# Retail DSS - API Dokümantasyonu

Bu belge, Retail Decision Support System (RetailDSS) projesinin backend API uç noktalarını (endpoints) detaylandırır.

## 📡 Base URL
Development: `http://localhost:8000`

## 🔐 Yetkilendirme (Authentication)
Şu anda demo amaçlı **Basic Auth** veya **No Auth** kullanılmaktadır. İleride JWT eklenecektir.

---

## 🛍️ Satış ve Mağaza İşlemleri

### `GET /api/dashboard/stats`
Ana dashboard için özet istatistikleri döner.
- **Response:**
  ```json
  {
    "total_revenue": 150000.50,
    "total_sales": 1200,
    "active_stores": 5,
    "top_product": "Laptop X"
  }
  ```

### `GET /api/stores`
Tüm mağazaların listesini ve konum bilgilerini döner.
- **Query Params:** `type` (Opsiyonel: filter by store type)

### `GET /api/sales/report`
Belirli bir tarih aralığı için detaylı satış raporu.
- **Query Params:** `start_date`, `end_date`

---

## 🔮 Tahminleme (Forecasting)

### `POST /api/forecast/product/{product_id}`
Belirli bir ürün için gelecek 7 günlük satış tahmini oluşturur.
- **Body:** `{ "days": 7 }`
- **Response:**
  ```json
  [
    { "date": "2023-10-25", "predicted_sales": 45 },
    { "date": "2023-10-26", "predicted_sales": 42 }
  ]
  ```

---

## 🌪️ Simülasyon (Simulation)

### `POST /api/simulation/run`
Parametrik senaryo simülasyonu çalıştırır.
- **Body:**
  ```json
  {
    "price_change_percent": -10,
    "demand_shock_factor": 1.2,
    "scenario_name": "Summer Sale"
  }
  ```

---

## 🏹 Stok Transferi (Robin Hood)

### `GET /api/transfers/suggestions`
Zengin mağazalardan fakir mağazalara stok transfer önerileri.
- **Logic:** Stok fazlası > %20 ve Stok eksiği < %10 olan mağazalar eşleştirilir.

---

## 🤖 AI Playground

### `POST /api/playground/ask`
Doğal dil ile veritabanı sorgulama (Text-to-SQL).
- **Body:** `{ "question": "En karlı mağaza hangisi?" }`
- **Response:**
  ```json
  {
    "sql": "SELECT name, revenue FROM stores ORDER BY revenue DESC LIMIT 1",
    "result": [ { "name": "Store A", "revenue": 50000 } ],
    "explanation": "Mağazalar tablosundan ciroya göre sıralama yapıldı."
  }
  ```

### `POST /api/playground/execute`
Doğrudan SQL sorgusu çalıştırma (Yalnızca SELECT).
- **Body:** `{ "query": "SELECT * FROM products" }`

---

## ⚙️ Sistem & Sağlık

### `GET /health`
Sistem sağlık durumunu kontrol eder.
- **Response:** `{ "status": "ok", "db": "connected" }`
