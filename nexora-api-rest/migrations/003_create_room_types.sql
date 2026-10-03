CREATE TABLE IF NOT EXISTS room_types (
    id         VARCHAR(36) PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    capacity   INTEGER NOT NULL CHECK (capacity > 0),
    base_price NUMERIC(12,2) NOT NULL CHECK (base_price >= 0),
    created_by VARCHAR(100) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);