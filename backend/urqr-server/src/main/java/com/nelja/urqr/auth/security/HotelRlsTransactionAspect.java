package com.nelja.urqr.auth.security;

import java.util.Collection;
import java.util.UUID;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

/** Runs inside the transaction advice so SET LOCAL applies to the transaction's connection. */
@Aspect
@Component
@Order(Ordered.LOWEST_PRECEDENCE - 1)
public class HotelRlsTransactionAspect {

    private final HotelRlsContext rlsContext;

    public HotelRlsTransactionAspect(HotelRlsContext rlsContext) {
        this.rlsContext = rlsContext;
    }

    @Around("@annotation(org.springframework.transaction.annotation.Transactional) "
            + "|| @within(org.springframework.transaction.annotation.Transactional)")
    public Object bindRlsContext(ProceedingJoinPoint invocation) throws Throwable {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwt && authentication.isAuthenticated()) {
            Object roles = jwt.getToken().getClaims().get("roles");
            if (roles instanceof Collection<?> values && values.stream().anyMatch("PLATFORM_ADMIN"::equals)) {
                rlsContext.allowPlatformAdministration();
            } else {
                String hotelClaim = jwt.getToken().getClaimAsString("hotel_id");
                if (hotelClaim != null && !hotelClaim.isBlank()) {
                    rlsContext.bindHotel(UUID.fromString(hotelClaim));
                }
            }
        }
        return invocation.proceed();
    }
}
