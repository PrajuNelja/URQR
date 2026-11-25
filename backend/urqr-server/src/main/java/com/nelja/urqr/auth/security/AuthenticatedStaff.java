package com.nelja.urqr.auth.security;

import java.util.UUID;

public interface AuthenticatedStaff {
    UUID staffId();
    UUID hotelId();
    String username();
    String role();
}
