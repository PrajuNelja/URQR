-- now() is fixed at transaction start; clock_timestamp() records when each
-- outbox row is actually enqueued inside a potentially longer business transaction.
ALTER TABLE outbox_events
    ALTER COLUMN created_at SET DEFAULT clock_timestamp();
