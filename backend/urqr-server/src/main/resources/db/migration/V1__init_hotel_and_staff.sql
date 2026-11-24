-- V1__init_hotel_and_staff.sql
-- Baseline Flyway migration matching JPA entities: Hotel, Role, StaffUser, MenuCategory, MenuItem, PosOrder, OrderItem, Payment, Receipt

CREATE TABLE IF NOT EXISTS hotel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(160) NOT NULL,
    slug VARCHAR(80) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_hotel_name UNIQUE (name),
    CONSTRAINT uk_hotel_slug UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS hotel_role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL,
    name VARCHAR(80) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_role_hotel_name UNIQUE (hotel_id, name),
    CONSTRAINT uk_role_hotel_id UNIQUE (hotel_id, id),
    CONSTRAINT fk_role_hotel FOREIGN KEY (hotel_id) REFERENCES hotel (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS staff_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(160) NOT NULL,
    role_id UUID NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_hotel_username UNIQUE (hotel_id, username),
    CONSTRAINT uk_user_hotel_id UNIQUE (hotel_id, id),
    CONSTRAINT fk_user_hotel FOREIGN KEY (hotel_id) REFERENCES hotel (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES hotel_role (id)
);

CREATE INDEX IF NOT EXISTS ix_user_hotel_role_status ON staff_user (hotel_id, role_id, status);

CREATE TABLE IF NOT EXISTS menu_category (
    id BIGSERIAL PRIMARY KEY,
    hotel_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_category_hotel_name UNIQUE (hotel_id, name),
    CONSTRAINT fk_category_hotel FOREIGN KEY (hotel_id) REFERENCES hotel (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS menu_item (
    id BIGSERIAL PRIMARY KEY,
    hotel_id UUID NOT NULL,
    category_id BIGINT NOT NULL,
    name VARCHAR(160) NOT NULL,
    description VARCHAR(500),
    price NUMERIC(10, 2) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_item_hotel FOREIGN KEY (hotel_id) REFERENCES hotel (id) ON DELETE CASCADE,
    CONSTRAINT fk_item_category FOREIGN KEY (category_id) REFERENCES menu_category (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pos_order (
    id BIGSERIAL PRIMARY KEY,
    hotel_id UUID NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PAID',
    payment_method VARCHAR(30) NOT NULL DEFAULT 'CASH',
    order_note VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_order_hotel_number UNIQUE (hotel_id, order_number),
    CONSTRAINT fk_order_hotel FOREIGN KEY (hotel_id) REFERENCES hotel (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_item (
    id BIGSERIAL PRIMARY KEY,
    hotel_id UUID NOT NULL,
    order_id BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES pos_order (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_hotel FOREIGN KEY (hotel_id) REFERENCES hotel (id) ON DELETE CASCADE
);
