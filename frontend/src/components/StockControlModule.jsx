import React from 'react';
import { ArrowRightIcon, ExclamationTriangleIcon, TruckIcon } from '@heroicons/react/24/outline';

const StockControlModule = ({ data }) => {
    // Mock data if not provided (for development)
    const stockItems = data || [
        { id: 1, name: 'Kot Pantolon (M)', store: 'Kadıköy', stock: 5, demand: 45, status: 'CRITICAL' },
        { id: 2, name: 'Spor Ayakkabı (42)', store: 'Beşiktaş', stock: 120, demand: 20, status: 'EXCESS' },
        { id: 3, name: 'Tişört (L)', store: 'Şişli', stock: 12, demand: 15, status: 'BALANCED' },
        { id: 4, name: 'Gömlek (S)', store: 'Kadıköy', stock: 2, demand: 25, status: 'CRITICAL' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'CRITICAL': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
            case 'EXCESS': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
        }
    };

    const getProgressBarColor = (stock, demand) => {
        const ratio = stock / demand;
        if (ratio < 0.3) return 'bg-red-500';
        if (ratio > 2.0) return 'bg-blue-500';
        return 'bg-green-500';
    };

    return (
        <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/50">
                <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-primary" />
                        Mağaza Stok Kontrol Modülü
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Veriler her 24 saatte bir güncellenir.
                    </p>
                </div>
                <button className="text-xs font-medium text-primary hover:underline">
                    Tümünü Gör
                </button>
            </div>

            <div className="p-0">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-4 py-3 font-medium">Ürün / Mağaza</th>
                            <th className="px-4 py-3 font-medium text-center">Durum</th>
                            <th className="px-4 py-3 font-medium w-1/3">Talep / Stok Dengesi</th>
                            <th className="px-4 py-3 font-medium text-right">Aksiyon</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {stockItems.map((item) => (
                            <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 font-medium">
                                    <div className="text-foreground">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">{item.store}</div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${getStatusColor(item.status)}`}>
                                        {item.status === 'CRITICAL' ? 'KRİTİK' : item.status === 'EXCESS' ? 'FAZLA' : 'DENGELİ'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                                        <span>Stok: {item.stock}</span>
                                        <span>Talep (7G): {item.demand}</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(item.stock, item.demand)}`}
                                            style={{ width: `${Math.min((item.stock / item.demand) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        className="inline-flex items-center justify-center p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors group"
                                        title="Transfer Planla"
                                    >
                                        <TruckIcon className="w-5 h-5" />
                                        <span className="hidden group-hover:inline ml-1 text-xs font-medium">Planla</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockControlModule;
