package com.nelja.urqr.auth.security;

import com.nelja.urqr.auth.access.role.RoleRepository;
import com.nelja.urqr.auth.access.user.StaffUserRepository;
import com.nelja.urqr.auth.hotel.HotelRepository;
import java.util.UUID;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Loads role state from PostgreSQL on Redis cache misses, with hotel RLS bound on the same transaction. */
@Service
public class StaffAuthorizationLookup {

    private final HotelRepository hotels;
    private final StaffUserRepository users;
    private final RoleRepository roles;
    private final HotelRlsContext rlsContext;

    public StaffAuthorizationLookup(HotelRepository hotels, StaffUserRepository users, RoleRepository roles,
            HotelRlsContext rlsContext) {
        this.hotels = hotels;
        this.users = users;
        this.roles = roles;
        this.rlsContext = rlsContext;
    }

    @Transactional(readOnly = true)
    public String findActiveRole(UUID hotelId, UUID userId) {
        // JWT authentication runs before controller transactions, so bind RLS in this lookup transaction.
        rlsContext.bindHotel(hotelId);
        if (hotels.findByIdAndStatus(hotelId, "ACTIVE").isEmpty()) {
            throw new BadCredentialsException("Inactive hotel");
        }
        var user = users.findByIdAndHotelId(userId, hotelId).filter(account -> account.isActive())
                .orElseThrow(() -> new BadCredentialsException("Inactive user"));
        return roles.findByIdAndHotelId(user.getRoleId(), hotelId)
                .map(role -> role.getName())
                .orElseThrow(() -> new BadCredentialsException("Invalid role"));
    }
}
