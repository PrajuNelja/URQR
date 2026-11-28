package com.nelja.urqr.auth.security;

import com.nelja.urqr.auth.access.user.StaffUser;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public record StaffPrincipal(UUID staffId, String hotelId, String username, String password,
        String role, boolean enabled) implements UserDetails, AuthenticatedStaff {
    public static StaffPrincipal from(StaffUser user, String roleName) {
        return new StaffPrincipal(user.getId(), user.getHotelId(), user.getUsername(),
                user.getPasswordHash(), roleName, user.isActive());
    }

    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }
    @Override public String getPassword() { return password; }
    @Override public String getUsername() { return username; }
    @Override public boolean isEnabled() { return enabled; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
}
