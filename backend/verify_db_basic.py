from database import SessionLocal
from models import Store, Product, Sale

db = SessionLocal()
print("--- DB VERIFICATION ---")
store_count = db.query(Store).count()
product_count = db.query(Product).count()
print(f"Stores: {store_count}")
print(f"Products: {product_count}")

s1p1_sales = db.query(Sale).filter_by(store_id=1, product_id=1).count()
print(f"Sales for S1P1: {s1p1_sales}")

print("--- END ---")
