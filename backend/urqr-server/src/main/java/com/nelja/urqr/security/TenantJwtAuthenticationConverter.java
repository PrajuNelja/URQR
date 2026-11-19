package com.nelja.urqr.security;

import com.nelja.urqr.access.role.RoleRepository;
import com.nelja.urqr.access.user.StaffUserRepository;
import com.nelja.urqr.hotel.HotelRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class TenantJwtAuthenticationConverter implements Converter<Jwt,JwtAuthenticationToken> {
    private final StaffUserRepository users;
    private final RoleRepository roles;
    private final HotelRepository hotels;
    private final String platformAdminUsername;
    public TenantJwtAuthenticationConverter(StaffUserRepository users,RoleRepository roles,HotelRepository hotels,
            @Value("${app.platform-admin.username:}") String platformAdminUsername){this.users=users;this.roles=roles;this.hotels=hotels;this.platformAdminUsername=platformAdminUsername;}
    @Override public JwtAuthenticationToken convert(Jwt jwt){
        try {
            if("PLATFORM_ADMIN".equals(jwt.getClaimAsString("principal_type"))) {
                if(platformAdminUsername==null || platformAdminUsername.isBlank() || jwt.getSubject()==null
                        || !java.security.MessageDigest.isEqual(
                                platformAdminUsername.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                                jwt.getSubject().getBytes(java.nio.charset.StandardCharsets.UTF_8))) {
                    throw new BadCredentialsException("Invalid platform administrator identity");
                }
                return new JwtAuthenticationToken(jwt,List.of(new SimpleGrantedAuthority("ROLE_PLATFORM_ADMIN")),jwt.getSubject());
            }
            UUID hotel=UUID.fromString(jwt.getClaimAsString("hotel_id")); UUID userId=UUID.fromString(jwt.getClaimAsString("uid"));
            if(hotels.findByIdAndStatus(hotel,"ACTIVE").isEmpty())throw new BadCredentialsException("Inactive tenant");
            var user=users.findByIdAndHotelId(userId,hotel).filter(u->u.isActive()).orElseThrow(()->new BadCredentialsException("Inactive user"));
            var role=roles.findByIdAndHotelId(user.getRoleId(),hotel).orElseThrow(()->new BadCredentialsException("Invalid role"));
            return new JwtAuthenticationToken(jwt,List.of(new SimpleGrantedAuthority("ROLE_"+role.getName())),user.getUsername());
        } catch(RuntimeException e) { throw new BadCredentialsException("Invalid tenant identity",e); }
    }
}
