package com.nelja.urqr.auth.security;

import java.util.UUID;

public interface AuthenticatedStaff {
    UUID staffId();
    String hotelId();
    String username();
    String role();
}
