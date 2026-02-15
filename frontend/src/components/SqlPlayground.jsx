import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
    PlayIcon,
    TrashIcon,
    TableCellsIcon,
    CpuChipIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    StarIcon,
    ClockIcon,
    CloudArrowDownIcon,
    ArchiveBoxIcon,
    BookOpenIcon,
    XMarkIcon,
    ShareIcon,
    ChartBarIcon,
    PhotoIcon,
    MapIcon
} from '@heroicons/react/24/outline';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import mermaid from 'mermaid';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import axios from '../api/axios';
import { useUI } from '../context/UIContext';

const SqlPlayground = () => {
    const [code, setCode] = useState("-- SQL Sorgunuzu buraya yazın\nSELECT * FROM sales LIMIT 10;");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    const [dataStory, setDataStory] = useState(null);
    const [suggestedChart, setSuggestedChart] = useState(null);

    const [history, setHistory] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

    // Yeni Özellik State'leri
    const [activeResultTab, setActiveResultTab] = useState('table'); // 'table' | 'chart'
    const [showSchema, setShowSchema] = useState(false);
    const [schemaSvg, setSchemaSvg] = useState('');

    // Mermaid Config
    React.useEffect(() => {
        mermaid.initialize({ startOnLoad: true, theme: 'dark' });
    }, []);

    // URL'den Sorgu Okuma (?q=Base64)
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q) {
            try {
                const decodedQuery = atob(q);
                setCode(decodedQuery);
            } catch (e) {
                console.error("Link çözülemedi", e);
            }
        }
    }, []);

    // Şema Diagramını Hazırla
    React.useEffect(() => {
        if (showSchema && !schemaSvg) {
            // MS SQL Server Stili (Sade, Beyaz, İnce Çizgili)
            const definitionClass = `
            classDiagram
                direction LR
                
                class Sales {
                    PK id 🔑
                    FK store_id
                    FK product_id
                    date
                    quantity
                    total_price
                }
                
                class Inventory {
                    PK id 🔑
                    FK store_id
                    FK product_id
                    quantity
                    safety_stock
                }

                class Products {
                    PK id 🔑
                    name
                    category
                    price
                }

                class Stores {
                    PK id 🔑
                    name
                    store_type
                    location
                }
                
                class Customers {
                    PK id 🔑
                    name
                    type
                    loyalty_score
                }

                %% İlişkiler
                Stores "1" --> "*" Sales : 
                Products "1" --> "*" Sales : 
                Customers "1" --> "*" Sales : 
                
                Stores "1" --> "*" Inventory : 
                Products "1" --> "*" Inventory : 

                %% Stil (MS SQL Tarzı: Beyaz arka plan, siyah yazı, gri kenarlık)
                %% fill:#ffffff (Beyaz Kutu), stroke:#333 (Koyu Gri Çizgi), stroke-width:1px (İnce)
                
                style Sales fill:#ffffff,stroke:#333333,stroke-width:1px,color:#000000
                style Inventory fill:#ffffff,stroke:#333333,stroke-width:1px,color:#000000
                
                style Stores fill:#f8f9fa,stroke:#333333,stroke-width:1px,color:#000000
                style Products fill:#f8f9fa,stroke:#333333,stroke-width:1px,color:#000000
                style Customers fill:#f8f9fa,stroke:#333333,stroke-width:1px,color:#000000
            `;

            mermaid.render('schema-div', definitionClass).then(({ svg }) => {
                setSchemaSvg(svg);
            });
        }
    }, [showSchema]);

    // LocalStorage'dan yükle
    React.useEffect(() => {
        const savedHistory = localStorage.getItem('sql_history');
        const savedFavorites = localStorage.getItem('sql_favorites');
        if (savedHistory) setHistory(JSON.parse(savedHistory));
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    }, []);

    // Geçmişe ekle
    const addToHistory = (query) => {
        const newHistory = [{ query, timestamp: Date.now() }, ...history].slice(0, 50); // Son 50 sorgu
        setHistory(newHistory);
        localStorage.setItem('sql_history', JSON.stringify(newHistory));
    };

    // Favorilere ekle/çıkar
    const toggleFavorite = (query) => {
        const exists = favorites.find(f => f.query === query);
        let newFavorites;
        if (exists) {
            newFavorites = favorites.filter(f => f.query !== query);
        } else {
            newFavorites = [...favorites, { query, timestamp: Date.now() }];
        }
        setFavorites(newFavorites);
        localStorage.setItem('sql_favorites', JSON.stringify(newFavorites));
    };

    // CSV İndir
    const downloadCSV = () => {
        if (!result || !result.data) return;

        const headers = result.columns.join(",");
        const rows = result.data.map(row => result.columns.map(col => {
            const val = row[col];
            return val === null ? "" : `"${val.toString().replace(/"/g, '""')}"`;
        }).join(","));

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sql_result_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Akıllı Editör: Autocomplete
    const handleEditorDidMount = (editor, monaco) => {
        monaco.languages.registerCompletionItemProvider('sql', {
            provideCompletionItems: () => {
                const suggestions = [
                    // Tablolar
                    { label: 'sales', kind: monaco.languages.CompletionItemKind.Class, insertText: 'sales', detail: 'Table' },
                    { label: 'stores', kind: monaco.languages.CompletionItemKind.Class, insertText: 'stores', detail: 'Table' },
                    { label: 'products', kind: monaco.languages.CompletionItemKind.Class, insertText: 'products', detail: 'Table' },
                    { label: 'inventory', kind: monaco.languages.CompletionItemKind.Class, insertText: 'inventory', detail: 'Table' },
                    { label: 'customers', kind: monaco.languages.CompletionItemKind.Class, insertText: 'customers', detail: 'Table' },
                    // Sütunlar (Örnek)
                    { label: 'store_id', kind: monaco.languages.CompletionItemKind.Field, insertText: 'store_id' },
                    { label: 'product_id', kind: monaco.languages.CompletionItemKind.Field, insertText: 'product_id' },
                    { label: 'quantity', kind: monaco.languages.CompletionItemKind.Field, insertText: 'quantity' },
                    { label: 'total_price', kind: monaco.languages.CompletionItemKind.Field, insertText: 'total_price' },
                    // Komutlar
                    { label: 'SELECT', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'SELECT ' },
                    { label: 'FROM', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'FROM ' },
                    { label: 'WHERE', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'WHERE ' },
                    { label: 'GROUP BY', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'GROUP BY ' },
                    { label: 'ORDER BY', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'ORDER BY ' },
                    { label: 'LIMIT', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'LIMIT ' },
                ];
                return { suggestions: suggestions };
            }
        });
    };

    // --- OPSİYONEL MÜKEMMELLİK BİLEŞENLERİ ---

    // 1. Paylaşım Fonksiyonu
    const handleShare = () => {
        const encoded = btoa(code);
        const url = `${window.location.origin}${window.location.pathname}?q=${encoded}`;
        navigator.clipboard.writeText(url);
        alert("Link kopyalandı! 🔗\n" + url);
    };

    // 2. Sihirli Grafik (Magic Chart)
    const MagicChart = ({ data, columns }) => {
        if (!data || data.length === 0) return <div className="p-8 text-center text-slate-500">Grafik için veri yok.</div>;

        // Basit Algoritma: 
        // X Ekseni: İlk String veya Date kolonu
        // Y Ekseni: İlk Number kolonu
        let xKey = columns.find(c => typeof data[0][c] === 'string' || data[0][c] instanceof Date);
        let yKey = columns.find(c => typeof data[0][c] === 'number');

        if (!xKey) xKey = columns[0]; // Fallback
        if (!yKey) yKey = columns.find(c => c !== xKey); // Fallback

        if (!yKey) return <div className="p-8 text-center text-slate-500">Sayısal veri bulunamadığı için grafik çizilemedi.</div>;

        // Renkler
        const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

        return (
            <div className="h-[400px] w-full p-4 bg-slate-900 rounded-lg">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey={xKey} stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                        />
                        <Legend />
                        <Bar dataKey={yKey} fill="#6366f1" name={yKey} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    // 3. Şema Modal
    const SchemaModal = () => (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowSchema(false)}>
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-[95vw] h-[90vh] overflow-hidden p-6 relative shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowSchema(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 bg-slate-800 rounded-lg p-1">
                    <XMarkIcon className="w-6 h-6" />
                </button>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 shrink-0">
                    <MapIcon className="w-6 h-6 text-indigo-400" />
                    Veritabanı Haritası (ERD)
                </h3>
                <div className="flex-1 bg-slate-800/50 rounded-xl p-4 overflow-auto flex items-center justify-center">
                    {schemaSvg ? (
                        <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: schemaSvg }} />
                    ) : (
                        <div className="text-slate-500 animate-pulse">Harita yükleniyor...</div>
                    )}
                </div>
            </div>
        </div>
    );

    // Basit bir Result Table bileşeni
    const ResultTable = ({ data, columns }) => {
        if (!data || data.length === 0) return (
            <div className="flex flex-col items-center justify-center p-8 text-slate-500">
                <p className="text-lg font-medium mb-2">Sonuç bulunamadı.</p>
                <p className="text-sm opacity-70">Veritabanında bu sorguya uygun kayıt yok.</p>
                <p className="text-xs mt-4 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20">
                    İpucu: Eğer tablolar boşsa, "Simülasyon" sayfasından veri/senaryo çalıştırın.
                </p>
            </div>
        );

        return (
            <div className="overflow-auto max-h-[400px]">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                    <thead className="uppercase tracking-wider border-b border-white/10 bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                        <tr>
                            {columns.map((col) => (
                                <th key={col} className="px-6 py-3 text-slate-400 font-semibold">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                {columns.map((col) => (
                                    <td key={col} className="px-6 py-3 font-medium text-slate-300">
                                        {row[col] !== null ? row[col].toString() : <span className="text-slate-600 italic">null</span>}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const handleRunQuery = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/api/playground/execute', { query: code });
            setResult(response.data);
            addToHistory(code); // Başarılıysa geçmişe ekle
        } catch (err) {
            const detail = err.response?.data?.detail;
            let errorMessage = "Sorgu çalıştırılırken bir hata oluştu.";

            if (detail) {
                if (typeof detail === 'string') {
                    errorMessage = detail;
                } else if (Array.isArray(detail)) {
                    errorMessage = detail.map(e => e.msg || JSON.stringify(e)).join(', ');
                } else if (typeof detail === 'object') {
                    errorMessage = detail.msg || JSON.stringify(detail);
                }
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleAskAI = async () => {
        if (!aiPrompt.trim()) return;
        setAiLoading(true);
        setDataStory(null);
        setSuggestedChart(null);

        try {
            const response = await axios.post('/api/playground/generate-sql', { prompt: aiPrompt });

            // Backend artık JSON dönebiliyor
            const { sql, data_story, suggested_chart } = response.data;

            if (sql) {
                const newCode = code + "\n\n-- AI: " + aiPrompt + "\n" + sql;
                setCode(newCode);
            }

            if (data_story) {
                setDataStory(data_story);
            }

            if (suggested_chart) {
                setSuggestedChart(suggested_chart);
            }

        } catch (err) {
            console.error(err);
            setError("AI Yanıt veremedi: " + (err.response?.data?.detail || err.message));
        } finally {
            setAiLoading(false);
            setAiPrompt("");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-4 animate-in fade-in zoom-in duration-500">
            {/* Header / Toolbar */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <TableCellsIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                            SQL Playground
                        </h1>
                        <div className="flex flex-col">
                            <p className="text-xs text-slate-400">Güvenli Veri Analiz Ortamı</p>
                            <span className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sadece SELECT
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-2"></span> Oto-LIMIT 100
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setIsLibraryOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-white/5 text-sm font-medium transition-all flex items-center gap-2"
                    >
                        <BookOpenIcon className="w-5 h-5" />
                        <span>Kütüphane</span>
                    </button>

                    <button
                        onClick={handleShare}
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        title="Sorguyu Paylaş"
                    >
                        <ShareIcon className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setShowSchema(true)}
                        className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                        title="Şemayı Gör"
                    >
                        <PhotoIcon className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setCode("")}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Temizle"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleRunQuery}
                        disabled={loading}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all ${loading
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 active:scale-95'
                            }`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <PlayIcon className="w-5 h-5" />
                        )}
                        <span>{loading ? 'Çalışıyor...' : 'Çalıştır'}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full min-h-0 relative">
                {/* Sol Panel: Editör ve AI */}
                {/* Sol Panel: Editör ve AI */}
                <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">

                    {/* AI Input (Moved to Top) */}
                    <div className="flex flex-col gap-2 relative z-30">
                        {dataStory && (
                            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl flex gap-3 items-start animate-in slide-in-from-bottom-2">
                                <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400 shrink-0">
                                    <CpuChipIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-blue-300 mb-1">AI Analizi</h4>
                                    <p className="text-sm text-slate-300">{dataStory}</p>
                                    {suggestedChart && (
                                        <div className="mt-2 text-xs text-blue-400/80 flex items-center gap-2">
                                            <span>📊 Önerilen Görselleştirme:</span>
                                            <span className="uppercase font-bold tracking-wider bg-blue-500/20 px-2 py-0.5 rounded">{suggestedChart}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex gap-2 items-center shadow-lg">
                            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
                                <CpuChipIcon className="w-6 h-6" />
                            </div>
                            <input
                                type="text"
                                className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 disabled:opacity-50"
                                placeholder="SQL bilmiyor musun? Sor bakalım! (Örn: En karlı mağaza hangisi?)"
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                                disabled={aiLoading}
                            />
                            <button
                                onClick={handleAskAI}
                                disabled={aiLoading || !aiPrompt.trim()}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-lg text-sm font-medium transition-all"
                            >
                                {aiLoading ? 'Düşünüyor...' : 'AI Oluştur'}
                            </button>
                        </div>
                    </div>

                    {/* Editor Container */}
                    <div className="flex-1 bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl relative group z-10">
                        <div className="absolute top-0 left-0 right-0 h-8 bg-slate-800 border-b border-slate-700 flex items-center px-4 text-xs text-slate-400 select-none z-10 justify-between">
                            <span>SQL Editor</span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => toggleFavorite(code)} className="hover:text-amber-400 transition-colors" title="Bunu Favorilere Ekle">
                                    {favorites.find(f => f.query === code) ? <StarIconSolid className="w-4 h-4 text-amber-400" /> : <StarIcon className="w-4 h-4" />}
                                </button>
                                <span className="text-[10px] text-slate-500">PostgreSQL syntax</span>
                            </div>
                        </div>
                        <div className="pt-8 h-full">
                            <Editor
                                height="100%"
                                defaultLanguage="sql"
                                theme="vs-dark"
                                value={code}
                                onChange={(value) => setCode(value)}
                                onMount={handleEditorDidMount}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    padding: { top: 16 },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                }}
                            />
                        </div>
                    </div>


                </div>

                {/* Sağ Panel: Sonuçlar */}
                <div className="lg:col-span-1 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col shadow-2xl min-h-0">
                    <div className="p-4 border-b border-white/10 bg-white/5 rounded-t-2xl flex justify-between items-center">
                        <div className="flex flex-col">
                            <h3 className="font-semibold text-slate-300 flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                                Sorgu Sonucu
                            </h3>
                            {result && result.execution_time_ms && (
                                <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                                    <ClockIcon className="w-3 h-3" /> {result.execution_time_ms}ms
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Tab Switcher for Result */}
                            {result && (
                                <div className="flex bg-slate-800 p-0.5 rounded-lg mr-2">
                                    <button
                                        onClick={() => setActiveResultTab('table')}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeResultTab === 'table' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Tablo
                                    </button>
                                    <button
                                        onClick={() => setActiveResultTab('chart')}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeResultTab === 'chart' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Grafik
                                    </button>
                                </div>
                            )}

                            {result && (
                                <button
                                    onClick={downloadCSV}
                                    title="CSV Olarak İndir"
                                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <CloudArrowDownIcon className="w-5 h-5" />
                                </button>
                            )}
                            {result && (
                                <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                                    {result.row_count} satır
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-0 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {loading && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs">Veri çekiliyor...</span>
                            </div>
                        )}

                        {error && !loading && (
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
                                    <ExclamationTriangleIcon className="w-8 h-8" />
                                </div>
                                <h4 className="text-red-400 font-bold mb-2">Sorgu Hatası</h4>
                                <p className="text-sm text-red-300/80 bg-red-950/30 p-3 rounded-lg border border-red-900/50 font-mono">
                                    {error}
                                </p>
                            </div>
                        )}

                        {!loading && !error && !result && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 p-6 text-center">
                                <PlayIcon className="w-12 h-12 mb-2 opacity-20" />
                                <p>Sorgu çalıştırmak için "Çalıştır" butonuna basın.</p>
                                <p className="text-xs text-slate-700 mt-2">Otomatik LIMIT 100 uygulanır.</p>
                            </div>
                        )}

                        {!loading && !error && result && (
                            activeResultTab === 'table' ? (
                                <ResultTable data={result.data} columns={result.columns} />
                            ) : (
                                <MagicChart data={result.data} columns={result.columns} />
                            )
                        )}
                    </div>
                </div>

                {/* Right Drawer (Kütüphane) */}
                <div className={`fixed inset-y-0 right-0 w-80 bg-slate-900 border-l border-white/10 shadow-2xl transform transition-transform duration-300 z-50 ${isLibraryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="h-full flex flex-col">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-800">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <BookOpenIcon className="w-5 h-5 text-indigo-400" />
                                Sorgu Kütüphanesi
                            </h3>
                            <button onClick={() => setIsLibraryOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-4 space-y-6">
                            {/* Favoriler */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <StarIconSolid className="w-4 h-4 text-amber-500" /> Favoriler
                                </h4>
                                <div className="space-y-2">
                                    {favorites.length === 0 && <span className="text-slate-600 text-sm italic">Henüz favori yok.</span>}
                                    {favorites.map((item, idx) => (
                                        <div key={idx} onClick={() => { setCode(item.query); setIsLibraryOpen(false); }} className="p-3 bg-slate-800/50 hover:bg-slate-700 border border-white/5 rounded-lg cursor-pointer group transition-all">
                                            <code className="text-xs text-indigo-300 line-clamp-3 font-mono break-all">{item.query}</code>
                                            <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-2">
                                                <span className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleDateString()}</span>
                                                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item.query); }} className="text-amber-500 hover:text-amber-400"><StarIconSolid className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Geçmiş */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <ClockIcon className="w-4 h-4" /> Son Geçmiş
                                </h4>
                                <div className="space-y-2">
                                    {history.length === 0 && <span className="text-slate-600 text-sm italic">Geçmiş boş.</span>}
                                    {history.map((item, idx) => (
                                        <div key={idx} onClick={() => { setCode(item.query); setIsLibraryOpen(false); }} className="p-3 bg-slate-800/50 hover:bg-slate-700 border border-white/5 rounded-lg cursor-pointer group transition-all">
                                            <code className="text-xs text-slate-400 group-hover:text-slate-200 line-clamp-2 font-mono break-all">{item.query}</code>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                                                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item.query); }} className="text-slate-600 hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"><StarIcon className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {showSchema && <SchemaModal />}
        </div >
    );
};

export default SqlPlayground;
