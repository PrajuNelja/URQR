package com.nelja.urqr.auth.access.user;

import com.nelja.urqr.auth.access.role.Role;
import com.nelja.urqr.auth.access.role.RoleRepository;
import com.nelja.urqr.auth.audit.AuditService;
import com.nelja.urqr.auth.hotel.HotelRepository;
import com.nelja.urqr.auth.security.HotelRlsContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Allows the platform administrator to provision hotel-scoped Manager and Cashier accounts. */
@RestController
@RequestMapping("/api/v1/platform/hotels/{hotelId}/users")
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class PlatformHotelStaffController {

    private final HotelRepository hotels;
    private final RoleRepository roles;
    private final StaffUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final HotelRlsContext rlsContext;
    private final AuditService audit;

    public PlatformHotelStaffController(HotelRepository hotels, RoleRepository roles, StaffUserRepository users,
            PasswordEncoder passwordEncoder, HotelRlsContext rlsContext, AuditService audit) {
        this.hotels = hotels;
        this.roles = roles;
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.rlsContext = rlsContext;
        this.audit = audit;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    @Operation(summary = "Add a Manager or Cashier account to one active hotel")
    public PlatformStaffUserResponse create(@PathVariable String hotelId,
            @Valid @RequestBody CreatePlatformStaffUserRequest request) {
        hotels.findByIdAndStatus(hotelId, "ACTIVE")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Active hotel not found"));

        // This operation checks the shared login namespace, so allow its platform-admin RLS scope.
        rlsContext.allowPlatformAdministration();
        String username = request.username().trim().toLowerCase(java.util.Locale.ROOT);
        if (users.existsByUsernameIgnoreCase(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This email is already assigned to a staff login");
        }

        String roleName = request.role().name();
        Role role = roles.findByHotelIdAndName(hotelId, roleName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT,
                        "The requested hotel role is not configured"));

        // BCrypt only uses the first 72 UTF-8 bytes, so reject longer passwords instead of silently truncating.
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Password must be at most 72 UTF-8 bytes for BCrypt");
        }

        StaffUser user = new StaffUser(hotelId, role.getId(), username,
                passwordEncoder.encode(request.password()));
        try {
            user = users.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            // The global unique email index handles simultaneous registrations across hotels.
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This email is already assigned to a staff login", exception);
        }

        audit.recordSystem(hotelId, "PLATFORM_STAFF_USER_CREATED", "User", user.getId().toString(),
                "username=" + user.getUsername() + ";role=" + roleName);
        return new PlatformStaffUserResponse(user.getId(), hotelId, user.getUsername(), roleName,
                user.getStatus(), user.getCreatedAt());
    }

    public record CreatePlatformStaffUserRequest(
            @NotBlank @jakarta.validation.constraints.Email @Size(max = 254)
            @Schema(description = "Email address used as the globally unique staff login username") String username,
            @NotBlank @Size(min = 12, max = 72) String password,
            @NotNull @Schema(description = "Only Manager and Cashier are provisionable here") ProvisionableStaffRole role) { }

    public enum ProvisionableStaffRole {
        MANAGER,
        CASHIER
    }

    public record PlatformStaffUserResponse(UUID id, String hotelId, String username, String role,
            String status, Instant createdAt) { }
}
