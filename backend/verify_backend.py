from database import SessionLocal
from models import Store, Inventory, Product
from risk_engine import analyze_store_risk, get_risk_report
from transfer_engine import generate_transfer_recommendations
from analysis_engine import calculate_abc_analysis
from cold_start_engine import analyze_cold_start

def verify_backend():
    print("--- Backend Verification Start ---")
    db = SessionLocal()
    
    try:
        # 1. Check Data Existence
        stores = db.query(Store).all()
        products = db.query(Product).all()
        inventory_count = db.query(Inventory).count()
        
        print(f"Stores: {len(stores)}")
        print(f"Products: {len(products)}")
        print(f"Inventory Records: {inventory_count}")
        
        if len(stores) == 0 or len(products) == 0 or inventory_count == 0:
            print("FAIL: Database seems empty.")
            return

        # 2. Check Relationships (Store -> Inventory)
        sample_store = stores[0]
        print(f"Checking Store: {sample_store.name}")
        print(f"Inventory Items: {len(sample_store.inventory)}")
        
        if len(sample_store.inventory) == 0:
            print("FAIL: Store has no inventory linked.")
            return

        # 3. Check Risk Engine
        print("\nTesting Risk Engine...")
        risk_status = analyze_store_risk(sample_store)
        print(f"Store Risk Status: {risk_status}")
        
        report = get_risk_report(stores)
        print(f"Risk Report Generated for {len(report)} stores.")

        # 4. Check Transfer Engine
        print("\nTesting Transfer Engine (Robin Hood)...")
        recommendations = generate_transfer_recommendations(db, stores)
        print(f"Recommendations Generated: {len(recommendations)}")
        if len(recommendations) > 0:
            print(f"Sample Rec: {recommendations[0]['reasons']}")
        
        if len(recommendations) > 0:
            print(f"Sample Rec: {recommendations[0]['reasons']}")

        # 5. Check Analysis Engine (ABC Analysis)
        print("\nTesting Analysis Engine (ABC Analysis)...")
        abc_result = calculate_abc_analysis(db)
        print(f"ABC Analysis Result: {abc_result}")
        
        # 6. Check Cold Start Engine
        print("\nTesting Cold Start Engine...")
        if len(products) > 0:
            sample_product_id = products[0].id
            try:
                cold_start_res = analyze_cold_start(db, product_id=sample_product_id)
                print(f"Cold Start Analysis for Product {sample_product_id}: {cold_start_res.get('status', 'Unknown')}")
            except Exception as cs_error:
                print(f"Cold Start Error: {cs_error}")
        else:
            print("Skipping Cold Start (No products)")

        print("\n--- Backend Verification PASS ---")
        
    except Exception as e:
        print(f"\n--- Backend Verification FAIL ---")
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_backend()
