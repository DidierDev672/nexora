CREATE TABLE IF NOT EXISTS bed_types (
    id              VARCHAR(36) PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    capacity_people INTEGER NOT NULL CHECK (capacity_people > 0),
    description     TEXT NOT NULL DEFAULT '',
    created_by      VARCHAR(100) NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);