-- Local hotel POS data only; this file is outside db/migration and never runs
-- by Flyway. Supply an existing hotel ID with psql -v hotel_id=...
\set ON_ERROR_STOP on
BEGIN;

-- Scope this seed transaction to one hotel.
SELECT set_config('app.hotel_id', :'hotel_id', true);

DO $$
DECLARE
    seed_hotel TEXT := NULLIF(current_setting('app.hotel_id', true), '');
BEGIN
    IF seed_hotel IS NULL OR NOT EXISTS (SELECT 1 FROM hotel WHERE id = seed_hotel) THEN
        RAISE EXCEPTION 'hotel_id must identify an existing hotel';
    END IF;
END;
$$;

INSERT INTO menu_category (id, hotel_id, name, active)
SELECT gen_random_uuid(), current_setting('app.hotel_id'), seed.name, TRUE
FROM (VALUES ('Beverages'), ('Snacks')) AS seed(name)
WHERE NOT EXISTS (
    SELECT 1 FROM menu_category c
    WHERE c.hotel_id = current_setting('app.hotel_id') AND c.name = seed.name
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
WHERE c.hotel_id = current_setting('app.hotel_id')
  AND NOT EXISTS (
      SELECT 1 FROM menu_item i
      WHERE i.hotel_id = c.hotel_id AND i.name = seed.item_name
  );

COMMIT;
