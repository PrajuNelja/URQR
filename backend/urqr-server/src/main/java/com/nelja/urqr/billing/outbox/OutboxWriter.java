package com.nelja.urqr.billing.outbox;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** Writes the one custom outbox row in the caller's order transaction. */
@Repository
public class OutboxWriter {

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    public OutboxWriter(JdbcTemplate jdbc, ObjectMapper objectMapper) {
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
    }

    public UUID enqueue(String hotelId, String eventType, String aggregateType, String aggregateId,
            Map<String, ?> payload) {
        UUID eventId = UUID.randomUUID();
        try {
            String json = objectMapper.writeValueAsString(payload);
            jdbc.update("""
                    INSERT INTO outbox_events
                      (event_id, hotel_id, aggregate_type, aggregate_id, event_type, payload,
                       state, attempts, next_attempt_at, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?::jsonb, 'PENDING', 0, clock_timestamp(), clock_timestamp(), clock_timestamp())
                    """, eventId, hotelId, aggregateType, aggregateId, eventType, json);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("Outbox payload could not be serialized", exception);
        }
        return eventId;
    }
}
