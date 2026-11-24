package com.nelja.urqr.platform.hotel.dto;

import jakarta.validation.constraints.NotNull;

public record HotelStatusRequest(@NotNull Boolean active) {
}
