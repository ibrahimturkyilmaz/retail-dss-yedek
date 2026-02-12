from sqlalchemy.orm import Session
from database import SessionLocal
from models import Store, Inventory, Sale, Product
from sqlalchemy import func

def test_queries():
    db = SessionLocal()
    try:
        print("Testing dashboard insights query...")
        critical_stores_count = db.query(Inventory).filter(Inventory.quantity <= 3).count()
        print(f"Critical stores count: {critical_stores_count}")
        
        print("Testing ai-voice query...")
        total_sales = db.query(func.sum(Sale.total_price)).scalar() or 0
        print(f"Total sales: {total_sales}")
        
        worst_store = db.query(Store.name).join(Inventory).order_by(Inventory.quantity).first()
        print(f"Worst store: {worst_store}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_queries()
