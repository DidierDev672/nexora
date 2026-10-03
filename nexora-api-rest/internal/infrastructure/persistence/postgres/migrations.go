package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

const migrationCreateRoles = `
CREATE TABLE IF NOT EXISTS roles (
    id          VARCHAR(36) PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT ''
);
`

const migrationCreateHeadquarters = `
CREATE TABLE IF NOT EXISTS headquarters (
    id          VARCHAR(36) PRIMARY KEY,
    name        VARCHAR(150) NOT NULL UNIQUE,
    address     TEXT NOT NULL,
    city        VARCHAR(100) NOT NULL,
    phone       VARCHAR(30) NOT NULL DEFAULT '',
    status      VARCHAR(20) NOT NULL DEFAULT 'active',
    created_by  VARCHAR(100) NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
`

const migrationCreateSubHeadquarters = `
CREATE TABLE IF NOT EXISTS sub_headquarters (
    id             VARCHAR(36) PRIMARY KEY,
    headquarter_id VARCHAR(36) NOT NULL REFERENCES headquarters(id) ON DELETE CASCADE,
    name           VARCHAR(150) NOT NULL,
    address        TEXT NOT NULL,
    phone          VARCHAR(30) NOT NULL DEFAULT '',
    status         VARCHAR(20) NOT NULL DEFAULT 'active',
    created_by     VARCHAR(100) NOT NULL DEFAULT '',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (headquarter_id, name)
);
`

const migrationCreatePalettes = `
CREATE TABLE IF NOT EXISTS palettes (
    id         VARCHAR(36) PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    is_defined BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`

const migrationCreatePaletteColors = `
CREATE TABLE IF NOT EXISTS palette_colors (
    palette_id VARCHAR(36)  NOT NULL REFERENCES palettes(id) ON DELETE CASCADE,
    hex        VARCHAR(7)   NOT NULL,
    name       VARCHAR(100) NOT NULL DEFAULT '',
    position   INT          NOT NULL,
    PRIMARY KEY (palette_id, hex)
);
`

const migrationCreateUsers = `
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
`

const migrationCreatePermissionAssignments = `
CREATE TABLE IF NOT EXISTS permission_assignments (
    id                    VARCHAR(36) PRIMARY KEY,
    user_id               VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    headquarters_id       VARCHAR(36) NOT NULL REFERENCES headquarters(id) ON DELETE CASCADE,
    sub_headquarters_id   VARCHAR(36) REFERENCES sub_headquarters(id) ON DELETE SET NULL,
    resource_id           VARCHAR(36),
    permission_resource_id VARCHAR(36),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
`

const migrationCreateModules = `
CREATE TABLE IF NOT EXISTS modules (
    id             SERIAL PRIMARY KEY,
    type_path      TEXT NOT NULL,
    type_component TEXT NOT NULL
);
`

const migrationCreateResources = `
CREATE TABLE IF NOT EXISTS resources (
    id        SERIAL PRIMARY KEY,
    component TEXT NOT NULL,
    name      TEXT NOT NULL,
    module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE
);
`

const migrationCreatePermissionResources = `
CREATE TABLE IF NOT EXISTS permission_resources (
    id          SERIAL PRIMARY KEY,
    resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    permission  BOOLEAN NOT NULL DEFAULT true
);
`

// migrationCreateRoomTypes is derived 1:1 from domain.RoomType:
// ID -> VARCHAR(36), Name -> VARCHAR(100) UNIQUE, Capacity -> INTEGER > 0,
// BasePrice -> NUMERIC(12,2) >= 0, CreatedBy -> VARCHAR(100),
// CreatedAt/UpdatedAt -> TIMESTAMPTZ DEFAULT now().
const migrationCreateRoomTypes = `
CREATE TABLE IF NOT EXISTS room_types (
    id         VARCHAR(36) PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    capacity   INTEGER NOT NULL CHECK (capacity > 0),
    base_price NUMERIC(12,2) NOT NULL CHECK (base_price >= 0),
    created_by VARCHAR(100) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`

