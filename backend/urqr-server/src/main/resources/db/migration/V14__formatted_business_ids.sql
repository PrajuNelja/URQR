-- Convert public business identifiers to readable strings without changing
-- their relationships. Counters are keyed by the visible prefix so hotels
-- with the same three-letter code still receive globally unique primary IDs.

CREATE TABLE business_id_sequence (
    id_prefix VARCHAR(64) PRIMARY KEY,
    last_value BIGINT NOT NULL CHECK (last_value > 0)
);
GRANT SELECT, INSERT, UPDATE ON business_id_sequence TO urqr_app;

CREATE TEMP TABLE business_id_candidates (
    entity_type VARCHAR(24) NOT NULL,
    hotel_id VARCHAR(64) NOT NULL,
    old_id TEXT NOT NULL,
    id_prefix VARCHAR(64) NOT NULL,
    sequence_width INTEGER NOT NULL,
    sort_at TIMESTAMPTZ,
    PRIMARY KEY (entity_type, hotel_id, old_id)
) ON COMMIT DROP;

CREATE FUNCTION pg_temp.id_prefix(value TEXT) RETURNS TEXT
LANGUAGE SQL IMMUTABLE
AS $$
    SELECT LEFT((REGEXP_REPLACE(NORMALIZE(UPPER(COALESCE(value, '')), NFD), '[^A-Z]', '', 'g') || 'XXX'), 3)
$$;

INSERT INTO business_id_candidates
SELECT 'STAFF', u.hotel_id, u.id::text,
       CASE UPPER(r.name)
           WHEN 'MANAGER' THEN 'MGR'
           WHEN 'CASHIER' THEN 'CSR'
           WHEN 'COOK' THEN 'COOK'
           WHEN 'WAITER' THEN 'WTR'
           ELSE 'USR'
       END || pg_temp.id_prefix(h.name),
       2, u.created_at
  FROM staff_user u
  JOIN hotel_role r ON r.hotel_id = u.hotel_id AND r.id = u.role_id
  JOIN hotel h ON h.id = u.hotel_id;

INSERT INTO business_id_candidates
SELECT 'CATEGORY', c.hotel_id, c.id::text,
       'CAT' || pg_temp.id_prefix(h.name), 3, NULL
  FROM menu_category c
  JOIN hotel h ON h.id = c.hotel_id;

INSERT INTO business_id_candidates
SELECT 'MENU_ITEM', i.hotel_id, i.id::text,
       pg_temp.id_prefix(c.name) || pg_temp.id_prefix(h.name), 4, NULL
  FROM menu_item i
  JOIN menu_category c ON c.hotel_id = i.hotel_id AND c.id = i.category_id
  JOIN hotel h ON h.id = i.hotel_id;

INSERT INTO business_id_candidates
SELECT 'ORDER', o.hotel_id, o.id::text,
       pg_temp.id_prefix(h.name) || TO_CHAR(o.created_at AT TIME ZONE 'UTC', 'YYYYMMDD'),
       4, o.created_at
  FROM pos_order o
  JOIN hotel h ON h.id = o.hotel_id;

INSERT INTO business_id_candidates
SELECT 'ORDER_ITEM', i.hotel_id, i.id::text, 'OI' || pg_temp.id_prefix(h.name), 3, o.created_at
  FROM order_item i
  JOIN pos_order o ON o.hotel_id = i.hotel_id AND o.id = i.order_id
  JOIN hotel h ON h.id = i.hotel_id;

INSERT INTO business_id_candidates
SELECT 'AUDIT', a.hotel_id, a.id::text,
       'ADT' || pg_temp.id_prefix(h.name) || TO_CHAR(a.created_at AT TIME ZONE 'UTC', 'YYYYMMDD'),
       5, a.created_at
  FROM audit_record a
  JOIN hotel h ON h.id = a.hotel_id;

INSERT INTO business_id_candidates
SELECT 'PAYMENT', p.hotel_id, p.id::text,
       REGEXP_REPLACE(UPPER(p.method), '[^A-Z0-9]', '', 'g')
           || pg_temp.id_prefix(h.name)
           || TO_CHAR(p.created_at AT TIME ZONE 'UTC', 'YYYYMMDD'),
       3, p.created_at
  FROM payment p
  JOIN hotel h ON h.id = p.hotel_id;

