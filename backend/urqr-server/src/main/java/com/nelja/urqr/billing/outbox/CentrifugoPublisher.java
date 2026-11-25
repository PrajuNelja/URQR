package com.nelja.urqr.billing.outbox;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** Sends a bounded outbox batch with one HTTP round trip to Centrifugo. */
@Component
public class CentrifugoPublisher {

    private final RestClient client;
    private final String apiKey;

    public CentrifugoPublisher(@Value("${app.centrifugo.api-url:}") String apiUrl,
            @Value("${app.centrifugo.api-key:}") String apiKey) {
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(
                HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build());
        requestFactory.setReadTimeout(Duration.ofSeconds(2));
        this.client = RestClient.builder()
                .baseUrl(batchEndpoint(apiUrl))
                .requestFactory(requestFactory)
                .build();
        this.apiKey = apiKey;
    }

    /** Returns a result per event so a partial batch response only retries the failed events. */
    public List<Throwable> publishBatch(List<OutboxTransactionService.PendingEvent> events) {
        if (events.isEmpty()) return List.of();
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("CENTRIFUGO_API_KEY is required to publish outbox events");
        }

        List<Map<String, Object>> commands = events.stream()
                .map(event -> Map.<String, Object>of("publish", Map.of(
                        "channel", "orders:" + event.tenantId(),
                        "data", publication(event),
                        // Centrifugo suppresses duplicates if the outbox worker retries after a crash.
                        "idempotency_key", event.eventId().toString())))
                .toList();

        Map<?, ?> response = client.post()
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-API-Key", apiKey)
                // Sequential batch processing preserves publication order within a tenant channel.
                .body(Map.of("commands", commands))
                .retrieve()
                .body(Map.class);
        if (response == null) throw new IllegalStateException("Centrifugo returned an empty batch response");
        if (response.get("error") != null) {
            throw new IllegalStateException("Centrifugo rejected the batch: " + response.get("error"));
        }
        if (!(response.get("replies") instanceof List<?> replies) || replies.size() != events.size()) {
            throw new IllegalStateException("Centrifugo returned an invalid batch response");
        }

        List<Throwable> failures = new ArrayList<>(replies.size());
        for (Object item : replies) {
            if (!(item instanceof Map<?, ?> reply)) {
                failures.add(new IllegalStateException("Centrifugo returned an invalid batch item"));
            } else if (reply.get("error") != null) {
                failures.add(new IllegalStateException("Centrifugo rejected publication: " + reply.get("error")));
            } else if (!reply.containsKey("publish")) {
                failures.add(new IllegalStateException("Centrifugo returned no publish result"));
            } else {
                failures.add(null);
            }
        }
        return failures;
    }

    private static Map<String, Object> publication(OutboxTransactionService.PendingEvent event) {
        return Map.of(
                "eventId", event.eventId().toString(),
                "tenantId", event.tenantId().toString(),
                "type", event.eventType(),
                "payload", event.payload());
    }

    private static String batchEndpoint(String apiUrl) {
        String base = apiUrl == null || apiUrl.isBlank() ? "http://localhost:8000/api" : apiUrl.trim();
        while (base.endsWith("/")) base = base.substring(0, base.length() - 1);
        if (base.endsWith("/batch")) return base;
        if (base.endsWith("/publish")) base = base.substring(0, base.length() - "/publish".length());
        return base + "/batch";
    }
}
