-- QA / frontend mock catalog dataset. Manual, local-development use only.
-- This file is not under db/migration and is never run automatically.
-- Adds 140 rows: 5 hotels, 5 manager roles, 5 manager accounts, 15 categories,
-- 30 menu items, 20 orders, 40 order lines, 15 payments, and 5 receipts.
-- Re-running it does not overwrite existing records.
--
-- Run from backend/urqr-server in PowerShell after the backend has started
-- successfully once (so Flyway has applied the schema) and Postgres is running:
-- Get-Content -Raw .\qa-mock-data.sql | docker compose --env-file .env -f docker-compose.yaml exec -T postgres psql -U urqr -d urqr -v ON_ERROR_STOP=1 -f -
--
-- Seed hotel IDs (NAME3 + COUNTRY2 + STATE + sequence, no separators):
-- AURINMH0001 Aurora Bay Hotel       BLUINKA0001 Blue Palm Resort
-- CEDINTN0001 Cedar Grove Inn        DAWINDL0001 Dawn View Suites
-- ELMUSCA0001 Elmwood Grand Hotel
--
-- Demo manager credentials (development only; all accounts share this password):
-- qa.aurora@mock.test     QaMock2026!Pass  -> AURINMH0001
-- qa.bluepalm@mock.test   QaMock2026!Pass  -> BLUINKA0001
-- qa.cedargrove@mock.test QaMock2026!Pass  -> CEDINTN0001
-- qa.dawnview@mock.test   QaMock2026!Pass  -> DAWINDL0001
-- qa.elmwood@mock.test    QaMock2026!Pass  -> ELMUSCA0001
-- Login: POST /api/v1/auth/login with {"username":"qa.aurora@mock.test","password":"QaMock2026!Pass"}.
-- The returned accessToken scopes hotel/catalog/order calls to that hotel's ID.
--
-- Hotel listing: GET /api/v1/platform/hotels (PLATFORM_ADMIN token).
-- Hotel detail/settings: GET/PATCH /api/v1/hotel (hotel-scoped MANAGER/CASHIER token).
-- Manager accounts are already included below. Log in via POST /api/v1/auth/login;
-- use the matching hotel account to get a hotel-scoped token for API calls.
-- This SQL inserts rows directly; it does not call API handlers or create audit/outbox events.
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

INSERT INTO hotel_role (id, hotel_id, name)
VALUES
    ('b1000000-0000-4000-8000-000000000001', 'AURINMH0001', 'MANAGER'),
    ('b1000000-0000-4000-8000-000000000002', 'BLUINKA0001', 'MANAGER'),
    ('b1000000-0000-4000-8000-000000000003', 'CEDINTN0001', 'MANAGER'),
    ('b1000000-0000-4000-8000-000000000004', 'DAWINDL0001', 'MANAGER'),
    ('b1000000-0000-4000-8000-000000000005', 'ELMUSCA0001', 'MANAGER')
ON CONFLICT DO NOTHING;

