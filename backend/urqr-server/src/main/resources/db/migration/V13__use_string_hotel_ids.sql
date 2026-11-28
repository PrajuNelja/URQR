-- Drop the public-code fields introduced in V12. The primary hotel ID itself
-- now carries the formatted value; V12 is kept unchanged for Flyway history.
DROP INDEX IF EXISTS uk_hotel_hotel_code;
ALTER TABLE hotel DROP CONSTRAINT IF EXISTS ck_hotel_public_code_location;
ALTER TABLE hotel DROP CONSTRAINT IF EXISTS ck_hotel_location_codes_together;
ALTER TABLE hotel DROP COLUMN IF EXISTS hotel_code;
ALTER TABLE hotel DROP COLUMN IF EXISTS country_code;
ALTER TABLE hotel DROP COLUMN IF EXISTS state_code;
DROP TABLE IF EXISTS hotel_code_sequence;

-- Existing UUID values are preserved in canonical text form so every existing
-- hotel and child record keeps the same identifier.
DO $$
DECLARE
    table_ref TEXT;
    policy_ref TEXT;
BEGIN
    FOREACH table_ref IN ARRAY ARRAY[
        'hotel_role', 'staff_user', 'audit_record', 'menu_category', 'menu_item',
        'pos_order', 'order_item', 'payment', 'receipt', 'outbox_events'
    ] LOOP
        FOR policy_ref IN
            SELECT policyname FROM pg_policies
            WHERE schemaname = current_schema() AND tablename = table_ref
        LOOP
            EXECUTE format('DROP POLICY %I ON %I', policy_ref, table_ref);
        END LOOP;
    END LOOP;
END;
$$;

ALTER TABLE hotel_role DROP CONSTRAINT IF EXISTS hotel_role_hotel_id_fkey;
ALTER TABLE staff_user DROP CONSTRAINT IF EXISTS staff_user_hotel_id_fkey;
ALTER TABLE staff_user DROP CONSTRAINT IF EXISTS fk_staff_user_role;
ALTER TABLE audit_record DROP CONSTRAINT IF EXISTS audit_record_hotel_id_fkey;
ALTER TABLE audit_record DROP CONSTRAINT IF EXISTS fk_audit_user_tenant;
ALTER TABLE menu_category DROP CONSTRAINT IF EXISTS menu_category_hotel_id_fkey;
ALTER TABLE menu_item DROP CONSTRAINT IF EXISTS menu_item_hotel_id_fkey;
ALTER TABLE menu_item DROP CONSTRAINT IF EXISTS fk_menu_item_category;
ALTER TABLE pos_order DROP CONSTRAINT IF EXISTS pos_order_hotel_id_fkey;
ALTER TABLE pos_order DROP CONSTRAINT IF EXISTS fk_order_creator;
ALTER TABLE order_item DROP CONSTRAINT IF EXISTS order_item_hotel_id_fkey;
ALTER TABLE order_item DROP CONSTRAINT IF EXISTS fk_order_item_order;
ALTER TABLE order_item DROP CONSTRAINT IF EXISTS fk_order_item_menu;
ALTER TABLE payment DROP CONSTRAINT IF EXISTS payment_hotel_id_fkey;
ALTER TABLE payment DROP CONSTRAINT IF EXISTS fk_payment_order;
ALTER TABLE receipt DROP CONSTRAINT IF EXISTS receipt_hotel_id_fkey;
ALTER TABLE receipt DROP CONSTRAINT IF EXISTS fk_receipt_order;
ALTER TABLE outbox_events DROP CONSTRAINT IF EXISTS fk_outbox_events_hotel;
ALTER TABLE outbox_events DROP CONSTRAINT IF EXISTS outbox_events_hotel_id_fkey;

