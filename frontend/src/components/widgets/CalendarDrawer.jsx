import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'; // Using Heroicons for main UI
import axiosClient from '../../api/axios';

// Public Holiday ICS for Demo (Turkey)
const DEMO_ICS_URL = "https://calendar.google.com/calendar/ical/en.turkish%23holiday%40group.v.calendar.google.com/public/basic.ics";

const CalendarDrawer = () => {
    const { isCalendarDrawerOpen, closeCalendarDrawer } = useUI();
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());

    // Note Modal State
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [newNote, setNewNote] = useState({ title: '', description: '', date: '', time: '' });

    useEffect(() => {
        if (isCalendarDrawerOpen && user) {
            fetchEvents();
        }
    }, [isCalendarDrawerOpen, user]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            // 0. Fetch User Profile to get Calendar URL
            const username = user?.username || 'admin';
            let icsUrl = DEMO_ICS_URL;

            try {
                const userProfileRes = await axiosClient.get(`/api/users/${username}`);
                if (userProfileRes.data.calendar_url) {
                    icsUrl = userProfileRes.data.calendar_url;
                }
            } catch (err) {
                console.warn("Could not fetch user profile for calendar URL, using demo.", err);
            }

            // 1. Fetch Outlook (Proxy) Events
            const outlookRes = await axiosClient.get(`/api/calendar/proxy?url=${encodeURIComponent(icsUrl)}`);
            const outlookEvents = outlookRes.data.map(evt => ({
                title: evt.title,
                start: evt.start,
                end: evt.end, // FullCalendar handles null end
                backgroundColor: '#3b82f6', // Blue for Outlook
                borderColor: '#2563eb',
                extendedProps: { description: evt.description, source: 'outlook' }
            }));

            // 2. Fetch Personal Notes
            // Mock username if user is missing (for dev)
            // const username = user?.username || 'admin'; // Already declared above
            const notesRes = await axiosClient.get(`/api/calendar/notes/${username}`);
            const noteEvents = notesRes.data.map(note => ({
                id: note.id, // For deletion
                title: note.title,
                start: note.time ? `${note.date}T${note.time}` : note.date,
                backgroundColor: note.color === 'yellow' ? '#f59e0b' : note.color === 'red' ? '#ef4444' : '#10b981',
                borderColor: 'transparent',
                textColor: '#fff',
                extendedProps: { description: note.description, source: 'personal' }
            }));

            setEvents([...outlookEvents, ...noteEvents]);
        } catch (error) {
            console.error("Error fetching calendar events:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateClick = (arg) => {
        setNewNote({ ...newNote, date: arg.dateStr });
        setIsNoteModalOpen(true);
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        try {
            const username = user?.username || 'admin';
            await axiosClient.post('/api/calendar/notes', {
                ...newNote,
                username,
                color: 'yellow' // Default color
            });
            setIsNoteModalOpen(false);
            setNewNote({ title: '', description: '', date: '', time: '' });
            fetchEvents(); // Refresh
        } catch (error) {
            console.error("Error adding note:", error);
        }
    };

    const handleDeleteNote = async (id) => {
        if (window.confirm('Bu notu silmek istediğinize emin misiniz?')) {
            try {
                await axiosClient.delete(`/api/calendar/notes/${id}`);
                fetchEvents();
            } catch (error) {
                console.error("Error deleting note:", error);
            }
        }
    };

    const handleEventClick = (info) => {
        if (info.event.extendedProps.source === 'personal') {
            handleDeleteNote(info.event.id);
        } else {
            alert(`Outlook Etkinliği: ${info.event.title}\n${info.event.extendedProps.description || ''}`);
        }
    };

    return (
        <>
            {/* Backdrop */}
            {isCalendarDrawerOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
                    onClick={closeCalendarDrawer}
                />
            )}

            {/* Drawer Panel */}
            <div className={`fixed top-0 right-0 h-full w-full md:w-[600px] lg:w-[800px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isCalendarDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Takvim & Ajanda</h2>
                        <p className="text-sm text-slate-500">Outlook etkinlikleriniz ve kişisel notlarınız.</p>
                    </div>
                    <button
                        onClick={closeCalendarDrawer}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-800"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content - Split View for Desktop */}
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    {loading && <div className="text-center py-4 text-blue-600 font-medium animate-pulse">Etkinlikler yükleniyor...</div>}

                    <div className="grid grid-cols-1 gap-8 h-full">
                        {/* Full Calendar View */}
                        <div className="bg-white rounded-xl h-full calendar-drawer-style">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                }}
                                locale="tr"
                                events={events}
                                dateClick={handleDateClick}
                                eventClick={handleEventClick}
                                height="auto"
                                contentHeight="auto"
                                stickyHeaderDates={true}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer / Quick Add Note Section */}
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <PlusIcon className="w-4 h-4" />
                        Hızlı Not Ekle
                    </h3>
                    <form onSubmit={handleAddNote} className="space-y-3">
                        <input
                            type="text"
                            placeholder="Not Başlığı"
                            required
                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newNote.title}
                            onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="date"
                                required
                                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newNote.date}
                                onChange={e => setNewNote({ ...newNote, date: e.target.value })}
                            />
                            <input
                                type="time"
                                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newNote.time}
                                onChange={e => setNewNote({ ...newNote, time: e.target.value })}
                            />
                        </div>
                        <textarea
                            placeholder="Detaylar (Opsiyonel)"
                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            rows="2"
                            value={newNote.description}
                            onChange={e => setNewNote({ ...newNote, description: e.target.value })}
                        />
                        <button
                            type="submit"
                            className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Ekle
                        </button>
                    </form>
                </div>
            </div>

            {/* Helper Modal for Adding Note */}
            {isNoteModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsNoteModalOpen(false)} />
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative z-10 animate-in zoom-in duration-200">
                        <h3 className="text-lg font-bold mb-4 text-slate-800">Yeni Not Ekle</h3>
                        <form onSubmit={handleAddNote} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Başlık</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newNote.title}
                                    onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                                <textarea
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows="3"
                                    value={newNote.description}
                                    onChange={e => setNewNote({ ...newNote, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tarih</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-100 cursor-not-allowed"
                                        value={newNote.date}
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Saat (Opsiyonel)</label>
                                    <input
                                        type="time"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newNote.time}
                                        onChange={e => setNewNote({ ...newNote, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsNoteModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .calendar-drawer-style .fc-toolbar-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1e293b;
                }
                .calendar-drawer-style .fc-button-primary {
                    background-color: #3b82f6;
                    border-color: #3b82f6;
                }
                .calendar-drawer-style .fc-daygrid-day.fc-day-today {
                    background-color: #eff6ff;
                }
            `}</style>
        </>
    );
};

export default CalendarDrawer;
