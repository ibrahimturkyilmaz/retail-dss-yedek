from sqlalchemy.orm import Session
from database import SessionLocal
from main import generate_forecasts

def run_forecasts():
    db = SessionLocal()
    try:
        print("Generating forecasts...")
        # We need to mock the dependency or just call the logic if it was cleaner.
        # But generate_forecasts relies on `db` dependency injection which is fine here.
        # Wait, generate_forecasts in main.py is an endpoint function. 
        # It takes `db: Session = Depends(get_db)`. 
        # We can call it directly passing the db session.
        
        result = generate_forecasts(db)
        print(f"Result: {result}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    run_forecasts()
