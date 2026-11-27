ALTER TABLE hotel
    ADD COLUMN country_code VARCHAR(2),
    ADD COLUMN state_code VARCHAR(8),
    ADD COLUMN hotel_code VARCHAR(64),
    ADD CONSTRAINT ck_hotel_location_codes_together
        CHECK ((country_code IS NULL) = (state_code IS NULL)),
    ADD CONSTRAINT ck_hotel_public_code_location
        CHECK (hotel_code IS NULL OR (country_code IS NOT NULL AND state_code IS NOT NULL));

CREATE UNIQUE INDEX uk_hotel_hotel_code
    ON hotel (hotel_code)
    WHERE hotel_code IS NOT NULL;

CREATE TABLE hotel_code_sequence (
    name_prefix VARCHAR(3) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    state_code VARCHAR(8) NOT NULL,
    last_value BIGINT NOT NULL CHECK (last_value > 0),
    PRIMARY KEY (name_prefix, country_code, state_code)
);

GRANT SELECT, INSERT, UPDATE ON hotel_code_sequence TO urqr_app;
