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

-- This optional fixture also uses the production business-ID formats and the
-- same atomic counters as API-created records.
CREATE TEMP TABLE seed_business_id_scope (ready BOOLEAN) ON COMMIT DROP;

CREATE FUNCTION pg_temp.seed_name_code(value TEXT) RETURNS TEXT
LANGUAGE SQL IMMUTABLE
AS $$
    SELECT LEFT((REGEXP_REPLACE(NORMALIZE(UPPER(COALESCE(value, '')), NFD), '[^A-Z]', '', 'g') || 'XXX'), 3)
$$;

CREATE FUNCTION pg_temp.seed_hotel_code(hotel_key TEXT) RETURNS TEXT
LANGUAGE SQL STABLE
AS $$
    SELECT pg_temp.seed_name_code(h.name)
      FROM hotel h
     WHERE h.id = hotel_key
$$;

CREATE FUNCTION pg_temp.next_business_id(id_prefix TEXT, minimum_width INTEGER) RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    sequence_value BIGINT;
BEGIN
    INSERT INTO business_id_sequence (id_prefix, last_value)
    VALUES (id_prefix, 1)
    ON CONFLICT (id_prefix) DO UPDATE
        SET last_value = business_id_sequence.last_value + 1
    RETURNING last_value INTO sequence_value;
    RETURN id_prefix || LPAD(sequence_value::text, minimum_width, '0');
END;
$$;

INSERT INTO menu_category (id, hotel_id, name, active)
SELECT pg_temp.next_business_id('CAT' || pg_temp.seed_hotel_code(current_setting('app.hotel_id')), 3),
       current_setting('app.hotel_id'), seed.name, TRUE
FROM (VALUES ('Beverages'), ('Snacks')) AS seed(name)
WHERE NOT EXISTS (
    SELECT 1 FROM menu_category c
    WHERE c.hotel_id = current_setting('app.hotel_id') AND c.name = seed.name
);

INSERT INTO menu_item (
    id, hotel_id, category_id, name, price, available, active,
    discount_percent, cgst_rate, sgst_rate, vat_rate
)
SELECT pg_temp.next_business_id(
           pg_temp.seed_name_code(c.name) || pg_temp.seed_hotel_code(c.hotel_id), 4),
       c.hotel_id, c.id, seed.name, seed.price, TRUE, TRUE,
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