// migrationCreateRooms is derived 1:1 from domain.Room: each room belongs to
// exactly one building (referential integrity ON DELETE CASCADE), the status
// enum is a CHECK constraint, price_override is nullable and the room number
// is unique per building. has_reception flags whether the room counts with a
// reception point.
const migrationCreateRooms = `
CREATE TABLE IF NOT EXISTS rooms (
    id             VARCHAR(36) PRIMARY KEY,
    number         VARCHAR(50) NOT NULL,
    floor          INTEGER NOT NULL CHECK (floor >= 0),
    room_types_id  VARCHAR(36) NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
    building_id    VARCHAR(36) NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    headquarters_id VARCHAR(36) NOT NULL REFERENCES headquarters(id) ON DELETE CASCADE,
    price_override NUMERIC(12,2),
    status         VARCHAR(20) NOT NULL DEFAULT 'available',
    has_reception  BOOLEAN NOT NULL DEFAULT false,
    created_by     VARCHAR(100) NOT NULL DEFAULT '',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (building_id, number),
    CHECK (status IN ('available', 'busy', 'maintenance', 'cleaning', 'inactive'))
);
`

// migrationAlterRoomsAddReception bridges a legacy rooms table that predates
// the has_reception column. Idempotent and self-sufficient exactly like
// migrationAlterRoomsAddBuilding: the column is added only when missing,
// guarded by information_schema, with a NOT NULL DEFAULT false so existing
// rows are satisfied without a value. Fresh databases never hit this path
// because migrationCreateRooms already includes the column.
const migrationAlterRoomsAddReception = `
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'rooms' AND column_name = 'has_reception'
    ) THEN
        ALTER TABLE rooms ADD COLUMN has_reception BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;
`

// migrateLegacyUsers guards against a pre-existing "users" table created by an
// older model (persona/family) that does not match the current schema.
// CREATE TABLE IF NOT EXISTS would silently skip an existing table and every
// query against users would fail with SQLSTATE 42703. The legacy table is
// preserved by renaming it, so the users slice owns the "users" table on the
// next boot. Idempotent and safe: it only renames when users has no "name"
// column and there is no user_profiles table yet.
func migrateLegacyUsers(ctx context.Context, conn *pgxpool.Pool) error {
	var hasNameCol, usersPresent, profilesPresent bool
	err := conn.QueryRow(ctx,
		`SELECT
			EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name'),
			EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users'  AND table_schema = current_schema()),
			EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = current_schema())`,
	).Scan(&hasNameCol, &usersPresent, &profilesPresent)
	if err != nil {
		return fmt.Errorf("inspect legacy users table: %w", err)
	}
	if !usersPresent || hasNameCol || profilesPresent {
		return nil
	}
	if _, err := conn.Exec(ctx, "ALTER TABLE users RENAME TO user_profiles"); err != nil {
		return fmt.Errorf("rename legacy users table: %w", err)
	}
	return nil
}

// migrationCreateBedTypes is derived 1:1 from domain.BedType: name is
// unique and capacity_people is constrained to host at least one person.
const migrationCreateBedTypes = `
CREATE TABLE IF NOT EXISTS bed_types (
    id              VARCHAR(36) PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    capacity_people INTEGER NOT NULL CHECK (capacity_people > 0),
    description     TEXT NOT NULL DEFAULT '',
    created_by      VARCHAR(100) NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
`

// migrationCreateBeds is derived 1:1 from domain.Bed: a bed belongs to a room
// (cascade delete) and a bed type (restrictive reference), etiquette is unique
// per room and status is constrained to the three lifecycle states.
const migrationCreateBeds = `
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
`

