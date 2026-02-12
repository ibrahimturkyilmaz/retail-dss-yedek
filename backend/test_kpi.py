from sqlalchemy.orm import Session
from database import SessionLocal
from models import Sale
from sqlalchemy import func, desc

def test_kpi():
    db = SessionLocal()
    try:
        print("Testing KPI query...")
        total_revenue = db.query(func.sum(Sale.total_price)).scalar() or 0
        print(f"Total Revenue: {total_revenue}")
        
        last_7_days = db.query(Sale.date, func.sum(Sale.total_price))\
            .group_by(Sale.date)\
            .order_by(desc(Sale.date))\
            .limit(7).all()
            
        print(f"Last 7 days raw: {last_7_days}")
        
        sparkline_data = [float(amount) for _, amount in last_7_days] if last_7_days else [1000, 1500, 1200, 1800, 2000, 2200, 2500]
        print(f"Sparkline data before reverse: {sparkline_data}")
        
        sparkline_data.reverse()
        print(f"Sparkline data after reverse: {sparkline_data}")
        
        recovered = [v * 0.15 for v in sparkline_data]
        print(f"Recovered sparkline: {recovered}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_kpi()
