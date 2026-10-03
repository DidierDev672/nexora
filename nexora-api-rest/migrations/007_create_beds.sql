CREATE TABLE IF NOT EXISTS beds (
    id            VARCHAR(36) PRIMARY KEY,
    room_id       VARCHAR(36) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    types_bed_id  VARCHAR(36) NOT NULL REFERENCES bed_types(id) ON DELETE RESTRICT,
    etiquette     VARCHAR(50) NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'active',
    created_by    VARCHAR(100) NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (room_id, etiquette),
    CHECK (status IN ('active', 'maintenance', 'withdrawal'))
);