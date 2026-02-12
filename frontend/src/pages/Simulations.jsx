import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axios';
import {
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    BoltIcon,
    AdjustmentsHorizontalIcon,
    ChartBarIcon,
    VariableIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { useSimulationStats, useSimulationActions } from '../hooks/useSimulations';

const SimulationCard = ({ title, description, icon: Icon, colorClass, onClick, isLoading }) => (
    <div
        onClick={!isLoading ? onClick : undefined}
        className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <div className={`absolute top-0 right-0 w-16 h-16 transform translate-x-4 -translate-y-4 rounded-full opacity-10 ${colorClass}`}></div>
        <div className="relative z-10 flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass} text-white`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                <p className="text-xs text-slate-500 line-clamp-1">{description}</p>
            </div>
        </div>
    </div>
);

const MetricCard = ({ title, value, previousValue, prefix = '', suffix = '' }) => {
    const change = (value || 0) - (previousValue || 0);
    const percentChange = previousValue && previousValue !== 0 ? (change / previousValue) * 100 : 0;
    const isPositive = change >= 0;

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
            <div className="flex items-end justify-between">
                <span className="text-2xl font-black text-slate-800">
                    {prefix}{(value || 0).toLocaleString()}{suffix}
                </span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
                </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Önceki: {prefix}{(previousValue || 0).toLocaleString()}{suffix}</p>
        </div>
    );
};

