import random
from datetime import datetime, timedelta
import faker
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Store, Product, Customer, Sale, StoreType, Inventory
from core.config import settings

# Veritabanı Yapılandırması
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

fake = faker.Faker('tr_TR')

def seed_data():
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    print("Tablolar oluşturuluyor (SQLite)...")
    Base.metadata.drop_all(bind=engine) # Temiz başlangıç
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    print("Veri temizleniyor ve yeniden oluşturuluyor...")

    # --- 1. Mağazalar ve Depolar ---
    print("Mağazalar ve Depolar ekleniyor...")
    # Topoloji: 1 Merkez, 1 Hub,    print("Mağazalar oluşturuluyor...")
    # Topoloji: 1 Merkez, 1 Hub,
    locations = [
        {"name": "Merkez Depo (Gebze)", "type": StoreType.CENTER, "lat": 40.8028, "lon": 29.4307, "safety": 50},
        {"name": "Anadolu Yakası Hub", "type": StoreType.HUB, "lat": 40.9900, "lon": 29.1500, "safety": 30},
        {"name": "Kadıköy Mağaza", "type": StoreType.STORE, "lat": 40.9819, "lon": 29.0254, "safety": 10},
        {"name": "Beşiktaş Mağaza", "type": StoreType.STORE, "lat": 41.0422, "lon": 29.0077, "safety": 10},
        {"name": "Bakırköy Mağaza", "type": StoreType.STORE, "lat": 40.9768, "lon": 28.8720, "safety": 10},
        {"name": "Sarıyer Mağaza", "type": StoreType.STORE, "lat": 41.1663, "lon": 29.0541, "safety": 10},
        {"name": "Beylikdüzü Mağaza", "type": StoreType.STORE, "lat": 41.0011, "lon": 28.6419, "safety": 10},
    ]

    stores = []
    for loc in locations:
        store = Store(
            name=loc["name"],
            store_type=loc["type"],
            lat=loc["lat"],
            lon=loc["lon"]
        )
        db.add(store)
        stores.append(store)
    db.commit()

    # --- 2. Ürünler ---
    print("Ürünler ekleniyor...")
    products = []
    
    categories = {
        "Elektronik": [("Akıllı Telefon", 5000, 7500), ("Laptop", 15000, 22000), ("Kulaklık", 500, 800), ("Şarj Aleti", 100, 250)],
        "Giyim": [("Tişört Basic", 100, 250), ("Kot Pantolon", 300, 600), ("Spor Ayakkabı", 800, 1500), ("Ceket", 600, 1200)],
        "Ev Yaşam": [("Kahve Makinesi", 2000, 3500), ("Yastık", 150, 300), ("Tablo", 200, 500), ("Vazo", 100, 250)],
        "Gıda": [("Premium Çikolata", 50, 100), ("Kahve Çekirdeği", 150, 300), ("Dondurma", 20, 50)]
    }

    for cat, items in categories.items():
        for name, cost, price in items:
            p = Product(
                name=name,
                category=cat,
                cost=cost,
                price=price
            )
            db.add(p)
            products.append(p)
    db.commit()
    # Tekrar sorgulayarak ID'leri alalım
    products = db.query(Product).all()
    stores = db.query(Store).all()

    # --- 3. Müşteriler ---
    print("Müşteriler ekleniyor...")
    customers = []
    for _ in range(100):
        c = Customer(
            name=fake.name(),
            city="İstanbul",
            loyalty_score=random.uniform(0, 10)
        )
        db.add(c)
        customers.append(c)
    db.commit()
    customers = db.query(Customer).all()

    # --- 3.5. Envanter (Inventory) Başlangıç Stokları ---
    print("Envanter oluşturuluyor...")
    for store in stores:
        for product in products:
            # Hub ve Center için yüksek stok, mağaza için normal
            if store.store_type == StoreType.CENTER:
                qty = random.randint(5000, 10000)
            elif store.store_type == StoreType.HUB:
                qty = random.randint(1000, 3000)
            else:
                qty = random.randint(50, 200)
            
            inv = Inventory(
                store_id=store.id,
                product_id=product.id,
                quantity=qty,
                safety_stock=int(qty * 0.2) # %20 güvenlik stoğu
            )
            db.add(inv)
    db.commit()

    # --- 4. Satış Geçmişi (1 Yıl) - BULK INSERT ---
    print("Satış geçmişi oluşturuluyor (Bulk Insert kullanılıyor)...")
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    
    sales_mappings = [] # Dict list for bulk_insert_mappings
    total_sales_count = 0
    
    # Performans için ID listelerini önceden alalım
    store_ids = [s.id for s in stores]
    product_data = [(p.id, p.price, p.name) for p in products] # ID, Price, Name
    customer_ids = [c.id for c in customers]
    
    current_date = start_date
    while current_date <= end_date:
        is_weekend = current_date.weekday() >= 5
        month = current_date.month
        is_summer = month in [6, 7, 8]
        
        # Her gün için toplu veri hazırlayalım
        daily_sales = []
        
        for store_id in store_ids:
            num_transactions = random.randint(10, 50) # Biraz artırdık
            if is_weekend:
                num_transactions = int(num_transactions * 1.5)
            
            for _ in range(num_transactions):
                # Ürün seçimi
                if is_summer and random.random() < 0.4:
                     summer_prods = [p for p in product_data if p[2] in ["Tişört Basic", "Dondurma", "Spor Ayakkabı"]]
                     if summer_prods:
                         p_id, p_price, _ = random.choice(summer_prods)
                     else:
                         p_id, p_price, _ = random.choice(product_data)
                else:
                    p_id, p_price, _ = random.choice(product_data)
                
                c_id = random.choice(customer_ids)
                qty = random.randint(1, 5)
                
                # Dict olarak ekle (ORM nesnesi oluşturmadan) -> ÇOK DAHA HIZLI
                daily_sales.append({
                    "store_id": store_id,
                    "product_id": p_id,
                    "customer_id": c_id,
                    "date": current_date.date(),
                    "quantity": qty,
                    "total_price": float(p_price * qty)
                })
        
        sales_mappings.extend(daily_sales)
        total_sales_count += len(daily_sales)
        
        # Her 5000 kayıtta bir DB'ye yaz (Bellek şişmesin)
        if len(sales_mappings) >= 5000:
            db.bulk_insert_mappings(Sale, sales_mappings)
            db.commit()
            sales_mappings = []
            print(f"{current_date.date()} itibarıyla {total_sales_count} kayıt basıldı...")
            
        current_date += timedelta(days=1)
        
    # Kalanları bas
    if sales_mappings:
        db.bulk_insert_mappings(Sale, sales_mappings)
        db.commit()
        
    print(f"Hızlı Tohumlama (Bulk Insert) tamamlandı! Toplam {total_sales_count} satış kaydı oluşturuldu.")
    db.close()

if __name__ == "__main__":
    seed_data()
