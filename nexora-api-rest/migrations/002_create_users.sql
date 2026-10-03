CREATE TABLE IF NOT EXISTS users (
    id                  VARCHAR(36) PRIMARY KEY,
    name                VARCHAR(150) NOT NULL,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password_hash       TEXT NOT NULL,
    role_id             VARCHAR(36) NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    headquarters_id     VARCHAR(36) REFERENCES headquarters(id) ON DELETE SET NULL,
    sub_headquarters_id VARCHAR(36) REFERENCES sub_headquarters(id) ON DELETE SET NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'active',
    created_by          VARCHAR(100) NOT NULL DEFAULT 'user_system',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);