INSERT INTO business_id_candidates
SELECT 'RECEIPT', r.hotel_id, r.id::text,
       'RPT' || pg_temp.id_prefix(h.name) || TO_CHAR(r.created_at AT TIME ZONE 'UTC', 'YYYYMMDD'),
       3, r.created_at
  FROM receipt r
  JOIN hotel h ON h.id = r.hotel_id;

CREATE TEMP TABLE business_id_map ON COMMIT DROP AS
WITH numbered AS (
    SELECT c.*,
           ROW_NUMBER() OVER (
               PARTITION BY c.id_prefix
               ORDER BY c.sort_at NULLS FIRST, c.entity_type, c.old_id
           ) AS sequence_value
      FROM business_id_candidates c
)
SELECT entity_type, hotel_id, old_id, id_prefix, sequence_value,
       id_prefix || LPAD(sequence_value::text,
           GREATEST(sequence_width, LENGTH(sequence_value::text)), '0') AS new_id
  FROM numbered;

CREATE UNIQUE INDEX business_id_map_new_id ON business_id_map (new_id);

-- Drop foreign keys on or referencing the converted ID columns while they are
-- changed. They are recreated below with the same hotel-scoped relationships.
DO $$
DECLARE
    constraint_ref RECORD;
BEGIN
    FOR constraint_ref IN
        SELECT c.conrelid::regclass AS table_ref, c.conname
          FROM pg_constraint c
         WHERE c.contype = 'f'
           AND (
               c.conrelid IN (
                   'staff_user'::regclass, 'audit_record'::regclass,
                   'menu_category'::regclass, 'menu_item'::regclass,
                   'pos_order'::regclass, 'order_item'::regclass,
                   'payment'::regclass, 'receipt'::regclass
               )
               OR c.confrelid IN (
                   'staff_user'::regclass, 'menu_category'::regclass,
                   'menu_item'::regclass, 'pos_order'::regclass
               )
           )
    LOOP
        EXECUTE FORMAT('ALTER TABLE %s DROP CONSTRAINT %I', constraint_ref.table_ref, constraint_ref.conname);
    END LOOP;
END;
$$;

ALTER TABLE staff_user
    ALTER COLUMN id TYPE VARCHAR(96) USING id::text;
ALTER TABLE audit_record
    ALTER COLUMN id TYPE VARCHAR(96) USING id::text,
    ALTER COLUMN user_id TYPE VARCHAR(96) USING user_id::text;
ALTER TABLE menu_category
    ALTER COLUMN id TYPE VARCHAR(96) USING id::text;
ALTER TABLE menu_item
    ALTER COLUMN id TYPE VARCHAR(96) USING id::text,
    ALTER COLUMN category_id TYPE VARCHAR(96) USING category_id::text;
ALTER TABLE pos_order
    ALTER COLUMN id TYPE VARCHAR(96) USING id::text,
    ALTER COLUMN created_by TYPE VARCHAR(96) USING created_by::text;
ALTER TABLE order_item
    ALTER COLUMN id TYPE VARCHAR(96) USING id::text,
    ALTER COLUMN order_id TYPE VARCHAR(96) USING order_id::text,
    ALTER COLUMN menu_item_id TYPE VARCHAR(96) USING menu_item_id::text;
ALTER TABLE payment
    ALTER COLUMN id TYPE VARCHAR(96) USING id::text,
    ALTER COLUMN order_id TYPE VARCHAR(96) USING order_id::text;
ALTER TABLE receipt
    ALTER COLUMN id TYPE VARCHAR(96) USING id::text,
    ALTER COLUMN order_id TYPE VARCHAR(96) USING order_id::text;
ALTER TABLE outbox_events
    ALTER COLUMN aggregate_id TYPE VARCHAR(96) USING aggregate_id::text;

