package com.nelja.urqr.auth.security;

import com.nelja.urqr.auth.access.user.StaffUserRepository;
import com.nelja.urqr.auth.access.role.RoleRepository;
import java.util.UUID;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private final StaffUserRepository users;
    private final RoleRepository roles;
    private final TenantRlsContext rls;

    public UserDetailsServiceImpl(StaffUserRepository users, RoleRepository roles, TenantRlsContext rls) {
        this.users = users;
        this.roles = roles;
        this.rls = rls;
    }

    @Override @Transactional(readOnly = true) public UserDetails loadUserByUsername(String username) {
        int separator=username.indexOf(':');
        if(separator<1) throw new UsernameNotFoundException("Invalid credentials");
        UUID hotelId;
        try { hotelId=UUID.fromString(username.substring(0,separator)); }
        catch (IllegalArgumentException ex) { throw new UsernameNotFoundException("Invalid credentials"); }
        rls.bindTenant(hotelId);
        String staffName=username.substring(separator+1);
        var user=users.findByHotelIdAndUsername(hotelId,staffName)
                .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
        var role=roles.findByIdAndHotelId(user.getRoleId(),hotelId)
                .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
        return StaffPrincipal.from(user,role.getName());
    }
}
