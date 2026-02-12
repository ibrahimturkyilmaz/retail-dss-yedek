import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowPathIcon, CheckBadgeIcon, ChartBarIcon, ExclamationTriangleIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import ColdStartModule from '../components/ColdStartModule';
import NewProductModal from '../components/NewProductModal';
import axiosClient from '../api/axios';
import { useTheme } from '../context/ThemeContext';

const InfoTooltip = ({ text }) => (
    <div className="group relative flex items-center ml-2">
        <div className="cursor-help text-slate-400 hover:text-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
        </div>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg text-center pointer-events-none">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
    </div>
);

const MetricCard = ({ title, value, subtext, color, icon: Icon, tooltip }) => (
    <div className={`p-6 rounded-2xl border ${color} bg-card shadow-sm flex items-start justify-between`}>
        <div>
            <div className="flex items-center mb-1">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                {tooltip && <InfoTooltip text={tooltip} />}
            </div>
            <h3 className="text-2xl font-bold text-card-foreground">{value}</h3>
            {subtext && <p className="text-xs mt-1 opacity-80 dark:text-slate-300">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-opacity-10 ${color?.replace('border', 'bg').replace('200', '50') || ''}`}>
            {Icon && <Icon className={`w-6 h-6 ${color?.replace('border-', 'text-').replace('-200', '-600') || ''}`} />}
        </div>
    </div>
);

const Analytics = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(1); // Demo için ID 1
    const [confidence, setConfidence] = useState("Hesaplanıyor...");
    const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchAccuracyData = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/api/analysis/accuracy?store_id=1&product_id=${selectedProduct}`);
            if (response.data.error) {
                console.error("API Error:", response.data.error);
                setData(null);
                return;
            }
            setData(response.data);
            setConfidence(response.data.metrics?.confidence_label || "Bilinmiyor");
        } catch (error) {
            console.error("Analiz hatası:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateForecasts = async () => {
        setIsGenerating(true);
        try {
            await axiosClient.post('/api/forecast/generate');
            await fetchAccuracyData();
        } catch (error) {
            console.error("Tahmin üretim hatası:", error);
            alert("Tahminler üretilirken bir hata oluştu.");
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        fetchAccuracyData();
    }, [selectedProduct]);

    return (
        <div className="space-y-6">
            <div className="flex justify-start items-center gap-8">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Tahmin Doğruluğu (Güncel)</h2>
                    <p className="text-sm text-muted-foreground">Backtesting yöntemiyle modelin geçmiş performansını (Son 7 gün) doğrulayın.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <button
                        onClick={() => setIsLaunchModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                    >
                        <RocketLaunchIcon className="w-4 h-4" />
                        Yeni Ürün Lansmanı
                    </button>
                    <select
                        className="bg-card border border-border text-sm rounded-lg p-2.5 shadow-sm focus:ring-blue-500 focus:border-blue-500 block text-foreground min-w-[200px]"
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                        <option value="1">Laptop (Premium)</option>
                        <option value="2">Telefon (X-Pro)</option>
                        <option value="3">Kulaklık (NoiseCancelling)</option>
                        <option value="99">Yeni Ürün (Cold Start Demo)</option>
                    </select>
                </div>
            </div>

            {selectedProduct === "99" && <ColdStartModule productId={99} />}

            {loading ? (
                <div className="p-20 text-center animate-pulse">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500 font-medium">Model geriye dönük test (Backtesting) yapıyor...</p>
                        <p className="text-xs text-slate-400">Son 7 günlük veri modelden gizleniyor ve tahmin üretiliyor.</p>
                    </div>
                </div>
            ) : data && data.metrics ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <MetricCard
                            title="R² Skoru"
                            value={`%${(data.metrics.r2 * 100 || 0).toFixed(0)}`}
                            subtext="Modelin açıklama gücü"
                            color="border-blue-200"
                            icon={ChartBarIcon}
                            tooltip="Modelin, satışlardaki değişimi ne kadar iyi açıkladığını gösterir."
                        />
                        <MetricCard
                            title="MAE (Ortalama Hata)"
                            value={`${data.metrics.MAE} Adet`}
                            subtext="Ortalama sapma miktarı"
                            color="border-purple-200"
                            icon={ExclamationTriangleIcon}
                            tooltip="Mean Absolute Error."
                        />
                        <MetricCard
                            title="RMSE (Ceza Puanı)"
                            value={data.metrics.RMSE}
                            subtext="Büyük hatalara duyarlı"
                            color="border-orange-200"
                            icon={ArrowPathIcon}
                            tooltip="Root Mean Square Error."
                        />
                        <div className={`p-6 rounded-2xl border ${confidence === 'Yüksek Güven' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'} shadow-sm flex flex-col justify-center items-center text-center`}>
                            <CheckBadgeIcon className={`w-8 h-8 mb-2 ${confidence === 'Yüksek Güven' ? 'text-emerald-600' : 'text-amber-600'}`} />
                            <h3 className={`text-lg font-bold ${confidence === 'Yüksek Güven' ? 'text-emerald-800 dark:text-emerald-400' : 'text-amber-800 dark:text-amber-400'}`}>{confidence}</h3>
                            <p className="text-xs opacity-80 dark:text-slate-300">Modelin bu ürün için güven seviyesi</p>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-card-foreground">Gerçekleşen vs Tahmin (Backtesting Sonucu)</h3>
                            <div className="flex items-center gap-4 text-xs font-bold">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                    <span className="text-slate-600 dark:text-slate-400">Gerçekleşen Satış</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-1 border-t-2 border-dashed border-purple-500"></span>
                                    <span className="text-slate-600 dark:text-slate-400">Model Tahmini (Backtest)</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.chart_data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
                                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} name="Gerçekleşen" />
                                    <Line type="monotone" dataKey="forecast" stroke="#a855f7" strokeWidth={3} strokeDasharray="5 5" dot={false} name="Tahmin (AI)" connectNulls />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            ) : (
                <div className="p-16 text-center bg-slate-50 dark:bg-slate-900/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ChartBarIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Henüz Tahmin Verisi Yok</h3>
                        <p className="text-sm text-slate-500 mb-8">
                            Seçili ürün ve mağaza için validasyon verileri henüz oluşturulmamış.
                            Modeli şimdi çalıştırarak 30 günlük tahminleri ve doğruluk metriklerini üretebilirsiniz.
                        </p>
                        <button
                            onClick={handleGenerateForecasts}
                            disabled={isGenerating}
                            className={`flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all mx-auto ${isGenerating ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Tahminler Üretiliyor...
                                </>
                            ) : (
                                <>
                                    <ArrowPathIcon className="w-5 h-5" />
                                    Tahminleri Şimdi Oluştur
                                </>
                            )}
                        </button>
                        <p className="text-[10px] text-slate-400 mt-6 uppercase tracking-widest font-bold">
                            Bu işlem yaklaşık 5-10 saniye sürebilir.
                        </p>
                    </div>
                </div>
            )}

            <NewProductModal
                isOpen={isLaunchModalOpen}
                onClose={() => setIsLaunchModalOpen(false)}
                onLaunchSuccess={() => {
                    fetchAccuracyData();
                }}
            />
        </div>
    );
};

export default Analytics;
