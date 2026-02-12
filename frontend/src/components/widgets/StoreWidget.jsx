import React, { useState } from 'react';
import CountUp from 'react-countup';
import { BuildingStorefrontIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const StoreWidget = ({ activeStoreCount = 0, storeDetails = [], style, className, ...props }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            style={style}
            className={`bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl p-6 transition-all duration-300 relative flex flex-col h-full ${className}`}
            {...props}
        >
            {/* Drag Handle */}
            <div className="absolute top-4 right-4 z-20 cursor-move text-slate-300 hover:text-slate-500 drag-handle">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </div>

            <div className="flex justify-between items-start mb-2">
                <div className="p-3 bg-purple-50 rounded-2xl">
                    <BuildingStorefrontIcon className="w-6 h-6 text-purple-600" />
                </div>

                {/* Expand Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // prevent drag start maybe?
                        setExpanded(!expanded);
                        // In a grid layout, expansion might need to trigger a layout change callback if we want the card to grow in the grid. 
                        // For now, we'll keep it simple internal scroll or just show/hide details within fixed height.
                    }}
                    className="absolute top-6 right-12 p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 z-30"
                >
                    {expanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                </button>
            </div>

            {!expanded ? (
                <div className="mt-auto pointer-events-none">
                    <h3 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tight mb-2">
                        <CountUp end={activeStoreCount} duration={2} />
                    </h3>
                    <p className="text-sm lg:text-lg font-bold text-slate-500">Aktif Mağaza</p>
                </div>
            ) : (
                <div className="mt-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                        <CountUp end={activeStoreCount} duration={2} /> <span className="text-sm font-medium text-slate-400">Mağaza</span>
                    </h3>
                    <div className="space-y-2">
                        {storeDetails.map((store, idx) => (
                            <div key={idx} className="flex flex-col p-3 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-purple-200 transition-colors">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-slate-700 text-sm">{store.name}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${store.fillRate < 60 ? 'bg-red-100 text-red-700' :
                                        store.fillRate > 120 ? 'bg-blue-100 text-blue-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                        %{store.fillRate}
                                    </span>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                                    <span>Stok: {store.stock}</span>
                                    <span>Talep: {store.demand}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreWidget;
