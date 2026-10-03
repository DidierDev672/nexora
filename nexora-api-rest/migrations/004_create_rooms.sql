CREATE TABLE IF NOT EXISTS rooms (
    id             VARCHAR(36) PRIMARY KEY,
    number         VARCHAR(50) NOT NULL,
    floor          INTEGER NOT NULL CHECK (floor >= 0),
    room_types_id  VARCHAR(36) NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
    building_id    VARCHAR(36) NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    price_override NUMERIC(12,2),
    status         VARCHAR(20) NOT NULL DEFAULT 'available',
    created_by     VARCHAR(100) NOT NULL DEFAULT '',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (building_id, number),
    CHECK (status IN ('available', 'busy', 'maintenance', 'cleaning', 'inactive'))
);