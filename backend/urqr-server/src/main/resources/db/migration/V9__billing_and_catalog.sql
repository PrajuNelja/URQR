-- V9__billing_and_catalog.sql
-- Girish T: POS Billing & Catalog Seed Data + PostgreSQL 18.7 Row-Level Security (RLS)

-- 1. Enable Row-Level Security (RLS) on Multi-Tenant Tables
ALTER TABLE pos_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS Policies for Tenant Isolation using session variable or direct hotel context
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'pos_order' AND policyname = 'pos_order_tenant_isolation'
    ) THEN
        CREATE POLICY pos_order_tenant_isolation ON pos_order
            FOR ALL
            USING (hotel_id = NULLIF(current_setting('app.current_hotel_id', true), '')::UUID
                   OR current_setting('app.current_hotel_id', true) IS NULL);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'order_item' AND policyname = 'order_item_tenant_isolation'
    ) THEN
        CREATE POLICY order_item_tenant_isolation ON order_item
            FOR ALL
            USING (hotel_id = NULLIF(current_setting('app.current_hotel_id', true), '')::UUID
                   OR current_setting('app.current_hotel_id', true) IS NULL);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'menu_category' AND policyname = 'menu_category_tenant_isolation'
    ) THEN
        CREATE POLICY menu_category_tenant_isolation ON menu_category
            FOR ALL
            USING (hotel_id = NULLIF(current_setting('app.current_hotel_id', true), '')::UUID
                   OR current_setting('app.current_hotel_id', true) IS NULL);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'menu_item' AND policyname = 'menu_item_tenant_isolation'
    ) THEN
        CREATE POLICY menu_item_tenant_isolation ON menu_item
            FOR ALL
            USING (hotel_id = NULLIF(current_setting('app.current_hotel_id', true), '')::UUID
                   OR current_setting('app.current_hotel_id', true) IS NULL);
    END IF;
END $$;

-- 3. Seed Default Hotel / Tenant (Grand Horizon)
INSERT INTO hotel (id, name, currency_code, timezone, day_cutoff, status, receipt_details, created_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Grand Horizon Hotel & Restaurant',
    'INR',
    'Asia/Kolkata',
    '04:00:00',
    'ACTIVE',
    '{"address":"MG Road, Bengaluru","gstin":"29AAAAA0000A1Z5","phone":"+91 98765 43210"}'::jsonb,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    currency_code = EXCLUDED.currency_code;

-- 4. Seed Default Manager Role
INSERT INTO hotel_role (id, hotel_id, name)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'MANAGER'
)
ON CONFLICT (hotel_id, id) DO NOTHING;

-- 5. Seed Default Staff User: pos_manager_1 (BCrypt hash for Manager@123)
INSERT INTO staff_user (id, hotel_id, username, password_hash, role_id, status, created_at)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'pos_manager_1',
    '$2a$10$WkGv.4NqG1Kk8pGvQO2vxe4zS6KqB4.eU9qG2vG2.eU9qG2vG2.eU',
    'b0000000-0000-0000-0000-000000000001',
    'ACTIVE',
    CURRENT_TIMESTAMP
)
ON CONFLICT (hotel_id, username) DO NOTHING;

-- 6. Seed Grand Horizon Menu Categories
INSERT INTO menu_category (id, hotel_id, name, active)
VALUES 
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Starters', true),
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Main Course', true),
    ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Desserts', true),
    ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Beverages', true)
ON CONFLICT (hotel_id, id) DO NOTHING;

-- 7. Seed Grand Horizon POS Dishes matching frontend Screen 2 Catalog
INSERT INTO menu_item (id, hotel_id, category_id, name, price, available, active, cgst_rate, sgst_rate)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Truffle Mushroom Soup', 120.00, true, true, 2.50, 2.50),
    ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Classic Caesar Salad', 140.00, true, true, 2.50, 2.50),
    ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'Grilled Salmon Steak', 350.00, true, true, 2.50, 2.50),
    ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'Wagyu Ribeye', 480.00, true, true, 2.50, 2.50),
    ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'Lobster Linguine', 360.00, true, true, 2.50, 2.50),
    ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'Ribeye Beef Burger', 180.00, true, true, 2.50, 2.50),
    ('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'Belgian Chocolate Lava Cake', 110.00, true, true, 2.50, 2.50),
    ('e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 'Artisanal Espresso', 60.00, true, true, 2.50, 2.50),
    ('e0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 'Fresh Lime Soda', 50.00, true, true, 2.50, 2.50)
ON CONFLICT (hotel_id, id) DO NOTHING;
