import React, { useState } from 'react';
import axiosClient from '../api/axios';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const RejectionModal = ({ isOpen, onClose, transfer, onRejectSuccess }) => {
    const [reason, setReason] = useState('COST'); // Default reason
    const [loading, setLoading] = useState(false);

    if (!isOpen || !transfer) return null;

    const handleReject = async () => {
        setLoading(true);
        try {
            const payload = {
                source_store_id: transfer.source.id,
                target_store_id: transfer.target.id,
                product_id: transfer.product_id,
                reason: reason,
                transfer_id: transfer.transfer_id
            };

            await axiosClient.post('/api/transfer/reject', payload);
            if (onRejectSuccess) onRejectSuccess(transfer.transfer_id);
            onClose();
        } catch (error) {
            console.error("Rejection error:", error);
            alert("Transfer reddedilemedi.");
        } finally {
            setLoading(false);
        }
    };

    const reasons = [
        { id: 'COST', label: 'Yüksek Lojistik Maliyet', desc: 'Transfer mesafesi çok uzak, maliyet çok yüksek.' },
        { id: 'OPS', label: 'Operasyonel Zorluklar', desc: 'Depo kapasitesi dolu veya personel yetersiz.' },
        { id: 'STRATEGY', label: 'Stratejik Stok Tutma', desc: 'Bu ürün bu mağazada stratejik olarak tutulmalı.' }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-red-50">
                    <h3 className="font-bold text-red-700 flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5" />
                        Transferi Reddet
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-slate-600 mb-4">
                        <strong className="text-slate-800">{transfer.source.name}</strong> {'->'} <strong className="text-slate-800">{transfer.target.name}</strong> arasındaki transferi neden reddediyorsunuz?
                    </p>

                    <p className="text-xs text-slate-400 mb-4 bg-slate-50 p-2 rounded border border-slate-100 italic">
                        * Bu geri bildirim, algoritmanın gelecekteki önerilerini iyileştirecektir.
                    </p>

                    <div className="space-y-3">
                        {reasons.map((r) => (
                            <label
                                key={r.id}
                                className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${reason === r.id ? 'border-red-500 bg-red-50 ring-1 ring-red-500' : 'border-slate-200 hover:border-red-200'}`}
                            >
                                <input
                                    type="radio"
                                    name="rejection-reason"
                                    value={r.id}
                                    checked={reason === r.id}
                                    onChange={() => setReason(r.id)}
                                    className="mt-1 w-4 h-4 text-red-600 accent-red-600"
                                />
                                <div className="ml-3">
                                    <span className={`block text-sm font-bold ${reason === r.id ? 'text-red-700' : 'text-slate-700'}`}>{r.label}</span>
                                    <span className="block text-xs text-slate-500 mt-0.5">{r.desc}</span>
                                </div>
                            </label>
                        ))}
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
                        onClick={handleReject}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-200 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'İşleniyor...' : 'Reddet ve Öğret'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RejectionModal;
