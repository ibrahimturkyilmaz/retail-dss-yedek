from sqlalchemy.orm import Session
from sqlalchemy import text
from models import Store, Inventory, Sale, Product, StoreType
from seed import seed_data
from database import engine, Base
import random
from datetime import date

def simulate_sales_boom(db: Session):
    """
    Senaryo: Talep Patlaması (Demand Surge) 📈
    
    Amaç: Beklenmedik talep artışlarında sistemin dayanıklılığını (resilience) test etmek.
    Simülasyon Mantığı:
    - Rastgele seçilen mağazalarda stok tüketim hızı %50-%90 artırılır.
    - Sistemin "Stoksuz Kalma" (Stockout) durumuna tepkisi ölçülür.
    """
    stores = db.query(Store).filter(Store.store_type == StoreType.STORE).all()
    impacted_count = 0
    total_sales_generated = 0
    
    for store in stores:
        # Mağazaların %70'i bu patlamadan etkilenir
        if random.random() > 0.3:
            impacted_count += 1
            for item in store.inventory:
                # Stok varsa %50-%90 arası satılır
                if item.quantity > 0:
                    sold_qty = int(item.quantity * random.uniform(0.5, 0.9))
                    if sold_qty > 0:
                        item.quantity -= sold_qty
                        
                        # Satış kaydı at (Ciro artsın)
                        sale = Sale(
                            store_id=store.id,
                            product_id=item.product_id,
                            customer_id=1, # Dummy customer
                            date=date.today(),
                            quantity=sold_qty,
                            total_price=sold_qty * item.product.price
                        )
                        db.add(sale)
                        total_sales_generated += sold_qty

    db.commit()
    return f"Talep Patlaması Simüle Edildi: {impacted_count} mağazada toplam {total_sales_generated} ürün satıldı. Stoklar eridi!"

def simulate_recession(db: Session):
    """
    Senaryo: Ekonomik Durgunluk (Recession) 📉
    
    Amaç: Düşük talep dönemlerinde "Atıl Stok" (Dead Stock) maliyetini analiz etmek.
    Simülasyon Mantığı:
    - Mağazalara rastgele "satılmayan" stok eklenir.
    - Depo maliyeti ve nakit akışı üzerindeki baskı (Overstock) simüle edilir.
    """
    stores = db.query(Store).filter(Store.store_type == StoreType.STORE).all()
    
    # Mağaza bazlı işlem (Zaten parçalı olduğu için yield_per gerekmez ama inventory çoksa gerekebilir)
    for store in stores:
        for item in store.inventory:
            # Her ürüne rastgele stok ekle (İade gelmiş veya depodan yığılmış gibi)
            unsold_qty = int(item.safety_stock * random.uniform(1.0, 3.0))
            item.quantity += unsold_qty
            
    db.commit()
    return f"Durgunluk Simüle Edildi: Tüm mağazalarda stoklar şişirildi (Overstock durumu yaratıldı)."

def simulate_supply_shock(db: Session):
    """
    Senaryo: Tedarik Krizi 🚚
    Tüm stokları (Hub ve Center dahil) %50 siler.
    Etki: Küresel yokluk.
    
    [OPTIMIZASYON] yield_per ile 1000'erli paketler halinde işlenir.
    """
    # Batch Processing (Memory Friendly)
    query = db.query(Inventory).execution_options(yield_per=1000)
    total_lost = 0
    
    for item in query:
        if item.quantity > 0:
            lost_qty = int(item.quantity * 0.5)
            item.quantity -= lost_qty
            total_lost += lost_qty
            
    db.commit()
    return f"Tedarik Krizi Simüle Edildi: Lojistik hatlarında {total_lost} ürün kaybedildi."

def simulate_custom_scenario(db: Session, price_change: int, delay_days: int):
    """
    Kullanıcı Tanımlı "What-If" (Senaryo) Analizi.
    
    Değişkenler:
    1. Fiyat Elastisitesi (Price Elasticity of Demand):
       Formül: ΔTalep% = -1 * (ΔFiyat% * Elastisite)
       Varsayım: Elastisite katsayısı = 1.5 (Fiyat %10 artarsa, talep %15 düşer).
       
    2. Tedarik Zinciri Gecikmesi (Supply Chain Delay):
       Geciken her gün için potansiyel satış kaybı (Opportunity Cost) hesaplanır.
    """
    stores = db.query(Store).filter(Store.store_type == StoreType.STORE).all()
    total_revenue_impact = 0
    total_stock_impact = 0
    
    # Basit bir elastikiyet katsayısı
    elasticity = 1.5 
    demand_change_pct = 0
    
    if price_change != 0:
        # Fiyat %10 artarsa, talep %15 düşer (Örnek)
        demand_change_pct = -1 * (price_change / 100.0) * elasticity
        
    for store in stores:
        for item in store.inventory:
            if item.quantity > 0:
                # 1. Gecikme Etkisi (Stoktan düşme opsiyonel, burada sadece risk hesaplayalım veya stok silelim)
                # Gecikme simülasyonu: 5 gün gecikme = 5 günlük satış kadar stok "kullanılamaz" veya "yolda"
                daily_sales_avg = 2 # Ortalama 2 ürün satıyor diyelim
                lost_due_to_delay = daily_sales_avg * delay_days
                
                # Mevcut stoktan düşelim (Simülasyon olduğu için kalıcı, reset ile düzelir)
                actual_lost = min(item.quantity, lost_due_to_delay)
                item.quantity -= actual_lost
                total_stock_impact -= actual_lost
                
                # 2. Fiyat Etkisi (Talep değişimi -> Satış cirosuna etkisi)
                # Kalan stok üzerinden satış yapalım
                if item.quantity > 0:
                    base_sales = 5 # Baz satış
                    new_sales = base_sales * (1 + demand_change_pct)
                    revenue_impact = new_sales * item.product.price * (1 + price_change/100.0)
                    total_revenue_impact += revenue_impact

    db.commit()
    
    direction = "Artış" if total_revenue_impact > 0 else "Düşüş"
    return {
        "message": f"Senaryo Tamamlandı: Fiyat {price_change}%, Gecikme {delay_days} Gün.",
        "impact": {
            "revenue": total_revenue_impact,
            "stock_change": total_stock_impact,
            "summary": f"Tahmini Ciro Etkisi: {total_revenue_impact:,.0f} TL ({direction}), Toplam Stok Kaybı: {abs(total_stock_impact)} Adet"
        }
    }

def reset_database(db: Session):
    """
    Veritabanını sıfırlar ve temiz verilerle (Seed) tekrar doldurur.
    """
    # 1. Tabloları temizle (Drop & Create yerine Delete All daha hızlı olabilir ama seed yapısı create bekliyor mu bakalım)
    # Seed.py içindeki logic tabloları drop edip create ediyor genelde.
    # Biz burada transaction güvenliği için Base.metadata kullanabiliriz.
    
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # 2. Seed işlemini çalıştır
    seed_data()
    
    return "Sistem Fabrika Ayarlarına Döndürüldü (Reset)."
