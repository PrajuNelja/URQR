package com.nelja.urqr.auth.hotel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
        @NotBlank @Size(min = 8, max = 72) String managerPassword,
        @NotBlank @Pattern(regexp = "[A-Za-z]{2}", message = "Country code must contain two letters")
        @Schema(description = "ISO 3166-1 alpha-2 country code used in hotelId")
        String countryCode,
        @NotBlank @Pattern(regexp = "[A-Za-z0-9]{1,8}", message = "State code must contain 1 to 8 letters or digits")
        @Schema(description = "State or region code used in hotelId")
        String stateCode) {}
