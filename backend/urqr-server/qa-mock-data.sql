-- QA / frontend mock catalog dataset. Manual, local-development use only.
-- This file is not under db/migration and is never run automatically.
-- Adds 50 rows: 5 hotels, 15 categories, and 30 menu items.
-- Re-running it leaves existing hotel/category/item rows untouched.
--
-- Run from backend/urqr-server in PowerShell after starting the postgres service:
-- Get-Content -Raw .\qa-mock-data.sql | docker compose --env-file .env -f docker-compose.yaml exec -T postgres psql -U urqr -d urqr -v ON_ERROR_STOP=1 -f -
--
-- Seed hotel IDs (NAME3 + COUNTRY2 + STATE + sequence, no separators):
-- AURINMH0001 Aurora Bay Hotel       BLUINKA0001 Blue Palm Resort
-- CEDINTN0001 Cedar Grove Inn        DAWINDL0001 Dawn View Suites
-- ELMUSCA0001 Elmwood Grand Hotel
--
-- Hotel listing: GET /api/v1/platform/hotels (PLATFORM_ADMIN token).
-- Hotel detail/settings: GET/PATCH /api/v1/hotel (hotel-scoped MANAGER/CASHIER token).
-- For catalog calls, create a manager through POST /api/v1/platform/hotels/{hotelId}/users,
-- then log in via POST /api/v1/auth/login. The resulting JWT must belong to the seeded hotel.
-- Categories: /api/v1/menu/categories and /api/v1/menu/categories/{id}[/status].
-- Items: /api/v1/menu/items, /api/v1/menu/items/all, /api/v1/menu/items/{id}[/availability].
-- IDs below are fixed so QA and frontend can refer to the same seeded records.
-- Status cases: item ...0006 is active but unavailable; item ...0012 is inactive;
-- category ...0015 is inactive and item ...0030 belongs to it.

BEGIN;
SET LOCAL app.platform_admin = 'true';