-- Keep the existing display fields consistent with their newly assigned IDs.
UPDATE pos_order o
   SET order_number = 'ORD-' || m.new_id
  FROM business_id_map m
 WHERE m.entity_type = 'ORDER'
   AND o.hotel_id = m.hotel_id
   AND o.id = m.old_id;

UPDATE receipt r
   SET receipt_number = m.new_id
  FROM business_id_map m
 WHERE m.entity_type = 'RECEIPT'
   AND r.hotel_id = m.hotel_id
   AND r.id = m.old_id;

UPDATE staff_user t SET id = m.new_id
  FROM business_id_map m
 WHERE m.entity_type = 'STAFF' AND t.hotel_id = m.hotel_id AND t.id = m.old_id;

UPDATE audit_record t SET id = m.new_id
  FROM business_id_map m
 WHERE m.entity_type = 'AUDIT' AND t.hotel_id = m.hotel_id AND t.id = m.old_id;

UPDATE audit_record t SET user_id = m.new_id
  FROM business_id_map m
 WHERE m.entity_type = 'STAFF' AND t.hotel_id = m.hotel_id AND t.user_id = m.old_id;

UPDATE menu_category t SET id = m.new_id
  FROM business_id_map m
 WHERE m.entity_type = 'CATEGORY' AND t.hotel_id = m.hotel_id AND t.id = m.old_id;

UPDATE menu_item t SET id = m.new_id
  FROM business_id_map m
 WHERE m.entity_type = 'MENU_ITEM' AND t.hotel_id = m.hotel_id AND t.id = m.old_id;

UPDATE menu_item t SET category_id = m.new_id
  FROM business_id_map m
 WHERE m.entity_type = 'CATEGORY' AND t.hotel_id = m.hotel_id AND t.category_id = m.old_id;

UPDATE pos_order t SET id = m.new_id
  FROM business_id_map m
 WHERE m.entity_type = 'ORDER' AND t.hotel_id = m.hotel_id AND t.id = m.old_id;

UPDATE pos_order t SET created_by = m.new_id
  FROM business_id_map m
 WHERE m.entity_type = 'STAFF' AND t.hotel_id = m.hotel_id AND t.created_by = m.old_id;

UPDATE order_item t SET id = m.new_id
  FROM business_id_map m
 WHERE m.entity_type = 'ORDER_ITEM' AND t.hotel_id = m.hotel_id AND t.id = m.old_id;

UPDATE order_item t SET order_id = m.new_id
  FROM business_id_map m
 WHERE m.entity_type = 'ORDER' AND t.hotel_id = m.hotel_id AND t.order_id = m.old_id;

UPDATE order_item t SET menu_item_id = m.new_id
  FROM business_id_map m
 WHERE m.entity_type = 'MENU_ITEM' AND t.hotel_id = m.hotel_id AND t.menu_item_id = m.old_id;

UPDATE payment t SET id = m.new_id
  FROM business_id_map m
 WHERE m.entity_type = 'PAYMENT' AND t.hotel_id = m.hotel_id AND t.id = m.old_id;

UPDATE payment t SET order_id = m.new_id
  FROM business_id_map m
 WHERE m.entity_type = 'ORDER' AND t.hotel_id = m.hotel_id AND t.order_id = m.old_id;

UPDATE receipt t SET id = m.new_id
  FROM business_id_map m
 WHERE m.entity_type = 'RECEIPT' AND t.hotel_id = m.hotel_id AND t.id = m.old_id;

UPDATE receipt t SET order_id = m.new_id
  FROM business_id_map m
 WHERE m.entity_type = 'ORDER' AND t.hotel_id = m.hotel_id AND t.order_id = m.old_id;

UPDATE outbox_events t SET aggregate_id = m.new_id
  FROM business_id_map m
 WHERE m.entity_type = 'ORDER' AND t.hotel_id = m.hotel_id
   AND t.aggregate_type = 'Order' AND t.aggregate_id = m.old_id;

