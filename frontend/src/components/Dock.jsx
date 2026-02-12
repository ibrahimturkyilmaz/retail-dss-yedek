import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAVIGATION_ITEMS, BOTTOM_NAVIGATION_ITEMS } from '../constants/navigation';
import { useUI } from '../context/UIContext';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const Dock = () => {
    const location = useLocation();
    const { toggleCalendarDrawer } = useUI();
    const { isDark, toggleTheme } = useTheme();

    const isActiveLink = (path) => location.pathname === path;

    const handleItemClick = (e, item) => {
        if (item.path === '/calendar') {
            e.preventDefault();
            toggleCalendarDrawer();
        }
    };

    return (
        <div className={`flex items-center gap-4 p-2 backdrop-blur-xl border rounded-full shadow-lg relative group-container mx-4 transition-all duration-300 ${isDark
                ? 'bg-slate-800/70 border-slate-700/50 shadow-black/20 hover:bg-slate-800/90'
                : 'bg-white/60 border-white/50 shadow-slate-200/50 hover:bg-white/80'
            }`}>

            {/* Main Navigation Items */}
            {NAVIGATION_ITEMS.map((item) => (
                <DockItem
                    key={item.path}
                    item={item}
                    isActive={isActiveLink(item.path)}
                    onClick={(e) => handleItemClick(e, item)}
                    isDark={isDark}
                />
            ))}

            {/* Separator */}
            <div className={`h-8 w-px ${isDark ? 'bg-slate-600/50' : 'bg-slate-400/30'}`} />

            {/* Bottom/Settings Items */}
            {BOTTOM_NAVIGATION_ITEMS.map((item) => (
                <DockItem
                    key={item.path}
                    item={item}
                    isActive={isActiveLink(item.path)}
                    isDark={isDark}
                />
            ))}

            {/* Separator */}
            <div className={`h-8 w-px ${isDark ? 'bg-slate-600/50' : 'bg-slate-400/30'}`} />

            {/* 🌙 Dark Mode Toggle */}
            <button
                onClick={toggleTheme}
                className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${isDark
                        ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 hover:scale-110'
                        : 'bg-amber-100/60 text-amber-600 hover:bg-amber-200/80 hover:scale-110'
                    }`}
                title={isDark ? 'Açık Tema' : 'Koyu Tema'}
            >
                {isDark ? (
                    <SunIcon className="w-5 h-5" />
                ) : (
                    <MoonIcon className="w-5 h-5" />
                )}
            </button>
        </div>
    );
};

const DockItem = ({ item, isActive, onClick, isDark }) => {
    return (
        <NavLink
            to={item.path}
            className="relative group"
            onClick={onClick}
        >
            {({ isActive: linkActive }) => (
                <>
                    {/* Tooltip */}
                    <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-3 text-xs px-3 py-1.5 rounded-lg font-bold backdrop-blur-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 shadow-lg translate-y-[-4px] group-hover:translate-y-0 ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-white'
                        }`}>
                        {item.name}
                        <div className={`absolute top-[-4px] left-1/2 -translate-x-1/2 border-x-[6px] border-x-transparent border-b-[6px] ${isDark ? 'border-b-slate-700' : 'border-b-slate-800'
                            }`}></div>
                    </div>

                    {/* Icon Container */}
                    <div
                        className={`
                            relative flex items-center justify-center 
                            w-10 h-10 rounded-full 
                            transition-all duration-200 ease-in-out
                            group-hover:scale-110 group-hover:shadow-md
                            ${isDark
                                ? `group-hover:bg-slate-700/80 ${isActive ? 'bg-slate-700/80 shadow-md ring-1 ring-slate-600/60' : 'bg-transparent'}`
                                : `group-hover:bg-white/80 ${isActive ? 'bg-white/80 shadow-md ring-1 ring-white/60' : 'bg-transparent'}`
                            }
                        `}
                    >
                        <item.icon
                            className={`w-5 h-5 transition-colors duration-200 ${isActive
                                    ? 'text-blue-500'
                                    : isDark
                                        ? 'text-slate-400 group-hover:text-slate-200'
                                        : 'text-slate-500 group-hover:text-slate-800'
                                }`}
                        />

                        {/* Active Dot */}
                        {isActive && (
                            <span className="absolute -bottom-1 w-1 h-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        )}
                    </div>
                </>
            )}
        </NavLink>
    );
};

export default Dock;
