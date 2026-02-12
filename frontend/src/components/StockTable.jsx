import React, { useMemo } from 'react';
import {
    BoltIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ABCIndicator = ({ category }) => {
    const dotColors = {
        'A': 'bg-emerald-500',
        'B': 'bg-blue-500',
        'C': 'bg-slate-400'
    };

    return (
        <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${dotColors[category] || dotColors['C']}`} />
            <span className="text-[11px] font-bold text-slate-500">{category}</span>
        </div>
    );
};

const StockTable = ({ inventory, onAction }) => {
    const sortedInventory = useMemo(() => {
        return [...inventory].sort((a, b) => {
            const getRisk = (item) => (item.quantity / (item.forecast_next_7_days || 1));
            const riskA = getRisk(a);
            const riskB = getRisk(b);
            if (riskA !== riskB) return riskA - riskB;
            return a.abc_category.localeCompare(b.abc_category);
        });
    }, [inventory]);

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-white">
            {/* Table Header */}
            <div className="flex items-center bg-slate-50/80 border-b border-slate-200 py-2.5 shrink-0">
                <div className="w-16 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">ABC</div>
                <div className="flex-1 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-0">Ürün Bilgisi</div>
                <div className="w-24 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right shrink-0">Stok</div>
                <div className="w-24 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right shrink-0">Talep (7G)</div>
                <div className="w-24 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right shrink-0">Net Bakiye</div>
                <div className="w-32 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right shrink-0">Aksiyon</div>
            </div>

            {/* High-Density Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {sortedInventory.map((item) => {
                    const netBalance = item.quantity - item.forecast_next_7_days;
                    const isCritical = item.quantity < item.safety_stock;

                    return (
                        <div
                            key={item.product_id}
                            className={`flex items-center group border-b border-slate-50 transition-colors hover:bg-blue-50/40 ${isCritical ? 'bg-red-50' : ''}`}
                            style={{ height: '44px' }}
                        >
                            {/* ABC */}
                            <div className="w-16 px-4 shrink-0">
                                <ABCIndicator category={item.abc_category} />
                            </div>

                            {/* Ürün Bilgisi */}
                            <div className="flex-1 px-4 min-w-0">
                                <div className="font-bold text-slate-700 text-[12px] truncate">{item.product_name}</div>
                                <div className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-tighter">
                                    SKU-{item.product_id} • {item.category}
                                </div>
                            </div>

                            {/* Stok (Right Aligned) */}
                            <div className="w-24 px-4 text-right shrink-0">
                                <span className={`text-[13px] font-bold ${isCritical ? 'text-red-600' : 'text-slate-600'}`}>
                                    {item.quantity}
                                </span>
                            </div>

                            {/* Talep (Right Aligned) */}
                            <div className="w-24 px-4 text-right shrink-0">
                                <span className="text-[12px] font-medium text-slate-400">
                                    {item.forecast_next_7_days}
                                </span>
                            </div>

                            {/* Net Bakiye (Right Aligned) */}
                            <div className="w-24 px-4 text-right shrink-0">
                                <span className={`text-[13px] font-black ${netBalance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {netBalance > 0 ? '+' : ''}{Math.round(netBalance)}
                                </span>
                            </div>

                            {/* Aksiyon */}
                            <div className="w-32 px-4 text-right shrink-0">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onAction(netBalance < 0 ? 'TRANSFER_REQUEST' : 'TRANSFER_OFFER', item)}
                                        className={`p-1.5 rounded-lg transition-all transform hover:scale-110
                                            ${netBalance < 0
                                                ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                                        title={netBalance < 0 ? "Hızlı Transfer Talep Et" : "Fazla Stoğu Dağıt"}
                                    >
                                        <BoltIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StockTable;
