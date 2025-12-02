from pymongo import MongoClient
import datetime

client = MongoClient('mongodb://127.0.0.1:27017/')
db = client['quickCommerceDB']

# Clear existing data
db.Products.delete_many({})
db.DarkStores.delete_many({})
db.Inventory.delete_many({})
db.Orders.delete_many({})
db.OrderItems.delete_many({})
db.Users.delete_many({})
db.StockMovements.delete_many({})

# Sample Data
products = [
    {"product_id": 1, "name": "Quantum Processor", "brand": "Nexus", "barcode": "123456789", "is_perishable": False, "unit_of_measure": "unit"},
    {"product_id": 2, "name": "Neural Interface", "brand": "CyberDyne", "barcode": "987654321", "is_perishable": False, "unit_of_measure": "unit"},
    {"product_id": 3, "name": "Bio-Fuel Cell", "brand": "EcoEnergy", "barcode": "456123789", "is_perishable": True, "unit_of_measure": "liter"}
]

dark_stores = [
    {"store_id": 1, "name": "Alpha Sector", "location": "Sector 7", "region": "North", "contact_info": "alpha@nexus.com"},
    {"store_id": 2, "name": "Beta Sector", "location": "Sector 3", "region": "South", "contact_info": "beta@nexus.com"}
]

inventory = [
    {"inventory_id": 1, "product_id": 1, "store_id": 1, "quantity_available": 50, "quantity_reserved": 5, "reorder_threshold": 10, "last_updated": datetime.datetime.now()},
    {"inventory_id": 2, "product_id": 2, "store_id": 1, "quantity_available": 30, "quantity_reserved": 2, "reorder_threshold": 5, "last_updated": datetime.datetime.now()},
    {"inventory_id": 3, "product_id": 3, "store_id": 2, "quantity_available": 100, "quantity_reserved": 0, "reorder_threshold": 20, "last_updated": datetime.datetime.now()}
]

users = [
    {"user_id": 1, "name": "Admin User", "role": "Admin", "store_id": 1, "login_credentials": "admin_pass_hash"},
    {"user_id": 2, "name": "Store Manager", "role": "Manager", "store_id": 2, "login_credentials": "manager_pass_hash"}
]

orders = [
    {"order_id": 1, "customer_id": 101, "store_id": 1, "order_timestamp": datetime.datetime.now(), "status": "Pending", "delivery_slot": "Morning"},
    {"order_id": 2, "customer_id": 102, "store_id": 2, "order_timestamp": datetime.datetime.now(), "status": "Delivered", "delivery_slot": "Evening"}
]

order_items = [
    {"order_item_id": 1, "order_id": 1, "product_id": 1, "quantity": 1, "unit_price": 500.00, "discount": 0.0},
    {"order_item_id": 2, "order_id": 2, "product_id": 3, "quantity": 5, "unit_price": 20.00, "discount": 5.0}
]

stock_movements = [
    {"movement_id": 1, "product_id": 1, "store_id": 1, "type": "Inbound", "quantity": 50, "timestamp": datetime.datetime.now(), "reference": "PO-001"}
]

# Insert Data
db.Products.insert_many(products)
db.DarkStores.insert_many(dark_stores)
db.Inventory.insert_many(inventory)
db.Users.insert_many(users)
db.Orders.insert_many(orders)
db.OrderItems.insert_many(order_items)
db.StockMovements.insert_many(stock_movements)

print("Database seeded successfully!")
