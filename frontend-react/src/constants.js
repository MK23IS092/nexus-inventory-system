export const TABLES = [
    {
        name: 'Products',
        attributes: [
            { name: 'product_id', type: 'int', isPrimary: true },
            { name: 'name', type: 'varchar' },
            { name: 'brand', type: 'varchar' },
            { name: 'barcode', type: 'varchar' },
            { name: 'is_perishable', type: 'boolean' },
            { name: 'unit_of_measure', type: 'varchar' }
        ]
    },
    {
        name: 'DarkStores',
        attributes: [
            { name: 'store_id', type: 'int', isPrimary: true },
            { name: 'name', type: 'varchar' },
            { name: 'location', type: 'varchar' },
            { name: 'region', type: 'varchar' },
            { name: 'contact_info', type: 'varchar' }
        ]
    },
    {
        name: 'Inventory',
        attributes: [
            { name: 'inventory_id', type: 'int', isPrimary: true },
            { name: 'product_id', type: 'int', isForeign: true, references: 'Products' },
            { name: 'store_id', type: 'int', isForeign: true, references: 'DarkStores' },
            { name: 'quantity_available', type: 'int' },
            { name: 'quantity_reserved', type: 'int' },
            { name: 'reorder_threshold', type: 'int' },
            { name: 'last_updated', type: 'datetime' }
        ]
    },
    {
        name: 'Orders',
        attributes: [
            { name: 'order_id', type: 'int', isPrimary: true },
            { name: 'customer_id', type: 'int' },
            { name: 'store_id', type: 'int', isForeign: true, references: 'DarkStores' },
            { name: 'order_timestamp', type: 'datetime' },
            { name: 'status', type: 'varchar' },
            { name: 'delivery_slot', type: 'varchar' }
        ]
    },
    {
        name: 'OrderItems',
        attributes: [
            { name: 'order_item_id', type: 'int', isPrimary: true },
            { name: 'order_id', type: 'int', isForeign: true, references: 'Orders' },
            { name: 'product_id', type: 'int', isForeign: true, references: 'Products' },
            { name: 'quantity', type: 'int' },
            { name: 'unit_price', type: 'decimal' },
            { name: 'discount', type: 'decimal' }
        ]
    },
    {
        name: 'Users',
        attributes: [
            { name: 'user_id', type: 'int', isPrimary: true },
            { name: 'name', type: 'varchar' },
            { name: 'role', type: 'varchar' },
            { name: 'store_id', type: 'int', isForeign: true, references: 'DarkStores' },
            { name: 'login_credentials', type: 'varchar' }
        ]
    },
    {
        name: 'StockMovements',
        attributes: [
            { name: 'movement_id', type: 'int', isPrimary: true },
            { name: 'product_id', type: 'int', isForeign: true, references: 'Products' },
            { name: 'store_id', type: 'int', isForeign: true, references: 'DarkStores' },
            { name: 'type', type: 'varchar' },
            { name: 'quantity', type: 'int' },
            { name: 'timestamp', type: 'datetime' },
            { name: 'reference', type: 'varchar' }
        ]
    }
];
