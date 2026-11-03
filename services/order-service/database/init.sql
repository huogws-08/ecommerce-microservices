
-- ==========================================
-- ORDER SERVICE DATABASE
-- ==========================================

-- 1. Bảng đơn hàng
CREATE TABLE IF NOT EXISTS orders (
    oid SERIAL PRIMARY KEY,
    uid INTEGER NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL
        CHECK (total_amount >= 0),
    discount_amount NUMERIC(15, 2) NOT NULL DEFAULT 0
        CHECK (discount_amount >= 0),
    final_amount NUMERIC(15, 2) NOT NULL
        CHECK (final_amount >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng chi tiết đơn hàng
CREATE TABLE IF NOT EXISTS order_details (
    odid SERIAL PRIMARY KEY,
    oid INTEGER NOT NULL,
    pid VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(15, 2) NOT NULL
        CHECK (unit_price >= 0),
    subtotal NUMERIC(15, 2) NOT NULL
        CHECK (subtotal >= 0),

    CONSTRAINT fk_order_details_orders
        FOREIGN KEY (oid)
        REFERENCES orders(oid)
        ON DELETE CASCADE
);

-- 3. Bảng Transactional Outbox
CREATE TABLE IF NOT EXISTS outbox_events (
    event_id SERIAL PRIMARY KEY,
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);
