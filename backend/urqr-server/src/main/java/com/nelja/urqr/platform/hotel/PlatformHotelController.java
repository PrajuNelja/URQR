package com.nelja.urqr.platform.hotel;

import com.nelja.urqr.platform.access.role.Role;
import com.nelja.urqr.platform.access.role.RoleRepository;
import com.nelja.urqr.platform.access.user.StaffUser;
import com.nelja.urqr.platform.access.user.StaffUserRepository;
import com.nelja.urqr.platform.audit.AuditService;
import com.nelja.urqr.platform.security.RedisAuthStateService;
import com.nelja.urqr.platform.hotel.dto.CreateHotelRequest;
import com.nelja.urqr.platform.hotel.dto.CreateHotelResponse;
import com.nelja.urqr.platform.hotel.dto.HotelResponse;
import com.nelja.urqr.platform.hotel.dto.HotelStatusRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Tenant provisioning is restricted to the separately authenticated platform administrator. */
@RestController
@RequestMapping("/api/v1/platform/hotels")
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class PlatformHotelController {
    private final HotelRepository hotels;
    private final RoleRepository roles;
    private final StaffUserRepository users;
    private final PasswordEncoder encoder;
    private final AuditService audit;
    private final RedisAuthStateService authState;

    public PlatformHotelController(HotelRepository hotels, RoleRepository roles, StaffUserRepository users,
            PasswordEncoder encoder, AuditService audit, RedisAuthStateService authState) {
        this.hotels = hotels;
        this.roles = roles;
        this.users = users;
        this.encoder = encoder;
        this.audit = audit;
        this.authState = authState;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    @Operation(summary = "Create a hotel tenant and its first Manager account")
    public CreateHotelResponse create(@Valid @RequestBody CreateHotelRequest request) {
        Hotel hotel = hotels.save(Hotel.create(request.hotelName(), request.currency(), request.timezone(),
                request.dayCutoff(), request.receiptDetails()));
        Role manager = roles.save(new Role(hotel.getId(), "MANAGER"));
        roles.save(new Role(hotel.getId(), "CASHIER"));
        StaffUser managerUser = users.save(new StaffUser(hotel.getId(), manager.getId(),
                request.managerUsername().trim(), encoder.encode(request.managerPassword())));
        audit.recordSystem(hotel.getId(), "HOTEL_PROVISIONED", "Hotel", hotel.getId().toString(),
                "Platform administrator provisioned hotel and initial Manager");
        return new CreateHotelResponse(hotel.getId(), managerUser.getId(), managerUser.getUsername());
    }

    @GetMapping
    @Operation(summary = "List provisioned hotel tenants")
    public Page<HotelResponse> list(@PageableDefault(size = 20) Pageable pageable) {
        int page = Math.max(0, pageable.getPageNumber());
        int size = Math.max(1, Math.min(pageable.getPageSize(), 100));
        Pageable bounded = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return hotels.findAll(bounded).map(HotelResponse::from);
    }

    @PatchMapping("/{hotelId}/status")
    @Transactional
    @Operation(summary = "Activate or deactivate a hotel tenant")
    public HotelResponse status(@PathVariable UUID hotelId, @Valid @RequestBody HotelStatusRequest request) {
        Hotel hotel = hotels.findById(hotelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel not found"));
        String previousStatus = hotel.getStatus();
        hotel.setStatus(request.active() ? "ACTIVE" : "INACTIVE");
        hotels.save(hotel);
        authState.invalidateHotelAuthorization(hotelId);
        if (!request.active()) authState.revokeHotelTokens(hotelId);
        audit.recordSystem(hotelId, "HOTEL_STATUS_CHANGED", "Hotel", hotelId.toString(),
                previousStatus + " -> " + hotel.getStatus());
        return HotelResponse.from(hotel);
    }
}
