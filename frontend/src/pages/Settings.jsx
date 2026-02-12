import React, { useState, useEffect } from 'react';
import {
    UserCircleIcon,
    BookOpenIcon,
    InformationCircleIcon,
    KeyIcon,
    BuildingOfficeIcon,
    EnvelopeIcon,
    IdentificationIcon,
    CheckCircleIcon,
    ArrowDownTrayIcon,
    DocumentTextIcon,
    TableCellsIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

const Settings = () => {
    const { user, login } = useAuth(); // login fonksiyonunu profil güncelleme sonrası state yenilemek için kullanabiliriz veya context'e update fonksiyonu eklemeliyiz
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Ayarlar</h1>
                <p className="text-gray-500">Uygulama tercihlerinizi ve hesap bilgilerinizi yönetin.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 mt-8">
                {/* Sidebar Tabs */}
                <aside className="lg:w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        <TabButton
                            id="profile"
                            label="Profil"
                            icon={<UserCircleIcon className="w-5 h-5" />}
                            active={activeTab === 'profile'}
                            onClick={() => setActiveTab('profile')}
                        />
                        <TabButton
                            id="guide"
                            label="Kılavuz"
                            icon={<BookOpenIcon className="w-5 h-5" />}
                            active={activeTab === 'guide'}
                            onClick={() => setActiveTab('guide')}
                        />
                        <TabButton
                            id="reports"
                            label="Raporlar"
                            icon={<ArrowDownTrayIcon className="w-5 h-5" />}
                            active={activeTab === 'reports'}
                            onClick={() => setActiveTab('reports')}
                        />
                        <TabButton
                            id="about"
                            label="Hakkında"
                            icon={<InformationCircleIcon className="w-5 h-5" />}
                            active={activeTab === 'about'}
                            onClick={() => setActiveTab('about')}
                        />
                    </nav>
                </aside>

                {/* Content Area */}
                <main className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px] overflow-hidden">
                    <div className="p-8">
                        {activeTab === 'profile' && <ProfileSettings user={user} />}
                        {activeTab === 'guide' && <UserGuide />}
                        {activeTab === 'reports' && <ReportsExport />}
                        {activeTab === 'about' && <AboutSection />}
                    </div>
                </main>
            </div>
        </div>
    );
};

// --- Sub-Components ---

