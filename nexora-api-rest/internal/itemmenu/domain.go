package itemmenu

import (
	"errors"
	"strings"
	"time"
)

// ID identifica de forma unívoca a un ítem de menú.
type ID string

func (id ID) String() string {
	return string(id)
}

// Sentinel errors para violaciones de invariantes de dominio.
var (
	ErrNotFound             = errors.New("item menu not found")
	ErrInvalidID            = errors.New("id is required")
	ErrInvalidCategoryID    = errors.New("category_id is required")
	ErrEmptyName            = errors.New("name is required")
	ErrInvalidPrice         = errors.New("price cannot be negative")
	ErrInvalidTaxPercentage = errors.New("tax_percentage cannot be negative")
	ErrInvalidPrepTime      = errors.New("prep_time cannot be negative")
)

// ItemMenu representa la entidad central de dominio para un platillo, bebida o ítem de menú.
type ItemMenu struct {
	ID            ID
	CategoryID    string
	Name          string
	Description   string
	Price         float64
	TaxPercentage float64
	PrepTime      *int
	IsVegetarian  bool
	IsVegan       bool
	ImageURL      string
	StartTime     string
	EndTime       string
	Available     bool
	CreatedBy     string
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// NewItemMenu es el constructor de la entidad que valida todas las invariantes de negocio.
func NewItemMenu(
	id ID,
	categoryID string,
	name string,
	description string,
	price float64,
	taxPercentage float64,
	prepTime *int,
	isVegetarian bool,
	isVegan bool,
	imageURL string,
	startTime string,
	endTime string,
	available bool,
	createdBy string,
	now time.Time,
) (ItemMenu, error) {
	trimmedID := ID(strings.TrimSpace(string(id)))
	if trimmedID == "" {
		return ItemMenu{}, ErrInvalidID
	}

	trimmedCatID := strings.TrimSpace(categoryID)
	if trimmedCatID == "" {
		return ItemMenu{}, ErrInvalidCategoryID
	}

	trimmedName := strings.TrimSpace(name)
	if trimmedName == "" {
		return ItemMenu{}, ErrEmptyName
	}

	if price < 0 {
		return ItemMenu{}, ErrInvalidPrice
	}

	if taxPercentage < 0 {
		return ItemMenu{}, ErrInvalidTaxPercentage
	}

	var pt *int
	if prepTime != nil {
		if *prepTime < 0 {
			return ItemMenu{}, ErrInvalidPrepTime
		}
		val := *prepTime
		pt = &val
	}

	// Regla de dominio: Todo platillo vegano es inherentemente vegetariano
	if isVegan {
		isVegetarian = true
	}

	if now.IsZero() {
		now = time.Now().UTC()
	}

	return ItemMenu{
		ID:            trimmedID,
		CategoryID:    trimmedCatID,
		Name:          trimmedName,
		Description:   strings.TrimSpace(description),
		Price:         price,
		TaxPercentage: taxPercentage,
		PrepTime:      pt,
		IsVegetarian:  isVegetarian,
		IsVegan:       isVegan,
		ImageURL:      strings.TrimSpace(imageURL),
		StartTime:     strings.TrimSpace(startTime),
		EndTime:       strings.TrimSpace(endTime),
		Available:     available,
		CreatedBy:     strings.TrimSpace(createdBy),
		CreatedAt:     now,
		UpdatedAt:     now,
	}, nil
}

// Update actualiza los atributos mutables garantizando las invariantes de negocio.
func (i *ItemMenu) Update(
	name string,
	description string,
	price float64,
	taxPercentage float64,
	prepTime *int,
	isVegetarian bool,
	isVegan bool,
	imageURL string,
	startTime string,
	endTime string,
	available bool,
	now time.Time,
) error {
	trimmedName := strings.TrimSpace(name)
	if trimmedName == "" {
		return ErrEmptyName
	}

	if price < 0 {
		return ErrInvalidPrice
	}

	if taxPercentage < 0 {
		return ErrInvalidTaxPercentage
	}

	var pt *int
	if prepTime != nil {
		if *prepTime < 0 {
			return ErrInvalidPrepTime
		}
		val := *prepTime
		pt = &val
	}

	if isVegan {
		isVegetarian = true
	}

	if now.IsZero() {
		now = time.Now().UTC()
	}

	i.Name = trimmedName
	i.Description = strings.TrimSpace(description)
	i.Price = price
	i.TaxPercentage = taxPercentage
	i.PrepTime = pt
	i.IsVegetarian = isVegetarian
	i.IsVegan = isVegan
	i.ImageURL = strings.TrimSpace(imageURL)
	i.StartTime = strings.TrimSpace(startTime)
	i.EndTime = strings.TrimSpace(endTime)
	i.Available = available
	i.UpdatedAt = now

	return nil
}
