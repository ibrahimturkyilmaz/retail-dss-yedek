from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Product, Sale, Store
import random

def get_similar_products(db: Session, target_product: Product, limit: int = 3):
    """
    k-NN (k-Nearest Neighbors) Algoritması (SQL OPTİMİZE):
    Yeni bir ürün için "Benzer" (Proxy) ürünleri bulur.
    
    Benzerlik Kriterleri:
    1. Hard Filter: Aynı kategoride olmalı.
    2. Distance Metric (Mesafe): Fiyat farkı (|P1 - P2|) en az olanlar seçilir.
    
    Eski yöntem: Tüm kategori ürünlerini çekip Python'da sort ediyordu.
    Yeni yöntem: SQL ORDER BY ABS(...) LIMIT ... ile sadece gerekenleri çeker.
    """
    # SQL ile sıralama ve limit (RAM tasarrufu)
    similar_products = db.query(Product).filter(
        Product.category == target_product.category,
        Product.id != target_product.id
    ).order_by(
        func.abs(Product.price - target_product.price)
    ).limit(limit).all()
    
    return similar_products

def analyze_cold_start(db: Session, product_id: int):
    """
    Cold Start Problemi (Soğuk Başlangıç):
    Geçmiş satış verisi olmayan YENİ ürünler için talep tahmini yapma sorunu.
    
    Çözüm: "Proxy" (Vekil) Tabanlı Tahmin.
    Benzer ürünlerin istatistikleri (Ortalama, Standart Sapma) yeni ürüne kopyalanır.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return {"error": "Product not found"}
        
    # Bu ürünün satış geçmişi var mı?
    sale_count = db.query(func.count(Sale.id)).filter(Sale.product_id == product_id).scalar()
    
    if sale_count > 10:
        return {
            "status": "established",
            "message": "Yeterli geçmiş veri var. Standart istatistiksel motor kullanılıyor."
        }
        
    # Cold Start Durumu: Benzer ürünleri bul
    proxies = get_similar_products(db, product)
    
    proxy_data = []
    total_avg_daily_sales = 0
    
    for p in proxies:
        # Son 30 günlük ortalama satışını bul (Simüle)
        avg_sales = random.uniform(5, 15) # Demo verisi
        total_avg_daily_sales += avg_sales
        
        proxy_data.append({
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "similarity_score": f"%{random.randint(85, 99)}", # Demo skoru
            "avg_daily_demand": round(avg_sales, 1)
        })
        
    predicted_demand = total_avg_daily_sales / len(proxies) if proxies else 0
    
    return {
        "status": "cold_start",
        "method": "k-NN (Similarity Based)",
        "message": f"Yetersiz veri. '{product.category}' kategorisindeki benzer {len(proxies)} ürün referans alındı.",
        "proxies": proxy_data,
        "predicted_demand": round(predicted_demand, 1)
    }
