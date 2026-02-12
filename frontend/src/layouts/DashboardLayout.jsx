import React, { useState } from 'react';
import HeaderWidget from '../components/HeaderWidget';
import { Outlet } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

import CalendarDrawer from '../components/widgets/CalendarDrawer';

const DashboardLayout = () => {
    const [isZenMode, setIsZenMode] = useState(false);
    const { isDark } = useTheme();

    return (
        <div className={`min-h-screen font-sans antialiased selection:bg-blue-500 selection:text-white relative transition-all duration-500 ${isDark ? 'bg-slate-950 text-slate-200' : 'bg-muted/30 text-slate-900'}`}>
            {/* Background Gradient — Light / Dark */}
            <div className={`fixed inset-0 -z-10 transition-all duration-700 ${isDark
                    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
                    : 'bg-gradient-to-br from-slate-50 to-slate-100'
                } ${isZenMode ? 'opacity-50' : 'opacity-100'}`} />

            {/* Ambient Glow Orbs — Light: Blue/Rose, Dark: Indigo/Purple */}
            <div className={`fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] -z-10 pointer-events-none transition-all duration-1000 ${isDark
                    ? 'bg-indigo-600/15 mix-blend-screen'
                    : 'bg-blue-400/20 mix-blend-multiply'
                } ${isZenMode ? 'opacity-80' : 'opacity-100'}`} />
            <div className={`fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] -z-10 pointer-events-none transition-all duration-1000 ${isDark
                    ? 'bg-purple-600/10 mix-blend-screen'
                    : 'bg-rose-400/20 mix-blend-multiply'
                } ${isZenMode ? 'opacity-80' : 'opacity-100'}`} />

            {/* Zen Mode Toggle */}
            <button
                onClick={() => setIsZenMode(!isZenMode)}
                className={`fixed bottom-6 right-6 z-50 p-3 rounded-full transition-all duration-300 shadow-2xl border ${isZenMode
                        ? 'bg-white/10 text-slate-400 hover:text-white hover:bg-white/20 border-white/10'
                        : isDark
                            ? 'bg-slate-800 text-slate-400 hover:text-blue-400 border-slate-700'
                            : 'bg-white text-slate-400 hover:text-blue-600 border-slate-200'
                    }`}
                title={isZenMode ? "Zen Modundan Çık" : "Zen Modu (Sinema)"}
            >
                {isZenMode ? <EyeSlashIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
            </button>

            {/* Header */}
            <div className={`transition-all duration-700 ${isZenMode ? '-translate-y-32 opacity-0' : 'translate-y-0 opacity-100'}`}>
                <HeaderWidget />
            </div>

            {/* Main Content */}
            <main className={`min-h-screen pb-8 pt-28 px-4 md:px-8 md:pr-28 flex flex-col items-center transition-all duration-700 ${isZenMode ? 'scale-105 pt-12 pr-4' : ''}`}>
                <div className="w-full max-w-[1600px] animate-in fade-in duration-500 slide-in-from-bottom-4">
                    <Outlet />
                </div>
            </main>

            {/* Global Calendar Drawer */}
            <CalendarDrawer />
        </div>
    );
};

export default DashboardLayout;
