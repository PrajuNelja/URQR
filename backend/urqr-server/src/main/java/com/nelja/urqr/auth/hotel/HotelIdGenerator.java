package com.nelja.urqr.auth.hotel;

import java.text.Normalizer;
import java.util.Locale;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

/** Generates the primary hotel ID in the format NAME3 + COUNTRY2 + STATE + SEQUENCE. */
@Service
public class HotelIdGenerator {

    private static final String NEXT_VALUE_SQL = """
            INSERT INTO hotel_id_sequence (name_prefix, country_code, state_code, last_value)
            VALUES (?, ?, ?, 1)
            ON CONFLICT (name_prefix, country_code, state_code)
            DO UPDATE SET last_value = hotel_id_sequence.last_value + 1
            RETURNING last_value
            """;

    private final JdbcTemplate jdbcTemplate;

    public HotelIdGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String nextId(String hotelName, String countryCode, String stateCode) {
        String prefix = namePrefix(hotelName);
        String country = normalizeCountryCode(countryCode);
        String state = normalizeStateCode(stateCode);
        Long sequence = jdbcTemplate.queryForObject(NEXT_VALUE_SQL, Long.class, prefix, country, state);
        if (sequence == null || sequence < 1) {
            throw new IllegalStateException("Could not allocate a hotel ID");
        }
        return prefix + country + state + String.format(Locale.ROOT, "%04d", sequence);
    }

    private static String namePrefix(String hotelName) {
        if (hotelName == null || hotelName.isBlank()) {
            throw new IllegalArgumentException("Hotel name is required to generate a hotel ID");
        }
        String letters = Normalizer.normalize(hotelName, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase(Locale.ROOT)
                .replaceAll("[^A-Z]", "");
        if (letters.length() < 3) {
            throw new IllegalArgumentException("Hotel name must contain at least three letters to generate a hotel ID");
        }
        return letters.substring(0, 3);
    }

    private static String normalizeCountryCode(String countryCode) {
        String normalized = countryCode == null ? "" : countryCode.trim().toUpperCase(Locale.ROOT);
        if (!normalized.matches("[A-Z]{2}")) {
            throw new IllegalArgumentException("Country code must contain two letters");
        }
        return normalized;
    }

    private static String normalizeStateCode(String stateCode) {
        String normalized = stateCode == null ? "" : stateCode.trim().toUpperCase(Locale.ROOT);
        if (!normalized.matches("[A-Z0-9]{1,8}")) {
            throw new IllegalArgumentException("State code must contain 1 to 8 letters or digits");
        }
        return normalized;
    }
}
