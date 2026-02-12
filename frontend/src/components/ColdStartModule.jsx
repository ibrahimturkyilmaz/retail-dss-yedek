import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axios';

const ColdStartModule = ({ productId }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!productId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get(`/api/analysis/cold-start?product_id=${productId}`);
                setAnalysis(response.data);
            } catch (error) {
                console.error("Cold start analysis error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [productId]);

    if (loading) return <div className="p-4 text-center text-xs text-slate-400 animate-pulse">k-NN benzerlik analizi çalışıyor...</div>;
    if (!analysis || analysis.status !== 'cold_start') return null;

    return (
        <div className="mt-6 bg-muted rounded-xl border border-border p-5">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                    <UserGroupIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-foreground">Cold Start (Yeni Ürün) Tespiti</h4>
                            <p className="text-xs text-muted-foreground mt-1">{analysis.message}</p>
                        </div>
                        <span className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                            {analysis.method}
                        </span>
                    </div>

                    <div className="mt-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Referans Alınan Benzer Ürünler (Proxies)</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {analysis.proxies.map((proxy) => (
                                <div key={proxy.id} className="bg-card p-3 rounded-lg border border-border shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <CubeIcon className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                            {proxy.similarity_score} Benzer
                                        </span>
                                    </div>
                                    <p className="font-medium text-card-foreground text-sm truncate">{proxy.name}</p>
                                    <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                                        <span className="flex items-center"><CurrencyDollarIcon className="w-3 h-3 mr-1" /> {proxy.price}TL</span>
                                        <span className="flex items-center"><ArrowTrendingUpIcon className="w-3 h-3 mr-1" /> {proxy.avg_daily_demand}/gün</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                        <p className="text-xs text-muted-foreground italic">
                            * Bu ürün için geçmiş veri olmadığı için yukarıdaki 3 ürünün ortalama trendi kullanılacaktır.
                        </p>
                        <div className="text-right">
                            <span className="text-xs text-muted-foreground block">Öngörülen Talep</span>
                            <span className="text-lg font-bold text-indigo-700">{analysis.predicted_demand} Adet / Gün</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColdStartModule;
