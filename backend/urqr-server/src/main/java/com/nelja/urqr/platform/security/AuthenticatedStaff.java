package com.nelja.urqr.platform.security;

import java.util.UUID;

public interface AuthenticatedStaff {
    UUID staffId();
    UUID hotelId();
    String username();
    String role();
}
