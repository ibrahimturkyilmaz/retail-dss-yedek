import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axios';
import { CubeIcon, RocketLaunchIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const NewProductModal = ({ isOpen, onClose, onLaunchSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        cost: '',
        reference_product_id: ''
    });

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedReference, setSelectedReference] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Load products for reference search
            axiosClient.get('/api/products').then(res => setProducts(res.data));
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchQuery) {
            setFilteredProducts(products.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(0, 5));
        } else {
            setFilteredProducts([]);
        }
    }, [searchQuery, products]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await axiosClient.post('/api/products/launch', {
                ...formData,
                price: parseFloat(formData.price),
                cost: parseFloat(formData.cost),
                reference_product_id: selectedReference ? selectedReference.id : null
            });
            onLaunchSuccess();
            onClose();
            alert("Yeni ürün başarıyla eklendi ve referans geçmişi işlendi.");
        } catch (error) {
            console.error("Launch error:", error);
            alert("Ürün eklenirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-100 bg-indigo-50 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <RocketLaunchIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Yeni Ürün Lansmanı (Cold Start)</h3>
                        <p className="text-xs text-slate-500">Yeni ürün ekleyin ve benzer bir ürün referansı vererek talep tahminini başlatın.</p>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Ürün Adı</label>
                            <input
                                type="text"
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                            <input
                                type="text"
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Satış Fiyatı (₺)</label>
                            <input
                                type="number"
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Maliyet (₺)</label>
                            <input
                                type="number"
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.cost}
                                onChange={e => setFormData({ ...formData, cost: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Reference Selection */}
                    <div className="pt-4 border-t border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Referans Ürün (Opsiyonel)</label>
                        <p className="text-[10px] text-slate-400 mb-2">Benzer bir ürün seçerek talep tahmin algoritmasını (Cold Start) başlatın.</p>

                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Ürün ara..."
                                className="w-full pl-9 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Search Results */}
                        {filteredProducts.length > 0 && (
                            <div className="mt-2 border border-slate-100 rounded-lg shadow-sm bg-white divide-y divide-slate-50 max-h-32 overflow-y-auto">
                                {filteredProducts.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => {
                                            setSelectedReference(p);
                                            setSearchQuery('');
                                            setFilteredProducts([]);
                                        }}
                                        className="p-2 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-sm"
                                    >
                                        <span>{p.name}</span>
                                        <span className="text-xs text-slate-400">{p.category}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Selected Reference */}
                        {selectedReference && (
                            <div className="mt-3 bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <CubeIcon className="w-5 h-5 text-indigo-600" />
                                    <div>
                                        <p className="text-sm font-bold text-indigo-900">{selectedReference.name}</p>
                                        <p className="text-xs text-indigo-600">Referans olarak seçildi</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedReference(null)}
                                    className="text-xs text-red-500 hover:underline"
                                >
                                    Kaldır
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !formData.name || !formData.price}
                        className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Ekleniyor...' : 'Lansmanı Başlat'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewProductModal;
