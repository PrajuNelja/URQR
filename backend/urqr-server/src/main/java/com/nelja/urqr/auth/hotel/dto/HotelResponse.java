package com.nelja.urqr.auth.hotel.dto;

import com.nelja.urqr.auth.hotel.Hotel;
import java.time.Instant;
import java.time.LocalTime;

public record HotelResponse(String id, String name, String currencyCode, String timezone,
        LocalTime dayCutoff, java.util.Map<String,Object> receiptDetails, String status, Instant createdAt) {
    public static HotelResponse from(Hotel hotel) {
        return new HotelResponse(hotel.getId(), hotel.getName(), hotel.getCurrencyCode(),
                hotel.getTimezone(), hotel.getDayCutoff(), hotel.getReceiptDetails(), hotel.getStatus(),
                hotel.getCreatedAt());
    }
}
