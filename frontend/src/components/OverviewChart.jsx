import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md p-4 border border-slate-100 shadow-xl rounded-xl">
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between gap-4 py-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-sm text-slate-600 font-medium">{entry.name}:</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{entry.value.toLocaleString('tr-TR')} Adet</span>
                    </div>
                ))}
                {payload[0]?.payload?.xai && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">XAI Tahmin Gerekçesi</p>
                        <p className="text-xs text-slate-600 italic leading-relaxed">"{payload[0].payload.xai}"</p>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const OverviewChart = () => {
    const [activePoint, setActivePoint] = React.useState(null);
    const [selectedStore, setSelectedStore] = React.useState('Tüm Mağazalar');
    const [selectedCategory, setSelectedCategory] = React.useState('Tüm Kategoriler');

    const handlePointClick = (data, index) => {
        if (data && data.activePayload) {
            setActivePoint(data.activePayload[0].payload);
        }
    };

    // Mock Data Generator based on selection
    const generateData = (store, category) => {
        let baseSales = 400;
        let diff = 0;

        if (store === 'Kadıköy') diff += 100;
        if (store === 'Beşiktaş') diff += 200;
        if (category === 'Elektronik') diff += 150;
        if (category === 'Giyim') diff -= 50;

        // Randomize slightly to allow animation
        const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min + diff;

        return [
            { name: 'Pzt', sales: r(380, 420), forecast: null, ci_low: null, ci_high: null },
            { name: 'Sal', sales: r(430, 470), forecast: null, ci_low: null, ci_high: null },
            { name: 'Çar', sales: r(400, 440), forecast: null, ci_low: null, ci_high: null },
            { name: 'Per', sales: r(480, 520), forecast: null, ci_low: null, ci_high: null },
            { name: 'Cum', sales: r(580, 620), forecast: null, ci_low: null, ci_high: null },
            { name: 'Cmt', sales: null, forecast: r(630, 670), ci_low: r(580, 620), ci_high: r(680, 720), xai: "Hafta sonu yoğunluğu ve mevsimsellik etkisi bekleniyor (%15 Artış)." },
            { name: 'Paz', sales: null, forecast: r(660, 700), ci_low: r(600, 640), ci_high: r(720, 760), xai: "Resmi tatil ve komşu mağazalardaki stok krizi talebi buraya kaydırabilir (%20 Artış)." },
            { name: 'Pzt+', sales: null, forecast: r(400, 440), ci_low: r(360, 400), ci_high: r(440, 480) },
            { name: 'Sal+', sales: null, forecast: r(380, 420), ci_low: r(330, 370), ci_high: r(430, 470) },
        ];
    };

    const data = React.useMemo(() => generateData(selectedStore, selectedCategory), [selectedStore, selectedCategory]);

    return (
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col h-[400px] relative transition-colors duration-200">
            {activePoint && activePoint.xai && (
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20 bg-slate-800 text-white p-4 rounded-xl shadow-2xl max-w-sm border border-slate-700 animate-fade-in-up">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">XAI İçgörüsü</span>
                        <button onClick={() => setActivePoint(null)} className="text-slate-400 hover:text-white">✕</button>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">"{activePoint.xai}"</p>
                    <div className="mt-3 flex gap-2">
                        <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold">Güven Skoru: %92</span>
                    </div>
                </div>
            )}
            <div className="bg-transparent p-0 rounded-none shadow-none border-none flex flex-col h-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                    <div>
                        <h3 className="font-bold text-card-foreground">Satış Analizi ve Tahmin Projeksiyonu</h3>
                        <p className="text-xs text-muted-foreground font-medium">Son 5 gün gerçekleşen vs Önümüzdeki 4 gün istatistiksel tahmin</p>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedStore}
                            onChange={(e) => setSelectedStore(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5"
                        >
                            <option>Tüm Mağazalar</option>
                            <option>Kadıköy</option>
                            <option>Beşiktaş</option>
                            <option>Şişli</option>
                        </select>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5"
                        >
                            <option>Tüm Kategoriler</option>
                            <option>Elektronik</option>
                            <option>Giyim</option>
                            <option>Gıda</option>
                        </select>
                    </div>

                    <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold">
                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
                            <div className="w-3 h-1 bg-blue-500 rounded-full" />
                            Gerçekleşen
                        </div>
                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
                            <div className="w-3 h-1 border-t-2 border-dashed border-orange-400" />
                            Tahmin Bandı
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorCI" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.05} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border))" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />

                            {/* Güven Aralığı (Confidence Interval Area) */}
                            <Area
                                type="monotone"
                                dataKey="ci_high"
                                stroke="none"
                                fill="#f59e0b"
                                fillOpacity={0.05}
                                connectNulls
                            />
                            <Area
                                type="monotone"
                                dataKey="ci_low"
                                stroke="none"
                                fill="#fff"
                                fillOpacity={1}
                                connectNulls
                            />

                            {/* Gerçekleşen Satışlar */}
                            <Area
                                name="Gerçekleşen Satış"
                                type="monotone"
                                dataKey="sales"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorSales)"
                                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0.5 }}
                                connectNulls
                            />

                            {/* Tahmin */}
                            <Area
                                name="Tahmini Talep"
                                type="monotone"
                                dataKey="forecast"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                fillOpacity={0}
                                dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff', cursor: 'pointer' }}
                                activeDot={{ r: 8, strokeWidth: 0, fill: '#f59e0b' }}
                                connectNulls
                                onClick={(data, index) => {
                                    if (data && data.payload && data.payload.xai) {
                                        setActivePoint(data.payload);
                                    }
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default OverviewChart;
