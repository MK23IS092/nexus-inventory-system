// infra/mongo/init-mongo.js
// Initializes quickCommerceDB and seeds sample documents.
// This script is safe to run on first container startup (Docker will only run it when DB is empty).

db = db.getSiblingDB('quickCommerceDB');

// PRODUCTS
db.Products.insertMany([
  { product_id: 1, name: 'Sample T-Shirt', sku: 'TSH-001', price: 19.99, stock: 100 },
  { product_id: 2, name: 'Sample Mug', sku: 'MUG-001', price: 9.99, stock: 50 }
]);

// USERS
db.Users.insertMany([
  { user_id: 1, name: 'Alice', email: 'alice@example.com' },
  { user_id: 2, name: 'Bob', email: 'bob@example.com' }
]);

// DARK STORES
db.DarkStores.insertMany([
  { store_id: 1, name: 'Central DS', location: 'City Center' }
]);

// INVENTORY
db.Inventory.insertMany([
  { inventory_id: 1, product_id: 1, store_id: 1, quantity: 100 }
]);

// ORDERS & ITEMS (example)
db.Orders.insertOne({ order_id: 1, user_id: 1, total: 29.98, status: 'placed' });
db.OrderItems.insertMany([
  { order_item_id: 1, order_id: 1, product_id: 1, quantity: 1, price: 19.99 },
  { order_item_id: 2, order_id: 1, product_id: 2, quantity: 1, price: 9.99 }
]);

print('quickCommerceDB seeded');
