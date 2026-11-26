package com.nelja.urqr.auth.hotel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalTime;
import java.util.Map;

/** Hotel configuration and the first Manager account created by the platform operator. */
public record CreateHotelRequest(
        @NotBlank @Size(max = 160) String hotelName,
        @NotBlank @Size(min = 3, max = 3) String currency,
        @NotBlank String timezone,
        @NotNull LocalTime dayCutoff,
        Map<String, Object> receiptDetails,
        @NotBlank @jakarta.validation.constraints.Email @Size(max = 254)
        @Schema(description = "Email address used as the globally unique Manager login username") String managerUsername,
        @NotBlank @Size(min = 8, max = 72) String managerPassword) {}