const TabButton = ({ id, label, icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out ${active
            ? 'bg-indigo-50 text-indigo-700 shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
    >
        {icon}
        <span>{label}</span>
        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 block" />}
    </button>
);

const ProfileSettings = ({ user }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        department: '',
        role: '',
        calendar_url: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Load user data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.username) {
                try {
                    const response = await axios.get(`/users/${user.username}`);
                    setFormData({
                        first_name: response.data.first_name || '',
                        last_name: response.data.last_name || '',
                        email: response.data.email || '',
                        department: response.data.department || '',
                        role: response.data.role || 'user',
                        calendar_url: response.data.calendar_url || '',
                        password: ''
                    });
                } catch (error) {
                    console.error("Profil yüklenemedi:", error);
                    setMessage({ type: 'error', text: 'Profil bilgileri yüklenirken hata oluştu.' });
                }
            }
        };
        fetchProfile();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            await axios.put(`/users/${user.username}`, formData);
            setMessage({ type: 'success', text: 'Profil başarıyla güncellendi.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Güncelleme sırasında bir hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Profil Ayarları</h2>
                    <p className="text-gray-500 text-sm mt-1">Kişisel bilgilerinizi ve hesap tercihlerinizi yönetin.</p>
                </div>
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                    {formData.role === 'admin' ? <KeyIcon className="w-3.5 h-3.5" /> : <UserCircleIcon className="w-3.5 h-3.5" />}
                    <span>{formData.role}</span>
                </div>
            </div>

            {message && (
                <div className={`p-4 mb-6 rounded-lg flex items-center space-x-3 border ${message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                    {message.type === 'success' ? <CheckCircleIcon className="w-5 h-5 flex-shrink-0" /> : <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Kişisel Bilgiler */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <IdentificationIcon className="w-4 h-4 text-indigo-500" />
                        Kimlik Bilgileri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField label="İsim" name="first_name" value={formData.first_name} onChange={handleChange} />
                        <InputField label="Soyisim" name="last_name" value={formData.last_name} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField label="E-posta" name="email" type="email" value={formData.email} onChange={handleChange} icon={<EnvelopeIcon className="w-4 h-4" />} />
                        <div className="space-y-1.5 opacity-75">
                            <label className="block text-sm font-medium text-gray-700">Rol</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <KeyIcon className="w-4 h-4" />
                                </div>
                                <input type="text" value={formData.role.toUpperCase()} disabled className="block w-full pl-10 pr-3 py-2.5 border-gray-200 rounded-lg bg-gray-100 text-gray-500 sm:text-sm cursor-not-allowed" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. İş & Entegrasyon */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <BuildingOfficeIcon className="w-4 h-4 text-indigo-500" />
                        İş ve Entegrasyon
                    </h3>
                    <InputField label="Departman" name="department" value={formData.department} onChange={handleChange} />

                    <div className="space-y-1.5">
                        <div className="flex justify-between">
                            <label className="block text-sm font-medium text-gray-700">Takvim Bağlantısı (ICS URL)</label>
                            <span className="text-xs text-indigo-600 hover:text-indigo-800 cursor-help" title="Google veya Outlook takviminizi dashboard'da görmek için">Nedir?</span>
                        </div>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <div className="w-4 h-4 font-bold text-xs flex items-center justify-center border border-current rounded">ICS</div>
                            </div>
                            <input
                                type="url"
                                name="calendar_url"
                                value={formData.calendar_url}
                                onChange={handleChange}
                                placeholder="https://calendar.google.com/..."
                                className="block w-full pl-10 pr-3 py-2.5 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                            />
                        </div>
                        <p className="text-xs text-gray-400">Takvim entegrasyonu detayları için "Kılavuz" sekmesine bakın.</p>
                    </div>
                </div>

                {/* 3. Güvenlik */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <KeyIcon className="w-4 h-4 text-indigo-500" />
                        Güvenlik
                    </h3>
                    <InputField
                        label="Yeni Şifre"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Değiştirmek istemiyorsanız boş bırakın"
                        icon={<div className="w-1.5 h-1.5 rounded-full bg-current" />}
                    />
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Kaydediliyor...</span>
                            </>
                        ) : (
                            <span>Değişiklikleri Kaydet</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

const InputField = ({ label, name, type = "text", value, onChange, icon, placeholder }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="relative rounded-md shadow-sm group">
            {icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    {icon}
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all duration-200 bg-white`}
            />
        </div>
    </div>
);

const UserGuide = () => (
    <div className="max-w-3xl animate-fade-in">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sistem Kullanım Kılavuzu</h2>
            <p className="text-gray-500 mt-2">RetailDSS platformunun tüm özelliklerini nasıl kullanabileceğinizi öğrenin.</p>
        </div>

        {/* Quick Links / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <GuideCard
                icon={<BookOpenIcon className="w-6 h-6 text-blue-600" />}
                title="Başlangıç Rehberi"
                description="Panel kullanımı, menüler ve temel navigasyon."
                badge="Temel"
            />
            <GuideCard
                icon={<BuildingOfficeIcon className="w-6 h-6 text-purple-600" />}
                title="Stok Optimizasyonu"
                description="Robin Hood algoritması ile transfer önerilerini yönetin."
                badge="Pro"
            />
            <GuideCard
                icon={<UserCircleIcon className="w-6 h-6 text-emerald-600" />}
                title="Müşteri Analizi"
                description="Sadakat puanları ve müşteri segmentasyonu."
            />
            <GuideCard
                icon={<div className="w-6 h-6 text-amber-600 font-bold flex items-center justify-center text-xs border-2 border-current rounded-full">AI</div>}
                title="ARAS AI Asistan"
                description="Sesli komutlar, hava durumu farkındalıklı yapay zeka asistanı."
                badge="Yeni"
            />
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8">
            {/* ARAS AI Guide */}
            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-lg">🤖</span>
                        ARAS AI Asistan Kullanımı
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase">Komut Merkezi</span>
                </div>
                <div className="p-6 space-y-5">
                    <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                        <div className="text-sm">
                            <strong className="text-gray-900 block mb-1">Yazılı Soru Sorma</strong>
                            <span className="text-gray-500">Üst menüdeki "ARAS'a Sor..." kutusuna yazın ve Enter'a basın. ARAS, gerçek zamanlı stok, satış ve hava durumu verilerini analiz ederek yanıt verir.</span>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                        <div className="text-sm">
                            <strong className="text-gray-900 block mb-1">🎙️ Sesli Komut (Voice-to-Text)</strong>
                            <span className="text-gray-500">Mikrofon ikonuna basın ve konuşun. ARAS sesinizi tanıyıp yazıya çevirir. Türkçe dil desteği mevcuttur.</span>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                        <div className="text-sm">
                            <strong className="text-gray-900 block mb-1">📡 Sesli Sayfa Navigasyonu</strong>
                            <span className="text-gray-500">"Analiz sekmesine git", "Mağazaları aç" gibi komutlarla sayfalar arası geçiş yapın. API harcamaz, anında çalışır.</span>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
                        <div className="text-sm">
                            <strong className="text-gray-900 block mb-1">🔊 Sesli Yanıt (TTS)</strong>
                            <span className="text-gray-500">AI yanıtlarını sesli dinleyin. 👩 Kadın / 👨 Erkek ses profili arasında geçiş yapabilirsiniz.</span>
                        </div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                        <p className="text-xs text-amber-700 font-medium">⚡ <strong>Rate Limit:</strong> Günlük 50 soru hakkınız var. Her soru arası 20 saniye bekleme süresi uygulanır. Navigasyon ve akıllı komutlar bu limiti harcamaz.</p>
                    </div>
                </div>
            </section>

            {/* Smart Commands Guide */}
            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-lg">⚡</span>
                        Akıllı Komutlar (Sıfır API)
                    </h3>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded uppercase">Bedava</span>
                </div>
                <div className="p-6">
                    <p className="text-gray-600 text-sm mb-4">
                        Bu komutlar Gemini API kullanmadan çalışır. Günlük hakkınızı harcamaz!
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1">🎨 Tema & Ayarlar</h4>
                            <ul className="space-y-1 text-xs text-gray-500">
                                <li>• "Dark mode aç" / "Karanlık mod"</li>
                                <li>• "Açık mod" / "Light mode"</li>
                                <li>• "Ses profili değiştir"</li>
                                <li>• "Hafızayı temizle" / "Reset"</li>
                            </ul>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1">🕐 Zaman & Tarih</h4>
                            <ul className="space-y-1 text-xs text-gray-500">
                                <li>• "Saat kaç?"</li>
                                <li>• "Bugün hangi gün?"</li>
                                <li>• "Tarih ne?"</li>
                            </ul>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1">📥 Rapor İndirme</h4>
                            <ul className="space-y-1 text-xs text-gray-500">
                                <li>• "Satış raporu indir"</li>
                                <li>• "Stok raporu indir"</li>
                            </ul>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1">🏪 Hızlı Veri</h4>
                            <ul className="space-y-1 text-xs text-gray-500">
                                <li>• "Kaç mağaza var?"</li>
                                <li>• "Kritik stok nedir?"</li>
                                <li>• "Hava nasıl?"</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Calendar Integration */}
            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <IdentificationIcon className="w-5 h-5 text-indigo-500" />
                        Takvim Entegrasyonu
                    </h3>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded uppercase">Adım Adım</span>
                </div>
                <div className="p-6">
                    <p className="text-gray-600 text-sm mb-4">
                        Kişisel takviminizi sisteme bağlayarak toplantılarınızı ve önemli tarihlerinizi "Ajanda" widget'ında görebilirsiniz.
                    </p>
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                            <div className="text-sm">
                                <strong className="text-gray-900 block mb-1">Linkin Alınması</strong>
                                <ul className="list-disc pl-4 text-gray-500 space-y-1">
                                    <li><strong>Google Takvim:</strong> Ayarlar &gt; Takvimim &gt; Entegrasyon &gt; "iCal biçiminde gizli adres"</li>
                                    <li><strong>Outlook:</strong> Ayarlar &gt; Paylaşılan Takvimler &gt; Takvimi Yayınla &gt; "ICS Linki"</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                            <div className="text-sm">
                                <strong className="text-gray-900 block mb-1">Sisteme Kayıt</strong>
                                <span className="text-gray-500">Bu sayfadaki "Profil" sekmesine gidin ve "Takvim Bağlantısı" alanına kopyaladığınız linki yapıştırın ve kaydedin.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section>
                <h3 className="font-bold text-gray-900 mb-4 px-2">Sıkça Sorulan Sorular</h3>
                <div className="space-y-3">
                    <FaqItem
                        q="ARAS ile sesli komut nasıl verilir?"
                        a='Arama çubuğundaki mikrofon ikonuna tıklayın ve konuşun. Örneğin: "Stok durumu nedir?", "Analiz sekmesine git", "En çok satan ürünleri listele". ARAS Türkçe anlayıp yanıtlar.'
                    />
                    <FaqItem
                        q='"... sekmesine git" diyebilir miyim?'
                        a='Evet! ARAS sesli navigasyon komutlarını destekler. "Analiz sekmesine git", "Mağazaları aç", "Dashboard göster" gibi komutlarla API harcamadan anında sayfa değiştirebilirsiniz.'
                    />
                    <FaqItem
                        q="ARAS hava durumunu biliyor mu?"
                        a="Evet. ARAS her soruda İstanbul'un güncel hava durumunu ve 3 günlük tahmini görür. 'Bugün hava yağmurlu, şemsiye stokunu kontrol et' gibi operasyonel öneriler alabilirsiniz."
                    />
                    <FaqItem
                        q="Hangi komutlar API harcamaz?"
                        a='Navigasyon (\"Analiz sekmesine git\"), tema (\"Dark mode aç\"), zaman (\"Saat kaç?\"), rapor indirme (\"Satış raporu indir\"), ve hızlı veri sorguları (\"Kaç mağaza var?\") sıfır API harcamasıyla çalışır.'
                    />
                    <FaqItem
                        q="Sesle dark mode açabilir miyim?"
                        a='Evet! \"Dark mode aç\", \"Karanlık mod\" veya \"Gece modu\" demeniz yeterli. Aynı şekilde \"Açık mod\" ile geri dönebilirsiniz.'
                    />
                    <FaqItem
                        q="Veriler ne sıklıkla güncellenir?"
                        a="Satış verileri POS entegrasyonu sayesinde anlık olarak akar. Tahmin modelleri ise her gece 03:00'da yeniden eğitilir."
                    />
                    <FaqItem
                        q="Neden bazı mağazalar haritada kırmızı görünüyor?"
                        a="Kırmızı renk, o mağazanın stok risk seviyesinin 'Yüksek' olduğunu veya acil transfer ihtiyacı bulunduğunu gösterir."
                    />
                    <FaqItem
                        q="Simülasyon sonuçları gerçek veriyi bozar mı?"
                        a="Hayır. Simülasyonlar 'Sandbox' ortamında çalışır. Ancak 'Onayla' butonuna basarsanız oluşturulan transfer emirleri gerçek veritabanına işlenir."
                    />
                </div>
            </section>
        </div>
    </div>
);

const GuideCard = ({ icon, title, description, badge }) => (
    <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer group">
        <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                {icon}
            </div>
            {badge && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded-full">{badge}</span>}
        </div>
        <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{title}</h4>
        <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </div>
);

const FaqItem = ({ q, a }) => (
    <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 open:shadow-sm open:border-indigo-200">
        <summary className="px-5 py-4 cursor-pointer font-medium text-gray-800 hover:text-indigo-600 flex justify-between items-center bg-gray-50/50 group-open:bg-white transition-colors">
            {q}
            <span className="transform group-open:rotate-180 transition-transform text-gray-400">▼</span>
        </summary>
        <div className="px-5 py-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
            {a}
        </div>
    </details>
);

const AboutSection = () => (
    <div className="max-w-2xl animate-fade-in mx-auto text-center">
        <div className="mb-8 relative inline-block">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-20 animate-pulse"></div>
            <img src="/logo-icon.svg" className="w-20 h-20 relative z-10 mx-auto" alt="Logo" onError={(e) => { e.target.style.display = 'none' }} />
            {/* Logo yoksa fallback ikon */}
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl relative z-0">
                <BuildingOfficeIcon className="w-10 h-10" />
            </div>
        </div>

        <h2 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">RetailDSS</h2>
        <p className="text-sm text-gray-400 font-medium mb-1">powered by ARAS (Akıllı Retail Asistan Sistemi)</p>
        <p className="text-lg text-indigo-600 font-medium mb-8">Akıllı Perakende Karar Destek Platformu</p>

        <div className="grid grid-cols-2 gap-4 mb-6 text-left cursor-default">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Versiyon</div>
                <div className="text-xl font-bold text-gray-900">v2.0.0</div>
                <div className="text-xs text-emerald-600 font-medium mt-1">● ARAS AI Entegreli</div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Geliştirici</div>
                <div className="text-lg font-bold text-gray-900 truncate">İbrahim Türkyılmaz</div>
                <div className="text-xs text-gray-500 mt-1">Endüstri Mühendisliği</div>
            </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 text-left">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Teknoloji Yığını</div>
            <div className="flex flex-wrap gap-2">
                <TechBadge name="React 18" color="text-sky-600 bg-sky-50" />
                <TechBadge name="FastAPI" color="text-emerald-600 bg-emerald-50" />
                <TechBadge name="SQLite" color="text-blue-600 bg-blue-50" />
                <TechBadge name="TailwindCSS" color="text-cyan-600 bg-cyan-50" />
                <TechBadge name="XGBoost AI" color="text-purple-600 bg-purple-50" />
                <TechBadge name="Google Gemini" color="text-amber-600 bg-amber-50" />
                <TechBadge name="Web Speech API" color="text-rose-600 bg-rose-50" />
                <TechBadge name="WeatherAPI" color="text-teal-600 bg-teal-50" />
            </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 text-left">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Temel Özellikler</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-2"><span className="text-emerald-500">✓</span> ARAS AI Sesli Asistan</div>
                <div className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Hava Durumu Farkındalığı</div>
                <div className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Robin Hood Transfer</div>
                <div className="flex items-center gap-2"><span className="text-emerald-500">✓</span> ABC/XYZ Analizi</div>
                <div className="flex items-center gap-2"><span className="text-emerald-500">✓</span> What-If Simülasyon</div>
                <div className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Sesli Navigasyon</div>
                <div className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Dark Mode</div>
                <div className="flex items-center gap-2"><span className="text-emerald-500">✓</span> PDF/Excel Export</div>
            </div>
        </div>

        <div className="text-left mb-8">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Proje Yol Haritası (V2.0)</div>
            <div className="space-y-2">
                <details className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <summary className="px-4 py-3 cursor-pointer font-bold text-gray-700 text-sm flex justify-between items-center hover:bg-gray-50">
                        ✅ 1. Tamamlanan Özellikler
                        <span className="transform group-open:rotate-180 transition-transform text-gray-400 text-xs">▼</span>
                    </summary>
                    <div className="px-4 py-3 text-xs text-gray-600 border-t border-gray-50 space-y-2 bg-gray-50/30">
                        <p><strong>ARAS AI Asistan:</strong> Gemini 2.0 Flash entegrasyonu, Bağlamsal zeka (Stok, Satış, Hava Durumu), Sesli Komut (STT/TTS) ve Sıfır-API Akıllı Komut seti tamamlandı.</p>
                        <p><strong>Altyapı:</strong> Canlı Hava Durumu entegrasyonu, Rate Limiting (50/gün), Hafıza sistemi ve interaktif bildirimler yayında.</p>
                    </div>
                </details>

                <details className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <summary className="px-4 py-3 cursor-pointer font-bold text-gray-700 text-sm flex justify-between items-center hover:bg-gray-50">
                        🚀 2. Gelecek Aşama Planı
                        <span className="transform group-open:rotate-180 transition-transform text-gray-400 text-xs">▼</span>
                    </summary>
                    <div className="px-4 py-3 text-xs text-gray-600 border-t border-gray-50 space-y-3 bg-gray-50/30">
                        <div>
                            <span className="font-bold text-indigo-600">Aşama 1: Bulut Geçişi:</span>
                            <p className="mt-1">SQLite'dan Supabase(PostgreSQL)'e geçiş. Backend Render.com, Frontend Firebase Hosting yayını.</p>
                        </div>
                        <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                            <span className="font-bold text-red-600">🚩 Acil: GitHub Entegrasyonu:</span>
                            <p className="mt-1">Hassas verilerin temizlenmesi, .gitignore yapılandırması ve projenin GitHub'a yüklenmesi.</p>
                        </div>
                        <div>
                            <span className="font-bold text-indigo-600">Aşama 2: Gelişmiş Hafıza:</span>
                            <p className="mt-1">Sohbet geçmişinin bulut veritabanında (Supabase) kalıcı hale getirilmesi.</p>
                        </div>
                        <div>
                            <span className="font-bold text-indigo-600">Aşama 3: Forecasting 2.0:</span>
                            <p className="mt-1">XGBoost modeline geçiş. Hava durumu ve mevsimsellik etkilerinin tahminlere dahil edilmesi.</p>
                        </div>
                    </div>
                </details>

                <details className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <summary className="px-4 py-3 cursor-pointer font-bold text-gray-700 text-sm flex justify-between items-center hover:bg-gray-50">
                        📈 3. Performans & Limitler
                        <span className="transform group-open:rotate-180 transition-transform text-gray-400 text-xs">▼</span>
                    </summary>
                    <div className="px-4 py-3 text-xs text-gray-600 border-t border-gray-50 bg-gray-50/30">
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>AI Kotası:</strong> 50 istek/gün (Garantili ücretsiz)</li>
                            <li><strong>Hız:</strong> Sayfa navigasyon &lt; 50ms, AI Yanıt &lt; 1.5s</li>
                            <li><strong>Veri:</strong> Mevcut DB &lt; 5MB (Hafif ve optimize)</li>
                        </ul>
                    </div>
                </details>
            </div>
        </div>

        <div className="border-t border-gray-100 pt-8">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Emeği Geçenler</h3>
            <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                <span>Designed & Developed by</span>
                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">İbrahim Türkyılmaz</a>
                <span>&</span>
                <span className="font-semibold text-indigo-600">Google Gemini</span>
            </div>
            <p className="text-xs text-gray-400 mt-4">© 2026 RetailDSS — ARAS AI Powered. Tüm hakları saklıdır.</p>
        </div>
    </div>
);

const TechBadge = ({ name, color }) => (
    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border border-transparent ${color}`}>
        {name}
    </span>
);

// ==========================================
// 📤 RAPOR DIŞA AKTARMA (Reports Export)
// ==========================================
const ReportsExport = () => {
    const [downloading, setDownloading] = useState(null);

    const handleDownload = async (endpoint, filename) => {
        setDownloading(filename);
        try {
            const response = await axios.get(endpoint, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
            alert('İndirme başarısız oldu. Lütfen tekrar deneyin.');
        } finally {
            setDownloading(null);
        }
    };

    const reports = [
        {
            title: 'Satış Raporu',
            description: 'Son 30 günün tüm satış verilerini indirin',
            icon: <DocumentTextIcon className="w-8 h-8 text-blue-500" />,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-100',
            actions: [
                { label: 'Excel İndir', format: 'excel', ext: 'xlsx', endpoint: '/api/reports/export/sales?format=excel', color: 'bg-blue-600 hover:bg-blue-700' },
                { label: 'CSV İndir', format: 'csv', ext: 'csv', endpoint: '/api/reports/export/sales?format=csv', color: 'bg-slate-600 hover:bg-slate-700' },
            ]
        },
        {
            title: 'Stok Durumu Raporu',
            description: 'Tüm mağazaların güncel stok durumunu indirin',
            icon: <TableCellsIcon className="w-8 h-8 text-emerald-500" />,
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-100',
            actions: [
                { label: 'Excel İndir', format: 'excel', ext: 'xlsx', endpoint: '/api/reports/export/inventory?format=excel', color: 'bg-emerald-600 hover:bg-emerald-700' },
                { label: 'CSV İndir', format: 'csv', ext: 'csv', endpoint: '/api/reports/export/inventory?format=csv', color: 'bg-slate-600 hover:bg-slate-700' },
            ]
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">📤 Rapor Dışa Aktarma</h2>
                <p className="text-gray-500 mt-1">Verilerinizi Excel veya CSV formatında indirin.</p>
            </div>

            <div className="grid gap-4">
                {reports.map((report) => (
                    <div key={report.title} className={`${report.bgColor} border ${report.borderColor} rounded-2xl p-6 transition-all hover:shadow-md`}>
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                {report.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-800">{report.title}</h3>
                                <p className="text-sm text-gray-500 mt-0.5">{report.description}</p>
                                <div className="flex gap-2 mt-4">
                                    {report.actions.map((action) => (
                                        <button
                                            key={action.format}
                                            onClick={() => handleDownload(action.endpoint, `${report.title.replace(/\s/g, '_')}.${action.ext}`)}
                                            disabled={downloading !== null}
                                            className={`${action.color} text-white text-sm font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md`}
                                        >
                                            <ArrowDownTrayIcon className="w-4 h-4" />
                                            {downloading === `${report.title.replace(/\s/g, '_')}.${action.ext}` ? 'İndiriliyor...' : action.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Note */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs text-gray-500">
                <p>💡 <strong>İpucu:</strong> Excel dosyaları otomatik sütun genişliği ve renkli başlıklarla oluşturulur. CSV dosyaları UTF-8 BOM destekler (Türkçe karakterler Excel'de doğru görünür).</p>
            </div>
        </div>
    );
};

export default Settings;

