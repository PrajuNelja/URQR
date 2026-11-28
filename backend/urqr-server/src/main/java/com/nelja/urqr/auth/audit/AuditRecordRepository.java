package com.nelja.urqr.auth.audit;
import org.springframework.data.domain.Page; import org.springframework.data.domain.Pageable; import org.springframework.data.jpa.repository.JpaRepository;
public interface AuditRecordRepository extends JpaRepository<AuditRecord,String>{Page<AuditRecord> findAllByHotelIdOrderByCreatedAtDesc(String hotel,Pageable pageable);}
