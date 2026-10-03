package menucategory

import (
	"errors"
	"strings"
	"time"
)

// ID identifica de forma unívoca a una categoría de menú.
type ID string

func (id ID) String() string {
	return string(id)
}

// Sentinel errors para violaciones de invariantes de negocio del dominio.
var (
	ErrNotFound             = errors.New("menu category not found")
	ErrInvalidID            = errors.New("id is required")
	ErrInvalidHeadquarterID = errors.New("headquartes_id is required")
	ErrEmptyName            = errors.New("name is required")
	ErrInvalidOrder         = errors.New("order cannot be negative")
)

// MenuCategory representa la entidad central del dominio para categorías de menú.
type MenuCategory struct {
	ID               ID
	HeadquarterID    string
	SubHeadquarterID *string
	BuildingID       *string
	Name             string
	Description      string
	Order            int
	Asset            string
	CreatedBy        string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

// NewMenuCategory es el constructor que valida y asegura las invariantes del dominio.
func NewMenuCategory(
	id ID,
	headquarterID string,
	subHeadquarterID *string,
	buildingID *string,
	name string,
	description string,
	order int,
	asset string,
	createdBy string,
	now time.Time,
) (MenuCategory, error) {
	trimmedID := ID(strings.TrimSpace(string(id)))
	if trimmedID == "" {
		return MenuCategory{}, ErrInvalidID
	}

	trimmedHQ := strings.TrimSpace(headquarterID)
	if trimmedHQ == "" {
		return MenuCategory{}, ErrInvalidHeadquarterID
	}

	trimmedName := strings.TrimSpace(name)
	if trimmedName == "" {
		return MenuCategory{}, ErrEmptyName
	}

	if order < 0 {
		return MenuCategory{}, ErrInvalidOrder
	}

	var subHQ *string
	if subHeadquarterID != nil {
		val := strings.TrimSpace(*subHeadquarterID)
		if val != "" {
			subHQ = &val
		}
	}

	var bld *string
	if buildingID != nil {
		val := strings.TrimSpace(*buildingID)
		if val != "" {
			bld = &val
		}
	}

	if now.IsZero() {
		now = time.Now().UTC()
	}

	return MenuCategory{
		ID:               trimmedID,
		HeadquarterID:    trimmedHQ,
		SubHeadquarterID: subHQ,
		BuildingID:       bld,
		Name:             trimmedName,
		Description:      strings.TrimSpace(description),
		Order:            order,
		Asset:            strings.TrimSpace(asset),
		CreatedBy:        strings.TrimSpace(createdBy),
		CreatedAt:        now,
		UpdatedAt:        now,
	}, nil
}

// Update actualiza los atributos mutables garantizando las invariantes de negocio.
func (m *MenuCategory) Update(
	name string,
	description string,
	order int,
	asset string,
	subHeadquarterID *string,
	buildingID *string,
	now time.Time,
) error {
	trimmedName := strings.TrimSpace(name)
	if trimmedName == "" {
		return ErrEmptyName
	}

	if order < 0 {
		return ErrInvalidOrder
	}

	var subHQ *string
	if subHeadquarterID != nil {
		val := strings.TrimSpace(*subHeadquarterID)
		if val != "" {
			subHQ = &val
		}
	}

	var bld *string
	if buildingID != nil {
		val := strings.TrimSpace(*buildingID)
		if val != "" {
			bld = &val
		}
	}

	if now.IsZero() {
		now = time.Now().UTC()
	}

	m.Name = trimmedName
	m.Description = strings.TrimSpace(description)
	m.Order = order
	m.Asset = strings.TrimSpace(asset)
	m.SubHeadquarterID = subHQ
	m.BuildingID = bld
	m.UpdatedAt = now

	return nil
}
