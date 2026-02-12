from models import Store, StoreType, Forecast
from risk_engine import analyze_store_risk
from typing import List, Dict
import math
from sqlalchemy.orm import Session
from datetime import date, timedelta

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Haversine Formülü: Küresel yüzey üzerindeki iki nokta arasındaki en kısa mesafeyi hesaplar.
    
    Matematiksel Formül:
    a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
    c = 2 * atan2(√a, √(1-a))
    d = R * c
    
    R: Dünya Yarıçapı (Ortalama 6371 km)
    """
    R = 6371 # Dünya yarıçapı (km)
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def generate_transfer_recommendations(db: Session, stores: List[Store], max_truck_capacity: int = 50) -> List[Dict]:
    """
    Robin Hood Algoritması (Proaktif Stok Dengeleme):
    Zenginden (Stok Fazlası Olan) alıp, fakire (Stok İhtiyacı Olan) verme prensibi.
    
    Adımlar:
    1. Talep Tahmini Analizi (Gelecek 7 gün ne satacak?)
    2. Eksik (Shortage) ve Fazla (Excess) tespiti.
    3. Maliyet Fonksiyonu (Cost Function) ile en uygun transfer eşlemesi.
    """
    
    recommendations = []
    transfer_id_counter = 100
    today = date.today()
    next_week = today + timedelta(days=7)
    
    # Envanteri analiz et
    # İhtiyacı olanlar (Receivers) ve Fazlası olanlar (Givers)
    receivers = []
    givers = {StoreType.HUB: [], StoreType.CENTER: [], StoreType.STORE: []}
    
    # 1. Havuzları Doldur (Tahmin Odaklı Analiz)
    for store in stores:
        for item in store.inventory:
            # GELECEK TALEBİ ÇEK (Önümüzdeki 7 gün)
            future_demand = db.query(Forecast).filter(
                Forecast.store_id == store.id,
                Forecast.product_id == item.product_id,
                Forecast.date >= today,
                Forecast.date <= next_week
            ).with_entities(Forecast.predicted_quantity).all()
            
            total_predicted_demand = sum([f[0] for f in future_demand])
            
            # Alıcı mı? (Receiver Detection)
            # Formül: Mevcut Stok < (Tahminlenen Talep + Güvenlik Stoğu)
            if item.quantity < (total_predicted_demand + item.safety_stock):
                shortage = (total_predicted_demand + item.safety_stock) - item.quantity
                
                # Aciliyet Skoru (Urgency Metric):
                # Stok 0 ise aciliyet maksimumdur (1.0).
                # Değilse, talebin kaçta kaçını karşıladığına göre lineer artar.
                urgency_score = 1.0 if item.quantity == 0 else (total_predicted_demand / item.quantity if item.quantity > 0 else 1.0)
                
                receivers.append({
                    "store": store,
                    "product": item.product,
                    "shortage": shortage,
                    "priority": min(urgency_score, 1.0),
                    "current_stock": item.quantity,
                    "safety_stock": item.safety_stock,
                    "predicted_demand": total_predicted_demand,
                    "abc_category": item.product.abc_category
                })
            
            # Verici mi? (Gelecek hafta talebinden ve güvenlik stoğundan fazlası varsa)
            elif item.quantity > (total_predicted_demand + item.safety_stock):
                excess = item.quantity - (total_predicted_demand + item.safety_stock)
                
                # Mağazalar için daha sıkı kural (Sadece %50 fazlasını verebilir)
                if store.store_type == StoreType.STORE:
                    excess = int(excess * 0.5)

                if excess > 0:
                    givers[store.store_type].append({
                        "store": store,
                        "product_id": item.product_id,
                        "excess": excess,
                        "current_stock": item.quantity
                    })

    # 2. Önceliğe Göre Sırala (ABC Kategorisi A olanlar ve Urgency Score yüksek olanlar önce)
    receivers.sort(key=lambda x: (x["abc_category"] == 'A', x["priority"]), reverse=True)
    
    # 3. Eşleştirme Algoritması
    
    # [OPTIMIZASYON] Ceza Puanlarını Toplu Çek (Memory Cache)
    # N+1 Problemini çözer: Döngü içinde her defasında DB'ye gitmek yerine
    # tek seferde tüm ceza tablosunu çekip RAM'e alıyoruz.
    from models import RoutePenalty
    all_penalties = db.query(RoutePenalty).all()
    penalty_map = {}
    for p in all_penalties:
        penalty_map[(p.source_store_id, p.target_store_id)] = p.penalty_score

    for req in receivers:
        needed_product_id = req["product"].id
        amount_needed = req["shortage"]
        
        # SIRA 1: HUB Kontrolü
        # SIRA 2: CENTER Kontrolü
        # SIRA 3: STORE Kontrolü
        
        search_order = [StoreType.HUB, StoreType.CENTER, StoreType.STORE]
        best_source = None
        min_dist = float('inf')
        best_score = -float('inf')
        
        for source_type in search_order:
            potential_givers = [g for g in givers[source_type] if g["product_id"] == needed_product_id and g["excess"] > 0]
            
            if not potential_givers:
                continue # Bu türde kaynak yok, bir sonrakine bak
                
            # Bu türdeki en uygun (en optimize) kaynağı bul
            for giver in potential_givers:
                dist = calculate_distance(req["store"].lat, req["store"].lon, giver["store"].lat, giver["store"].lon)
                
                # --- ROBIN HOOD SKORU (Optimizasyon Fonksiyonu) ---
                # Amaç: Lojistik maliyeti en aza indirirken, stok riskini en çok azaltan hamleyi bulmak.
                # Skor Fonksiyonu: F(x) = (Aciliyet * w1) - (Mesafe * w2) - (Ceza * w3)
                
                logistics_cost = dist * 2.5 # km başına 2.5 TL birim maliyet
                
                # Merkez/Hub ise mesafeyi biraz daha tolere et (Daha büyük araçları var)
                dist_penalty = dist if source_type == StoreType.STORE else dist * 0.7 
                
                # Ceza Puanını RAM'den Oku (Hızlı)
                penalty_score = penalty_map.get((giver["store"].id, req["store"].id), 0.0)
                
                # Skor Hesaplama (Ceza puanı skoru düşürür)
                score = (req["priority"] * 100) - (dist_penalty * 0.5) - (penalty_score * 5.0)
                
                if score > best_score:
                    best_score = score
                    min_dist = dist
                    best_source = giver
            
            if best_source:
                # Kaynak bulundu! Döngüyü kır (Hiyerarşi kuralı: Hub varsa Store'a bakma)
                break 
        
        if best_source:
            # Transfer miktarını belirle (Aracın kapasitesini aşamaz)
            transfer_amount = min(amount_needed, best_source["excess"], max_truck_capacity)
            
            # Kaynağın stoğunu sanal olarak düşür (aynı döngüde başkasına vermesin)
            best_source["excess"] -= transfer_amount
            
            source_store = best_source["store"]
            target_store = req["store"]
            product_name = req["product"].name
            
            # --- XAI (Açıklanabilir Yapay Zeka - Explainable AI) ---
            # "Black Box" (Kara Kutu) model olmamak için, sistemin neden bu kararı verdiği
            # son kullanıcıya doğal dilde raporlanır.
            explanations = []
            
            # Neden Hedef Seçildi?
            stockout_risk_reduction = min(100, round((transfer_amount / req["predicted_demand"]) * 100)) if req["predicted_demand"] > 0 else 100
            
            explanations.append(f"Risk Analizi: Stok tükenme riski %{stockout_risk_reduction} oranında azaltıldı.")
            explanations.append(f"Talep Tahmini: Önümüzdeki 7 gün için {req['predicted_demand']} adet ihtiyaç var.")
            
            # Neden Kaynak Seçildi?
            if source_store.store_type == StoreType.HUB:
                explanations.append(f"Lojistik Stratejisi: En verimli kaynak (HUB) kullanıldı.")
            else:
                 explanations.append(f"Lojistik Stratejisi: En yakın ve stoğu bol mağaza ({source_store.name}) seçildi.")

            # ABC Önceliği
            if req['abc_category'] == 'A':
                explanations.append(f"Finansal Etki: A Grubu (Yüksek Ciro) ürün önceliklendirildi.")
            
            # Maliyet/Lojistik
            estimated_cost = min_dist * 4.5 # km başına 4.5 TL (Örnek)
            explanations.append(f"Lojistik Maliyet: ₺{estimated_cost:,.0f} (Mesafe: {min_dist:.1f} km).")
            
            rec = {
                "transfer_id": f"TRF-{transfer_id_counter}",
                "source": {
                    "id": source_store.id,
                    "name": source_store.name,
                    "type": source_store.store_type.value
                },
                "target": {
                    "id": target_store.id,
                    "name": target_store.name,
                    "type": target_store.store_type.value
                },
                "product_id": req["product"].id,
                "product": product_name, 
                "amount": transfer_amount,
                "xai_explanation": { # Frontend'de kart olarak gösterilecek
                    "summary": f"Stok Riski %{stockout_risk_reduction} Azaltıldı | Maliyet: ₺{estimated_cost:,.0f}",
                    "reasons": explanations,
                    "score": round(max(0, best_score)), # Skor negatif olmasın
                    "type": "PROACTIVE" # Frontend için tip belirteci
                },
                "algorithm": "Robin Hood AI v2.2 (Bulk Optimized)"
            }
            recommendations.append(rec)
            transfer_id_counter += 1

    return recommendations
