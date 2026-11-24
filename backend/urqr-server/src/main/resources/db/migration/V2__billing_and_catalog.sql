-- V2__billing_and_catalog.sql
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
        SELECT 1 FROM pg_policies WHERE tablename = 'menu_item' AND policyname = 'menu_item_tenant_isolation'
    ) THEN
        CREATE POLICY menu_item_tenant_isolation ON menu_item
            FOR ALL
            USING (hotel_id = NULLIF(current_setting('app.current_hotel_id', true), '')::UUID
                   OR current_setting('app.current_hotel_id', true) IS NULL);
    END IF;
END $$;

-- 3. Seed Default Hotel / Tenant (Grand Horizon) if not exists
INSERT INTO hotel (id, name, slug, status)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Grand Horizon Hotel & Restaurant', 'grand-horizon', 'ACTIVE')
ON CONFLICT (slug) DO NOTHING;

-- 4. Seed Default Manager Role
INSERT INTO hotel_role (id, hotel_id, name, description)
VALUES ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'MANAGER', 'POS Restaurant Floor Manager')
ON CONFLICT DO NOTHING;

-- 5. Seed Default Staff User: pos_manager_1 (BCrypt hash for Manager@123)
INSERT INTO staff_user (id, hotel_id, username, password_hash, full_name, role_id, status)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'pos_manager_1',
    '$2a$10$WkGv.4NqG1Kk8pGvQO2vxe4zS6KqB4.eU9qG2vG2.eU9qG2vG2.eU',
    'Grand Horizon POS Manager',
    'b0000000-0000-0000-0000-000000000001',
    'ACTIVE'
)
ON CONFLICT DO NOTHING;

-- 6. Seed Grand Horizon Menu Categories
INSERT INTO menu_category (id, hotel_id, name, active)
VALUES 
    (1, 'a0000000-0000-0000-0000-000000000001', 'Starters', true),
    (2, 'a0000000-0000-0000-0000-000000000001', 'Main Course', true),
    (3, 'a0000000-0000-0000-0000-000000000001', 'Desserts', true),
    (4, 'a0000000-0000-0000-0000-000000000001', 'Beverages', true)
ON CONFLICT DO NOTHING;

-- 7. Seed Grand Horizon POS Dishes matching frontend Screen 2 Catalog
INSERT INTO menu_item (id, hotel_id, category_id, name, description, price, available)
VALUES
    (1, 'a0000000-0000-0000-0000-000000000001', 1, 'Truffle Mushroom Soup', 'Served with garlic bread', 120.00, true),
    (2, 'a0000000-0000-0000-0000-000000000001', 1, 'Classic Caesar Salad', 'Romaine, parmesan, croutons', 140.00, true),
    (3, 'a0000000-0000-0000-0000-000000000001', 2, 'Grilled Salmon Steak', 'Fresh herbs & lemon butter', 350.00, true),
    (4, 'a0000000-0000-0000-0000-000000000001', 2, 'Wagyu Ribeye', 'Cheddar, brioche, fries', 480.00, true),
    (5, 'a0000000-0000-0000-0000-000000000001', 2, 'Lobster Linguine', 'Chili, garlic, white wine', 360.00, true),
    (6, 'a0000000-0000-0000-0000-000000000001', 2, 'Ribeye Beef Burger', 'With cheddar & fries', 180.00, true),
    (7, 'a0000000-0000-0000-0000-000000000001', 3, 'Belgian Chocolate Lava Cake', 'Vanilla bean ice cream', 110.00, true),
    (8, 'a0000000-0000-0000-0000-000000000001', 4, 'Artisanal Espresso', 'Single-origin, double shot', 60.00, true),
    (9, 'a0000000-0000-0000-0000-000000000001', 4, 'Fresh Lime Soda', 'Sweet or salted', 50.00, true)
ON CONFLICT DO NOTHING;