-- BCrypt hash for the shared local-only password documented above.
INSERT INTO staff_user (id, hotel_id, username, password_hash, role_id, status, created_at)
VALUES
    ('MGRAUR01', 'AURINMH0001', 'qa.aurora@mock.test', '$2a$10$9Qe98NWcfK//us5g9yq.JOfJKyvk4zxyE9QZGs7Zh5Ylk2S9CAn1y', 'b1000000-0000-4000-8000-000000000001', 'ACTIVE', CURRENT_TIMESTAMP),
    ('MGRBLU01', 'BLUINKA0001', 'qa.bluepalm@mock.test', '$2a$10$9Qe98NWcfK//us5g9yq.JOfJKyvk4zxyE9QZGs7Zh5Ylk2S9CAn1y', 'b1000000-0000-4000-8000-000000000002', 'ACTIVE', CURRENT_TIMESTAMP),
    ('MGRCED01', 'CEDINTN0001', 'qa.cedargrove@mock.test', '$2a$10$9Qe98NWcfK//us5g9yq.JOfJKyvk4zxyE9QZGs7Zh5Ylk2S9CAn1y', 'b1000000-0000-4000-8000-000000000003', 'ACTIVE', CURRENT_TIMESTAMP),
    ('MGRDAW01', 'DAWINDL0001', 'qa.dawnview@mock.test', '$2a$10$9Qe98NWcfK//us5g9yq.JOfJKyvk4zxyE9QZGs7Zh5Ylk2S9CAn1y', 'b1000000-0000-4000-8000-000000000004', 'ACTIVE', CURRENT_TIMESTAMP),
    ('MGRELM01', 'ELMUSCA0001', 'qa.elmwood@mock.test', '$2a$10$9Qe98NWcfK//us5g9yq.JOfJKyvk4zxyE9QZGs7Zh5Ylk2S9CAn1y', 'b1000000-0000-4000-8000-000000000005', 'ACTIVE', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO menu_category (id, hotel_id, name, active)
VALUES
    ('CATAUR001', 'AURINMH0001', 'Breakfast', TRUE),
    ('CATAUR002', 'AURINMH0001', 'Main Course', TRUE),
    ('CATAUR003', 'AURINMH0001', 'Beverages', TRUE),
    ('CATBLU001', 'BLUINKA0001', 'Breakfast', TRUE),
    ('CATBLU002', 'BLUINKA0001', 'Main Course', TRUE),
    ('CATBLU003', 'BLUINKA0001', 'Beverages', TRUE),
    ('CATCED001', 'CEDINTN0001', 'Breakfast', TRUE),
    ('CATCED002', 'CEDINTN0001', 'Main Course', TRUE),
    ('CATCED003', 'CEDINTN0001', 'Beverages', TRUE),
    ('CATDAW001', 'DAWINDL0001', 'Breakfast', TRUE),
    ('CATDAW002', 'DAWINDL0001', 'Main Course', TRUE),
    ('CATDAW003', 'DAWINDL0001', 'Beverages', TRUE),
    ('CATELM001', 'ELMUSCA0001', 'Breakfast', TRUE),
    ('CATELM002', 'ELMUSCA0001', 'Main Course', TRUE),
    ('CATELM003', 'ELMUSCA0001', 'Beverages', FALSE)
ON CONFLICT DO NOTHING;

INSERT INTO menu_item (
    id, hotel_id, category_id, name, price, available, active,
    cgst_rate, sgst_rate, vat_rate, discount_percent
)
VALUES
    ('BREAUR0001', 'AURINMH0001', 'CATAUR001', 'Masala Idli', 75.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('BREAUR0002', 'AURINMH0001', 'CATAUR001', 'South Indian Platter', 180.00, TRUE, TRUE, 2.50, 2.50, 0.00, 5.00),
    ('MAIAUR0001', 'AURINMH0001', 'CATAUR002', 'Paneer Tikka', 240.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('MAIAUR0002', 'AURINMH0001', 'CATAUR002', 'Vegetable Biryani', 210.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('BEVAUR0001', 'AURINMH0001', 'CATAUR003', 'Filter Coffee', 55.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('BEVAUR0002', 'AURINMH0001', 'CATAUR003', 'Mango Lassi', 90.00, FALSE, TRUE, 2.50, 2.50, 0.00, 0.00),

    ('BREBLU0001', 'BLUINKA0001', 'CATBLU001', 'Coconut Pancakes', 160.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('BREBLU0002', 'BLUINKA0001', 'CATBLU001', 'Tropical Fruit Bowl', 140.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('MAIBLU0001', 'BLUINKA0001', 'CATBLU002', 'Grilled Catch of the Day', 420.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('MAIBLU0002', 'BLUINKA0001', 'CATBLU002', 'Coconut Curry', 360.00, TRUE, TRUE, 2.50, 2.50, 0.00, 10.00),
    ('BEVBLU0001', 'BLUINKA0001', 'CATBLU003', 'Pineapple Cooler', 110.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('BEVBLU0002', 'BLUINKA0001', 'CATBLU003', 'Mint Lime Soda', 95.00, FALSE, FALSE, 2.50, 2.50, 0.00, 0.00),

    ('BRECED0001', 'CEDINTN0001', 'CATCED001', 'Buttermilk Pancakes', 175.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('BRECED0002', 'CEDINTN0001', 'CATCED001', 'Avocado Toast', 190.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('MAICED0001', 'CEDINTN0001', 'CATCED002', 'Wild Mushroom Pasta', 330.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('MAICED0002', 'CEDINTN0001', 'CATCED002', 'Roasted Chicken', 390.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('BEVCED0001', 'CEDINTN0001', 'CATCED003', 'Berry Smoothie', 150.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('BEVCED0002', 'CEDINTN0001', 'CATCED003', 'Americano', 90.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),

    ('BREDAW0001', 'DAWINDL0001', 'CATDAW001', 'Aloo Paratha', 110.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('BREDAW0002', 'DAWINDL0001', 'CATDAW001', 'Chole Kulche', 150.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('MAIDAW0001', 'DAWINDL0001', 'CATDAW002', 'Paneer Butter Masala', 270.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('MAIDAW0002', 'DAWINDL0001', 'CATDAW002', 'Dal Tadka', 220.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('BEVDAW0001', 'DAWINDL0001', 'CATDAW003', 'Masala Chai', 45.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),
    ('BEVDAW0002', 'DAWINDL0001', 'CATDAW003', 'Sweet Lassi', 80.00, TRUE, TRUE, 2.50, 2.50, 0.00, 0.00),

    ('BREELM0001', 'ELMUSCA0001', 'CATELM001', 'Blueberry Waffles', 14.50, TRUE, TRUE, 0.00, 0.00, 0.00, 0.00),
    ('BREELM0002', 'ELMUSCA0001', 'CATELM001', 'Granola Breakfast Bowl', 12.00, TRUE, TRUE, 0.00, 0.00, 0.00, 0.00),
    ('MAIELM0001', 'ELMUSCA0001', 'CATELM002', 'Classic Cheeseburger', 18.75, TRUE, TRUE, 0.00, 0.00, 0.00, 0.00),
    ('MAIELM0002', 'ELMUSCA0001', 'CATELM002', 'Mushroom Risotto', 21.50, TRUE, TRUE, 0.00, 0.00, 0.00, 5.00),
    ('BEVELM0001', 'ELMUSCA0001', 'CATELM003', 'Cold Brew Coffee', 5.50, TRUE, TRUE, 0.00, 0.00, 0.00, 0.00),
    ('BEVELM0002', 'ELMUSCA0001', 'CATELM003', 'Vanilla Milkshake', 7.25, TRUE, TRUE, 0.00, 0.00, 0.00, 0.00)
ON CONFLICT DO NOTHING;

-- One hotel-scoped order for each UI state: unpaid/open, partially paid/open,
-- paid/completed with a receipt, and cancelled/unpaid.
CREATE TEMP TABLE qa_mock_order_seed (
    order_id VARCHAR(96) NOT NULL PRIMARY KEY,
    hotel_id VARCHAR(64) NOT NULL,
    created_by VARCHAR(96) NOT NULL,
    order_number VARCHAR(40) NOT NULL,
    status VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    cancel_reason VARCHAR(500),
    days_ago INTEGER NOT NULL,
    item_a VARCHAR(96) NOT NULL,
    quantity_a INTEGER NOT NULL,
    item_b VARCHAR(96) NOT NULL,
    quantity_b INTEGER NOT NULL
) ON COMMIT DROP;

INSERT INTO qa_mock_order_seed
    (order_id, hotel_id, created_by, order_number, status, payment_status,
     cancel_reason, days_ago, item_a, quantity_a, item_b, quantity_b)
VALUES
    ('AUR202611289001', 'AURINMH0001', 'MGRAUR01', 'QA-AUR-0001', 'OPEN', 'UNPAID', NULL, 0, 'BREAUR0001', 1, 'MAIAUR0001', 1),
    ('AUR202611289002', 'AURINMH0001', 'MGRAUR01', 'QA-AUR-0002', 'OPEN', 'PARTIAL', NULL, 0, 'BREAUR0002', 1, 'BEVAUR0001', 2),
    ('AUR202611289003', 'AURINMH0001', 'MGRAUR01', 'QA-AUR-0003', 'COMPLETED', 'PAID', NULL, 1, 'BREAUR0001', 2, 'MAIAUR0002', 1),
    ('AUR202611289004', 'AURINMH0001', 'MGRAUR01', 'QA-AUR-0004', 'CANCELLED', 'UNPAID', 'Guest cancelled before payment', 3, 'MAIAUR0001', 1, 'BEVAUR0001', 1),

    ('BLU202611289001', 'BLUINKA0001', 'MGRBLU01', 'QA-BLU-0001', 'OPEN', 'UNPAID', NULL, 0, 'BREBLU0001', 1, 'MAIBLU0001', 1),
    ('BLU202611289002', 'BLUINKA0001', 'MGRBLU01', 'QA-BLU-0002', 'OPEN', 'PARTIAL', NULL, 1, 'BREBLU0002', 2, 'BEVBLU0001', 1),
    ('BLU202611289003', 'BLUINKA0001', 'MGRBLU01', 'QA-BLU-0003', 'COMPLETED', 'PAID', NULL, 2, 'BREBLU0001', 1, 'MAIBLU0002', 1),
    ('BLU202611289004', 'BLUINKA0001', 'MGRBLU01', 'QA-BLU-0004', 'CANCELLED', 'UNPAID', 'Guest cancelled before payment', 5, 'MAIBLU0001', 1, 'BEVBLU0001', 1),

    ('CED202611289001', 'CEDINTN0001', 'MGRCED01', 'QA-CED-0001', 'OPEN', 'UNPAID', NULL, 0, 'BRECED0001', 1, 'MAICED0001', 1),
    ('CED202611289002', 'CEDINTN0001', 'MGRCED01', 'QA-CED-0002', 'OPEN', 'PARTIAL', NULL, 1, 'BRECED0002', 1, 'BEVCED0001', 2),
    ('CED202611289003', 'CEDINTN0001', 'MGRCED01', 'QA-CED-0003', 'COMPLETED', 'PAID', NULL, 3, 'BRECED0001', 1, 'MAICED0002', 1),
    ('CED202611289004', 'CEDINTN0001', 'MGRCED01', 'QA-CED-0004', 'CANCELLED', 'UNPAID', 'Guest cancelled before payment', 6, 'MAICED0001', 1, 'BEVCED0002', 1),

    ('DAW202611289001', 'DAWINDL0001', 'MGRDAW01', 'QA-DAW-0001', 'OPEN', 'UNPAID', NULL, 0, 'BREDAW0001', 1, 'MAIDAW0001', 1),
    ('DAW202611289002', 'DAWINDL0001', 'MGRDAW01', 'QA-DAW-0002', 'OPEN', 'PARTIAL', NULL, 1, 'BREDAW0002', 2, 'BEVDAW0001', 1),
    ('DAW202611289003', 'DAWINDL0001', 'MGRDAW01', 'QA-DAW-0003', 'COMPLETED', 'PAID', NULL, 4, 'BREDAW0001', 1, 'MAIDAW0002', 1),
    ('DAW202611289004', 'DAWINDL0001', 'MGRDAW01', 'QA-DAW-0004', 'CANCELLED', 'UNPAID', 'Guest cancelled before payment', 7, 'MAIDAW0001', 1, 'BEVDAW0002', 1),

    ('ELM202611289001', 'ELMUSCA0001', 'MGRELM01', 'QA-ELM-0001', 'OPEN', 'UNPAID', NULL, 0, 'BREELM0001', 1, 'MAIELM0001', 1),
    ('ELM202611289002', 'ELMUSCA0001', 'MGRELM01', 'QA-ELM-0002', 'OPEN', 'PARTIAL', NULL, 1, 'BREELM0002', 1, 'MAIELM0002', 1),
    ('ELM202611289003', 'ELMUSCA0001', 'MGRELM01', 'QA-ELM-0003', 'COMPLETED', 'PAID', NULL, 5, 'BREELM0001', 1, 'MAIELM0001', 1),
    ('ELM202611289004', 'ELMUSCA0001', 'MGRELM01', 'QA-ELM-0004', 'CANCELLED', 'UNPAID', 'Guest cancelled before payment', 8, 'BREELM0002', 1, 'MAIELM0002', 1)
ON CONFLICT DO NOTHING;

-- Calculate line snapshots using the same discount-first, per-tax rounding rule
-- as the POS service, so totals, payments, bills, and receipts agree.
CREATE TEMP TABLE qa_mock_order_lines ON COMMIT DROP AS
WITH raw_lines AS (
    SELECT
        ('OI' || LEFT(seed.hotel_id, 3) || LPAD((9000 + ROW_NUMBER() OVER (
            PARTITION BY LEFT(seed.hotel_id, 3)
            ORDER BY seed.order_number, requested.line_number))::text, 4, '0')) AS id,
        seed.order_id,
        seed.hotel_id,
        seed.order_number,
        seed.days_ago,
        requested.menu_item_id,
        requested.quantity,
        item.name,
        item.price,
        item.discount_percent,
        item.cgst_rate,
        item.sgst_rate,
        item.vat_rate
    FROM qa_mock_order_seed seed
    CROSS JOIN LATERAL (VALUES
        (1, seed.item_a, seed.quantity_a),
        (2, seed.item_b, seed.quantity_b)
    ) AS requested(line_number, menu_item_id, quantity)
    JOIN menu_item item
      ON item.hotel_id = seed.hotel_id AND item.id = requested.menu_item_id
), discounted AS (
    SELECT raw_lines.*,
           round(price * quantity, 2) AS gross,
           round(price * quantity * discount_percent / 100.0, 2) AS discount_amount
    FROM raw_lines
), taxed AS (
    SELECT discounted.*,
           gross - discount_amount AS taxable_amount,
           round((gross - discount_amount) * cgst_rate / 100.0, 2) AS tax_cgst,
           round((gross - discount_amount) * sgst_rate / 100.0, 2) AS tax_sgst,
           round((gross - discount_amount) * vat_rate / 100.0, 2) AS tax_vat
    FROM discounted
)
SELECT id, order_id, hotel_id, order_number, days_ago, menu_item_id, name, price, quantity,
       gross, discount_amount, tax_cgst, tax_sgst, tax_vat,
       (taxable_amount + tax_cgst + tax_sgst + tax_vat)::numeric(12,2) AS line_total
FROM taxed;

CREATE TEMP TABLE qa_mock_order_totals ON COMMIT DROP AS
SELECT order_id, hotel_id,
       sum(gross)::numeric(12,2) AS subtotal,
       sum(discount_amount)::numeric(12,2) AS discount_total,
       sum(tax_cgst + tax_sgst + tax_vat)::numeric(12,2) AS tax_total,
       sum(line_total)::numeric(12,2) AS grand_total
FROM qa_mock_order_lines
GROUP BY order_id, hotel_id;

INSERT INTO pos_order (
    id, hotel_id, order_number, status, payment_status, subtotal, discount_total,
    tax_total, grand_total, created_by, cancel_reason, created_at, updated_at
)
SELECT seed.order_id, seed.hotel_id, seed.order_number, seed.status, seed.payment_status,
       totals.subtotal, totals.discount_total, totals.tax_total, totals.grand_total,
       seed.created_by, seed.cancel_reason,
       CURRENT_TIMESTAMP - seed.days_ago * INTERVAL '1 day',
       CURRENT_TIMESTAMP - seed.days_ago * INTERVAL '1 day'
FROM qa_mock_order_seed seed
JOIN qa_mock_order_totals totals USING (order_id, hotel_id)
ON CONFLICT DO NOTHING;

INSERT INTO order_item (
    id, hotel_id, order_id, menu_item_id, name_snapshot, price_snapshot, quantity,
    discount_amount, tax_cgst, tax_sgst, tax_vat, line_total, created_at
)
SELECT line.id, line.hotel_id, line.order_id, line.menu_item_id, line.name, line.price, line.quantity,
       line.discount_amount, line.tax_cgst, line.tax_sgst, line.tax_vat, line.line_total,
       CURRENT_TIMESTAMP - line.days_ago * INTERVAL '1 day' + INTERVAL '1 minute'
FROM qa_mock_order_lines line
ON CONFLICT DO NOTHING;

CREATE TEMP TABLE qa_mock_payment_seed ON COMMIT DROP AS
WITH planned AS (
    SELECT seed.order_id, seed.hotel_id, seed.order_number, seed.days_ago,
           1 AS payment_number, 'CASH'::varchar(12) AS method,
           round(totals.grand_total * 0.40, 2)::numeric(12,2) AS amount,
           'QA-' || seed.order_number || '-PARTIAL' AS reference_no
    FROM qa_mock_order_seed seed
    JOIN qa_mock_order_totals totals USING (order_id, hotel_id)
    WHERE seed.status = 'OPEN' AND seed.payment_status = 'PARTIAL'
    UNION ALL
    SELECT seed.order_id, seed.hotel_id, seed.order_number, seed.days_ago,
           1, 'CASH'::varchar(12),
           round(totals.grand_total * 0.60, 2)::numeric(12,2),
           'QA-' || seed.order_number || '-CASH'
    FROM qa_mock_order_seed seed
    JOIN qa_mock_order_totals totals USING (order_id, hotel_id)
    WHERE seed.status = 'COMPLETED'
    UNION ALL
    SELECT seed.order_id, seed.hotel_id, seed.order_number, seed.days_ago,
           2, 'UPI'::varchar(12),
           (totals.grand_total - round(totals.grand_total * 0.60, 2))::numeric(12,2),
           'QA-' || seed.order_number || '-UPI'
    FROM qa_mock_order_seed seed
    JOIN qa_mock_order_totals totals USING (order_id, hotel_id)
    WHERE seed.status = 'COMPLETED'
), numbered AS (
    SELECT planned.method || LEFT(planned.hotel_id, 3) || '20261128' ||
           LPAD((9000 + ROW_NUMBER() OVER (
               PARTITION BY planned.method, LEFT(planned.hotel_id, 3)
               ORDER BY planned.order_number, planned.payment_number))::text, 4, '0') AS id,
           planned.*
    FROM planned
)
SELECT * FROM numbered;

INSERT INTO payment (id, hotel_id, order_id, method, amount, reference_no, created_at)
SELECT id, hotel_id, order_id, method, amount, reference_no,
       CURRENT_TIMESTAMP - days_ago * INTERVAL '1 day' + payment_number * INTERVAL '10 minutes'
FROM qa_mock_payment_seed
ON CONFLICT DO NOTHING;

INSERT INTO receipt (id, hotel_id, order_id, receipt_number, snapshot, created_at)
SELECT 'RPT' || LEFT(seed.hotel_id, 3) || '202611289001',
       seed.hotel_id,
       seed.order_id,
       'RPT' || LEFT(seed.hotel_id, 3) || '202611289001',
       jsonb_build_object(
           'hotelName', hotel.name,
           'currency', hotel.currency_code,
           'receiptDetails', coalesce(hotel.receipt_details, '{}'::jsonb),
           'orderNumber', seed.order_number,
           'items', (
               SELECT jsonb_agg(jsonb_build_object(
                   'name', line.name,
                   'price', line.price,
                   'quantity', line.quantity,
                   'discount', line.discount_amount,
                   'cgst', line.tax_cgst,
                   'sgst', line.tax_sgst,
                   'vat', line.tax_vat,
                   'lineTotal', line.line_total
               ) ORDER BY line.id)
               FROM qa_mock_order_lines line
               WHERE line.order_id = seed.order_id AND line.hotel_id = seed.hotel_id
           ),
           'subtotal', totals.subtotal,
           'discountTotal', totals.discount_total,
           'taxTotal', totals.tax_total,
           'grandTotal', totals.grand_total,
           'paidAt', CURRENT_TIMESTAMP - seed.days_ago * INTERVAL '1 day' + INTERVAL '30 minutes'
       ),
       CURRENT_TIMESTAMP - seed.days_ago * INTERVAL '1 day' + INTERVAL '30 minutes'
FROM qa_mock_order_seed seed
JOIN qa_mock_order_totals totals USING (order_id, hotel_id)
JOIN hotel ON hotel.id = seed.hotel_id
WHERE seed.status = 'COMPLETED'
ON CONFLICT DO NOTHING;

-- Keep the runtime generators ahead of the fixed mock IDs.
WITH seeded_ids AS (
    SELECT LEFT(id, LENGTH(id) - 2) AS id_prefix, RIGHT(id, 2)::bigint AS last_value
    FROM staff_user WHERE username LIKE 'qa.%'
    UNION ALL
    SELECT LEFT(id, LENGTH(id) - 3), RIGHT(id, 3)::bigint
    FROM menu_category WHERE hotel_id IN ('AURINMH0001', 'BLUINKA0001', 'CEDINTN0001', 'DAWINDL0001', 'ELMUSCA0001')
      AND id LIKE 'CAT%'
    UNION ALL
    SELECT LEFT(id, LENGTH(id) - 4), RIGHT(id, 4)::bigint
    FROM menu_item WHERE hotel_id IN ('AURINMH0001', 'BLUINKA0001', 'CEDINTN0001', 'DAWINDL0001', 'ELMUSCA0001')
    UNION ALL
    SELECT LEFT(id, LENGTH(id) - 4), RIGHT(id, 4)::bigint
    FROM pos_order WHERE order_number LIKE 'QA-%'
    UNION ALL
    SELECT LEFT(id, LENGTH(id) - 4), RIGHT(id, 4)::bigint
    FROM order_item line JOIN pos_order ord ON ord.hotel_id = line.hotel_id AND ord.id = line.order_id
    WHERE ord.order_number LIKE 'QA-%'
    UNION ALL
    SELECT LEFT(pay.id, LENGTH(pay.id) - 4), RIGHT(pay.id, 4)::bigint
    FROM payment pay JOIN pos_order ord ON ord.hotel_id = pay.hotel_id AND ord.id = pay.order_id
    WHERE ord.order_number LIKE 'QA-%'
    UNION ALL
    SELECT LEFT(rec.id, LENGTH(rec.id) - 4), RIGHT(rec.id, 4)::bigint
    FROM receipt rec JOIN pos_order ord ON ord.hotel_id = rec.hotel_id AND ord.id = rec.order_id
    WHERE ord.order_number LIKE 'QA-%'
)
INSERT INTO business_id_sequence (id_prefix, last_value)
SELECT id_prefix, MAX(last_value)
FROM seeded_ids
GROUP BY id_prefix
ON CONFLICT (id_prefix) DO UPDATE
    SET last_value = GREATEST(business_id_sequence.last_value, EXCLUDED.last_value);

SELECT dataset, rows_found
FROM (
    SELECT 'hotels' AS dataset, COUNT(*) AS rows_found
    FROM hotel WHERE id IN ('AURINMH0001', 'BLUINKA0001', 'CEDINTN0001', 'DAWINDL0001', 'ELMUSCA0001')
    UNION ALL SELECT 'manager roles', COUNT(*) FROM hotel_role
    WHERE hotel_id IN ('AURINMH0001', 'BLUINKA0001', 'CEDINTN0001', 'DAWINDL0001', 'ELMUSCA0001')
    UNION ALL SELECT 'manager accounts', COUNT(*) FROM staff_user
    WHERE hotel_id IN ('AURINMH0001', 'BLUINKA0001', 'CEDINTN0001', 'DAWINDL0001', 'ELMUSCA0001')
    UNION ALL SELECT 'categories', COUNT(*) FROM menu_category
    WHERE hotel_id IN ('AURINMH0001', 'BLUINKA0001', 'CEDINTN0001', 'DAWINDL0001', 'ELMUSCA0001')
    UNION ALL SELECT 'menu items', COUNT(*) FROM menu_item
    WHERE hotel_id IN ('AURINMH0001', 'BLUINKA0001', 'CEDINTN0001', 'DAWINDL0001', 'ELMUSCA0001')
    UNION ALL SELECT 'orders', COUNT(*) FROM pos_order
    WHERE hotel_id IN ('AURINMH0001', 'BLUINKA0001', 'CEDINTN0001', 'DAWINDL0001', 'ELMUSCA0001')
      AND order_number LIKE 'QA-%'
    UNION ALL SELECT 'order lines', COUNT(*) FROM order_item line
    JOIN pos_order ord ON ord.hotel_id = line.hotel_id AND ord.id = line.order_id
    WHERE ord.order_number LIKE 'QA-%'
    UNION ALL SELECT 'payments', COUNT(*) FROM payment pay
    JOIN pos_order ord ON ord.hotel_id = pay.hotel_id AND ord.id = pay.order_id
    WHERE ord.order_number LIKE 'QA-%'
    UNION ALL SELECT 'receipts', COUNT(*) FROM receipt rec
    JOIN pos_order ord ON ord.hotel_id = rec.hotel_id AND ord.id = rec.order_id
    WHERE ord.order_number LIKE 'QA-%'
) seeded_counts
ORDER BY dataset;

COMMIT;
