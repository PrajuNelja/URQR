package com.nelja.urqr.auth.security;

public interface AuthenticatedStaff {
    String staffId();
    String hotelId();
    String username();
    String role();
}