const Simulations = () => {
    const [activeTab, setActiveTab] = useState('scenarios'); // scenarios, custom, whatif

    // React Query Hooks
    const { data: baseStats, isLoading: loadingStats } = useSimulationStats();
    // Simulated Stats'i local state yerine derived state olarak veya ayrı bir query ile tutabiliriz. 
    // Ancak mevcut mantıkta baseStats hem başlangıç hem de güncel durumu temsil ediyor olabilir. 
    // Backend yapısına göre simulatedStats ayrı dönmüyorsa, UI'da manipüle etmek için local state gerekebilir.
    // Şimdilik Backend'den dönen veriyi "Güncel Durum" kabul edelim.

    const { reset, runScenario: runScenarioMutation, runWhatIf: runWhatIfMutation } = useSimulationActions();

    const [logs, setLogs] = useState([]);

    // Store ve Product dataları için existing hooks kullanılmalı (varsa) veya burada useQuery ile çekilmeli
    // Şimdilik axios kalsın ama doğrusu useStores ve useProducts olmalı.
    const [stores, setStores] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [storesRes, productsRes] = await Promise.all([
                    axiosClient.get('/stores'),
                    axiosClient.get('/api/products')
                ]);
                setStores(storesRes.data);
                setProducts(productsRes.data);
            } catch (e) { console.error(e); }
        };
        fetchDropdowns();
    }, []);

    // Local Simulation State (Sliderlar için)
    const [simulatedStats, setSimulatedStats] = useState(null);
    const [params, setParams] = useState({
        demandChange: 0,
        supplyDelay: 0,
        priceChange: 0
    });

    const [whatIfData, setWhatIfData] = useState({
        sourceStore: '',
        targetStore: '',
        product: '',
        amount: 10
    });

    const [chartData, setChartData] = useState([]);

    // Base Stats Yüklendiğinde Local State'i Güncelle
    useEffect(() => {
        if (baseStats) {
            setSimulatedStats(baseStats);
        }
    }, [baseStats]);

    // Slider Değişimlerini Hesapla (Client-Side Simulation)
    useEffect(() => {
        if (!baseStats) return;
        const revenueImpact = 1 + (params.demandChange / 100) + (params.priceChange / 100);
        const stockImpact = 1 - (params.demandChange / 100) + (params.supplyDelay * 0.05);

        const newStats = {
            total_revenue: baseStats.total_revenue * revenueImpact,
            total_stock: Math.round(baseStats.total_stock * stockImpact),
            critical_stores: Math.round(baseStats.critical_stores * (1 + params.supplyDelay * 0.2))
        };
        setSimulatedStats(newStats);

        const data = [];
        for (let i = 1; i <= 7; i++) {
            const baseValue = 1000 + Math.random() * 200;
            data.push({
                day: `Gün ${i}`,
                current: Math.round(baseValue),
                simulated: Math.round(baseValue * revenueImpact)
            });
        }
        setChartData(data);
    }, [params, baseStats]);

    const handleReset = () => {
        reset.mutate(undefined, {
            onSuccess: (data) => {
                setParams({ demandChange: 0, supplyDelay: 0, priceChange: 0 });
                setLogs(prev => [{ message: "Sistem fabrika ayarlarına döndürüldü.", type: 'RESET', time: new Date().toLocaleTimeString() }, ...prev]);
            }
        });
    };

    const runScenario = (type) => {
        runScenarioMutation.mutate(type, {
            onSuccess: (data) => {
                setLogs(prev => [{ message: data.message, type: type.toUpperCase(), time: new Date().toLocaleTimeString() }, ...prev]);
            }
        });
    };

    const handleWhatIf = () => {
        if (!whatIfData.sourceStore || !whatIfData.targetStore || !whatIfData.product) return;

        runWhatIfMutation.mutate({
            source_store_id: parseInt(whatIfData.sourceStore),
            target_store_id: parseInt(whatIfData.targetStore),
            product_id: parseInt(whatIfData.product),
            amount: parseInt(whatIfData.amount)
        }, {
            onSuccess: (data) => {
                setLogs(prev => [{ message: data.message, type: 'WHATIF', time: new Date().toLocaleTimeString() }, ...prev]);
            }
        });
    };

    const loading = reset.isPending || runScenarioMutation.isPending || runWhatIfMutation.isPending || loadingStats;

    if (!baseStats || !simulatedStats) return <div className="p-10 text-center animate-pulse">Veriler hazırlanıyor...</div>;

    return (
        <div className="h-[calc(100vh-200px)] flex flex-col gap-6 overflow-hidden">
            {/* Header */}
            {/* Header - Compact & Left Aligned */}
            <div className="flex justify-start items-center gap-6 bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                        <BoltIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-slate-800 leading-tight">Simülasyon Oluşturma</h1>
                        <p className="text-[10px] text-slate-500 truncate">Senaryo analizi ve stratejik doğrulama.</p>
                    </div>
                </div>

                <div className="h-8 w-px bg-slate-200"></div>

                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                    <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Sıfırla
                </button>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left Panel: Tabs & Controls - Fixed Width */}
                <div className="w-80 flex flex-col gap-6 overflow-hidden shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                        <div className="flex border-b border-slate-100">
                            {[
                                { id: 'scenarios', label: 'Senaryo', icon: SparklesIcon },
                                { id: 'custom', label: 'Özel', icon: AdjustmentsHorizontalIcon },
                                { id: 'whatif', label: 'What-If', icon: VariableIcon }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-bold transition-all ${activeTab === tab.id ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/30' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-4 overflow-y-auto max-h-[400px]">
                            {activeTab === 'scenarios' && (
                                <div className="grid grid-cols-1 gap-3">
                                    <SimulationCard
                                        title="Talep Patlaması"
                                        description="Talebi %50 artır."
                                        icon={ArrowTrendingUpIcon}
                                        colorClass="bg-green-500"
                                        onClick={() => runScenario('boom')}
                                        isLoading={loading}
                                    />
                                    <SimulationCard
                                        title="Ekonomik Daralma"
                                        description="Talebi %30 düşür."
                                        icon={ArrowTrendingDownIcon}
                                        colorClass="bg-blue-500"
                                        onClick={() => runScenario('recession')}
                                        isLoading={loading}
                                    />
                                    <SimulationCard
                                        title="Tedarik Şoku"
                                        description="Gecikme +15 gün."
                                        icon={ExclamationTriangleIcon}
                                        colorClass="bg-red-500"
                                        onClick={() => runScenario('shock')}
                                        isLoading={loading}
                                    />
                                </div>
                            )}

                            {activeTab === 'custom' && (
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Talep Değişimi</label>
                                            <span className="text-xs font-bold text-green-600">{params.demandChange}%</span>
                                        </div>
                                        <input
                                            type="range" min="-50" max="50" step="5"
                                            value={params.demandChange}
                                            onChange={(e) => setParams({ ...params, demandChange: parseInt(e.target.value) })}
                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Tedarik Gecikmesi</label>
                                            <span className="text-xs font-bold text-orange-600">{params.supplyDelay} Gün</span>
                                        </div>
                                        <input
                                            type="range" min="0" max="30" step="1"
                                            value={params.supplyDelay}
                                            onChange={(e) => setParams({ ...params, supplyDelay: parseInt(e.target.value) })}
                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic mt-2">Not: Özel ayarlar anlık etki analizi içindir.</p>
                                </div>
                            )}

                            {activeTab === 'whatif' && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Kaynak</label>
                                        <select
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                            value={whatIfData.sourceStore}
                                            onChange={e => setWhatIfData({ ...whatIfData, sourceStore: e.target.value })}
                                        >
                                            <option value="">Seçiniz...</option>
                                            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Hedef</label>
                                        <select
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                            value={whatIfData.targetStore}
                                            onChange={e => setWhatIfData({ ...whatIfData, targetStore: e.target.value })}
                                        >
                                            <option value="">Seçiniz...</option>
                                            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Ürün</label>
                                            <select
                                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                                value={whatIfData.product}
                                                onChange={e => setWhatIfData({ ...whatIfData, product: e.target.value })}
                                            >
                                                <option value="">Seçiniz...</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Miktar</label>
                                            <input
                                                type="number"
                                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                                value={whatIfData.amount}
                                                onChange={e => setWhatIfData({ ...whatIfData, amount: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleWhatIf}
                                        disabled={loading || !whatIfData.sourceStore || !whatIfData.targetStore || !whatIfData.product}
                                        className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors disabled:opacity-50"
                                    >
                                        Simüle Et
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Logs */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 flex justify-between items-center shrink-0">
                            Simülasyon Logları
                            {loading && <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>}
                        </div>
                        <div className="p-3 space-y-2 overflow-y-auto flex-1">
                            {logs.map((log, i) => (
                                <div key={i} className="text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100 animate-in slide-in-from-top-1">
                                    <div className="flex justify-between mb-1">
                                        <span className={`font-black px-1.5 py-0.5 rounded text-[9px] ${log.type === 'RESET' ? 'bg-slate-200 text-slate-700' : 'bg-purple-100 text-purple-700'}`}>{log.type}</span>
                                        <span className="text-[9px] text-slate-400">{log.time}</span>
                                    </div>
                                    <p className="text-slate-600 text-[10px] leading-tight">{log.message}</p>
                                </div>
                            ))}
                            {logs.length === 0 && (
                                <div className="text-center py-6">
                                    <BoltIcon className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                                    <p className="text-[10px] text-slate-400">Log kaydı yok.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Analysis - Fluid Width */}
                <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
                    <div className="grid grid-cols-3 gap-4">
                        <MetricCard
                            title="Tahmini Ciro"
                            value={simulatedStats.total_revenue}
                            previousValue={baseStats.total_revenue}
                            prefix="₺"
                        />
                        <MetricCard
                            title="Toplam Stok"
                            value={simulatedStats.total_stock}
                            previousValue={baseStats.total_stock}
                            suffix=" Adet"
                        />
                        <MetricCard
                            title="Riskli Mağaza"
                            value={simulatedStats.critical_stores}
                            previousValue={baseStats.critical_stores}
                        />
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[450px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <ChartBarIcon className="w-5 h-5 text-blue-500" />
                                Kıyaslamalı Etki Grafiği
                            </h3>
                            <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div> Mevcut
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div> Simüle
                                </div>
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="current" stroke="#94a3b8" strokeWidth={2} fill="url(#colorCurrent)" />
                                <Area type="monotone" dataKey="simulated" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorSim)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Simulations;
