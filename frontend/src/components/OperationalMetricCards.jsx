import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import {
    ExclamationTriangleIcon,
    TruckIcon,
    BuildingStorefrontIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

const OperationalMetricCards = ({ riskyCount = 0, pendingCount = 0, activeStoreCount = 0 }) => {
    const navigate = useNavigate();
    const [expandedStoreCard, setExpandedStoreCard] = useState(false);

    // Using values from props
    const riskyStoresCount = riskyCount;
    const pendingTransfersCount = pendingCount;
    const activeStores = activeStoreCount;


    // Mock store details
    const storeDetails = [
        { name: 'Kadıköy', stock: 450, demand: 800, fillRate: 56 },
        { name: 'Beşiktaş', stock: 1200, demand: 950, fillRate: 126 },
        { name: 'Şişli', stock: 600, demand: 620, fillRate: 96 },
    ];

    return (
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* 1. Riskli Mağaza Kartı */}
            <div
                onClick={() => navigate('/transfers?filter=critical')}
                className="bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-3xl p-8 cursor-pointer hover:shadow-xl hover:shadow-red-100/50 transition-all group relative overflow-hidden flex flex-col justify-between aspect-[4/3] md:aspect-auto md:h-64"
            >
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-red-100 rounded-full blur-3xl group-hover:bg-red-200 transition-colors"></div>

                <div className="relative z-10 flex justify-between items-start">
                    <div className="p-4 bg-white/80 rounded-2xl shadow-sm">
                        <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                    </div>
                </div>

                <div className="relative z-10 mt-auto">
                    <h3 className="text-5xl font-black text-slate-800 tracking-tight mb-2">
                        <CountUp end={riskyStoresCount} duration={2} />
                    </h3>
                    <p className="text-lg font-bold text-red-600">Riskli Mağaza</p>
                    <div className="flex items-center gap-2 mt-3 text-sm text-red-500 font-medium group-hover:translate-x-1 transition-transform">
                        <span>Aksiyon Al</span>
                        <ArrowRightIcon className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* 2. Bekleyen Transferler Kartı */}
            <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl p-8 relative group hover:shadow-xl hover:shadow-blue-100/50 transition-all flex flex-col justify-between aspect-[4/3] md:aspect-auto md:h-64">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-4 bg-blue-50 rounded-2xl">
                        <TruckIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <button
                        onClick={() => navigate('/transfers')}
                        className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                        YÖNET
                    </button>
                </div>

                <div className="mt-auto">
                    <h3 className="text-5xl font-black text-slate-800 tracking-tight mb-2">
                        <CountUp end={pendingTransfersCount} duration={2} />
                    </h3>
                    <p className="text-lg font-bold text-slate-500">Bekleyen Transfer</p>
                </div>

                {/* Decorative background element */}
                <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                    <TruckIcon className="w-48 h-48 -mr-8 -mb-8" />
                </div>
            </div>

            {/* 3. Mağazalar Kartı (Akıllı Katman) */}
            <div className={`bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl p-8 transition-all duration-300 relative flex flex-col ${expandedStoreCard ? 'row-span-2' : 'aspect-[4/3] md:aspect-auto md:h-64'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="p-4 bg-purple-50 rounded-2xl">
                        <BuildingStorefrontIcon className="w-8 h-8 text-purple-600" />
                    </div>
                    <button
                        onClick={() => setExpandedStoreCard(!expandedStoreCard)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                    >
                        {expandedStoreCard ? <ChevronUpIcon className="w-6 h-6" /> : <ChevronDownIcon className="w-6 h-6" />}
                    </button>
                </div>

                {!expandedStoreCard ? (
                    <div className="mt-auto">
                        <h3 className="text-5xl font-black text-slate-800 tracking-tight mb-2">
                            <CountUp end={activeStores} duration={2} />
                        </h3>
                        <p className="text-lg font-bold text-slate-500">Aktif Mağaza</p>
                    </div>
                ) : (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <h3 className="text-3xl font-bold text-slate-800 mb-4">
                            <CountUp end={activeStores} duration={2} /> <span className="text-lg font-medium text-slate-400">Mağaza</span>
                        </h3>
                        <div className="space-y-3">
                            {storeDetails.map((store, idx) => (
                                <div key={idx} className="flex flex-col p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-purple-200 transition-colors">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-slate-700">{store.name}</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${store.fillRate < 60 ? 'bg-red-100 text-red-700' :
                                            store.fillRate > 120 ? 'bg-blue-100 text-blue-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                            %{store.fillRate} Doluluk
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 font-medium">
                                        <span>Stok: {store.stock}</span>
                                        <span>Talep: {store.demand}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OperationalMetricCards;
