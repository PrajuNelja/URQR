package com.nelja.urqr.auth.hotel.dto;

import java.util.UUID;

/** Safe provisioning result; passwords are never returned. */
public record CreateHotelResponse(UUID hotelId, UUID managerUserId, String managerUsername) {}