// migrationCreateBedBedTypes materialises the N:N relation between beds and
// bed types (a bed can host several types, a type can appear on many beds).
// It is the canonical source for domain.Bed.TypesBedID.
const migrationCreateBedBedTypes = `
CREATE TABLE IF NOT EXISTS beds_bed_types (
    bed_id       VARCHAR(36) NOT NULL REFERENCES beds(id) ON DELETE CASCADE,
    bed_type_id  VARCHAR(36) NOT NULL REFERENCES bed_types(id) ON DELETE RESTRICT,
    PRIMARY KEY (bed_id, bed_type_id)
);
`

// migrationBackfillBedBedTypes backfills the N:N pivot from the legacy
// single-column anchor (beds.types_bed_id) so existing beds are preserved.
// It is idempotent: ON CONFLICT DO NOTHING guards re-runs.
const migrationBackfillBedBedTypes = `
INSERT INTO beds_bed_types (bed_id, bed_type_id)
SELECT b.id, b.types_bed_id
FROM beds b
WHERE b.types_bed_id IS NOT NULL
ON CONFLICT (bed_id, bed_type_id) DO NOTHING;
`

// migrationAlterRoomsAddBuilding bridges the legacy rooms table (which used
// headquarters_id/sub_headquarters_id) to the refactored linear model where a
// room hangs directly off a building (building_id). It is idempotent:
// ADD COLUMN only runs when the column is missing hole, and the UPDATE only
// fills rows that still have a NULL building_id, assigning them to the first
// building by creation order. This preserves existing room data instead of
// dropping the table.
const migrationAlterRoomsAddBuilding = `
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'rooms' AND column_name = 'building_id'
    ) THEN
        ALTER TABLE rooms ADD COLUMN building_id VARCHAR(36) REFERENCES buildings(id) ON DELETE CASCADE;
    END IF;
END $$;

UPDATE rooms SET building_id = (SELECT id FROM buildings ORDER BY created_at LIMIT 1) WHERE building_id IS NULL;
`

// migrationBackfillRoomsHeadquarters fills the denormalized headquarters_id
// left over from the legacy rooms model (which predates building_id) from the
// room's building. The physical table keeps a NOT NULL headquarters_id, so
// existing rows that could never satisfy it are repaired here. It is fully
// idempotent and self-sufficient: if a legacy rooms table predates the
// headquarters_id column entirely, the column is added first (guarded by
// information_schema exactly like migrationAlterRoomsAddBuilding), and rows
// that already carry a value are untouched.
const migrationBackfillRoomsHeadquarters = `
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'rooms' AND column_name = 'headquarters_id'
    ) THEN
        ALTER TABLE rooms ADD COLUMN headquarters_id VARCHAR(36) REFERENCES headquarters(id) ON DELETE CASCADE;
    END IF;
END $$;

UPDATE rooms r
SET headquarters_id = b.headquarters_id
FROM buildings b
WHERE b.id = r.building_id AND r.headquarters_id IS NULL;
`

// migrationCreatePersons is derived 1:1 from domain.Person: document_type and
// document_number form the unique natural key of the aggregate; the demographic
// fields (date of birth, gender, nationality) mirror the domain invariants
// (gender is a closed M/F enum, nationality defaults to ” so NOT NULL holds).
const migrationCreatePersons = `
CREATE TABLE IF NOT EXISTS persons (
    id              VARCHAR(36) PRIMARY KEY,
    document_type   VARCHAR(20) NOT NULL,
    document_number VARCHAR(50) NOT NULL,
    name            VARCHAR(150) NOT NULL,
    phone_number    VARCHAR(30) NOT NULL,
    email           VARCHAR(150) NOT NULL,
    date_of_birth   DATE NOT NULL,
    gender          VARCHAR(1) NOT NULL,
    nationality     VARCHAR(100) NOT NULL DEFAULT '',
    created_by      VARCHAR(100) NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (document_type, document_number),
    CHECK (document_type IN ('id_card', 'national_id', 'foreign_id')),
    CHECK (gender IN ('M', 'F'))
);
`