INSERT INTO hotel (
    id, name, currency_code, timezone, day_cutoff, status, receipt_details, created_at
)
VALUES
    ('AURINMH0001', 'Aurora Bay Hotel', 'INR', 'Asia/Kolkata', '04:00:00', 'ACTIVE',
     '{"address":"1 Marine Drive, Mumbai","phone":"+91-90000-00001","taxId":"27AUROR0001A1Z1"}'::jsonb, CURRENT_TIMESTAMP),
    ('BLUINKA0001', 'Blue Palm Resort', 'INR', 'Asia/Kolkata', '04:00:00', 'ACTIVE',
     '{"address":"12 Palm Grove Road, Bengaluru","phone":"+91-90000-00002","taxId":"29BLUEP0001A1Z2"}'::jsonb, CURRENT_TIMESTAMP),
    ('CEDINTN0001', 'Cedar Grove Inn', 'INR', 'Asia/Kolkata', '04:00:00', 'ACTIVE',
     '{"address":"8 Garden Street, Chennai","phone":"+91-90000-00003","taxId":"33CEDAR0001A1Z3"}'::jsonb, CURRENT_TIMESTAMP),
    ('DAWINDL0001', 'Dawn View Suites', 'INR', 'Asia/Kolkata', '04:00:00', 'ACTIVE',
     '{"address":"21 Connaught Place, New Delhi","phone":"+91-90000-00004","taxId":"07DAWN0001A1Z4"}'::jsonb, CURRENT_TIMESTAMP),
    ('ELMUSCA0001', 'Elmwood Grand Hotel', 'USD', 'America/Los_Angeles', '04:00:00', 'ACTIVE',
     '{"address":"500 Market Street, San Francisco","phone":"+1-415-555-0105","taxId":"QA-ELM-0005"}'::jsonb, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Keep each generator counter at or above the sequence encoded in the seeded ID.
INSERT INTO hotel_id_sequence (name_prefix, country_code, state_code, last_value)
VALUES
    ('AUR', 'IN', 'MH', 1),
    ('BLU', 'IN', 'KA', 1),
    ('CED', 'IN', 'TN', 1),
    ('DAW', 'IN', 'DL', 1),
    ('ELM', 'US', 'CA', 1)
ON CONFLICT (name_prefix, country_code, state_code)
DO UPDATE SET last_value = GREATEST(hotel_id_sequence.last_value, EXCLUDED.last_value);

INSERT INTO menu_category (id, hotel_id, name, active)
VALUES
    ('d1000000-0000-4000-8000-000000000001', 'AURINMH0001', 'Breakfast', TRUE),
    ('d1000000-0000-4000-8000-000000000002', 'AURINMH0001', 'Main Course', TRUE),
    ('d1000000-0000-4000-8000-000000000003', 'AURINMH0001', 'Beverages', TRUE),
    ('d1000000-0000-4000-8000-000000000004', 'BLUINKA0001', 'Breakfast', TRUE),
    ('d1000000-0000-4000-8000-000000000005', 'BLUINKA0001', 'Main Course', TRUE),
    ('d1000000-0000-4000-8000-000000000006', 'BLUINKA0001', 'Beverages', TRUE),
    ('d1000000-0000-4000-8000-000000000007', 'CEDINTN0001', 'Breakfast', TRUE),
    ('d1000000-0000-4000-8000-000000000008', 'CEDINTN0001', 'Main Course', TRUE),
    ('d1000000-0000-4000-8000-000000000009', 'CEDINTN0001', 'Beverages', TRUE),
    ('d1000000-0000-4000-8000-000000000010', 'DAWINDL0001', 'Breakfast', TRUE),
    ('d1000000-0000-4000-8000-000000000011', 'DAWINDL0001', 'Main Course', TRUE),
    ('d1000000-0000-4000-8000-000000000012', 'DAWINDL0001', 'Beverages', TRUE),
    ('d1000000-0000-4000-8000-000000000013', 'ELMUSCA0001', 'Breakfast', TRUE),
    ('d1000000-0000-4000-8000-000000000014', 'ELMUSCA0001', 'Main Course', TRUE),
    ('d1000000-0000-4000-8000-000000000015', 'ELMUSCA0001', 'Beverages', FALSE)
ON CONFLICT DO NOTHING;

INSERT INTO menu_item (
    id, hotel_id, category_id, name, price, available, active,
    cgst_rate, sgst_rate, vat_rate, discount_percent
)
VALUES
    ('e1000000-0000-4000-8000-000000000001', 'AURINMH0001', 'd1000000-0000-4000-8000-000000000001', 'Masala Idli', 75.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000002', 'AURINMH0001', 'd1000000-0000-4000-8000-000000000001', 'South Indian Platter', 180.00, TRUE, TRUE, 2.50, 2.50, 0.00, 5.00),
    ('e1000000-0000-4000-8000-000000000003', 'AURINMH0001', 'd1000000-0000-4000-8000-000000000002', 'Paneer Tikka', 240.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000004', 'AURINMH0001', 'd1000000-0000-4000-8000-000000000002', 'Vegetable Biryani', 210.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000005', 'AURINMH0001', 'd1000000-0000-4000-8000-000000000003', 'Filter Coffee', 55.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000006', 'AURINMH0001', 'd1000000-0000-4000-8000-000000000003', 'Mango Lassi', 90.00, FALSE, TRUE, 2.50, 2.50, 0.00, 0.00),

    ('e1000000-0000-4000-8000-000000000007', 'BLUINKA0001', 'd1000000-0000-4000-8000-000000000004', 'Coconut Pancakes', 160.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000008', 'BLUINKA0001', 'd1000000-0000-4000-8000-000000000004', 'Tropical Fruit Bowl', 140.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000009', 'BLUINKA0001', 'd1000000-0000-4000-8000-000000000005', 'Grilled Catch of the Day', 420.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000010', 'BLUINKA0001', 'd1000000-0000-4000-8000-000000000005', 'Coconut Curry', 360.00, TRUE, TRUE, 2.50, 2.50, 0.00, 10.00),
    ('e1000000-0000-4000-8000-000000000011', 'BLUINKA0001', 'd1000000-0000-4000-8000-000000000006', 'Pineapple Cooler', 110.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000012', 'BLUINKA0001', 'd1000000-0000-4000-8000-000000000006', 'Mint Lime Soda', 95.00, FALSE, FALSE, 2.50, 2.50, 0.00, 0.00),

    ('e1000000-0000-4000-8000-000000000013', 'CEDINTN0001', 'd1000000-0000-4000-8000-000000000007', 'Buttermilk Pancakes', 175.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000014', 'CEDINTN0001', 'd1000000-0000-4000-8000-000000000007', 'Avocado Toast', 190.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000015', 'CEDINTN0001', 'd1000000-0000-4000-8000-000000000008', 'Wild Mushroom Pasta', 330.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000016', 'CEDINTN0001', 'd1000000-0000-4000-8000-000000000008', 'Roasted Chicken', 390.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000017', 'CEDINTN0001', 'd1000000-0000-4000-8000-000000000009', 'Berry Smoothie', 150.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000018', 'CEDINTN0001', 'd1000000-0000-4000-8000-000000000009', 'Americano', 90.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),

    ('e1000000-0000-4000-8000-000000000019', 'DAWINDL0001', 'd1000000-0000-4000-8000-000000000010', 'Aloo Paratha', 110.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000020', 'DAWINDL0001', 'd1000000-0000-4000-8000-000000000010', 'Chole Kulche', 150.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000021', 'DAWINDL0001', 'd1000000-0000-4000-8000-000000000011', 'Paneer Butter Masala', 270.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000022', 'DAWINDL0001', 'd1000000-0000-4000-8000-000000000011', 'Dal Tadka', 220.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000023', 'DAWINDL0001', 'd1000000-0000-4000-8000-000000000012', 'Masala Chai', 45.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000024', 'DAWINDL0001', 'd1000000-0000-4000-8000-000000000012', 'Sweet Lassi', 80.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),

    ('e1000000-0000-4000-8000-000000000025', 'ELMUSCA0001', 'd1000000-0000-4000-8000-000000000013', 'Blueberry Waffles', 14.50, TRUE, TRUE, 0.00, 0.00, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000026', 'ELMUSCA0001', 'd1000000-0000-4000-8000-000000000013', 'Granola Breakfast Bowl', 12.00, TRUE, TRUE, 0.00, 0.00, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000027', 'ELMUSCA0001', 'd1000000-0000-4000-8000-000000000014', 'Classic Cheeseburger', 18.75, TRUE, TRUE, 0.00, 0.00, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000028', 'ELMUSCA0001', 'd1000000-0000-4000-8000-000000000014', 'Mushroom Risotto', 21.50, TRUE, TRUE, 0.00, 0.00, 0.00, 5.00),
    ('e1000000-0000-4000-8000-000000000029', 'ELMUSCA0001', 'd1000000-0000-4000-8000-000000000015', 'Cold Brew Coffee', 5.50, TRUE, TRUE, 0.00, 0.00, 0.00, 0.00),
    ('e1000000-0000-4000-8000-000000000030', 'ELMUSCA0001', 'd1000000-0000-4000-8000-000000000015', 'Vanilla Milkshake', 7.25, TRUE, TRUE, 0.00, 0.00, 0.00, 0.00)
ON CONFLICT DO NOTHING;

SELECT 'hotels' AS dataset, COUNT(*) AS rows_found
FROM hotel WHERE id IN ('AURINMH0001', 'BLUINKA0001', 'CEDINTN0001', 'DAWINDL0001', 'ELMUSCA0001')
UNION ALL
SELECT 'categories', COUNT(*)
FROM menu_category WHERE hotel_id IN ('AURINMH0001', 'BLUINKA0001', 'CEDINTN0001', 'DAWINDL0001', 'ELMUSCA0001')
UNION ALL
SELECT 'menu_items', COUNT(*)
FROM menu_item WHERE hotel_id IN ('AURINMH0001', 'BLUINKA0001', 'CEDINTN0001', 'DAWINDL0001', 'ELMUSCA0001');

COMMIT;
