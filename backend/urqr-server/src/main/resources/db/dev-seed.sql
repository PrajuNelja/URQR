-- Local development data only; this file is outside db/migration and is never
-- run by Flyway. Supply an existing hotel/tenant UUID with psql -v tenant_id=...
\set ON_ERROR_STOP on
BEGIN;

-- The application role runs this in a transaction so SET LOCAL cannot leak
-- tenant context to the next pooled connection user.
SELECT set_config('app.tenant_id', :'tenant_id', true);

DO $$
DECLARE
    seed_tenant UUID := NULLIF(current_setting('app.tenant_id', true), '')::uuid;
BEGIN
    IF seed_tenant IS NULL
       OR NOT EXISTS (SELECT 1 FROM tenants WHERE id = seed_tenant)
       OR NOT EXISTS (SELECT 1 FROM hotel WHERE id = seed_tenant) THEN
        RAISE EXCEPTION 'tenant_id must identify an existing tenant and hotel';
    END IF;
END;
$$;

INSERT INTO categories (tenant_id, name, status)
VALUES (current_setting('app.tenant_id')::uuid, 'Beverages', 'ACTIVE'),
       (current_setting('app.tenant_id')::uuid, 'Snacks', 'ACTIVE')
ON CONFLICT (tenant_id, name) DO NOTHING;

INSERT INTO products (tenant_id, category_id, name, description, sku, status)
SELECT c.tenant_id, c.id, seed.name, seed.description, seed.sku, 'ACTIVE'
FROM (VALUES
    ('Beverages', 'Masala Chai', 'Development sample menu item', 'DEV-MASALA-CHAI'),
    ('Snacks', 'Veg Sandwich', 'Development sample menu item', 'DEV-VEG-SANDWICH')
) AS seed(category_name, name, description, sku)
JOIN categories c
  ON c.tenant_id = current_setting('app.tenant_id')::uuid
 AND c.name = seed.category_name
WHERE NOT EXISTS (
    SELECT 1 FROM products p
    WHERE p.tenant_id = c.tenant_id AND p.sku = seed.sku
);

INSERT INTO prices (tenant_id, product_id, amount, currency, is_active)
SELECT p.tenant_id, p.id,
       CASE p.sku WHEN 'DEV-MASALA-CHAI' THEN 80.00 ELSE 120.00 END,
       'INR', TRUE
FROM products p
WHERE p.tenant_id = current_setting('app.tenant_id')::uuid
  AND p.sku IN ('DEV-MASALA-CHAI', 'DEV-VEG-SANDWICH')
  AND NOT EXISTS (
      SELECT 1 FROM prices active_price
      WHERE active_price.tenant_id = p.tenant_id
        AND active_price.product_id = p.id
        AND active_price.is_active
  );

-- Demo rates exercise split-GST calculation; confirm each real SKU's rate before use.
INSERT INTO tax_rates (tenant_id, code, name, rate_percent)
VALUES (current_setting('app.tenant_id')::uuid, 'DEMO_CGST_9', 'Demo CGST 9%', 9.00),
       (current_setting('app.tenant_id')::uuid, 'DEMO_SGST_9', 'Demo SGST 9%', 9.00),
       (current_setting('app.tenant_id')::uuid, 'DEMO_VAT_5', 'Demo VAT 5%', 5.00)
ON CONFLICT (tenant_id, code) DO NOTHING;

INSERT INTO product_tax_rates (tenant_id, product_id, tax_rate_id)
SELECT p.tenant_id, p.id, t.id
FROM products p
JOIN tax_rates t ON t.tenant_id = p.tenant_id
WHERE p.tenant_id = current_setting('app.tenant_id')::uuid
  AND p.sku IN ('DEV-MASALA-CHAI', 'DEV-VEG-SANDWICH')
  AND t.code IN ('DEMO_CGST_9', 'DEMO_SGST_9')
ON CONFLICT (tenant_id, product_id, tax_rate_id) DO NOTHING;

INSERT INTO menu_category (id, hotel_id, name, active)
SELECT gen_random_uuid(), current_setting('app.tenant_id')::uuid, seed.name, TRUE
FROM (VALUES ('Beverages'), ('Snacks')) AS seed(name)
WHERE NOT EXISTS (
    SELECT 1 FROM menu_category c
    WHERE c.hotel_id = current_setting('app.tenant_id')::uuid AND c.name = seed.name
);

INSERT INTO menu_item (
    id, hotel_id, category_id, name, price, available, active,
    discount_percent, cgst_rate, sgst_rate, vat_rate
)
SELECT gen_random_uuid(), c.hotel_id, c.id, seed.name, seed.price, TRUE, TRUE,
       0.00, 9.00, 9.00, 0.00
FROM menu_category c
JOIN (VALUES
    ('Beverages', 'Masala Chai', 80.00),
    ('Snacks', 'Veg Sandwich', 120.00)
) AS seed(category_name, item_name, price) ON seed.category_name = c.name
WHERE c.hotel_id = current_setting('app.tenant_id')::uuid
  AND NOT EXISTS (
      SELECT 1 FROM menu_item i
      WHERE i.hotel_id = c.hotel_id AND i.name = seed.item_name
  );

COMMIT;
