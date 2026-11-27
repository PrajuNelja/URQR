package com.nelja.urqr.billing.outbox;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nelja.urqr.auth.security.HotelRlsContext;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Short transactions claim and acknowledge rows; the network call stays outside the transaction. */
@Service
public class OutboxTransactionService {

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;
    private final HotelRlsContext rls;

    public OutboxTransactionService(JdbcTemplate jdbc, ObjectMapper objectMapper, HotelRlsContext rls) {
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
        this.rls = rls;
    }

    @Transactional
    public List<PendingEvent> claim(int limit) {
        // Only the trusted internal worker calls this; it claims a bounded global batch.
        rls.allowPlatformAdministration();
        List<PendingEvent> due = jdbc.query("""
                WITH due AS MATERIALIZED (
                    SELECT hotel_id, event_id, created_at
                      FROM outbox_events
                     WHERE ((state = 'PENDING' AND next_attempt_at <= now())
                         OR (state = 'PROCESSING' AND locked_until <= now()))
                     ORDER BY created_at, event_id
                     FOR UPDATE SKIP LOCKED
                     LIMIT ?
                ), updated AS (
                    UPDATE outbox_events AS e
                       SET state = 'PROCESSING', attempts = e.attempts + 1,
                           locked_until = clock_timestamp() + interval '30 seconds',
                           updated_at = clock_timestamp()
                      FROM due
                     WHERE e.hotel_id = due.hotel_id AND e.event_id = due.event_id
                    RETURNING e.event_id, e.hotel_id, e.event_type, e.payload::text AS payload, e.attempts
                )
                SELECT updated.event_id, updated.hotel_id, updated.event_type, updated.payload, updated.attempts
                  FROM updated
                  JOIN due USING (hotel_id, event_id)
                 ORDER BY due.created_at, due.event_id
                """, (rs, row) -> new PendingEvent(
                        rs.getObject(1, UUID.class),
                        rs.getObject(2, UUID.class),
                        rs.getString(3),
                        readPayload(rs.getString(4)),
                        rs.getInt(5)), limit);
        return due;
    }

    @Transactional
    public void markDelivered(List<PendingEvent> events) {
        rls.allowPlatformAdministration();
        for (PendingEvent event : events) {
            jdbc.update("""
                    UPDATE outbox_events
                       SET state = 'DELIVERED', delivered_at = now(), locked_until = NULL,
                           last_error = NULL, updated_at = now()
                     WHERE hotel_id = ? AND event_id = ?
                    """, event.hotelId(), event.eventId());
        }
    }

    @Transactional
    public void markFailed(PendingEvent event, Throwable failure, int maxAttempts) {
        rls.bindHotel(event.hotelId());
        String state = event.attempts() >= maxAttempts ? "DEAD" : "PENDING";
        long seconds = Math.min(300L, 1L << Math.min(event.attempts() - 1, 8));
        String message = failure.getMessage() == null ? failure.getClass().getSimpleName() : failure.getMessage();
        if (message.length() > 2000) message = message.substring(0, 2000);
        jdbc.update("""
                UPDATE outbox_events
                   SET state = ?, next_attempt_at = now() + (? * interval '1 second'),
                       locked_until = NULL, last_error = ?, updated_at = now()
                 WHERE hotel_id = ? AND event_id = ?
                """, state, seconds, message, event.hotelId(), event.eventId());
    }

    private Map<String, Object> readPayload(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() { });
        } catch (Exception exception) {
            throw new IllegalStateException("Stored outbox payload is invalid JSON", exception);
        }
    }

    public record PendingEvent(UUID eventId, UUID hotelId, String eventType,
            Map<String, Object> payload, int attempts) { }
}
