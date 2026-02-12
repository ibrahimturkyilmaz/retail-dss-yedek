import React, { useState, useEffect } from 'react';
import { useStores } from '../hooks/useStores';
import { useInventory } from '../hooks/useInventory';
import StoreMap from '../components/StoreMap';
import {
    MapIcon,
    TableCellsIcon,
    BuildingStorefrontIcon,
    CircleStackIcon,
    CheckBadgeIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import axiosClient from '../api/axios';
import CategoryTree from '../components/CategoryTree';
import StockTable from '../components/StockTable';

// Inventory Data Fetcher Wrapper
const InventoryHealthView = ({ store }) => {
    const { data: inventory = [], isLoading: loading } = useInventory(store?.id);
    const [selectedCategory, setSelectedCategory] = useState(null);

    if (!store) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <BuildingStorefrontIcon className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-medium text-sm">Detaylarını görmek için soldan bir mağaza seçin.</p>
                <p className="text-xs opacity-60">Envanter durumu canlı olarak analiz edilecektir.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Envanter verileri çekiliyor...</p>
            </div>
        );
    }

    const filteredInventory = selectedCategory
        ? inventory.filter(i => i.category === selectedCategory)
        : inventory;

    return (
        <div className="flex h-full gap-4 overflow-hidden">
            {/* Inner Sidebar: Category Analysis */}
            <div className="w-64 flex-shrink-0 border-r border-slate-100 pr-4 overflow-y-auto">
                <h3 className="font-bold text-slate-700 mb-3 px-2 text-sm uppercase tracking-wider">Kategori Analizi</h3>
                <CategoryTree
                    inventory={inventory}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />
            </div>

            {/* Inner Main: Stock Details */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4 px-2">
                    <div>
                        <h3 className="font-black text-slate-800 text-xl">{store.name}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                                {selectedCategory ? `${selectedCategory} kategorisi gösteriliyor` : 'Tüm envanter listeleniyor'}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                                <CheckBadgeIcon className="w-3 h-3" /> Canlı Veritabanı
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <StockTable inventory={filteredInventory} onAction={(type, item) => console.log(type, item)} />
                </div>
            </div>
        </div>
    );
};

const Stores = () => {
    const { data: stores, isLoading, error } = useStores();
    const [selectedStore, setSelectedStore] = useState(null);
    const [viewMode, setViewMode] = useState('map'); // 'map' or 'health'

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-slate-500 font-medium animate-pulse">Mağaza ağı yükleniyor...</p>
        </div>
    );

    if (error) return (
        <div className="p-10 text-center bg-red-50 rounded-2xl border border-red-100 m-10">
            <p className="text-red-500 font-bold mb-2">Veri bağlantısı kurulamadı.</p>
            <p className="text-xs text-red-400">{error.message}</p>
        </div>
    );

    return (
        <div className="h-[calc(100vh-200px)] flex flex-col gap-6">
            {/* Toolbar */}
            <div className="flex justify-start items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm shrink-0 gap-6">
                <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
                    <button
                        onClick={() => setViewMode('map')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${viewMode === 'map' ? 'bg-white text-blue-600 shadow-md transform -translate-y-[1px]' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <MapIcon className="w-3.5 h-3.5" />
                        Harita
                    </button>
                    <button
                        onClick={() => setViewMode('health')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${viewMode === 'health' ? 'bg-white text-blue-600 shadow-md transform -translate-y-[1px]' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <TableCellsIcon className="w-3.5 h-3.5" />
                        Envanter Sağlık
                    </button>
                </div>

                <div className="w-px h-6 bg-slate-200"></div>

                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-50 rounded-lg">
                        <CircleStackIcon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-800 tracking-tight leading-none">Mağaza Ağı</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Canlı Senkron</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden pb-4">
                {/* Left Side: Store List - Reduced Width */}
                <div className="w-full md:w-64 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden shrink-0">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mağaza Listesi</span>
                        <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded-full text-white font-bold">{stores?.length || 0}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                        {stores?.map((store) => {
                            const isSelected = selectedStore?.id === store.id;
                            return (
                                <div
                                    key={store.id}
                                    onClick={() => setSelectedStore(store)}
                                    className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-between cursor-pointer group
                                        ${isSelected
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 transform scale-[1.02]'
                                            : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-500 text-white' : (store.store_type === 'HUB' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600')}`}>
                                            <BuildingStorefrontIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-800'}`}>{store.name}</h4>
                                            <p className={`text-[9px] ${isSelected ? 'text-blue-100' : 'text-slate-400 uppercase tracking-tighter'}`}>{store.store_type}</p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg inline-block
                                             ${isSelected ? 'bg-white/20 text-white' : (store.stock < store.safety_stock ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600')}`}>
                                            {store.stock?.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side: Map OR Health Center */}
                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 p-1 relative overflow-hidden flex flex-col min-w-0">
                    {viewMode === 'map' ? (
                        <div className="flex-1 relative rounded-2xl overflow-hidden">
                            <StoreMap
                                stores={stores}
                                selectedStore={selectedStore}
                                onSelect={setSelectedStore}
                                onViewDetails={() => setViewMode('health')}
                            />
                            <div className="absolute top-6 right-6 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl z-[400] text-xs max-w-[200px] border border-white/10 text-white">
                                <h4 className="font-black mb-2 flex items-center gap-2">
                                    <SparklesIcon className="w-4 h-4 text-blue-400" />
                                    Lejant
                                </h4>
                                <div className="space-y-2 opacity-80 font-medium">
                                    <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> HUB Etki Alanı</p>
                                    <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Kritik Stok Riski</p>
                                    <p className="mt-2 text-[10px] leading-relaxed italic">Veriler veritabanı üzerinden gerçek zamanlı güncellenir.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 p-6 overflow-hidden">
                            <InventoryHealthView store={selectedStore} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Stores;
