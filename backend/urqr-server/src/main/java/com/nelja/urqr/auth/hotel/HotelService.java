package com.nelja.urqr.auth.hotel;

import com.nelja.urqr.auth.hotel.dto.HotelResponse;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalTime;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HotelService {
    private final HotelRepository hotels;

    public HotelService(HotelRepository hotels) {
        this.hotels = hotels;
    }

    public HotelResponse getCurrentHotel(UUID authenticatedHotelId) {
        return hotels.findByIdAndStatus(authenticatedHotelId, "ACTIVE")
                .map(HotelResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel not found"));
    }

    @Transactional public HotelResponse update(UUID hotelId,String name,String currency,String timezone,LocalTime cutoff,Map<String,Object> receiptDetails){
        Hotel hotel=hotels.findById(hotelId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Hotel not found"));
        try{hotel.update(name,currency,timezone,cutoff,receiptDetails);}catch(RuntimeException e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid hotel configuration");}
        return HotelResponse.from(hotels.save(hotel));
    }
}
