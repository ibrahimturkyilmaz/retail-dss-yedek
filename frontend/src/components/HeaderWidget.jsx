import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PowerIcon } from '@heroicons/react/24/solid';

import SmartQueryBar from './SmartQueryBar';
import Dock from './Dock';
import CalendarPopup from './widgets/CalendarPopup';
import axiosClient from '../api/axios';

// ==========================================
// Hava Durumu Emoji Mapping
// ==========================================
const getWeatherEmoji = (code, isDay) => {
    if (!code) return '🌤️';
    if (code === 1000) return isDay ? '☀️' : '🌙';
    if (code === 1003) return isDay ? '⛅' : '☁️';
    if ([1006, 1009].includes(code)) return '☁️';
    if ([1030, 1135, 1147].includes(code)) return '🌫️';
    if ([1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) return '🌧️';
    if ([1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) return '🌨️';
    if ([1087, 1273, 1276].includes(code)) return '⛈️';
    if ([1117].includes(code)) return '❄️';
    return '🌤️';
};

const HeaderWidget = () => {
    const [time, setTime] = useState(new Date());
    const [greeting, setGreeting] = useState('');
    const [greetingEmoji, setGreetingEmoji] = useState('');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [weather, setWeather] = useState(null);
    const [isDaytime, setIsDaytime] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Saat güncelleme
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setTime(now);
            updateGreeting(now.getHours());
        }, 1000);
        updateGreeting(new Date().getHours());
        return () => clearInterval(timer);
    }, []);

    // Hava durumu çek (header indicator için)
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const { data } = await axiosClient.get('/api/weather?city=Istanbul');
                setWeather(data);
                setIsDaytime(data?.current?.is_day === 1);
            } catch (err) {
                console.error('Header weather error:', err);
            }
        };
        fetchWeather();
        const interval = setInterval(fetchWeather, 3600000); // 1 saat
        return () => clearInterval(interval);
    }, []);

    const updateGreeting = (hour) => {
        if (hour >= 6 && hour < 12) {
            setGreeting('Günaydın');
            setGreetingEmoji('☀️');
            setIsDaytime(true);
        } else if (hour >= 12 && hour < 18) {
            setGreeting('İyi Günler');
            setGreetingEmoji('🌤️');
            setIsDaytime(true);
        } else if (hour >= 18 && hour < 21) {
            setGreeting('İyi Akşamlar');
            setGreetingEmoji('🌅');
            setIsDaytime(false);
        } else {
            setGreeting('İyi Geceler');
            setGreetingEmoji('🌙');
            setIsDaytime(false);
        }
    };

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('tr-TR', {
            day: 'numeric',
            month: 'long',
            weekday: 'short'
        }).format(date);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Gündüz / Gece teması
    const dayNightTheme = isDaytime
        ? {
            timeBg: 'bg-white/50 hover:bg-amber-50/60 border-white/50 hover:border-amber-200/40',
            timeText: 'text-slate-900',
            dateText: 'text-slate-500',
            hoverLabel: 'text-amber-600',
            greetBg: 'bg-white/50 hover:bg-red-500/10 border-white/50 hover:border-red-500/20',
            weatherBg: 'bg-gradient-to-r from-sky-50/70 to-blue-50/70 border-sky-200/40 hover:border-sky-300/50',
            weatherText: 'text-sky-700',
            glowColor: 'shadow-amber-100/30',
        }
        : {
            timeBg: 'bg-slate-800/60 hover:bg-indigo-900/40 border-slate-600/40 hover:border-indigo-400/30',
            timeText: 'text-white',
            dateText: 'text-slate-400',
            hoverLabel: 'text-indigo-400',
            greetBg: 'bg-slate-800/60 hover:bg-red-900/20 border-slate-600/40 hover:border-red-500/30',
            weatherBg: 'bg-gradient-to-r from-slate-800/60 to-indigo-900/40 border-indigo-400/20 hover:border-indigo-400/30',
            weatherText: 'text-indigo-300',
            glowColor: 'shadow-indigo-500/20',
        };

    return (
        <div className="fixed top-6 right-6 z-40 hidden md:flex items-center gap-3 select-none">

            {/* Smart Assistant Bar */}
            <div className="mr-1 relative z-50">
                <SmartQueryBar />
            </div>

            {/* Navigation Dock */}
            <Dock />

            {/* ═══════════════════════════════════════
                🌡️ HAVA DURUMU GÖSTERGESI (Minimalist / Her zaman görünür)
                ═══════════════════════════════════════ */}
            {weather && (
                <div
                    className={`backdrop-blur-xl rounded-full py-2 px-4 flex items-center gap-2 shadow-lg cursor-default transition-all duration-500 h-[54px] ${dayNightTheme.weatherBg} border`}
                    title={`${weather.current.condition} • ${weather.location.name}`}
                >
                    <span className="text-xl leading-none">
                        {getWeatherEmoji(weather.current.condition_code, weather.current.is_day)}
                    </span>
                    <div className="flex flex-col items-center">
                        <span className={`text-lg font-black tracking-tight leading-none ${dayNightTheme.weatherText}`}>
                            {Math.round(weather.current.temp_c)}°
                        </span>
                        <span className={`text-[8px] font-bold uppercase tracking-wider opacity-70 ${dayNightTheme.weatherText}`}>
                            {weather.location.name}
                        </span>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════
                👤 KARŞILAMA MODÜLÜ (Büyütülmüş)
                ═══════════════════════════════════════ */}
            <div
                className={`group relative backdrop-blur-xl rounded-2xl py-2.5 px-6 flex flex-col items-center justify-center shadow-lg cursor-pointer h-[54px] min-w-[140px] transition-all duration-500 border ${dayNightTheme.greetBg}`}
                onClick={handleLogout}
            >
                <div className="flex flex-col items-end transition-all duration-300 group-hover:opacity-0 group-hover:scale-95 absolute">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] leading-none">{greetingEmoji}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider opacity-80 ${isDaytime ? 'text-slate-500' : 'text-slate-400'}`}>
                            {greeting}
                        </span>
                    </div>
                    <span className={`text-sm font-bold mt-0.5 ${isDaytime ? 'text-slate-800' : 'text-white'}`}>
                        {user?.name || user?.username || 'Misafir'}
                    </span>
                </div>

                {/* Logout Hover State */}
                <div className="hidden group-hover:flex items-center space-x-2 text-red-500 font-bold animate-in fade-in zoom-in duration-300 absolute">
                    <PowerIcon className="w-4 h-4" />
                    <span className="text-sm">Çıkış</span>
                </div>
            </div>

            {/* ═══════════════════════════════════════
                🕐 SAAT & TARİH MODÜLÜ (Büyütülmüş + Gündüz/Gece Teması)
                ═══════════════════════════════════════ */}
            <div className="relative">
                <div
                    className={`group backdrop-blur-xl rounded-2xl py-2.5 px-6 flex flex-col items-center justify-center shadow-lg cursor-pointer h-[54px] min-w-[120px] transition-all duration-500 border ${dayNightTheme.timeBg} ${dayNightTheme.glowColor}`}
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                >
                    <div className="flex flex-col items-end transition-all duration-300 group-hover:opacity-0 group-hover:scale-95 absolute">
                        <span className={`text-[10px] font-bold uppercase tracking-wider opacity-80 ${dayNightTheme.dateText}`}>
                            {formatDate(time)}
                        </span>
                        <span className={`text-xl font-black leading-none tabular-nums tracking-tight ${dayNightTheme.timeText}`}>
                            {formatTime(time)}
                        </span>
                    </div>

                    {/* Calendar Hover State */}
                    <div className={`hidden group-hover:flex items-center justify-center font-bold animate-in fade-in zoom-in duration-300 absolute ${dayNightTheme.hoverLabel}`}>
                        <span className="text-sm">📅 Takvim</span>
                    </div>
                </div>

                {/* Calendar Popup */}
                <CalendarPopup
                    isOpen={isCalendarOpen}
                    onClose={() => setIsCalendarOpen(false)}
                />
            </div>
        </div>
    );
};

export default HeaderWidget;