// migrationAlterPersonsAddPersonalData bridges a legacy persons table that
// predates the demographic columns (date_of_birth, gender, nationality).
// Idempotent and self-sufficient exactly like migrationAlterRoomsAddBuilding:
// each column is added only when missing, guarded by information_schema.
// date_of_birth and gender stay nullable because legacy rows carry unknown
// values (a new NOT NULL without default would fail); nationality gets a
// NOT NULL DEFAULT ” so existing rows are satisfied. Fresh databases never
// hit this path because migrationCreatePersons already includes the columns.
const migrationAlterPersonsAddPersonalData = `
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'persons' AND column_name = 'date_of_birth'
    ) THEN
        ALTER TABLE persons ADD COLUMN date_of_birth DATE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'persons' AND column_name = 'gender'
    ) THEN
        ALTER TABLE persons ADD COLUMN gender VARCHAR(1) CHECK (gender IN ('M', 'F'));
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'persons' AND column_name = 'nationality'
    ) THEN
        ALTER TABLE persons ADD COLUMN nationality VARCHAR(100) NOT NULL DEFAULT '';
    END IF;
END $$;
`

// migrationCreatePersonsRoles materialises the N:N relation between persons and
// roles.
const migrationCreatePersonsRoles = `
CREATE TABLE IF NOT EXISTS persons_roles (
    person_id VARCHAR(36) NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    role_id   VARCHAR(36) NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    PRIMARY KEY (person_id, role_id)
);
`

// migrationBackfillStayPersons seeds the N:N pivot from the legacy single
// guest column (stays.person_id) so existing stays are preserved. Guarded by
// information_schema because the column no longer exists on fresh databases
// (StaySchemaDDL builds stays without person_id). Idempotent: ON CONFLICT DO
// NOTHING guards re-runs.
const migrationBackfillStayPersons = `
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'stays' AND column_name = 'person_id'
    ) THEN
        INSERT INTO stays_persons (stay_id, person_id)
        SELECT id, person_id FROM stays WHERE person_id IS NOT NULL
        ON CONFLICT (stay_id, person_id) DO NOTHING;
    END IF;
END $$;
`

// migrationDropStayPersonID removes the legacy single-guest column after the
// pivot has been backfilled. Native DROP COLUMN IF EXISTS is idempotent and
// also drops the legacy idx_stays_person_id index.
const migrationDropStayPersonID = `
ALTER TABLE stays DROP COLUMN IF EXISTS person_id;
`

func Migrate(ctx context.Context, conn *pgxpool.Pool) error {
	if err := migrateLegacyUsers(ctx, conn); err != nil {
		return err
	}
	for _, ddl := range []string{
		migrationCreateRoles,
		migrationCreateHeadquarters,
		migrationCreateSubHeadquarters,
		migrationCreateUsers,
		migrationCreatePermissionAssignments,
		migrationCreatePalettes,
		migrationCreatePaletteColors,
		migrationCreateModules,
		migrationCreateResources,
		migrationCreatePermissionResources,
		migrationCreateRoomTypes,
		buildingSchema,
		migrationCreateRooms,
		migrationAlterRoomsAddBuilding,
		migrationBackfillRoomsHeadquarters,
		migrationAlterRoomsAddReception,
		migrationCreateBedTypes,
		migrationCreateBeds,
		migrationCreateBedBedTypes,
		migrationBackfillBedBedTypes,
		migrationCreatePersons,
		migrationAlterPersonsAddPersonalData,
		migrationCreatePersonsRoles,
		ReserveSchemaDDL,
		StaySchemaDDL,
		migrationBackfillStayPersons,
		migrationDropStayPersonID,
		RateSchemaDDL,
		RoomTariffSchemaDDL,
	} {
		if _, err := conn.Exec(ctx, ddl); err != nil {
			return fmt.Errorf("run migration: %w", err)
		}
	}
	return nil
}
