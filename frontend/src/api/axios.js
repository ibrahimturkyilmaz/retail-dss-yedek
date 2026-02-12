import axios from 'axios';

// ==========================================
// 🔌 API İSTEMCİSİ (AXIOS)
// ==========================================
// Backend ile iletişim kuran merkezi yapı.

// VITE_API_URL: .env dosyasından gelen Backend adresi.
// Eğer tanımlı değilse (Lokalde) varsayılan olarak http://localhost:8001 kullanılır.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const axiosClient = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- İSTEK (REQUEST) ARAYÜZÜ ---
// Her istekten önce çalışır (Token ekleme vb. için)
axiosClient.interceptors.request.use(
    (config) => {
        // Gelecekte JWT Token burada eklenecek:
        // config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- YANIT (RESPONSE) ARAYÜZÜ ---
// Her yanıttan sonra çalışır (Hata yakalama için)
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Merkezi Hata Yönetimi
        if (error.response) {
            // Sunucu cevap verdi ama hata kodu döndü (4xx, 5xx)
            console.error('[API Hatası]', error.response.status, error.response.data);
        } else {
            // Sunucuya hiç ulaşılamadı (Network Error)
            console.error('[Bağlantı Hatası]', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
