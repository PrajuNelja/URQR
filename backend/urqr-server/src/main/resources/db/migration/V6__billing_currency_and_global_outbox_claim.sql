-- Correct the fixed-width currency columns without rewriting V2 after it ran.
ALTER TABLE prices ALTER COLUMN currency TYPE VARCHAR(3);
ALTER TABLE orders ALTER COLUMN currency TYPE VARCHAR(3);

CREATE INDEX IF NOT EXISTS idx_outbox_pending_due
    ON outbox_events (next_attempt_at, created_at, event_id)
    WHERE state = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_outbox_processing_lease
    ON outbox_events (locked_until, created_at, event_id)
    WHERE state = 'PROCESSING';

-- The internal outbox worker claims across tenants in one SKIP LOCKED query.
DROP POLICY tenant_isolation ON outbox_events;
CREATE POLICY tenant_isolation ON outbox_events
    USING (
        tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
        OR current_setting('app.platform_admin', true) = 'true'
    )
    WITH CHECK (
        tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
        OR current_setting('app.platform_admin', true) = 'true'
    );
