package com.nelja.urqr.auth.hotel.dto;

import jakarta.validation.constraints.NotNull;

public record HotelStatusRequest(@NotNull Boolean active) {
}
