package com.nelja.urqr.auth.access.user;

import com.nelja.urqr.auth.access.role.HotelStaffRole;
import com.nelja.urqr.auth.access.role.Role;
import com.nelja.urqr.auth.access.role.RoleRepository;
import com.nelja.urqr.auth.audit.AuditService;
import com.nelja.urqr.auth.security.CurrentHotel;
import com.nelja.urqr.auth.security.RedisAuthStateService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/users")
@PreAuthorize("hasRole('MANAGER')")
@Transactional
@SecurityRequirement(name = "bearerAuth")
public class StaffUserController {
    private final StaffUserRepository users;
    private final RoleRepository roles;
    private final CurrentHotel tenant;
    private final PasswordEncoder encoder;
    private final AuditService audit;
    private final RedisAuthStateService authState;

    public StaffUserController(StaffUserRepository users, RoleRepository roles, CurrentHotel tenant,
            PasswordEncoder encoder, AuditService audit, RedisAuthStateService authState) {
        this.users = users;
        this.roles = roles;
        this.tenant = tenant;
        this.encoder = encoder;
        this.audit = audit;
        this.authState = authState;
    }

    @PostMapping
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    public UserDto create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateUser request) {
        String hotelId = tenant.hotelId(jwt);
        Role role = requestedRole(request.roleId(), hotelId);
        if (request.password().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }
        String username = request.username().trim().toLowerCase(java.util.Locale.ROOT);
        if (users.existsByHotelIdAndUsernameIgnoreCase(hotelId, username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already used by a staff account");
        }

        StaffUser user;
        try {
            user = users.saveAndFlush(new StaffUser(hotelId, role.getId(), username,
                    encoder.encode(request.password())));
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Email is already used by a hotel staff account", exception);
        }
        audit.record(hotelId, tenant.userId(jwt), "USER_CREATED", "User", user.getId().toString(), null,
                user.getUsername());
        return dto(user, role);
    }

    @GetMapping
    public List<UserDto> list(@AuthenticationPrincipal Jwt jwt) {
        String hotelId = tenant.hotelId(jwt);
        Map<UUID, Role> roleById = new HashMap<>();
        roles.findAllByHotelIdOrderByName(hotelId).forEach(role -> roleById.put(role.getId(), role));
        return users.findAllByHotelIdOrderByUsername(hotelId).stream()
                .map(user -> dto(user, Optional.ofNullable(roleById.get(user.getRoleId()))
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT,
                                "User role is not configured"))))
                .toList();
    }

    @GetMapping("/{id}")
    public UserDto get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        String hotelId = tenant.hotelId(jwt);
        StaffUser user = findUser(id, hotelId);
        return dto(user, findRole(user.getRoleId(), hotelId));
    }

    @PatchMapping("/{id}")
    public UserDto update(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
            @Valid @RequestBody UpdateUser request) {
        String hotelId = tenant.hotelId(jwt);
        StaffUser user = findUser(id, hotelId);
        Role previousRole = findRole(user.getRoleId(), hotelId);
        Role nextRole = request.roleId() == null ? previousRole : requestedRole(request.roleId(), hotelId);

        if (!previousRole.getId().equals(nextRole.getId())
                && HotelStaffRole.MANAGER.name().equals(previousRole.getName())
                && users.countByHotelIdAndRoleIdAndStatus(hotelId, previousRole.getId(), "ACTIVE") <= 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The last active manager cannot be reassigned");
        }
        if (request.roleId() != null) {
            user.setRoleId(nextRole.getId());
        }
        boolean passwordChanged = request.password() != null && !request.password().isBlank();
        if (request.password() != null && !request.password().isBlank()) {
            if (request.password().length() < 12) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 12 characters");
            }
            user.setPasswordHash(encoder.encode(request.password()));
        }

        users.save(user);
        authState.invalidateStaffAuthorization(hotelId, user.getId());
        if (passwordChanged) authState.revokeStaffTokens(hotelId, user.getId());
        audit.record(hotelId, tenant.userId(jwt), "USER_UPDATED", "User", id.toString(),
                "role=" + previousRole.getName(), "role=" + nextRole.getName());
        return dto(user, nextRole);
    }

    @PatchMapping("/{id}/status")
    public UserDto status(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id, @RequestBody Status request) {
        String hotelId = tenant.hotelId(jwt);
        StaffUser user = findUser(id, hotelId);
        Role role = findRole(user.getRoleId(), hotelId);
        if (!request.active() && user.isActive() && HotelStaffRole.MANAGER.name().equals(role.getName())
                && users.countByHotelIdAndRoleIdAndStatus(hotelId, role.getId(), "ACTIVE") <= 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The last active manager cannot be deactivated");
        }

        String oldStatus = user.getStatus();
        user.setStatus(request.active() ? "ACTIVE" : "INACTIVE");
        users.save(user);
        authState.invalidateStaffAuthorization(hotelId, user.getId());
        if (!request.active()) authState.revokeStaffTokens(hotelId, user.getId());
        audit.record(hotelId, tenant.userId(jwt), "USER_STATUS_CHANGED", "User", id.toString(), oldStatus,
                user.getStatus());
        return dto(user, role);
    }

    private StaffUser findUser(UUID id, String hotelId) {
        return users.findByIdAndHotelId(id, hotelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Role requestedRole(UUID id, String hotelId) {
        Role role = findRole(id, hotelId);
        if (!HotelStaffRole.supports(role.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported hotel staff role");
        }
        return role;
    }

    private Role findRole(UUID id, String hotelId) {
        return roles.findByIdAndHotelId(id, hotelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Role not found in this hotel"));
    }

    private static UserDto dto(StaffUser user, Role role) {
        return new UserDto(user.getId(), user.getUsername(), user.getStatus(), role.getId(), role.getName(),
                user.getCreatedAt());
    }

    public record CreateUser(@NotBlank @jakarta.validation.constraints.Email @Size(max = 254) String username,
            @NotBlank String password,
            @NotNull UUID roleId) { }
    public record UpdateUser(UUID roleId, String password) { }
    public record Status(boolean active) { }
    public record UserDto(UUID id, String username, String status, UUID roleId, String role, Instant createdAt) { }
}
