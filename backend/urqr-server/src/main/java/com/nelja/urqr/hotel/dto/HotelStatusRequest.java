package com.nelja.urqr.hotel.dto;

import jakarta.validation.constraints.NotNull;

public record HotelStatusRequest(@NotNull Boolean active) {
}
