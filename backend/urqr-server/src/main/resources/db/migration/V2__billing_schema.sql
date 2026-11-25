-- V2: billing schema — catalog + orders + payments, all NUMERIC money,
-- all tenant-owned tables protected by FORCE ROW LEVEL SECURITY.

-- V1 deliberately has its own immutable-created_at trigger function.
-- Billing rows need the same created_at guarantee plus updated_at maintenance.
CREATE FUNCTION set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.created_at := OLD.created_at;
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------

CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID         NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
    parent_id   UUID,
    name        VARCHAR(150) NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_categories_tenant_name UNIQUE (tenant_id, name),
    CONSTRAINT uq_categories_tenant_id UNIQUE (tenant_id, id),
    CONSTRAINT fk_categories_parent_tenant FOREIGN KEY (tenant_id, parent_id)
        REFERENCES categories (tenant_id, id) ON DELETE SET NULL (parent_id)
);

CREATE TABLE products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID         NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
    category_id UUID,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    sku         VARCHAR(100),
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_products_tenant_id UNIQUE (tenant_id, id),
    CONSTRAINT fk_products_category_tenant FOREIGN KEY (tenant_id, category_id)
        REFERENCES categories (tenant_id, id) ON DELETE SET NULL (category_id)
);

-- One active price per product, enforced by partial unique index.
-- Price history is kept by flipping is_active, never by deleting.
CREATE TABLE prices (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID          NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
    product_id  UUID          NOT NULL,
    amount      NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    currency    CHAR(3)       NOT NULL DEFAULT 'INR',
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT uq_prices_tenant_id UNIQUE (tenant_id, id),
    CONSTRAINT fk_prices_product_tenant FOREIGN KEY (tenant_id, product_id)
        REFERENCES products (tenant_id, id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX uq_prices_one_active ON prices (product_id) WHERE is_active;

-- Tax components: CGST 9%, SGST 9%, VAT 5%, etc. Rate is a percentage.
CREATE TABLE tax_rates (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID          NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
    code          VARCHAR(50)   NOT NULL,
    name          VARCHAR(100)  NOT NULL,
    rate_percent  NUMERIC(5,2)  NOT NULL CHECK (rate_percent >= 0),
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT uq_tax_rates_tenant_code UNIQUE (tenant_id, code),
    CONSTRAINT uq_tax_rates_tenant_id UNIQUE (tenant_id, id)
);

-- Many-to-many: a product can carry several tax components (e.g. CGST + SGST)
CREATE TABLE product_tax_rates (
    tenant_id     UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
    product_id    UUID NOT NULL,
    tax_rate_id   UUID NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (tenant_id, product_id, tax_rate_id),
    CONSTRAINT fk_product_tax_rates_product_tenant FOREIGN KEY (tenant_id, product_id)
        REFERENCES products (tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_product_tax_rates_rate_tenant FOREIGN KEY (tenant_id, tax_rate_id)
        REFERENCES tax_rates (tenant_id, id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------

CREATE TABLE orders (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID          NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
    cashier_id    UUID,
    status        VARCHAR(20)   NOT NULL DEFAULT 'COMPLETED'
                  CHECK (status IN ('COMPLETED', 'CANCELLED', 'REFUNDED')),
    currency      CHAR(3)       NOT NULL DEFAULT 'INR',
    subtotal      NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    discount_total NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_total >= 0),
    tax_total     NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (tax_total >= 0),
    grand_total   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (grand_total >= 0),
    notes         TEXT,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT uq_orders_tenant_id UNIQUE (tenant_id, id),
    CONSTRAINT fk_orders_cashier_tenant FOREIGN KEY (tenant_id, cashier_id)
        REFERENCES users (tenant_id, id) ON DELETE SET NULL (cashier_id)
);

CREATE TABLE order_items (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id      UUID          NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
    order_id       UUID          NOT NULL,
    product_id     UUID,
    product_name   VARCHAR(200)  NOT NULL,          -- snapshot: survives product renames/deletes
    quantity       INTEGER       NOT NULL CHECK (quantity > 0),
    unit_price     NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_cgst       NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_sgst       NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_vat        NUMERIC(12,2) NOT NULL DEFAULT 0,
    line_total     NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT fk_order_items_order_tenant FOREIGN KEY (tenant_id, order_id)
        REFERENCES orders (tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product_tenant FOREIGN KEY (tenant_id, product_id)
        REFERENCES products (tenant_id, id) ON DELETE SET NULL (product_id)
);

CREATE TABLE payments (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id      UUID          NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
    order_id       UUID          NOT NULL,
    method         VARCHAR(30)   NOT NULL,          -- CASH, CARD, UPI, WALLET...
    amount         NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    status         VARCHAR(20)   NOT NULL DEFAULT 'COMPLETED'
                   CHECK (status IN ('COMPLETED', 'FAILED', 'REFUNDED')),
    transaction_ref VARCHAR(100),
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT fk_payments_order_tenant FOREIGN KEY (tenant_id, order_id)
        REFERENCES orders (tenant_id, id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- Indexes — every tenant_id lookup + hot query paths
-- ---------------------------------------------------------------------------

CREATE INDEX idx_categories_tenant_id   ON categories (tenant_id);
CREATE INDEX idx_products_tenant_cat    ON products (tenant_id, category_id);
CREATE INDEX idx_prices_tenant_product  ON prices (tenant_id, product_id) WHERE is_active;
CREATE INDEX idx_tax_rates_tenant_id    ON tax_rates (tenant_id);
CREATE INDEX idx_ptr_product            ON product_tax_rates (tenant_id, product_id);
CREATE INDEX idx_orders_tenant_created  ON orders (tenant_id, created_at DESC);
CREATE INDEX idx_order_items_order      ON order_items (order_id);
CREATE INDEX idx_order_items_tenant     ON order_items (tenant_id, order_id);
CREATE INDEX idx_payments_order         ON payments (order_id);
CREATE INDEX idx_payments_tenant        ON payments (tenant_id, order_id);

-- ---------------------------------------------------------------------------
-- Row-Level Security: tenant isolation enforced by the database itself.
-- current_setting('app.tenant_id', true) returns NULL when unset ->
-- comparisons yield NULL -> zero rows visible / inserts rejected.
-- ---------------------------------------------------------------------------

ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices            ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates         ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;

-- FORCE makes even the table owner subject to the policies
ALTER TABLE categories        FORCE ROW LEVEL SECURITY;
ALTER TABLE products          FORCE ROW LEVEL SECURITY;
ALTER TABLE prices            FORCE ROW LEVEL SECURITY;
ALTER TABLE tax_rates         FORCE ROW LEVEL SECURITY;
ALTER TABLE product_tax_rates FORCE ROW LEVEL SECURITY;
ALTER TABLE orders            FORCE ROW LEVEL SECURITY;
ALTER TABLE order_items       FORCE ROW LEVEL SECURITY;
ALTER TABLE payments          FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON categories
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON products
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON prices
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON tax_rates
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON product_tax_rates
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON orders
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON order_items
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON payments
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- Every update keeps created_at immutable and refreshes updated_at.
CREATE TRIGGER trg_categories_updated_at     BEFORE UPDATE ON categories     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated_at       BEFORE UPDATE ON products       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_prices_updated_at         BEFORE UPDATE ON prices         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tax_rates_updated_at      BEFORE UPDATE ON tax_rates      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated_at         BEFORE UPDATE ON orders         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_payments_updated_at       BEFORE UPDATE ON payments       FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Non-owner application role. The app must NOT connect as the table owner:
-- RLS policies (and FORCE) only protect non-privileged roles in practice.
-- Flyway keeps using the owner credentials via spring.flyway.user.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'urqr_app') THEN
        EXECUTE format(
            'CREATE ROLE urqr_app LOGIN PASSWORD %L NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE',
            '${appDbPassword}'
        );
    ELSE
        EXECUTE format(
            'ALTER ROLE urqr_app LOGIN PASSWORD %L NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE',
            '${appDbPassword}'
        );
    END IF;
END $$;

GRANT USAGE ON SCHEMA public TO urqr_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO urqr_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO urqr_app;

-- Tables/sequences created by FUTURE migrations (run as the migration user)
-- are auto-granted to urqr_app
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO urqr_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO urqr_app;
