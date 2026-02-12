from models import Store, Inventory
from typing import Dict, List
from sqlalchemy.orm import Session
from sqlalchemy import text
from core.logger import logger

def analyze_store_risk(store: Store, db: Session) -> str:
    """
    MAĞAZA RİSK ANALİZİ (SQL OPTİMİZE)
    
    Eski yöntem: Tüm envanteri çek, döngüyle say (Python Loop).
    Yeni yöntem: Veritabanında (SQL) saydır ve sadece 3 tane sayı çek.
    """
    if not db:
        # DB oturumu yoksa (eski kod uyumluluğu) manuel hesapla veya hata dön
        return "UNKNOWN"

    sql_query = text("""
        SELECT 
            COUNT(*) as total_items,
            SUM(CASE WHEN quantity < safety_stock THEN 1 ELSE 0 END) as high_risk_count,
            SUM(CASE WHEN quantity > safety_stock * 3 THEN 1 ELSE 0 END) as overstock_count
        FROM inventory
        WHERE store_id = :store_id
    """)
    
    try:
        result = db.execute(sql_query, {"store_id": store.id}).fetchone()
        if not result:
            return "UNKNOWN"
            
        total_items = result[0]
        high_risk_count = result[1] or 0
        overstock_count = result[2] or 0
        
    except Exception as e:
        logger.error(f"Risk Engine SQL Error: {e}")
        return "UNKNOWN"

    if total_items == 0:
        return "LOW_RISK"

    # Karar Mantığı (Aynı kalıyor)
    if (high_risk_count / total_items) > 0.2:
        return "HIGH_RISK"
    
    if (overstock_count / total_items) > 0.4:
        return "OVERSTOCK"
        
    return "LOW_RISK"

def get_risk_report(db: Session, stores: List[Store]) -> List[Dict]:
    """
    TOPLU RİSK RAPORU (SQL OPTİMİZE)
    
    Tüm mağazaların risk durumunu tek sorguda çeker.
    """
    # Tek sorguda tüm mağazaların stok istatistiklerini al
    sql_query = text("""
        SELECT 
            i.store_id,
            SUM(i.quantity) as total_stock_qty,
            SUM(i.safety_stock) as total_safety_qty,
            COUNT(i.id) as total_items,
            SUM(CASE WHEN i.quantity < i.safety_stock THEN 1 ELSE 0 END) as high_risk,
            SUM(CASE WHEN i.quantity > i.safety_stock * 3 THEN 1 ELSE 0 END) as overstock
        FROM inventory i
        GROUP BY i.store_id
    """)
    
    try:
        stats_results = db.execute(sql_query).fetchall()
    except Exception as e:
        logger.error(f"Bulk Risk Report Error: {e}")
        stats_results = []
        
    # Sonuçları Store ID'ye göre sözlüğe al (O(1) erişim için)
    stats_map = {}
    for row in stats_results:
        stats_map[row[0]] = {
            "total_stock": row[1] or 0,
            "total_safety": row[2] or 0,
            "total_items": row[3] or 0,
            "high_risk": row[4] or 0,
            "overstock": row[5] or 0
        }

    report = []
    
    frontend_colors = {
        "HIGH_RISK": "red",
        "MEDIUM_RISK": "orange",
        "OVERSTOCK": "yellow",
        "LOW_RISK": "green",
        "UNKNOWN": "gray"
    }
        
    for store in stores:
        stat = stats_map.get(store.id, {})
        
        # Risk Durumu Hesapla
        total_items = stat.get("total_items", 0)
        high_risk = stat.get("high_risk", 0)
        overstock = stat.get("overstock", 0)
        
        status = "LOW_RISK"
        if total_items > 0:
            if (high_risk / total_items) > 0.2:
                status = "HIGH_RISK"
            elif (overstock / total_items) > 0.4:
                status = "OVERSTOCK"
        else:
            status = "UNKNOWN" if total_items == 0 else "LOW_RISK"
            
        report.append({
            "store_id": store.id,
            "name": store.name,
            "type": store.store_type.value,
            "stock": stat.get("total_stock", 0),
            "safety_stock": stat.get("total_safety", 0),
            "status": status,
            "color": frontend_colors.get(status, "gray")
        })
        
    return report
