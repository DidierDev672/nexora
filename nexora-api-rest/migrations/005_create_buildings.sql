CREATE TABLE IF NOT EXISTS buildings (
    id                   VARCHAR(36) PRIMARY KEY,
    name                 VARCHAR(150) NOT NULL,
    floor_number         INTEGER NOT NULL CHECK (floor_number >= 1),
    headquarters_id      VARCHAR(36) NOT NULL REFERENCES headquarters(id) ON DELETE CASCADE,
    sub_headquarters_id  VARCHAR(36) REFERENCES sub_headquarters(id) ON DELETE SET NULL,
    status               VARCHAR(20) NOT NULL DEFAULT 'available',
    created_by           VARCHAR(100) NOT NULL DEFAULT '',
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (headquarters_id, name),
    CHECK (status IN ('available', 'busy', 'maintenance', 'cleaning', 'inactive', 'occupied'))
);