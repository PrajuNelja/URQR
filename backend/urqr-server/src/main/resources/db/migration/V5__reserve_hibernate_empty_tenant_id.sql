-- Hibernate needs a non-null startup identifier before any request has a tenant.
-- Reserve UUID zero so this fallback can never identify a real tenant or hotel.
ALTER TABLE tenants
    ADD CONSTRAINT ck_tenants_id_not_empty_tenant
    CHECK (id <> '00000000-0000-0000-0000-000000000000');

ALTER TABLE hotel
    ADD CONSTRAINT ck_hotel_id_not_empty_tenant
    CHECK (id <> '00000000-0000-0000-0000-000000000000');
