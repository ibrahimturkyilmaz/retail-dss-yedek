# --- VERİTABANI BAĞLANTISI ---
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from core.config import settings

# Öncelik: .env dosyasındaki DATABASE_URL (Supabase/PostgreSQL)
# Yedek: Eğer .env yoksa veya boşsa, yerel SQLite dosyasını kullan (./retail.db)
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# Bağlantı motorunu oluştur
# check_same_thread=False sadece SQLite için gereklidir, PostgreSQL'de bu ayara gerek yok ama zarar vermez.
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL (Supabase) için bağlantı ayarı
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Veritabanı oturumu (Session) oluşturucu
# autocommit=False: İşlemleri biz onaylamadan kaydetme (Güvenlik)
# autoflush=False: Değişiklikleri hemen yansıtma (Performans)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Tüm modellerin (Tabloların) miras alacağı temel sınıf
Base = declarative_base()

# --- BAĞLANTIYI KULLANAN FONKSİYON ---
# Bu fonksiyon her API isteğinde çağrılır ve iş bitince bağlantıyı kapatır.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
