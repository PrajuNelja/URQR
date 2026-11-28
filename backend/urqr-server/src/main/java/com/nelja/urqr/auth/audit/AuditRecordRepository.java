package com.nelja.urqr.auth.audit;
import java.util.UUID; import org.springframework.data.domain.Page; import org.springframework.data.domain.Pageable; import org.springframework.data.jpa.repository.JpaRepository;
public interface AuditRecordRepository extends JpaRepository<AuditRecord,UUID>{Page<AuditRecord> findAllByHotelIdOrderByCreatedAtDesc(String hotel,Pageable pageable);}
