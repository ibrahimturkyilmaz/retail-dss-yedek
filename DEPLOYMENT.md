# Deployment Rehberi

Bu belge, RetailDSS projesini canlı ortama (Production) almak için gerekli adımları içerir.

## 🐳 Docker ile Deployment (Önerilen)

*Not: Docker support şu an yol haritasındadır (Phase 3). Aşağıdaki adımlar gelecekteki yapılandırma içindir.*

### `Dockerfile` (Backend)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### `docker-compose.yml`
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/retail_dss
      
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: retail_dss
```

---

## ☁️ Manuel Deployment (Ubuntu/Linux)

### 1. Sunucu Hazırlığı
```bash
sudo apt update && sudo apt upgrade
sudo apt install python3-pip python3-venv nodejs npm nginx
```

### 2. Backend Servisi (Systemd)
`/etc/systemd/system/retail-backend.service`:
```ini
[Unit]
Description=Gunicorn instance to serve RetailDSS
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/retail-dss-project/backend
Environment="PATH=/home/ubuntu/retail-dss-project/backend/venv/bin"
ExecStart=/home/ubuntu/retail-dss-project/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

### 3. Frontend Build & Nginx
Frontend'i build alın:
```bash
cd frontend
npm run build
```
Oluşan `dist` klasörünü Nginx ile sunun:

`/etc/nginx/sites-available/retail-dss`:
```nginx
server {
    listen 80;
    server_name ornek-domain.com;

    location / {
        root /home/ubuntu/retail-dss-project/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. SSL (HTTPS)
Certbot kullanarak ücretsiz SSL sertifikası alın:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ornek-domain.com
```

---

## 🔗 Ortam Değişkenleri (Production)

Canlı ortamda `.env` dosyanızda şu değişiklikleri yapmayı unutmayın:

- `DEBUG=False` yapın.
- `DATABASE_URL` olarak gerçek PostgreSQL/MySQL veritabanınızı kullanın.
- `SECRET_KEY` değerini rastgele ve uzun bir string ile değiştirin.
- `ALLOW_ORIGINS` ayarını sadece frontend domain'inize izin verecek şekilde güncelleyin.
