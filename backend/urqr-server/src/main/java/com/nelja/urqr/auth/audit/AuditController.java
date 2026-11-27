package com.nelja.urqr.auth.audit;

import com.nelja.urqr.auth.security.CurrentHotel;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/audit")
@PreAuthorize("hasRole('MANAGER')")
@SecurityRequirement(name = "bearerAuth")
@Transactional(readOnly = true)
public class AuditController {

    private final AuditRecordRepository audit;
    private final CurrentHotel tenant;

    public AuditController(AuditRecordRepository audit, CurrentHotel tenant) {
        this.audit = audit;
        this.tenant = tenant;
    }

    @GetMapping
    public Page<AuditDto> list(@AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Pageable bounded = PageRequest.of(pageable.getPageNumber(),
                Math.max(1, Math.min(pageable.getPageSize(), 100)), pageable.getSort());
        return audit.findAllByHotelIdOrderByCreatedAtDesc(tenant.hotelId(jwt), bounded).map(AuditDto::from);
    }

    public record AuditDto(UUID id, UUID userId, String action, String entity, String entityId,
            String oldValue, String newValue, Instant createdAt) {
        static AuditDto from(AuditRecord record) {
            return new AuditDto(record.getId(), record.getUserId(), record.getAction(), record.getEntity(),
                    record.getEntityId(), record.getOldValue(), record.getNewValue(), record.getCreatedAt());
        }
    }
}
