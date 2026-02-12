import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
# Now we can import directly as if we are in backend or properly structured
from main import get_store_inventory
from models import Store, Inventory, Product
from database import Base

# Setup in-memory DB for testing
engine = create_engine('sqlite:///:memory:')
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
db = Session()

# Seed Data
product = Product(name="Test Product", category="Test Cat", cost=10, price=20, abc_category="A")
store = Store(name="Test Store", store_type="STORE", lat=0, lon=0)
db.add(product)
db.add(store)
db.commit()

inv = Inventory(store_id=store.id, product_id=product.id, quantity=100, safety_stock=10)
db.add(inv)
db.commit()

# Test Endpoint Logic
try:
    print("Testing get_store_inventory...")
    results = get_store_inventory(store.id, db)
    print("Success. Results:", results)
    
    # Check structure
    first_item = results[0]
    assert 'forecast_next_7_days' in first_item
    assert 'category' in first_item
    print("Data structure verified.")
except Exception as e:
    print(f"Test Failed: {e}")
    import traceback
    traceback.print_exc()
