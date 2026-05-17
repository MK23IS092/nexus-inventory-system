from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables from .env

from config import MONGO_URI, SECRET_KEY

app = Flask(__name__)
app.config.setdefault("SECRET_KEY", SECRET_KEY)
CORS(app)

# MongoDB connection
client = MongoClient(MONGO_URI)
db = client.get_database() if MONGO_URI else client["quickCommerceDB"]

@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "Welcome to QuickCommerce API!"})

# New route to get all tables and their content
@app.route('/all-tables', methods=['GET'])
def get_all_tables():
    collections = [
        "Products", 
        "DarkStores", 
        "Users", 
        "Inventory", 
        "StockMovements", 
        "Orders", 
        "OrderItems"
    ]
    
    all_data = {}
    
    for collection_name in collections:
        # Get all documents from the collection, excluding MongoDB's _id field
        items = list(db[collection_name].find({}, {'_id': 0}))
        all_data[collection_name] = items
    
    return jsonify(all_data)

# -------------------- Utility --------------------
def create_routes(name, key_field):
    # Add document
    @app.route(f'/add-{name}', methods=['POST'], endpoint=f'add_{name}')
    def add():
        data = request.get_json() or {}
        if not data.get(key_field):
            return jsonify({"error": f"{key_field} is required"}), 400
        db[name].insert_one(data)
        return jsonify({"message": f"{name} added successfully!"}), 201

    # Get all documents
    @app.route(f'/get-{name}', methods=['GET'], endpoint=f'get_all_{name}')
    def get_all():
        items = list(db[name].find({}, {'_id': 0}))
        return jsonify(items)

    # Update by key
    @app.route(f'/update-{name}/<key_value>', methods=['PUT'], endpoint=f'update_{name}')
    def update(key_value):
        data = request.get_json() or {}
        try:
            parsed_key = int(key_value)
        except ValueError:
            parsed_key = key_value
        result = db[name].update_one({key_field: parsed_key}, {'$set': data})
        if result.matched_count == 0:
            return jsonify({"error": f"{name} not found"}), 404
        return jsonify({"message": f"{name} updated successfully!"})
    

    # Delete by key
    @app.route(f'/delete-{name}/<key_value>', methods=['DELETE'], endpoint=f'delete_{name}')
    def delete(key_value):
        try:
            parsed_key = int(key_value)
        except ValueError:
            parsed_key = key_value
        result = db[name].delete_one({key_field: parsed_key})
        if result.deleted_count == 0:
            return jsonify({"error": f"{name} not found"}), 404
        return jsonify({"message": f"{name} deleted successfully!"})
# Unified update endpoint to modify specific attributes in a given table
@app.route('/update-row', methods=['PUT'])
def update_row():
    data = request.get_json()

    table_name = data.get('table_name')
    key = data.get('key')
    attribute_list = data.get('attribute_list')

    if not all([table_name, key, attribute_list]):
        return jsonify({"error": "Missing one or more required fields: table_name, key, attribute_list"}), 400

    if not isinstance(attribute_list, (dict, list)):
        return jsonify({"error": "attribute_list must be a dictionary or list"}), 400

    # Normalize to dict if attribute_list is given as list of key-value pairs
    if isinstance(attribute_list, list):
        try:
            attribute_list = dict(attribute_list)
        except Exception:
            return jsonify({"error": "Invalid attribute_list format"}), 400

    # Identify key field for the specified table
    key_field_map = {
        "Products": "product_id",
        "DarkStores": "store_id",
        "Users": "user_id",
        "Inventory": "inventory_id",
        "StockMovements": "movement_id",
        "Orders": "order_id",
        "OrderItems": "order_item_id"
    }

    key_field = key_field_map.get(table_name)
    if not key_field:
        return jsonify({"error": f"Invalid table name: {table_name}"}), 404

    # Convert key to int if needed
    try:
        key = int(key)
    except ValueError:
        pass

    result = db[table_name].update_one(
        {key_field: key},
        {"$set": attribute_list}
    )

    if result.matched_count == 0:
        return jsonify({"error": f"No record found in {table_name} with {key_field} = {key}"}), 404

    return jsonify({
        "message": f"{table_name} updated successfully.",
        "matched_count": result.matched_count,
        "modified_count": result.modified_count
    }), 200

# -------------------- Routes for Each Collection --------------------

create_routes("Products", "product_id")
create_routes("DarkStores", "store_id")
create_routes("Users", "user_id")
create_routes("Inventory", "inventory_id")
create_routes("StockMovements", "movement_id")
create_routes("Orders", "order_id")
create_routes("OrderItems", "order_item_id")

# -------------------- Run the App --------------------

if __name__ == "__main__":
    import sys
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', os.getenv('FLASK_RUN_PORT', '5000')))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() in ('1', 'true', 'yes')

    try:
        app.run(host=host, port=port, debug=debug)
    except Exception as e:
        # Print error to stderr so CI logs capture it
        print("Backend failed to start:", e, file=sys.stderr)
        raise