-- Hibernate may have generated names for these keys that differ from the
-- explicit names above. Drop every FK touching an affected table before
-- changing hotel_id types; all intended tenant FKs are recreated below.
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
                  'hotel_role'::regclass, 'staff_user'::regclass,
                  'audit_record'::regclass, 'menu_category'::regclass,
                  'menu_item'::regclass, 'pos_order'::regclass,
                  'order_item'::regclass, 'payment'::regclass,
                  'receipt'::regclass, 'outbox_events'::regclass
              )
              OR c.confrelid IN (
                  'hotel_role'::regclass, 'staff_user'::regclass,
                  'audit_record'::regclass, 'menu_category'::regclass,
                  'menu_item'::regclass, 'pos_order'::regclass,
                  'order_item'::regclass, 'payment'::regclass,
                  'receipt'::regclass, 'outbox_events'::regclass
              )
          )
    LOOP
        EXECUTE format(
            'ALTER TABLE %s DROP CONSTRAINT %I',
            constraint_ref.table_ref,
            constraint_ref.conname
        );
    END LOOP;
END;
$$;

ALTER TABLE hotel DROP CONSTRAINT IF EXISTS ck_hotel_id_not_empty;
ALTER TABLE hotel ALTER COLUMN id TYPE VARCHAR(64) USING id::text;
ALTER TABLE hotel_role ALTER COLUMN hotel_id TYPE VARCHAR(64) USING hotel_id::text;
ALTER TABLE staff_user ALTER COLUMN hotel_id TYPE VARCHAR(64) USING hotel_id::text;
ALTER TABLE audit_record ALTER COLUMN hotel_id TYPE VARCHAR(64) USING hotel_id::text;
ALTER TABLE menu_category ALTER COLUMN hotel_id TYPE VARCHAR(64) USING hotel_id::text;
ALTER TABLE menu_item ALTER COLUMN hotel_id TYPE VARCHAR(64) USING hotel_id::text;
ALTER TABLE pos_order ALTER COLUMN hotel_id TYPE VARCHAR(64) USING hotel_id::text;
ALTER TABLE order_item ALTER COLUMN hotel_id TYPE VARCHAR(64) USING hotel_id::text;
ALTER TABLE payment ALTER COLUMN hotel_id TYPE VARCHAR(64) USING hotel_id::text;
ALTER TABLE receipt ALTER COLUMN hotel_id TYPE VARCHAR(64) USING hotel_id::text;
ALTER TABLE outbox_events ALTER COLUMN hotel_id TYPE VARCHAR(64) USING hotel_id::text;
ALTER TABLE hotel ADD CONSTRAINT ck_hotel_id_not_empty
    CHECK (id <> '00000000-0000-0000-0000-000000000000');

ALTER TABLE hotel_role
    ADD CONSTRAINT hotel_role_hotel_id_fkey FOREIGN KEY (hotel_id)
        REFERENCES hotel (id) ON DELETE CASCADE;
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
ALTER TABLE outbox_events
    ADD CONSTRAINT fk_outbox_events_hotel FOREIGN KEY (hotel_id)
        REFERENCES hotel (id) ON DELETE CASCADE;

CREATE TABLE hotel_id_sequence (
    name_prefix VARCHAR(3) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    state_code VARCHAR(8) NOT NULL,
    last_value BIGINT NOT NULL CHECK (last_value > 0),
    PRIMARY KEY (name_prefix, country_code, state_code)
);
GRANT SELECT, INSERT, UPDATE ON hotel_id_sequence TO urqr_app;

DO $$
DECLARE
    table_ref TEXT;
BEGIN
    FOREACH table_ref IN ARRAY ARRAY[
        'hotel_role', 'staff_user', 'audit_record', 'menu_category', 'menu_item',
        'pos_order', 'order_item', 'payment', 'receipt', 'outbox_events'
    ] LOOP
        EXECUTE format(
            'CREATE POLICY hotel_isolation ON %I USING '
            || '(hotel_id::text = NULLIF(current_setting(''app.hotel_id'', true), '''') '
            || 'OR current_setting(''app.platform_admin'', true) = ''true'') WITH CHECK '
            || '(hotel_id::text = NULLIF(current_setting(''app.hotel_id'', true), '''') '
            || 'OR current_setting(''app.platform_admin'', true) = ''true'')',
            table_ref
        );
    END LOOP;
END;
$$;
