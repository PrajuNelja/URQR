-- Keep the existing MVC POS API, but make its schema and the custom outbox
-- reproducible from Flyway instead of depending on Hibernate ddl-auto=update.

CREATE TABLE IF NOT EXISTS hotel (
    id UUID PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    timezone VARCHAR(64) NOT NULL,
    day_cutoff TIME NOT NULL,
    status VARCHAR(24) NOT NULL,
    receipt_details JSONB,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS hotel_role (
    id UUID PRIMARY KEY,
    hotel_id UUID NOT NULL REFERENCES hotel (id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    CONSTRAINT uk_role_hotel_name UNIQUE (hotel_id, name),
    CONSTRAINT uk_role_hotel_id UNIQUE (hotel_id, id)
);

CREATE TABLE IF NOT EXISTS staff_user (
    id UUID PRIMARY KEY,
    hotel_id UUID NOT NULL REFERENCES hotel (id) ON DELETE CASCADE,
    username VARCHAR(160) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    role_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uk_user_hotel_username UNIQUE (hotel_id, username),
    CONSTRAINT uk_user_hotel_id UNIQUE (hotel_id, id),
    CONSTRAINT fk_staff_user_role FOREIGN KEY (hotel_id, role_id)
        REFERENCES hotel_role (hotel_id, id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS audit_record (
    id UUID PRIMARY KEY,
    hotel_id UUID NOT NULL REFERENCES hotel (id) ON DELETE CASCADE,
    user_id UUID,
    action VARCHAR(80) NOT NULL,
    entity VARCHAR(80) NOT NULL,
    entity_id VARCHAR(80),
    old_value VARCHAR(2000),
    new_value VARCHAR(2000),
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_audit_user_tenant FOREIGN KEY (hotel_id, user_id)
        REFERENCES staff_user (hotel_id, id) ON DELETE SET NULL (user_id)
);

CREATE TABLE IF NOT EXISTS menu_category (
    id UUID PRIMARY KEY,
    hotel_id UUID NOT NULL REFERENCES hotel (id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    active BOOLEAN NOT NULL,
    CONSTRAINT uk_category_hotel_name UNIQUE (hotel_id, name),
    CONSTRAINT uk_category_hotel_id UNIQUE (hotel_id, id)
);

CREATE TABLE IF NOT EXISTS menu_item (
    id UUID PRIMARY KEY,
    hotel_id UUID NOT NULL REFERENCES hotel (id) ON DELETE CASCADE,
    category_id UUID NOT NULL,
    name VARCHAR(160) NOT NULL,
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    available BOOLEAN NOT NULL,
    active BOOLEAN NOT NULL,
    CONSTRAINT uk_item_hotel_id UNIQUE (hotel_id, id),
    CONSTRAINT fk_menu_item_category FOREIGN KEY (hotel_id, category_id)
        REFERENCES menu_category (hotel_id, id) ON DELETE RESTRICT
);

-- Existing local databases may already have Hibernate-created tables. These
-- additive columns bring them forward without changing any applied migration.
ALTER TABLE menu_item ADD COLUMN IF NOT EXISTS cgst_rate NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE menu_item ADD COLUMN IF NOT EXISTS sgst_rate NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE menu_item ADD COLUMN IF NOT EXISTS vat_rate NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE menu_item ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS pos_order (
    id UUID PRIMARY KEY,
    hotel_id UUID NOT NULL REFERENCES hotel (id) ON DELETE CASCADE,
    order_number VARCHAR(40) NOT NULL,
    status VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_by UUID NOT NULL,
    cancel_reason VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uk_order_hotel_number UNIQUE (hotel_id, order_number),
    CONSTRAINT uk_order_hotel_id UNIQUE (hotel_id, id),
    CONSTRAINT fk_order_creator FOREIGN KEY (hotel_id, created_by)
        REFERENCES staff_user (hotel_id, id) ON DELETE RESTRICT
);

ALTER TABLE pos_order ADD COLUMN IF NOT EXISTS discount_total NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE pos_order ADD COLUMN IF NOT EXISTS tax_total NUMERIC(12,2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS order_item (
    id UUID PRIMARY KEY,
    hotel_id UUID NOT NULL REFERENCES hotel (id) ON DELETE CASCADE,
    order_id UUID NOT NULL,
    menu_item_id UUID NOT NULL,
    name_snapshot VARCHAR(160) NOT NULL,
    price_snapshot NUMERIC(12,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 999),
    line_total NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_order_item_order FOREIGN KEY (hotel_id, order_id)
        REFERENCES pos_order (hotel_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_menu FOREIGN KEY (hotel_id, menu_item_id)
        REFERENCES menu_item (hotel_id, id) ON DELETE RESTRICT
);

ALTER TABLE order_item ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE order_item ADD COLUMN IF NOT EXISTS tax_cgst NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE order_item ADD COLUMN IF NOT EXISTS tax_sgst NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE order_item ADD COLUMN IF NOT EXISTS tax_vat NUMERIC(12,2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS payment (
    id UUID PRIMARY KEY,
    hotel_id UUID NOT NULL REFERENCES hotel (id) ON DELETE CASCADE,
    order_id UUID NOT NULL,
    method VARCHAR(12) NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    reference_no VARCHAR(120),
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uk_payment_hotel_id UNIQUE (hotel_id, id),
    CONSTRAINT fk_payment_order FOREIGN KEY (hotel_id, order_id)
        REFERENCES pos_order (hotel_id, id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS receipt (
    id UUID PRIMARY KEY,
    hotel_id UUID NOT NULL REFERENCES hotel (id) ON DELETE CASCADE,
    order_id UUID NOT NULL UNIQUE,
    receipt_number VARCHAR(60) NOT NULL,
    snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uk_receipt_hotel_number UNIQUE (hotel_id, receipt_number),
    CONSTRAINT fk_receipt_order FOREIGN KEY (hotel_id, order_id)
        REFERENCES pos_order (hotel_id, id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS outbox_events (
    event_id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
    aggregate_type VARCHAR(80) NOT NULL,
    aggregate_id UUID NOT NULL,
    event_type VARCHAR(120) NOT NULL,
    payload JSONB NOT NULL,
    state VARCHAR(16) NOT NULL DEFAULT 'PENDING'
        CHECK (state IN ('PENDING', 'PROCESSING', 'DELIVERED', 'DEAD')),
    attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    locked_until TIMESTAMPTZ,
    last_error VARCHAR(2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    delivered_at TIMESTAMPTZ,
    CONSTRAINT uq_outbox_tenant_event UNIQUE (tenant_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_outbox_due
    ON outbox_events (tenant_id, next_attempt_at, created_at)
    WHERE state IN ('PENDING', 'PROCESSING');
CREATE INDEX IF NOT EXISTS idx_menu_category_hotel_active
    ON menu_category (hotel_id, active, name);
CREATE INDEX IF NOT EXISTS idx_menu_item_hotel_available
    ON menu_item (hotel_id, available, active, category_id);
CREATE INDEX IF NOT EXISTS idx_order_search
    ON pos_order (hotel_id, created_at DESC, status);
CREATE INDEX IF NOT EXISTS idx_order_search_status_created
    ON pos_order (hotel_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_item_by_order
    ON order_item (hotel_id, order_id, id);
CREATE INDEX IF NOT EXISTS idx_payment_by_order
    ON payment (hotel_id, order_id, created_at);
CREATE TRIGGER trg_outbox_events_updated_at
    BEFORE UPDATE ON outbox_events FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- The GUC is set transaction-locally from the verified hotel_id claim. The
-- platform-admin flag only grants access on authenticated admin operations.
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'hotel_role', 'staff_user', 'audit_record', 'menu_category', 'menu_item',
        'pos_order', 'order_item', 'payment', 'receipt'
    ] LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
        EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', table_name);
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', table_name);
        EXECUTE format(
            'CREATE POLICY tenant_isolation ON %I USING '
            || '(hotel_id = NULLIF(current_setting(''app.tenant_id'', true), '''')::uuid '
            || 'OR current_setting(''app.platform_admin'', true) = ''true'') WITH CHECK '
            || '(hotel_id = NULLIF(current_setting(''app.tenant_id'', true), '''')::uuid '
            || 'OR current_setting(''app.platform_admin'', true) = ''true'')',
            table_name
        );
    END LOOP;
END;
$$;

ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON outbox_events
    USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO urqr_app;
