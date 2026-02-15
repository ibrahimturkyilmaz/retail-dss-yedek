# Katkıda Bulunma Rehberi (Contributing Guide)

Retail Decision Support System (RetailDSS) projesine katkıda bulunmak istediğiniz için teşekkürler! Bu rehber, katkı sürecinizi kolaylaştırmak için hazırlanmıştır.

## 🤝 Nasıl Katkıda Bulunabilirim?

### 1. Hata Bildirimi (Bug Report)
Bir hata bulursanız, lütfen GitHub Issues üzerinden bildirin.
- **Başlık:** Hatanın kısa özeti.
- **Açıklama:** Hatanın nasıl oluştuğunu (reproduction steps) detaylandırın.
- **Ekran Görüntüsü:** Varsa hatayı gösteren görsel ekleyin.

### 2. Özellik İsteği (Feature Request)
Yeni bir özellik önermek isterseniz, Issues bölümünde "Feature Request" şablonunu kullanın.

### 3. Kod Katkısı (Pull Requests)

#### Adımlar:
1.  **Fork** edin: Projeyi kendi hesabınıza forklayın.
2.  **Clone** yapın: `git clone https://github.com/SİZİN_KULLANICI_ADINIZ/retail-dss-project.git`
3.  **Branch** açın: `git checkout -b feature/yeni-ozellik-adi` (Anlamlı isimler kullanın).
4.  **Geliştirme** yapın: Kodunuzu yazın. Mevcut kod standartlarına uyun (PEP 8 for Python, ESLint for JS).
5.  **Test** edin: Yaptığınız değişikliklerin mevcut testleri bozmadığından emin olun.
6.  **Commit** leyin: `git commit -m "feat: Yeni mağaza filtresi eklendi"` (Conventional Commits tercih edilir).
7.  **Push** layın: `git push origin feature/yeni-ozellik-adi`.
8.  **Pull Request (PR)** açın: Ana repo'ya PR gönderin ve değişikliklerinizi açıklayın.

## 📝 Kod Standartları

### Backend (Python)
- **Framework:** FastAPI
- **Style Guide:** PEP 8
- **Type Hints:** Mümkün olduğunca type hint kullanın (`def get_store(id: int) -> Store:`).

### Frontend (React)
- **Framework:** React 19 + Vite
- **Styling:** TailwindCSS
- **Component Pattern:** Fonksiyonel bileşenler ve Hook'lar.

## ⚖️ Lisans
Bu projeye yaptığınız tüm katkılar **MIT Lisansı** altında lisanslanacaktır.
