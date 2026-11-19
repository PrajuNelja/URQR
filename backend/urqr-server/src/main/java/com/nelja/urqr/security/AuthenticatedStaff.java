package com.nelja.urqr.security;

import java.util.UUID;

public interface AuthenticatedStaff {
    UUID staffId();
    UUID hotelId();
    String username();
    String role();
}
