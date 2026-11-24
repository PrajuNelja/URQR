package com.nelja.urqr.platform.access.role;

import java.util.Locale;

/** The supported hotel staff roles and the capabilities assigned by the API. */
public enum HotelStaffRole {
    MANAGER,
    CASHIER,
    COOK,
    WAITER;

    public static String normalize(String name) {

        return name == null ? "" : name.trim().toUpperCase(Locale.ROOT);
    }

    public static boolean supports(String name) {
        try {
            valueOf(normalize(name));
            return true;
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    public static boolean managerCreatedRole(String name) {
        String normalized = normalize(name);
        return COOK.name().equals(normalized) || WAITER.name().equals(normalized);
    }
}
