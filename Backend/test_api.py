import requests
import json

BASE_URL = "http://127.0.0.1:5000"

collections = [
    {"name": "Products", "key": "product_id"},
    {"name": "DarkStores", "key": "store_id"},
    {"name": "Users", "key": "user_id"},
    {"name": "Inventory", "key": "inventory_id"},
    {"name": "StockMovements", "key": "movement_id"},
    {"name": "Orders", "key": "order_id"},
    {"name": "OrderItems", "key": "order_item_id"},
]

def test_collection(collection):
    name = collection["name"]
    key = collection["key"]

    print(f"\nTesting collection: {name}")

    # Sample test data for POST
    test_data = {
        key: 1,
        "name": f"Test {name} Item",
        "extra_field": "test_value"
    }

    # Add document (POST)
    r = requests.post(f"{BASE_URL}/add-{name}", json=test_data)
    print("POST add:", r.status_code, r.json())

    # Get all documents (GET)
    r = requests.get(f"{BASE_URL}/get-{name}")
    print("GET all:", r.status_code, r.json())

    # Update document (PUT)
    update_data = {"extra_field": "updated_value"}
    r = requests.put(f"{BASE_URL}/update-{name}/1", json=update_data)
    print("PUT update:", r.status_code, r.json())

    # Delete document (DELETE)
    r = requests.delete(f"{BASE_URL}/delete-{name}/1")
    print("DELETE:", r.status_code, r.json())

if __name__ == "__main__":
    for col in collections:
        test_collection(col)