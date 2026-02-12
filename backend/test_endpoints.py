import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8001"

def test_endpoint(name, url):
    prefixes = ["/api", ""]
    for prefix in prefixes:
        full_url = f"{BASE_URL}{prefix}{url}"
        try:
            # print(f"Testing {name} ({full_url})...", end=" ")
            response = requests.get(full_url)
            if response.status_code == 200:
                print(f"✅ {name} ({full_url}) OK")
                return True
            else:
                last_error = f"Status {response.status_code}: {response.text[:200]}"
        except Exception as e:
            last_error = str(e)
            continue
    
    # If we get here, both prefixes failed
    print(f"❌ {name} ({url}) Failed. {last_error if 'last_error' in locals() else 'Unknown error'}")
    return False

def main():
    print(f"Starting API Tests against {BASE_URL}\n")
    
    success = True
    success &= test_endpoint("Stores List", "/stores") # No /api prefix for this one
    success &= test_endpoint("Dashboard Insights", "/api/dashboard/insights")
    success &= test_endpoint("Transfer Recommendations", "/api/transfers/recommendations") # Plural 'transfers'
    success &= test_endpoint("Inventory for Store 1", "/api/stores/1/inventory")
    success &= test_endpoint("Analytics Accuracy", "/api/analysis/accuracy?store_id=1&product_id=1")
    
    # Test Product Launch (POST)
    try:
        print("Testing Product Launch (POST /api/products/launch)...", end=" ")
        launch_payload = {
            "name": "Test Product " + str(datetime.now()),
            "category": "Electronics",
            "price": 100.0,
            "reference_product_id": 1
        }
        res = requests.post(f"{BASE_URL}/api/products/launch", json=launch_payload)
        if res.status_code == 200:
            print("✅ OK")
        else:
            print(f"❌ Failed ({res.status_code}): {res.text[:100]}")
            success = False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        success = False

    if success:

        print("\n🎉 All critical endpoints are responsive!")
    else:
        print("\n⚠️ Some endpoints failed.")

if __name__ == "__main__":
    main()
