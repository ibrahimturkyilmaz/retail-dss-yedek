from database import SessionLocal, engine
from models import Base
from analysis_engine import calculate_abc_analysis, simulate_what_if
from simulation_engine import reset_database
import requests

def verify_analysis():
    db = SessionLocal()
    try:
        print("1. Veritabanı Sıfırlanıyor (Schema Update)...")
        reset_database(db)
        print("   ✅ Veritabanı sıfırlandı ve seed edildi.")

        print("\n2. ABC Analizi Hesapla...")
        abc_result = calculate_abc_analysis(db)
        print(f"   📊 Sonuç: {abc_result}")
        if abc_result.get("classification", {}).get("A", 0) > 0:
            print("   ✅ ABC Analizi çalıştı.")
        else:
            print("   ❌ ABC Analizi sonucu boş veya hatalı.")

        print("\n3. What-If Simülasyonu Test Et...")
        # Seed verisinden örnek ID'ler (Genelde 1 ve 2 Store ID, 1 Product ID vardır)
        # Store 1 (Center) -> Store 2 (Hub veya Store)
        # Seed.py'yi kontrol etmeden varsayım yapıyorum ama genelde ID'ler 1'den başlar.
        what_if_result = simulate_what_if(db, source_id=1, target_id=2, product_id=1, amount=50)
        print(f"   🧪 Simülasyon Sonucu:\n   {what_if_result}")
        
        if "scenario" in what_if_result:
            print("   ✅ What-If simülasyonu başarılı.")
        else:
            print("   ❌ Simülasyon hatası.")
            
    except Exception as e:
        print(f"❌ HATA OLUŞTU: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_analysis()
