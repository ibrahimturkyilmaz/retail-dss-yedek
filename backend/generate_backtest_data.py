from sqlalchemy.orm import Session
from database import SessionLocal
from models import Store, Product, Sale, Forecast
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import datetime
from datetime import timedelta

def generate_backtest_forecasts(db: Session):
    print("Starting BACKTEST forecast generation...")
    
    # 1. Clear existing forecasts to avoid confusion
    print("Clearing existing forecasts...")
    db.query(Forecast).delete()
    db.commit()
    
    stores = db.query(Store).all()
    products = db.query(Product).limit(50).all() 
    
    generated_count = 0
    days_to_backtest = 14 # Validate last 2 weeks
    
    for store in stores:
        for product in products:
            # Fetch ALL sales
            sales_data = db.query(Sale.date, Sale.quantity)\
                .filter(Sale.store_id == store.id, Sale.product_id == product.id)\
                .order_by(Sale.date)\
                .all()
            
            if len(sales_data) < 20: 
                continue
                
            df = pd.DataFrame(sales_data, columns=['date', 'quantity'])
            df['date'] = pd.to_datetime(df['date'])
            df['date_ordinal'] = df['date'].map(datetime.datetime.toordinal)
            
            # 2. Split Data: Train on (Start -> End - 14 days)
            # Predict on (End - 14 days -> End + 30 days)
            
            last_date = df['date'].max()
            split_date = last_date - timedelta(days=days_to_backtest)
            
            # Train Set
            train_df = df[df['date'] <= split_date]
            
            if len(train_df) < 10:
                continue
                
            X_train = train_df['date_ordinal'].values.reshape(-1, 1)
            y_train = train_df['quantity']
            
            model = LinearRegression()
            model.fit(X_train, y_train)
            
            # Predict specific range: from split_date + 1 to last_date + 30
            # This covers the backtest period (last 14 days) and future
            
            start_pred_date = split_date + timedelta(days=1)
            end_pred_date = last_date + timedelta(days=30)
            
            days_count = (end_pred_date - start_pred_date).days + 1
            
            target_dates = [start_pred_date + timedelta(days=x) for x in range(days_count)]
            target_ordinals = np.array([d.toordinal() for d in target_dates]).reshape(-1, 1)
            
            predictions = model.predict(target_ordinals)
            
            for i, pred in enumerate(predictions):
                pred_qty = max(0, round(pred))
                forecast = Forecast(
                    store_id=store.id,
                    product_id=product.id,
                    date=target_dates[i],
                    predicted_quantity=pred_qty
                )
                db.add(forecast)
                generated_count += 1
                
    db.commit()
    print(f"DONE. Generated {generated_count} backtest forecasts.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        generate_backtest_forecasts(db)
    finally:
        db.close()
