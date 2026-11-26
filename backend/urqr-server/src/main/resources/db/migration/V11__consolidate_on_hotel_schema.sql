-- Move the durable outbox to the hotel-owned schema before removing tenants.
DROP POLICY IF EXISTS tenant_isolation ON outbox_events;
ALTER TABLE outbox_events DROP CONSTRAINT IF EXISTS outbox_events_tenant_id_fkey;
ALTER TABLE outbox_events DROP CONSTRAINT IF EXISTS uq_outbox_tenant_event;
DROP INDEX IF EXISTS idx_outbox_due;

ALTER TABLE outbox_events RENAME COLUMN tenant_id TO hotel_id;
ALTER TABLE outbox_events
    ADD CONSTRAINT fk_outbox_events_hotel
        FOREIGN KEY (hotel_id) REFERENCES hotel (id) ON DELETE CASCADE,
    ADD CONSTRAINT uq_outbox_hotel_event UNIQUE (hotel_id, event_id);

CREATE INDEX idx_outbox_hotel_due
    ON outbox_events (hotel_id, next_attempt_at, created_at)
    WHERE state IN ('PENDING', 'PROCESSING');

-- All hotel-owned tables now use the same RLS key as the data model.
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'hotel_role', 'staff_user', 'audit_record', 'menu_category', 'menu_item',
        'pos_order', 'order_item', 'payment', 'receipt', 'outbox_events'
    ] LOOP
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', table_name);
        EXECUTE format('DROP POLICY IF EXISTS hotel_isolation ON %I', table_name);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', table_name || '_tenant_isolation', table_name);
        EXECUTE format(
            'CREATE POLICY hotel_isolation ON %I USING '
            || '(hotel_id = NULLIF(current_setting(''app.hotel_id'', true), '''')::uuid '
            || 'OR current_setting(''app.platform_admin'', true) = ''true'') WITH CHECK '
            || '(hotel_id = NULLIF(current_setting(''app.hotel_id'', true), '''')::uuid '
            || 'OR current_setting(''app.platform_admin'', true) = ''true'')',
            table_name
        );
    END LOOP;
END;
$$;

-- Keep the reserved UUID guard while removing the old tenant-named constraint.
ALTER TABLE hotel DROP CONSTRAINT IF EXISTS ck_hotel_id_not_empty_tenant;
ALTER TABLE hotel ADD CONSTRAINT ck_hotel_id_not_empty
    CHECK (id <> '00000000-0000-0000-0000-000000000000');

-- These were the unused generic tenant auth and billing tables. Hotel staff,
-- menu, POS orders, payments, receipts, and the outbox remain the live model.
DROP TABLE IF EXISTS product_tax_rates;
DROP TABLE IF EXISTS prices;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS tax_rates;
DROP TABLE IF EXISTS credentials;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS tenants;

DROP FUNCTION IF EXISTS maintain_audit_timestamps();
