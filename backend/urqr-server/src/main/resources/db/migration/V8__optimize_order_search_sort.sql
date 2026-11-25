-- Order pages sort by created_at and then UUID to make pagination stable.
DROP INDEX IF EXISTS idx_order_search;
DROP INDEX IF EXISTS idx_order_search_status_created;

CREATE INDEX idx_order_search_created_id
    ON pos_order (hotel_id, created_at DESC, id DESC);

CREATE INDEX idx_order_search_status_created_id
    ON pos_order (hotel_id, status, created_at DESC, id DESC);
