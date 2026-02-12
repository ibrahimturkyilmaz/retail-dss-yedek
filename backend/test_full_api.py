import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8001"

log_file = open("api_test_report.txt", "w", encoding="utf-8")

def log(msg):
    print(msg)
    log_file.write(msg + "\n")
    log_file.flush()


def test_get(name, path, params=None):
    url = f"{BASE_URL}{path}"
    try:
        response = requests.get(url, params=params, timeout=5)
        if response.status_code == 200:
            log(f"✅ [GET] {name:<30} | {path:<40} | OK")
            return True
        else:
            log(f"❌ [GET] {name:<30} | {path:<40} | FAIL ({response.status_code})")
            if response.text:
                log(f"   Error: {response.text[:100]}")
            return False
    except Exception as e:
        log(f"🔥 [GET] {name:<30} | {path:<40} | ERROR: {str(e)}")
        return False

def test_post(name, path, payload):
    url = f"{BASE_URL}{path}"
    try:
        response = requests.post(url, json=payload, timeout=5)
        if response.status_code == 200:
            log(f"✅ [POST] {name:<29} | {path:<40} | OK")
            return True
        else:
            log(f"❌ [POST] {name:<29} | {path:<40} | FAIL ({response.status_code})")
            if response.text:
                log(f"   Error: {response.text[:100]}")
            return False
    except Exception as e:
        log(f"🔥 [POST] {name:<29} | {path:<40} | ERROR: {str(e)}")
        return False

def main():
    log("="*100)
    log(f"SYSTEM-WIDE API VERIFICATION - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log(f"Target: {BASE_URL}")
    log("="*100)


    results = []

    # 1. CORE ENDPOINTS
    results.append(test_get("Root", "/"))
    results.append(test_get("Stores List", "/stores"))
    results.append(test_get("Sales List", "/api/sales"))
    results.append(test_get("Products List", "/api/products"))
    results.append(test_get("Store Inventory (ID: 1)", "/api/stores/1/inventory"))
    
    # 2. ANALYSIS & FORECASTS
    results.append(test_get("Analytics Summary", "/api/sales/analytics"))
    results.append(test_get("Forecasts", "/api/forecast", params={"store_id": 1}))

    results.append(test_get("Forecast Accuracy", "/api/analysis/accuracy", params={"store_id": 1, "product_id": 1}))
    results.append(test_get("Cold Start Analysis", "/api/analysis/cold-start", params={"product_id": 1}))

    # 3. DASHBOARD & TRANSFERS
    results.append(test_get("Dashboard Insights", "/api/dashboard/insights"))
    results.append(test_get("Transfer Recommendations", "/api/transfers/recommendations"))

    # 4. SIMULATIONS (POST Requests)
    # Note: These modify the DB state but are safe for verification if DB is meant for simulation.
    results.append(test_post("Simulate: Sales Boom", "/api/simulate/sales-boom", {}))
    results.append(test_post("Simulate: Recession", "/api/simulate/recession", {}))
    results.append(test_post("Simulate: Supply Shock", "/api/simulate/supply-shock", {}))
    results.append(test_post("Simulate: Reset", "/api/simulate/reset", {}))

    # 5. PRODUCT LAUNCH
    launch_payload = {
        "name": f"Verification Product {datetime.now().microsecond}",
        "category": "Electronics",
        "price": 299.99,
        "cost": 150.0,
        "reference_product_id": 1

    }
    results.append(test_post("Product Launch", "/api/products/launch", launch_payload))

    print("="*100)
    success_count = sum(1 for r in results if r)
    total_count = len(results)
    print(f"SUMMARY: {success_count}/{total_count} passed.")
    print("="*100)

if __name__ == "__main__":
    main()
