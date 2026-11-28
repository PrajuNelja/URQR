package com.nelja.urqr.auth.hotel.dto;

/** Safe provisioning result; passwords are never returned. */
public record CreateHotelResponse(String hotelId, String managerUserId, String managerUsername) {}
