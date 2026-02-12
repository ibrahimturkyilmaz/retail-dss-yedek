import requests
import json

BASE_URL = "http://127.0.0.1:8001"

def test_endpoint(name, url):
    print(f"\n--- Testing {name} ---")
    try:
        response = requests.get(url)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            # Serialize to string to catch any circular ref or strange issues, and for pretty printing
            print(json.dumps(data, indent=2)[:500] + "...") # Print first 500 chars
            return data
        else:
            print(f"Error Body: {response.text}")
    except Exception as e:
        print(f"Request Failed: {e}")

# 1. Test Transfers
print("checking transfers...")
transfers = test_endpoint("Transfers Recommendations", f"{BASE_URL}/api/transfers/recommendations")

# 2. Test Stores (used in Transfers map)
print("checking stores...")
stores = test_endpoint("Stores", f"{BASE_URL}/stores")

# 3. Test Analytics
print("checking analytics...")
analytics = test_endpoint("Analytics Accuracy", f"{BASE_URL}/api/analysis/accuracy?store_id=1&product_id=1")
