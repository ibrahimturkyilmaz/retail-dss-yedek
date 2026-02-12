from sqlalchemy.orm import Session
from sqlalchemy import text
from models import Sale, Product, Store, Inventory, Forecast
from core.logger import logger
# import pandas as pd # Pandas artık gerekli değil (Optimizasyon)
# import numpy as np # Numpy da gerekli değil
# from sklearn.metrics import r2_score, mean_absolute_error # Sklearn yerine manuel hesap

def calculate_abc_analysis(db: Session):
    """
    🔠 ABC ANALİZİ (SQL OPTİMİZE)
    
    RAM dostu versiyon. 
    Tüm veriyi belleğe çekmek yerine, hesaplamayı veritabanı motoruna (SQL) yıkar.
    """
    # 1. SQL Window Functions ile Kümülatif Ciro Hesabı
    # Modern veritabanları (PostgreSQL, SQLite 3.25+) Window Function destekler.
    
    sql_query = text("""
    WITH product_sales AS (
        SELECT product_id, SUM(total_price) as revenue
        FROM sales
        GROUP BY product_id
    ),
    total as (
        SELECT SUM(revenue) as total_revenue FROM product_sales
    ),
    cumulative AS (
        SELECT 
            p.product_id, 
            p.revenue,
            SUM(p.revenue) OVER (ORDER BY p.revenue DESC) as running_total,
            t.total_revenue
        FROM product_sales p, total t
    )
    SELECT 
        product_id, 
        revenue,
        (running_total * 1.0 / total_revenue) as ratio
    FROM cumulative;
    """)
    
    try:
        results = db.execute(sql_query).fetchall()
    except Exception as e:
        logger.error(f"SQL Error: {e}")
        return []

    abc_results = []
    
    for row in results:
        p_id = row[0]
        revenue = row[1]
        ratio = row[2]
        
        # Sınıflandırma
        if ratio <= 0.80:
            abc_class = "A"
        elif ratio <= 0.95:
            abc_class = "B"
        else:
            abc_class = "C"
            
        # Veritabanında güncelle (Bulk Update yerine tek tek yapıyoruz şimdilik, 
        # çünkü model bağımlılığı var. İlerde bu da bulk SQL olabilir.)
        product = db.query(Product).filter(Product.id == p_id).first()
        if product:
            product.abc_category = abc_class
            # Sadece ilk 20 veya A grubu ürünleri rapora ekle (Performance UI)
            if len(abc_results) < 20: 
                abc_results.append({
                    "product": product.name,
                    "revenue": revenue,
                    "class": abc_class
                })
            
    db.commit()
    return abc_results

def simulate_what_if(db: Session, source_store_id: int, target_store_id: int, product_id: int, amount: int):
    """
    🧪 WHAT-IF SENARYOSU
    
    Veritabanına yük bindirmeden (sadece 3 basit sorgu) simülasyon yapar.
    """
    source_inv = db.query(Inventory).filter(Inventory.store_id == source_store_id, Inventory.product_id == product_id).first()
    target_inv = db.query(Inventory).filter(Inventory.store_id == target_store_id, Inventory.product_id == product_id).first()
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not source_inv or not target_inv:
        return {"error": "Envanter bulunamadı"}
        
    source_after = source_inv.quantity - amount
    source_risk = "DÜŞÜK"
    if source_after < source_inv.safety_stock:
        source_risk = "YÜKSEK"
    
    # Hedef Analizi
    potential_revenue = amount * product.price * 0.7 
    
    return {
        "scenario": f"{amount} adet transfer senaryosu",
        "source_store_impact": {
            "current_stock": source_inv.quantity,
            "stock_after": source_after,
            "risk_assessment": source_risk
        },
        "target_store_impact": {
            "current_stock": target_inv.quantity,
            "stock_after": target_inv.quantity + amount,
            "potential_revenue_increase": potential_revenue
        },
        "recommendation": "ONAY" if source_after > source_inv.safety_stock else "RED"
    }

def calculate_forecast_accuracy(db: Session, store_id: int, product_id: int):
    """
    🎯 TAHMİN DOĞRULUĞU (SQL JOIN OPTİMİZE)
    
    N+1 problemini çözer. Forecast ve Sales tablolarını veritabanında birleştirir.
    """
    # Tek Sorguda (JOIN) Çek
    sql_query = text("""
        SELECT 
            f.date, 
            f.predicted_quantity as predicted, 
            COALESCE(s.quantity, 0) as actual
        FROM forecasts f
        LEFT JOIN sales s 
            ON f.store_id = s.store_id 
            AND f.product_id = s.product_id 
            AND f.date = s.date
        WHERE f.store_id = :store_id AND f.product_id = :product_id
    """)
    
    results = db.execute(sql_query, {"store_id": store_id, "product_id": product_id}).fetchall()
    
    if not results:
        return {"error": "Yeterli tahmin verisi yok"}

    total_abs_error = 0
    total_squared_error = 0
    count = 0
    validation_data = []
    
    actual_values = [] # R2 için

    for row in results:
        date_val = row[0]
        predicted = row[1]
        actual = row[2]
        
        error = actual - predicted
        abs_error = abs(error)
        
        total_abs_error += abs_error
        total_squared_error += error ** 2
        count += 1
        
        actual_values.append(actual)
        
        validation_data.append({
            "date": date_val,
            "actual": actual,
            "predicted": predicted,
            "error": error
        })
        
    if count == 0:
        return {"error": "Veri yok"}
        
    mae = total_abs_error / count
    rmse = (total_squared_error / count) ** 0.5
    
    # R2 Hesaplama (Manuel)
    if len(actual_values) > 1:
        mean_actual = sum(actual_values) / len(actual_values)
        ss_res = total_squared_error
        ss_tot = sum((y - mean_actual) ** 2 for y in actual_values)
        r2 = 1 - (ss_res / ss_tot) if ss_tot != 0 else 1.0
    else:
        r2 = 1.0

    return {
        "store_id": store_id,
        "product_id": product_id,
        "metrics": {
            "MAE": round(mae, 2),
            "RMSE": round(rmse, 2),
            "r2": round(r2, 4),
            "Sample_Size": count
        },
        "chart_data": validation_data
    }
