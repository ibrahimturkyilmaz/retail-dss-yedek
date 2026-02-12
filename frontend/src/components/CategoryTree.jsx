import React from 'react';
import {
    FolderIcon,
    TagIcon
} from '@heroicons/react/24/outline';

const CategoryTree = ({ inventory, onSelectCategory, selectedCategory }) => {
    // 1. Group inventory by category
    const categories = [...new Set(inventory.map(item => item.category))].sort();

    // Group counts
    const getCategoryStats = (cat) => {
        const items = inventory.filter(i => i.category === cat);
        const criticalCount = items.filter(i => i.quantity < i.safety_stock).length;
        return { total: items.length, critical: criticalCount };
    };

    return (
        <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
            <div
                className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 text-[13px] mb-1.5
                    ${!selectedCategory
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-100 font-bold'
                        : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-800'}`}
                onClick={() => onSelectCategory(null)}
            >
                <FolderIcon className={`w-4 h-4 ${!selectedCategory ? 'text-white' : 'text-slate-400'}`} />
                <span>Tüm Envanter</span>
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-black
                    ${!selectedCategory ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {inventory.length}
                </span>
            </div>

            <div className="mt-4 mb-2 px-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategoriler</span>
            </div>

            {categories.map(cat => {
                const stats = getCategoryStats(cat);
                const isSelected = selectedCategory === cat;

                return (
                    <div
                        key={cat}
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 text-[12px] mb-1 group
                            ${isSelected
                                ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}`}
                        onClick={() => onSelectCategory(cat)}
                    >
                        <TagIcon className={`w-4 h-4 ${isSelected ? 'text-indigo-500' : 'text-slate-300 group-hover:text-slate-400'}`} />
                        <span className="truncate">{cat}</span>

                        <div className="ml-auto flex items-center gap-1.5">
                            {stats.critical > 0 && (
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title={`${stats.critical} kritik ürün`} />
                            )}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold
                                ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                {stats.total}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CategoryTree;
