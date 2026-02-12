import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, SparklesIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axios';
import AINotificationPopup from './AINotificationPopup';
import { useTheme } from '../context/ThemeContext';

const SmartQueryBar = () => {
    const navigate = useNavigate();
    const navigateRef = useRef(navigate);
    const { isDark, toggleTheme } = useTheme();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [history, setHistory] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [voiceGender, setVoiceGender] = useState(() => localStorage.getItem('ai_voice_gender') || 'female');
    const [cooldown, setCooldown] = useState(0);
    const [remaining, setRemaining] = useState(50);
    const recognitionRef = useRef(null);
    const inputRef = useRef(null);

    // Cooldown geri sayım
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) { clearInterval(timer); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    // Ses profili değiştiğinde localStorage'a kaydet
    useEffect(() => {
        localStorage.setItem('ai_voice_gender', voiceGender);
    }, [voiceGender]);

    // ========================================
    // 🎙️ SES TANIMA (Speech-to-Text)
    // ========================================
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Tarayıcınız ses tanımayı desteklemiyor.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'tr-TR';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(r => r[0].transcript)
                .join('');
            setQuery(transcript);
        };

        recognition.onend = () => {
            setIsListening(false);
            // Otomatik gönder
            if (inputRef.current?.value) {
                handleSearch(null, inputRef.current.value);
            }
        };

        recognition.onerror = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    // ========================================
    // 🔊 SES ÇIKIŞI (Text-to-Speech)
    // ========================================
    const speakText = (text) => {
        if (!window.speechSynthesis) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR';
        utterance.rate = 1.0;
        utterance.pitch = voiceGender === 'female' ? 1.15 : 0.85;

        // Türkçe ses bul
        const voices = window.speechSynthesis.getVoices();
        const turkishVoices = voices.filter(v => v.lang.startsWith('tr'));

        if (turkishVoices.length > 0) {
            // Cinsiyet tahmini: genelde ilk ses kadın, ikinci erkek
            if (voiceGender === 'male' && turkishVoices.length > 1) {
                utterance.voice = turkishVoices[1];
            } else {
                utterance.voice = turkishVoices[0];
            }
        }

        window.speechSynthesis.speak(utterance);
    };

    // ========================================
    // 🧠 SESLI KOMUT ALGILAMA (Nav + AI)
    // ========================================
    const VOICE_NAV_MAP = {
        'dashboard': '/', 'ana sayfa': '/', 'anasayfa': '/',
        'analiz': '/analytics', 'analytics': '/analytics', 'tahmin': '/analytics',
        'mağaza': '/stores', 'magaza': '/stores', 'harita': '/stores',
        'transfer': '/transfers', 'sevkiyat': '/transfers', 'robin hood': '/transfers',
        'simülasyon': '/simulations', 'simulasyon': '/simulations', 'senaryo': '/simulations',
        'ayarlar': '/settings', 'profil': '/settings', 'setting': '/settings',
    };

    const PAGE_LABELS = {
        '/': 'Dashboard', '/analytics': 'Analiz', '/stores': 'Mağazalar',
        '/transfers': 'Transferler', '/simulations': 'Simülasyonlar', '/settings': 'Ayarlar'
    };

    const tryVoiceNavigation = (msg) => {
        const lower = msg.toLowerCase().trim();
        // "X sekmesine git", "X aç", "X göster", "X sayfasına git"
        const navPatterns = [
            /(.+?)\s*(sekmesine|sayfasına|ekranına)\s*(git|geç)/,
            /(.+?)\s*(aç|göster|getir)/,
            /(git|geç)\s+(.+?)\s*(sekmesi|sayfası|ekranı)?$/,
        ];

        for (const pattern of navPatterns) {
            const match = lower.match(pattern);
            if (match) {
                const keyword = (match[1] || match[2] || '').trim();
                for (const [key, path] of Object.entries(VOICE_NAV_MAP)) {
                    if (keyword.includes(key)) {
                        navigateRef.current(path);
                        const label = PAGE_LABELS[path];
                        speakText(`${label} sayfasına yönlendiriliyorsunuz.`);
                        setNotification({
                            message: `📡 ${label} sayfasına yönlendirildiniz.`,
                            type: 'text', table: null,
                            navigate: path, query: msg,
                            timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                        });
                        return true;
                    }
                }
            }
        }
        return false;
    };

    // ========================================
    // ⚡ SIFIR API AKILLI KOMUTLAR
    // ========================================
    const trySmartCommand = async (msg) => {
        const lower = msg.toLowerCase().trim();
        const ts = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const makeNotif = (message, extra = {}) => {
            setNotification({ message, type: 'text', table: null, navigate: null, query: msg, timestamp: ts, ...extra });
            speakText(message.replace(/[\u{1F300}-\u{1F9FF}]/gu, ''));
            setQuery('');
            return true;
        };

        // --- Tema / Ayar Komutları ---
        if (/dark\s*mode|karanlık\s*(mod|tema)|gece\s*modu/.test(lower)) {
            if (!isDark) toggleTheme();
            return makeNotif('🌙 Karanlık mod aktif edildi.');
        }
        if (/light\s*mode|açık\s*(mod|tema)|gündüz\s*modu/.test(lower)) {
            if (isDark) toggleTheme();
            return makeNotif('☀️ Açık mod aktif edildi.');
        }
        if (/ses(\s*profil)?.*değiştir|kadın.*ses|erkek.*ses/.test(lower)) {
            const newGender = voiceGender === 'female' ? 'male' : 'female';
            setVoiceGender(newGender);
            return makeNotif(`🔊 Ses profili değiştirildi: ${newGender === 'female' ? '👩 Kadın' : '👨 Erkek'} sesi aktif.`);
        }
        if (/hafıza.*temizle|geçmiş.*sil|sohbet.*sıfırla|reset/.test(lower)) {
            resetMemory();
            return true;
        }

        // --- Zaman / Tarih ---
        if (/saat kaç|kaç saat/.test(lower)) {
            const now = new Date();
            return makeNotif(`🕐 Şu an saat ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}.`);
        }
        if (/bugün.*(gün|tarih)|hangi gün|tarih ne/.test(lower)) {
            const now = new Date();
            const gun = now.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            return makeNotif(`📅 Bugün ${gun}.`);
        }

        // --- Rapor İndirme ---
        if (/satış.*(rapor|indir|export)/.test(lower)) {
            try {
                const res = await axiosClient.get('/api/reports/export/sales?format=excel', { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const a = document.createElement('a'); a.href = url; a.download = 'Satis_Raporu.xlsx';
                document.body.appendChild(a); a.click(); a.remove();
            } catch { /* ignore */ }
            return makeNotif('📥 Satış raporu indiriliyor...');
        }
        if (/stok.*(rapor|indir|export)|envanter.*(rapor|indir)/.test(lower)) {
            try {
                const res = await axiosClient.get('/api/reports/export/inventory?format=excel', { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const a = document.createElement('a'); a.href = url; a.download = 'Stok_Raporu.xlsx';
                document.body.appendChild(a); a.click(); a.remove();
            } catch { /* ignore */ }
            return makeNotif('📥 Stok durumu raporu indiriliyor...');
        }

        // --- Hızlı Veri Sorguları (Backend'den ama Gemini'siz) ---
        if (/kaç mağaza|mağaza sayısı|toplam mağaza/.test(lower)) {
            try {
                const { data } = await axiosClient.get('/api/ai/quick-stats');
                return makeNotif(`🏪 Sistemde toplam ${data.store_count} mağaza bulunuyor.`, { navigate: '/stores' });
            } catch { return makeNotif('⚠️ Mağaza verisi alınamadı.'); }
        }
        if (/toplam\s*stok|kaç\s*ürün\s*var|stok\s*miktarı/.test(lower)) {
            try {
                const { data } = await axiosClient.get('/api/ai/quick-stats');
                return makeNotif(`📦 Tüm mağazalarda toplam ${data.total_stock.toLocaleString()} adet ürün stoku bulunuyor.`);
            } catch { return makeNotif('⚠️ Stok verisi alınamadı.'); }
        }
        if (/en\s*çok\s*satan|popüler\s*ürün|top\s*ürün/.test(lower)) {
            try {
                const { data } = await axiosClient.get('/api/ai/quick-stats');
                return makeNotif(`🏆 En çok satan ürünler: ${data.top_selling}.`);
            } catch { return makeNotif('⚠️ Satış verisi alınamadı.'); }
        }
        if (/kritik\s*stok|tükenen|stok.*durum|az.*kalan/.test(lower)) {
            try {
                const { data } = await axiosClient.get('/api/ai/quick-stats');
                return makeNotif(`⚠️ Kritik seviyede ${data.low_stock_count} ürün, tamamen tükenmiş ${data.zero_stock_count} ürün kaydı var.`, { navigate: '/stores' });
            } catch { return makeNotif('⚠️ Stok verisi alınamadı.'); }
        }
        if (/hava.*(nasıl|durumu|bugün)/.test(lower)) {
            try {
                const { data } = await axiosClient.get('/api/weather?city=Istanbul');
                return makeNotif(`🌤️ İstanbul: ${data.current?.temp_c}°C, ${data.current?.condition}. Nem: %${data.current?.humidity}, Rüzgar: ${data.current?.wind_kph} km/s.`);
            } catch { return makeNotif('⚠️ Hava durumu verisi alınamadı.'); }
        }

        return false; // Akıllı komut değil → Gemini'ye gönder
    };

    const handleSearch = async (e, overrideQuery = null) => {
        if (e) e.preventDefault();
        const msg = overrideQuery || query;
        if (!msg.trim()) return;

        // 🧠 Önce sesli navigasyon komutu mu kontrol et
        if (tryVoiceNavigation(msg)) {
            setQuery('');
            return;
        }

        // ⚡ Sıfır API akıllı komut mu kontrol et
        const handled = await trySmartCommand(msg);
        if (handled) return;

        // Frontend cooldown kontrolü
        if (cooldown > 0) {
            setNotification({
                message: `⏳ Lütfen ${cooldown} saniye bekleyin.`,
                type: 'rate_limit',
                table: null,
                navigate: null,
                query: msg,
                timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                cooldown: cooldown,
                remaining: remaining
            });
            return;
        }

        setLoading(true);

        try {
            const { data } = await axiosClient.post('/api/ai/chat', {
                message: msg,
                history: history,
                voice_gender: voiceGender
            });

            // Rate limit bilgilerini güncelle
            if (data.remaining !== undefined) setRemaining(data.remaining);
            if (data.cooldown) setCooldown(data.cooldown);

            // Rate limit ise sadece popup göster
            if (data.type === 'rate_limit') {
                setNotification({
                    message: data.response,
                    type: 'rate_limit',
                    table: null,
                    navigate: null,
                    query: msg,
                    timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                    cooldown: data.cooldown,
                    remaining: data.remaining
                });
                setLoading(false);
                return;
            }

            // Geçmişe ekle
            const newHistory = [
                ...history,
                { role: 'user', content: msg },
                { role: 'assistant', content: data.response }
            ];
            setHistory(newHistory.slice(-10)); // Son 10 mesaj

            // Bildirim popup'ı göster
            setNotification({
                message: data.response,
                type: data.type,
                table: data.table,
                navigate: data.navigate,
                query: msg,
                timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                remaining: data.remaining
            });

            // Sesli okuma
            if (data.response && data.type !== 'table') {
                speakText(data.response);
            }

        } catch (err) {
            setNotification({
                message: 'AI asistanına ulaşılamadı. Backend çalışıyor mu?',
                type: 'error',
                table: null,
                navigate: null,
                query: msg,
                timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
            });
        } finally {
            setLoading(false);
            setQuery('');
        }
    };

    return (
        <>
            <div className="relative z-50 mr-4 group/search">
                {/* Search Input Container */}
                <form onSubmit={handleSearch} className="relative flex items-center justify-end gap-2">
                    <div className={`
                        relative flex items-center transition-all duration-500 ease-out
                        ${query || loading ? 'w-[420px]' : 'w-12 group-hover/search:w-[420px]'}
                        h-[62px] bg-white/40 backdrop-blur-md border border-white/40 rounded-full shadow-lg
                        overflow-hidden
                    `}>
                        {/* Search Icon */}
                        <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none z-10">
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <SparklesIcon className="h-5 w-5 text-blue-600" />
                            )}
                        </div>

                        {/* Input */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className={`
                                w-full h-full pl-12 pr-24 bg-transparent border-none outline-none text-slate-800 placeholder-slate-500/70
                                text-sm font-medium transition-opacity duration-300
                                ${query || loading ? 'opacity-100' : 'opacity-0 group-hover/search:opacity-100'}
                            `}
                            placeholder="Asistana Sor... (Yazın veya 🎙️ konuşun)"
                        />

                        {/* Right Actions */}
                        <div className={`absolute right-2 z-20 flex items-center gap-1 transition-opacity duration-300 ${query || loading ? 'opacity-100' : 'opacity-0 group-hover/search:opacity-100'}`}>

                            {/* Ses Profili Seçici */}
                            <button
                                type="button"
                                onClick={() => setVoiceGender(v => v === 'female' ? 'male' : 'female')}
                                className="p-1.5 hover:bg-slate-200/50 rounded-full text-slate-500 transition-all text-xs font-bold"
                                title={voiceGender === 'female' ? 'Kadın Sesi (değiştir)' : 'Erkek Sesi (değiştir)'}
                            >
                                {voiceGender === 'female' ? '👩' : '👨'}
                            </button>

                            {/* Mikrofon */}
                            <button
                                type="button"
                                onClick={isListening ? stopListening : startListening}
                                className={`p-1.5 rounded-full transition-all ${isListening
                                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40'
                                    : 'hover:bg-slate-200/50 text-slate-500'
                                    }`}
                                title={isListening ? 'Durdurmak için tıklayın' : 'Sesli soru sorun'}
                            >
                                <MicrophoneIcon className="h-4 w-4" />
                            </button>

                            {/* Clear */}
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => { setQuery(''); }}
                                    className="p-1 hover:bg-slate-200/50 rounded-full text-slate-500 transition-colors"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* 📢 AI Bildirim Popup (Sağ Alt Köşe) */}
            <AINotificationPopup
                notification={notification}
                onClose={() => {
                    setNotification(null);
                    window.speechSynthesis?.cancel();
                }}
                voiceGender={voiceGender}
                onSpeak={speakText}
            />
        </>
    );
};

export default SmartQueryBar;
