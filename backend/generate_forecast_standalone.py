from sqlalchemy.orm import Session
from sqlalchemy import func
from database import SessionLocal
from models import Store, Product, Sale, Forecast
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import datetime
from datetime import timedelta
import math

# --- Helper Functions ---

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) * math.sin(dlat / 2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dlon / 2) * math.sin(dlon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def get_proxy_sales_data(db: Session, target_store: Store, product_id: int):
    other_stores = db.query(Store).filter(
        Store.id != target_store.id,
        Store.store_type == target_store.store_type
    ).all()
    
    best_proxy = None
    min_dist = float('inf')
    
    for s in other_stores:
        has_data = db.query(Sale).filter(Sale.store_id == s.id, Sale.product_id == product_id).first()
        if not has_data:
            continue
            
        dist = calculate_distance(target_store.lat, target_store.lon, s.lat, s.lon)
        if dist < min_dist:
            min_dist = dist
            best_proxy = s
            
    if best_proxy:
        print(f"    Using proxy store {best_proxy.name} for Store {target_store.id}")
        return db.query(Sale.date, Sale.quantity)\
            .filter(Sale.store_id == best_proxy.id, Sale.product_id == product_id)\
            .order_by(Sale.date)\
            .all()
    return []

def generate_forecasts(db: Session):
    print("Starting standalone forecast generation...")
    
    # 1. Clear existing forecasts
    print("Clearing existing forecasts...")
    db.query(Forecast).delete()
    db.commit()
    
    stores = db.query(Store).all()
    # Use ALL products or a larger limit
    products = db.query(Product).limit(50).all() 
    
    generated_count = 0
    
    for store in stores:
        for product in products:
            # print(f"Processing Store {store.id} - Product {product.id} ({product.name})...")
            
            sales_data = db.query(Sale.date, Sale.quantity)\
                .filter(Sale.store_id == store.id, Sale.product_id == product.id)\
                .order_by(Sale.date)\
                .all()
            
            # Cold Start Handle
            if len(sales_data) < 10:
                # print(f"  Insufficient data ({len(sales_data)}), trying proxy...")
                sales_data = get_proxy_sales_data(db, store, product.id)
                
            if len(sales_data) < 10:
                # print(f"  Still insufficient data ({len(sales_data)}). Skipping.")
                continue
                
            try:
                df = pd.DataFrame(sales_data, columns=['date', 'quantity'])
                df['date_ordinal'] = pd.to_datetime(df['date']).map(datetime.datetime.toordinal)
                
                X = df[['date_ordinal']]
                y = df['quantity']
                
                model = LinearRegression()
                model.fit(X, y)
                
                # Gelecek 30 gün
                last_date = pd.to_datetime(df['date'].max())
                future_dates = [last_date + timedelta(days=x) for x in range(1, 31)]
                future_ordinals = np.array([d.toordinal() for d in future_dates]).reshape(-1, 1)
                predictions = model.predict(future_ordinals)
                
                for i, pred in enumerate(predictions):
                    pred_qty = max(0, round(pred))
                    forecast = Forecast(
                        store_id=store.id,
                        product_id=product.id,
                        date=future_dates[i],
                        predicted_quantity=pred_qty
                    )
                    db.add(forecast)
                    generated_count += 1
                
                # print(f"  Generated forecasts for S{store.id} P{product.id}")
            except Exception as e:
                print(f"  Error generating forecast for S{store.id} P{product.id}: {e}")
                
    db.commit()
    print(f"DONE. Generated {generated_count} total forecasts.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        generate_forecasts(db)
    finally:
        db.close()
