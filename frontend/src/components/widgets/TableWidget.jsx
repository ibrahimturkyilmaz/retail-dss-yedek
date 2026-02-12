import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

import { useDashboardExtras } from '../../hooks/useDashboardExtras';

const TableWidget = ({ style, className, ...props }) => {
    const { criticalStock } = useDashboardExtras();

    return (
        <div style={style} className={`bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col h-full ${className}`} {...props}>
            {/* Header with Drag Handle */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center relative">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 rounded-xl">
                        <ExclamationTriangleIcon className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-base">Kritik Stok Takibi</h3>
                        <p className="text-xs text-slate-500">7 Günlük Yapay Zeka Projeksiyonu</p>
                    </div>
                </div>

                {/* Drag Handle */}
                <div className="cursor-move text-slate-300 hover:text-slate-500 drag-handle ml-auto mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </div>

                <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-1 rounded-lg font-bold uppercase tracking-wider animate-pulse flex-shrink-0">Aksiyon</span>
            </div>

            <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3">Mağaza</th>
                            <th className="px-6 py-3">Mevcut Stok</th>
                            <th className="px-6 py-3">Tahmin (7G)</th>
                            <th className="px-6 py-3">Risk</th>
                            <th className="px-6 py-3 text-right">Aksiyon</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {criticalStock.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800">{row.name}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">SKU: Kritik/A</span>
                                    </div>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-700">{row.stock}</span>
                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full bg-${row.color}-500`} style={{ width: `${Math.min(100, (row.stock / row.forecast) * 100)}%` }} />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-3 text-sm font-medium text-slate-600">{row.forecast}</td>
                                <td className="px-6 py-3">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-${row.color === 'rose' ? 'rose-50' : 'amber-50'} text-${row.color === 'rose' ? 'rose-600' : 'amber-600'} border border-${row.color === 'rose' ? 'rose-100' : 'amber-100'}`}>
                                        {row.risk}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <button className="text-[10px] font-bold px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-blue-600 hover:shadow-lg transition-all">
                                        Transfer
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {criticalStock.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-slate-400 font-medium text-sm">
                                    Kritik stok uyarısı bulunmuyor.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TableWidget;
