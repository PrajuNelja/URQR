package com.nelja.urqr.platform.access.role;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nelja.urqr.platform.audit.AuditService;
import com.nelja.urqr.platform.security.CurrentTenant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class RoleControllerTest {

    private static final UUID HOTEL_ID = UUID.randomUUID();
    private static final UUID USER_ID = UUID.randomUUID();

    @Mock private RoleRepository roles;
    @Mock private CurrentTenant tenant;
    @Mock private AuditService audit;
    @Captor private ArgumentCaptor<Role> roleCaptor;
    @InjectMocks private RoleController controller;

    private Jwt jwt;

    @BeforeEach
    void setUp() {
        jwt = Jwt.withTokenValue("test-token")
                .header("alg", "none")
                .claim("sub", "manager")
                .build();
    }

    @Test
    void listReturnsRolesForCurrentHotel() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        Role manager = mock(Role.class);
        when(manager.getName()).thenReturn("MANAGER");
        when(roles.findAllByHotelIdOrderByName(HOTEL_ID)).thenReturn(List.of(manager));

        List<RoleController.RoleDto> result = controller.list(jwt);

        assertEquals(1, result.size());
        assertEquals("MANAGER", result.getFirst().name());
        verify(roles).findAllByHotelIdOrderByName(HOTEL_ID);
    }

    @Test
    void createNormalizesAllowedRoleAndRecordsAuditEvent() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        when(tenant.userId(jwt)).thenReturn(USER_ID);
        UUID roleId = UUID.randomUUID();
        Role savedRole = mock(Role.class);
        when(savedRole.getId()).thenReturn(roleId);
        when(savedRole.getName()).thenReturn("COOK");
        when(roles.save(any(Role.class))).thenReturn(savedRole);

        RoleController.RoleDto result = controller.create(jwt, new RoleController.RoleRequest(" cook "));

        verify(roles).save(roleCaptor.capture());
        assertEquals("COOK", roleCaptor.getValue().getName());
        assertEquals(roleId, result.id());
        assertEquals("COOK", result.name());
        verify(audit).record(HOTEL_ID, USER_ID, "ROLE_CREATED", "Role", roleId.toString(), null, "COOK");
    }

    @Test
    void createRejectsProvisionedManagerRole() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> controller.create(jwt, new RoleController.RoleRequest("MANAGER")));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }
}
