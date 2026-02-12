import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUI } from '../../context/UIContext';

const CalendarPopup = ({ isOpen, onClose }) => {
    const [date, setDate] = useState(new Date());
    const { openCalendarDrawer } = useUI();

    // Opsiyonel: Dışarı tıklandığında kapanması için ref logic eklenebilir
    // Şimdilik parent (HeaderWidget) kontrol edecek.

    if (!isOpen) return null;

    return (
        <div className="absolute top-16 right-0 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
            <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl p-4 w-80">
                <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="text-slate-700 font-bold text-lg">Takvim</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
                    >
                        Kapat
                    </button>
                </div>

                <div className="calendar-custom-style">
                    <Calendar
                        onChange={setDate}
                        value={date}
                        className="border-none w-full text-sm font-medium text-slate-600 bg-transparent"
                        tileClassName={({ date, view }) => {
                            // Bugünü özel işaretle
                            if (view === 'month' && date.toDateString() === new Date().toDateString()) {
                                return 'bg-indigo-500 text-white rounded-full font-bold shadow-md';
                            }
                            return 'hover:bg-slate-100 rounded-lg transition-colors text-slate-700';
                        }}
                        navigationLabel={({ date, label, locale, view }) => (
                            <span className="text-slate-800 font-bold text-base capitalize">
                                {date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                            </span>
                        )}
                        nextLabel={<ChevronRight size={18} className="text-slate-500" />}
                        prevLabel={<ChevronLeft size={18} className="text-slate-500" />}
                        next2Label={null}
                        prev2Label={null}
                        formatShortWeekday={(locale, date) =>
                            date.toLocaleDateString('tr-TR', { weekday: 'short' }).slice(0, 2)
                        }
                    />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                    <span>Etkinlik yok</span>
                    <button
                        onClick={() => {
                            openCalendarDrawer();
                            onClose();
                        }}
                        className="text-indigo-600 font-bold hover:underline"
                    >
                        Tümünü Gör
                    </button>
                </div>
            </div>

            {/* Arrow */}
            <div className="absolute -top-2 right-8 w-4 h-4 bg-white/90 backdrop-blur-xl border-t border-l border-white/50 rotate-45 transform"></div>

            <style>{`
                .calendar-custom-style .react-calendar__navigation button {
                    min-width: 30px;
                    background: none;
                }
                .calendar-custom-style .react-calendar__navigation button:enabled:hover,
                .calendar-custom-style .react-calendar__navigation button:enabled:focus {
                    background-color: #f1f5f9;
                    border-radius: 8px;
                }
                .calendar-custom-style .react-calendar__month-view__weekdays {
                    text-transform: uppercase;
                    font-size: 0.65em;
                    font-weight: 700;
                    color: #94a3b8;
                    margin-bottom: 8px;
                }
                .calendar-custom-style .react-calendar__month-view__days__day {
                    padding: 8px;
                }
                .calendar-custom-style .react-calendar__tile--now {
                    background: transparent;
                }
                .calendar-custom-style .react-calendar__tile--now:enabled:hover,
                .calendar-custom-style .react-calendar__tile--now:enabled:focus {
                    background: #f1f5f9;
                }
            `}</style>
        </div>
    );
};

export default CalendarPopup;
