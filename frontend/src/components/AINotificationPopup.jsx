import React, { useEffect, useState } from 'react';
import { XMarkIcon, SpeakerWaveIcon, ArrowTopRightOnSquareIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

// Sayfa isim mapping
const PAGE_NAMES = {
    '/': 'Dashboard',
    '/analytics': 'Analiz',
    '/stores': 'Mağazalar',
    '/transfers': 'Transferler',
    '/simulations': 'Simülasyonlar',
    '/settings': 'Ayarlar',
};

const AINotificationPopup = ({ notification, onClose, voiceGender, onSpeak }) => {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (notification) {
            setIsExiting(false);
            // Küçük gecikme ile animasyonlu giriş
            const timer = setTimeout(() => setIsVisible(true), 50);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [notification]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, 300);
    };

    const handleNavigate = (path) => {
        navigate(path);
    };

    if (!notification) return null;

    return (
        <div className={`fixed bottom-6 right-6 z-[9999] max-w-md w-full transition-all duration-500 ease-out ${isVisible && !isExiting
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-8 opacity-0 scale-95'
            }`}>
            <div className={`relative rounded-2xl shadow-2xl border overflow-hidden ${isDark
                ? 'bg-slate-800/95 backdrop-blur-xl border-slate-700/60 shadow-black/40'
                : 'bg-white/95 backdrop-blur-xl border-white/60 shadow-slate-300/50'
                }`}>

                {/* ═══ Header ═══ */}
                <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'
                    }`}>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20">
                            <SparklesIcon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                            <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-600'
                                }`}>AI Asistan</h4>
                            <p className={`text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {notification.timestamp} • {voiceGender === 'female' ? '👩 Kadın' : '👨 Erkek'} ses
                            </p>
                        </div>
                    </div>

                    {/* 🔴 Yanıp Sönen Kapatma Butonu */}
                    <button
                        onClick={handleClose}
                        className="relative p-1.5 rounded-full transition-all hover:scale-110 group"
                        title="Kapat"
                    >
                        {/* Yanıp sönen kırmızı halo */}
                        <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                        <span className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse" />
                        <span className="relative flex items-center justify-center w-6 h-6 bg-red-500 rounded-full shadow-lg shadow-red-500/40 group-hover:bg-red-600 transition-colors">
                            <XMarkIcon className="w-3.5 h-3.5 text-white" />
                        </span>
                    </button>
                </div>

                {/* ═══ Sorgu Bağlamı ═══ */}
                {notification.query && (
                    <div className={`px-4 py-2 text-[10px] font-medium flex items-center gap-1.5 ${isDark ? 'bg-slate-700/30 text-slate-400' : 'bg-slate-50 text-slate-500'
                        }`}>
                        <span>💬</span>
                        <span className="truncate">"{notification.query}"</span>
                    </div>
                )}

                {/* ═══ İçerik ═══ */}
                <div className="px-4 py-4 max-h-72 overflow-y-auto custom-scrollbar">

                    {/* Metin / Rate Limit Yanıtı */}
                    {notification.type !== 'table' && (
                        <div>
                            <p className={`text-sm leading-relaxed font-medium ${notification.type === 'error'
                                ? 'text-red-500'
                                : notification.type === 'rate_limit'
                                    ? isDark ? 'text-amber-400' : 'text-amber-600'
                                    : isDark ? 'text-slate-200' : 'text-slate-700'
                                }`}>
                                {notification.message}
                            </p>
                            {notification.type === 'rate_limit' && notification.cooldown > 0 && (
                                <div className={`mt-3 flex items-center gap-2 text-xs font-bold ${isDark ? 'text-amber-300' : 'text-amber-500'
                                    }`}>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${(notification.cooldown / 20) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tablo Yanıtı */}
                    {notification.type === 'table' && notification.table && (
                        <div className="space-y-3">
                            {notification.message && (
                                <p className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {notification.message}
                                </p>
                            )}
                            <div className="overflow-x-auto rounded-xl border border-slate-200/50">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className={isDark ? 'bg-slate-700/50' : 'bg-slate-50'}>
                                            {notification.table.columns.map((col, i) => (
                                                <th key={i} className={`px-3 py-2 font-bold text-left ${isDark ? 'text-slate-300' : 'text-slate-600'
                                                    }`}>
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notification.table.rows.map((row, ri) => (
                                            <tr key={ri} className={`border-t ${isDark ? 'border-slate-700/50' : 'border-slate-100'
                                                }`}>
                                                {row.map((cell, ci) => (
                                                    <td key={ci} className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-700'
                                                        }`}>
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══ Alt Aksiyonlar ═══ */}
                <div className={`flex items-center justify-between px-4 py-3 border-t ${isDark ? 'border-slate-700/50 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'
                    }`}>
                    {/* Sesli Oku Butonu */}
                    <button
                        onClick={() => onSpeak?.(notification.message)}
                        className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${isDark
                                ? 'text-blue-400 hover:bg-blue-500/10'
                                : 'text-blue-600 hover:bg-blue-50'
                            }`}
                    >
                        <SpeakerWaveIcon className="w-3.5 h-3.5" />
                        Sesli Oku
                    </button>

                    {/* Kalan Hak Rozeti */}
                    {notification.remaining !== undefined && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${notification.remaining > 10
                                ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                                : notification.remaining > 0
                                    ? isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600'
                                    : isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600'
                            }`}>
                            {notification.remaining}/50 hak
                        </span>
                    )}

                    {/* Sayfaya Git Butonu */}
                    {notification.navigate && (
                        <button
                            onClick={() => handleNavigate(notification.navigate)}
                            className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
                        >
                            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                            {PAGE_NAMES[notification.navigate] || 'Sayfaya Git'}
                        </button>
                    )}
                </div>

                {/* Dekoratif gradient çizgi */}
                <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            </div>
        </div>
    );
};

export default AINotificationPopup;
