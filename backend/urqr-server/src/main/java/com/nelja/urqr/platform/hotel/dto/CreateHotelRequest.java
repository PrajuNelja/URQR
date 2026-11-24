package com.nelja.urqr.platform.hotel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalTime;
import java.util.Map;

/** Hotel configuration and the first Manager account created by the platform operator. */
public record CreateHotelRequest(
        @NotBlank @Size(max = 160) String hotelName,
        @NotBlank @Size(min = 3, max = 3) String currency,
        @NotBlank String timezone,
        @NotNull LocalTime dayCutoff,
        Map<String, Object> receiptDetails,
        @NotBlank @Size(max = 160) String managerUsername,
        @NotBlank @Size(min = 12, max = 72) String managerPassword) {}
