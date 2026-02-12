import React, { useState, useEffect } from 'react';
import AssistantBanner from '../AssistantBanner';
import { SparklesIcon, CloudIcon, CalendarDaysIcon, SunIcon } from '@heroicons/react/24/outline';
import Tilt from 'react-parallax-tilt';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useDashboardExtras } from '../../hooks/useDashboardExtras';
import { useUI } from '../../context/UIContext';
import axiosClient from '../../api/axios';

// ==========================================
// Hava Durumu İkon Mapping (WeatherAPI condition code → emoji)
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

// Gün ismi kısaltması
const getDayName = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) return 'Bugün';
    if (date.getTime() === tomorrow.getTime()) return 'Yarın';
    return date.toLocaleDateString('tr-TR', { weekday: 'short' });
};

const AssistantWidget = ({ style, className, ...props }) => {
    const { aiVoice } = useDashboardExtras();
    const { openCalendarDrawer } = useUI();
    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState('insights'); // 'insights' | 'calendar'

    // Hava durumu verisi çek
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const { data } = await axiosClient.get('/api/weather?city=Istanbul');
                setWeather(data);
            } catch (err) {
                console.error('Weather fetch error:', err);
            } finally {
                setWeatherLoading(false);
            }
        };
        fetchWeather();
        // Her 1 saatte bir yenile (backend cache ile senkron)
        const interval = setInterval(fetchWeather, 3600000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Tilt
            glareEnable={true}
            glareMaxOpacity={0.1}
            glareColor="#ffffff"
            glarePosition="all"
            scale={1.01}
            transitionSpeed={2500}
            tiltMaxAngleX={5}
            tiltMaxAngleY={5}
            style={style}
            className={`h-full ${className}`}
            {...props}
        >
            <div className="flex flex-col gap-3 h-full">

                {/* ═══════════════════════════════════════════
                    🌦️ HAVA DURUMU KARTI (Compact)
                    ═══════════════════════════════════════════ */}
                <div className="bg-gradient-to-br from-sky-500/10 to-blue-600/10 backdrop-blur-md rounded-3xl p-4 border border-sky-200/40 relative overflow-hidden group flex-shrink-0">
                    {/* Drag Handle */}
                    <div className="absolute top-2 right-2 z-20 cursor-move text-sky-300 hover:text-sky-500 drag-handle">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </div>

                    {/* Dekoratif arka plan efektleri */}
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-blue-400/15 rounded-full blur-2xl pointer-events-none" />

                    {weatherLoading ? (
                        <div className="flex items-center gap-3 animate-pulse">
                            <div className="w-12 h-12 bg-sky-200/40 rounded-2xl" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-sky-200/40 rounded w-24" />
                                <div className="h-5 bg-sky-200/40 rounded w-16" />
                            </div>
                        </div>
                    ) : weather ? (
                        <div className="relative z-10">
                            {/* Ana hava durumu */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="text-4xl leading-none">
                                        {getWeatherEmoji(weather.current.condition_code, weather.current.is_day)}
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-slate-800 tracking-tight">
                                                {Math.round(weather.current.temp_c)}°
                                            </span>
                                            <span className="text-xs text-slate-500 font-medium">
                                                Hissedilen {Math.round(weather.current.feelslike_c)}°
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 font-semibold mt-0.5">
                                            {weather.current.condition}
                                        </p>
                                    </div>
                                </div>

                                {/* Detay bilgiler */}
                                <div className="flex flex-col items-end gap-1 text-[10px] text-slate-500 font-medium">
                                    <span>💧 %{weather.current.humidity}</span>
                                    <span>💨 {Math.round(weather.current.wind_kph)} km/s</span>
                                    <span className="text-[9px] text-slate-400">{weather.location.name}</span>
                                </div>
                            </div>

                            {/* 3 günlük tahmin */}
                            <div className="flex gap-2 mt-1">
                                {weather.forecast.map((day, i) => (
                                    <div
                                        key={day.date}
                                        className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-colors ${i === 0
                                                ? 'bg-white/60 border border-sky-200/40 shadow-sm'
                                                : 'hover:bg-white/30'
                                            }`}
                                    >
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                                            {getDayName(day.date)}
                                        </span>
                                        <span className="text-lg leading-none">
                                            {getWeatherEmoji(null, true)}
                                        </span>
                                        <div className="flex items-center gap-1 text-[10px]">
                                            <span className="font-bold text-slate-700">{Math.round(day.maxtemp_c)}°</span>
                                            <span className="text-slate-400">{Math.round(day.mintemp_c)}°</span>
                                        </div>
                                        {day.daily_chance_of_rain > 30 && (
                                            <span className="text-[9px] text-blue-500 font-semibold">
                                                🌧 %{day.daily_chance_of_rain}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Yağış uyarısı */}
                            {weather.forecast.some(d => d.daily_chance_of_rain > 50) && (
                                <div className="mt-2 px-3 py-1.5 bg-blue-500/10 border border-blue-200/30 rounded-xl text-[10px] text-blue-700 font-semibold flex items-center gap-1.5">
                                    <span>🌧️</span>
                                    <span>Yakında yağış bekleniyor — şemsiye/yağmurluk stoğunu kontrol edin</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <CloudIcon className="w-4 h-4" />
                            <span>Hava durumu yüklenemedi</span>
                        </div>
                    )}
                </div>

                {/* ═══════════════════════════════════════════
                    📋 TAB KONTROLLÜ İÇERİK (Insights / Takvim)
                    ═══════════════════════════════════════════ */}
                <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/60 relative flex-1 overflow-hidden flex flex-col min-h-0">

                    {/* Tab Header */}
                    <div className="flex items-center border-b border-slate-100 px-4 pt-3 pb-0 flex-shrink-0">
                        <button
                            onClick={() => setActiveTab('insights')}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 ${activeTab === 'insights'
                                    ? 'text-blue-600 border-blue-500 bg-blue-50/50'
                                    : 'text-slate-400 border-transparent hover:text-slate-600'
                                }`}
                        >
                            <SparklesIcon className="w-3.5 h-3.5" />
                            Uyarılar
                        </button>
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 ${activeTab === 'calendar'
                                    ? 'text-indigo-600 border-indigo-500 bg-indigo-50/50'
                                    : 'text-slate-400 border-transparent hover:text-slate-600'
                                }`}
                        >
                            <CalendarDaysIcon className="w-3.5 h-3.5" />
                            Takvim
                        </button>

                        {/* Live badge */}
                        <div className="ml-auto text-[9px] font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full animate-pulse">
                            CANLI
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                        {activeTab === 'insights' ? (
                            <AssistantBanner />
                        ) : (
                            <div className="space-y-3">
                                {/* Mini Calendar */}
                                <div className="calendar-widget-style">
                                    <Calendar
                                        onChange={setCalendarDate}
                                        value={calendarDate}
                                        className="border-none w-full text-sm font-medium text-slate-600 bg-transparent"
                                        tileClassName={({ date, view }) => {
                                            if (view === 'month' && date.toDateString() === new Date().toDateString()) {
                                                return 'bg-indigo-500 text-white rounded-full font-bold shadow-md';
                                            }
                                            return 'hover:bg-slate-100 rounded-lg transition-colors text-slate-700';
                                        }}
                                        navigationLabel={({ date }) => (
                                            <span className="text-slate-800 font-bold text-sm capitalize">
                                                {date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                                            </span>
                                        )}
                                        next2Label={null}
                                        prev2Label={null}
                                        formatShortWeekday={(locale, date) =>
                                            date.toLocaleDateString('tr-TR', { weekday: 'short' }).slice(0, 2)
                                        }
                                    />
                                </div>

                                {/* Tümünü Gör butonu */}
                                <div className="flex justify-end pt-1">
                                    <button
                                        onClick={openCalendarDrawer}
                                        className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1"
                                    >
                                        <CalendarDaysIcon className="w-3.5 h-3.5" />
                                        Detaylı Takvim
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══════════════════════════════════════════
                    🤖 AI VOICE PANEL (Mevcut)
                    ═══════════════════════════════════════════ */}
                <div className="bg-slate-900 p-5 rounded-3xl shadow-xl shadow-slate-200 text-white relative overflow-hidden group flex-shrink-0">
                    {/* Abstract Art */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[40px] -mr-6 -mt-6 rounded-full group-hover:bg-blue-500/30 transition-all duration-700" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-blue-500/20 rounded-lg">
                                <SparklesIcon className="w-4 h-4 text-blue-400" />
                            </div>
                            <h4 className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Statistical Engine</h4>
                        </div>
                        <p className="text-sm font-medium leading-relaxed mb-3 text-slate-200 line-clamp-3">
                            "{aiVoice?.summary || 'Veriler analiz ediliyor...'}"
                        </p>
                        <div className="flex items-center justify-between border-t border-white/10 pt-3">
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Güven Skoru</span>
                            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20">
                                {aiVoice?.confidence || '%98.2'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Widget Stilleri */}
            <style>{`
                .calendar-widget-style .react-calendar {
                    font-family: inherit;
                }
                .calendar-widget-style .react-calendar__navigation button {
                    min-width: 28px;
                    background: none;
                    font-size: 0.85rem;
                }
                .calendar-widget-style .react-calendar__navigation button:enabled:hover,
                .calendar-widget-style .react-calendar__navigation button:enabled:focus {
                    background-color: #f1f5f9;
                    border-radius: 8px;
                }
                .calendar-widget-style .react-calendar__month-view__weekdays {
                    text-transform: uppercase;
                    font-size: 0.6em;
                    font-weight: 700;
                    color: #94a3b8;
                    margin-bottom: 4px;
                }
                .calendar-widget-style .react-calendar__month-view__days__day {
                    padding: 6px;
                    font-size: 0.8rem;
                }
                .calendar-widget-style .react-calendar__tile--now {
                    background: transparent;
                }
                .calendar-widget-style .react-calendar__tile--now:enabled:hover,
                .calendar-widget-style .react-calendar__tile--now:enabled:focus {
                    background: #f1f5f9;
                }
                .calendar-widget-style .react-calendar__tile--active {
                    background: #6366f1 !important;
                    color: white !important;
                    border-radius: 8px;
                }
            `}</style>
        </Tilt>
    );
};

export default AssistantWidget;
