package com.nelja.urqr.billing.outbox;

import jakarta.annotation.PreDestroy;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Claims a bounded batch and sends it through Centrifugo's batch endpoint. */
@Component
@ConditionalOnProperty(prefix = "app.outbox", name = "enabled", havingValue = "true")
public class OutboxPoller {

    private static final Logger log = LoggerFactory.getLogger(OutboxPoller.class);
    private static final int BATCH_SIZE = 50;

    private final OutboxTransactionService transactions;
    private final CentrifugoPublisher centrifugo;
    private final AtomicBoolean running = new AtomicBoolean();
    private final ExecutorService publishers = Executors.newVirtualThreadPerTaskExecutor();

    public OutboxPoller(OutboxTransactionService transactions, CentrifugoPublisher centrifugo) {
        this.transactions = transactions;
        this.centrifugo = centrifugo;
    }

    @Scheduled(fixedDelayString = "${app.outbox.poll-delay-ms:50}")
    public void poll() {
        if (!running.compareAndSet(false, true)) return;
        try {
            long claimStarted = System.nanoTime();
            List<OutboxTransactionService.PendingEvent> events = transactions.claim(BATCH_SIZE);
            if (events.isEmpty()) return;
            log.debug("Claimed {} outbox events in {} ms", events.size(), elapsedMillis(claimStarted));

            long publishStarted = System.nanoTime();
            List<Throwable> failures;
            try {
                failures = publishers.submit(() -> centrifugo.publishBatch(events)).get();
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
                return;
            } catch (ExecutionException failure) {
                failures = java.util.Collections.nCopies(events.size(), failure.getCause());
            }
            log.debug("Published {} outbox events to Centrifugo in {} ms",
                    events.size(), elapsedMillis(publishStarted));

            List<OutboxTransactionService.PendingEvent> delivered = new java.util.ArrayList<>();
            List<FailedDelivery> failed = new ArrayList<>();
            if (failures.size() != events.size()) {
                throw new IllegalStateException("Centrifugo batch response did not match claimed events");
            }
            for (int index = 0; index < events.size(); index++) {
                if (failures.get(index) == null) delivered.add(events.get(index));
                else failed.add(new FailedDelivery(events.get(index), failures.get(index)));
            }
            // One acknowledgement transaction avoids opening one database connection per event.
            if (!delivered.isEmpty()) {
                long acknowledgementStarted = System.nanoTime();
                transactions.markDelivered(delivered);
                log.debug("Acknowledged {} outbox events in {} ms",
                        delivered.size(), elapsedMillis(acknowledgementStarted));
            }
            for (FailedDelivery delivery : failed) {
                log.warn("Outbox event {} delivery failed on attempt {}: {}",
                        delivery.event().eventId(), delivery.event().attempts(), delivery.failure().toString());
                transactions.markFailed(delivery.event(), delivery.failure(), 10);
            }
        } catch (Exception failure) {
            log.error("Outbox polling cycle failed", failure);
        } finally {
            running.set(false);
        }
    }

    private static double elapsedMillis(long started) {
        return (System.nanoTime() - started) / 1_000_000.0;
    }

    private record FailedDelivery(OutboxTransactionService.PendingEvent event, Throwable failure) { }

    @PreDestroy
    void closePublisherExecutor() {
        publishers.close();
    }
}