UPDATE audit_record t SET entity_id = m.new_id
  FROM business_id_map m
 WHERE t.hotel_id = m.hotel_id AND t.entity_id = m.old_id
   AND ((m.entity_type = 'STAFF' AND t.entity IN ('User', 'StaffUser'))
     OR (m.entity_type = 'CATEGORY' AND t.entity = 'MenuCategory')
     OR (m.entity_type = 'MENU_ITEM' AND t.entity = 'MenuItem')
     OR (m.entity_type = 'ORDER' AND t.entity = 'Order')
     OR (m.entity_type = 'PAYMENT' AND t.entity = 'Payment')
     OR (m.entity_type = 'RECEIPT' AND t.entity = 'Receipt'));

UPDATE outbox_events t
   SET payload = jsonb_set(t.payload, '{orderId}', TO_JSONB(m.new_id), false)
  FROM business_id_map m
 WHERE m.entity_type = 'ORDER' AND t.hotel_id = m.hotel_id
   AND t.payload ->> 'orderId' = m.old_id;

UPDATE outbox_events t
   SET payload = jsonb_set(t.payload, '{paymentId}', TO_JSONB(m.new_id), false)
  FROM business_id_map m
 WHERE m.entity_type = 'PAYMENT' AND t.hotel_id = m.hotel_id
   AND t.payload ->> 'paymentId' = m.old_id;

ALTER TABLE staff_user
    ADD CONSTRAINT staff_user_hotel_id_fkey FOREIGN KEY (hotel_id)
        REFERENCES hotel (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_staff_user_role FOREIGN KEY (hotel_id, role_id)
        REFERENCES hotel_role (hotel_id, id) ON DELETE RESTRICT;
ALTER TABLE audit_record
    ADD CONSTRAINT audit_record_hotel_id_fkey FOREIGN KEY (hotel_id)
        REFERENCES hotel (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_audit_user_tenant FOREIGN KEY (hotel_id, user_id)
        REFERENCES staff_user (hotel_id, id) ON DELETE SET NULL (user_id);
ALTER TABLE menu_category
    ADD CONSTRAINT menu_category_hotel_id_fkey FOREIGN KEY (hotel_id)
        REFERENCES hotel (id) ON DELETE CASCADE;
ALTER TABLE menu_item
    ADD CONSTRAINT menu_item_hotel_id_fkey FOREIGN KEY (hotel_id)
        REFERENCES hotel (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_menu_item_category FOREIGN KEY (hotel_id, category_id)
        REFERENCES menu_category (hotel_id, id) ON DELETE RESTRICT;
ALTER TABLE pos_order
    ADD CONSTRAINT pos_order_hotel_id_fkey FOREIGN KEY (hotel_id)
        REFERENCES hotel (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_order_creator FOREIGN KEY (hotel_id, created_by)
        REFERENCES staff_user (hotel_id, id) ON DELETE RESTRICT;
ALTER TABLE order_item
    ADD CONSTRAINT order_item_hotel_id_fkey FOREIGN KEY (hotel_id)
        REFERENCES hotel (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_order_item_order FOREIGN KEY (hotel_id, order_id)
        REFERENCES pos_order (hotel_id, id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_order_item_menu FOREIGN KEY (hotel_id, menu_item_id)
        REFERENCES menu_item (hotel_id, id) ON DELETE RESTRICT;
ALTER TABLE payment
    ADD CONSTRAINT payment_hotel_id_fkey FOREIGN KEY (hotel_id)
        REFERENCES hotel (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_payment_order FOREIGN KEY (hotel_id, order_id)
        REFERENCES pos_order (hotel_id, id) ON DELETE CASCADE;
ALTER TABLE receipt
    ADD CONSTRAINT receipt_hotel_id_fkey FOREIGN KEY (hotel_id)
        REFERENCES hotel (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_receipt_order FOREIGN KEY (hotel_id, order_id)
        REFERENCES pos_order (hotel_id, id) ON DELETE CASCADE;

INSERT INTO business_id_sequence (id_prefix, last_value)
SELECT id_prefix, MAX(sequence_value)
  FROM business_id_map
 GROUP BY id_prefix
ON CONFLICT (id_prefix) DO UPDATE
    SET last_value = GREATEST(business_id_sequence.last_value, EXCLUDED.last_value);
