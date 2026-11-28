package com.nelja.urqr.common.id;

import java.text.Normalizer;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

/** Allocates readable, globally unique business IDs using an atomic database counter. */
@Service
public class BusinessIdGenerator {

    private static final DateTimeFormatter UTC_DATE = DateTimeFormatter.ofPattern("yyyyMMdd", Locale.ROOT)
            .withZone(ZoneOffset.UTC);
    private static final String NEXT_VALUE_SQL = """
            INSERT INTO business_id_sequence (id_prefix, last_value)
            VALUES (?, 1)
            ON CONFLICT (id_prefix)
            DO UPDATE SET last_value = business_id_sequence.last_value + 1
            RETURNING last_value
            """;

    private final JdbcTemplate jdbc;

    public BusinessIdGenerator(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public String nextStaffId(String hotelId, String roleName) {
        String rolePrefix = switch (roleName == null ? "" : roleName.trim().toUpperCase(Locale.ROOT)) {
            case "MANAGER" -> "MGR";
            case "CASHIER" -> "CSR";
            case "COOK" -> "COOK";
            case "WAITER" -> "WTR";
            default -> throw new IllegalArgumentException("Unsupported staff role for ID generation");
        };
        return next(rolePrefix + hotelPrefix(hotelId), 2);
    }

    public String nextCategoryId(String hotelId) {
        return next("CAT" + hotelPrefix(hotelId), 3);
    }

    public String nextMenuItemId(String hotelId, String categoryName) {
        return next(namePrefix(categoryName) + hotelPrefix(hotelId), 4);
    }

    public String nextOrderId(String hotelId) {
        String prefix = hotelPrefix(hotelId) + UTC_DATE.format(Instant.now());
        return next(prefix, 4);
    }

    public String nextOrderItemId(String hotelId) {
        return next("OI" + hotelPrefix(hotelId), 3);
    }

    public String nextAuditId(String hotelId) {
        String prefix = "ADT" + hotelPrefix(hotelId) + UTC_DATE.format(Instant.now());
        return next(prefix, 5);
    }

    public String nextPaymentId(String hotelId, Object method) {
        String methodName = method == null ? "PAY" : method.toString();
        String paymentType = methodName.replaceAll("[^A-Z0-9]", "");
        String prefix = paymentType + hotelPrefix(hotelId) + UTC_DATE.format(Instant.now());
        return next(prefix, 3);
    }

    public String nextReceiptId(String hotelId) {
        String prefix = "RPT" + hotelPrefix(hotelId) + UTC_DATE.format(Instant.now());
        return next(prefix, 3);
    }

    private String next(String prefix, int minimumDigits) {
        Long sequence = jdbc.queryForObject(NEXT_VALUE_SQL, Long.class, prefix);
        if (sequence == null || sequence < 1) {
            throw new IllegalStateException("Could not allocate a business ID");
        }
        return prefix + String.format(Locale.ROOT, "%0" + minimumDigits + "d", sequence);
    }

    private String hotelPrefix(String hotelId) {
        if (hotelId == null || hotelId.isBlank()) {
            throw new IllegalArgumentException("Hotel ID is required for ID generation");
        }
        String name = jdbc.query(
                "SELECT name FROM hotel WHERE id = ?",
                rs -> rs.next() ? rs.getString(1) : null,
                hotelId
        );
        if (name == null || name.isBlank()) {
            return namePrefix(hotelId);
        }
        return namePrefix(name);
    }

    private static String namePrefix(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("A name is required to generate an ID");
        }
        String letters = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase(Locale.ROOT)
                .replaceAll("[^A-Z]", "");
        return (letters + "XXX").substring(0, 3);
    }
}
