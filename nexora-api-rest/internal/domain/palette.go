package domain

import (
	"errors"
	"regexp"
	"strings"
	"time"
)

// PaletteID identifies a palette within the system.
type PaletteID string

// MaxPaletteColors is a business invariant: a palette cannot exceed it.
const MaxPaletteColors = 10

// Sentinel errors represent the invariant violations of the palette aggregate.
var (
	ErrPaletteNotFound        = errors.New("palette not found")
	ErrPaletteDuplicated      = errors.New("a palette with this name already exists")
	ErrInvalidPaletteName     = errors.New("palette name must not be empty")
	ErrInvalidPaletteColor    = errors.New("color hex must match #RRGGBB")
	ErrDuplicatedPaletteColor = errors.New("palette cannot contain duplicate colors")
	ErrPaletteColorNotFound   = errors.New("color not found in palette")
	ErrTooManyPaletteColors   = errors.New("palette cannot contain more than 10 colors")
)

// Color is a value object: immutable, identified by the #RRGGBB hex code.
type Color struct {
	Hex  string // canonical form, always uppercased
	Name string // optional human-readable name
}

var colorHexPattern = regexp.MustCompile(`^#[0-9A-Fa-f]{6}$`)

// NewColor builds a Color after validating its hex code (business rule).
func NewColor(hex, name string) (Color, error) {
	color := Color{Hex: strings.ToUpper(hex), Name: name}
	if err := color.Validate(); err != nil {
		return Color{}, err
	}
	return color, nil
}

// Validate enforces the invariant of the value object.
func (c Color) Validate() error {
	if !colorHexPattern.MatchString(c.Hex) {
		return ErrInvalidPaletteColor
	}
	return nil
}

// Equal reports whether two colors are the same value (value semantics).
func (c Color) Equal(other Color) bool {
	return c.Hex == other.Hex
}

// Palette is the core domain entity. It has no dependencies on other layers.
type Palette struct {
	ID        PaletteID
	Name      string
	Colors    []Color
	IsDefined bool
	CreatedAt time.Time
}

// NewPalette is the sanctioned constructor: it enforces the business
// invariants before an entity can exist, so invalid states are rejected
// at creation time rather than silently persisted.
func NewPalette(id PaletteID, name string, colors []Color, isDefined bool, createdAt time.Time) (Palette, error) {
	p := Palette{
		ID:        id,
		Name:      name,
		Colors:    append([]Color(nil), colors...), // defensive copy
		IsDefined: isDefined,
		CreatedAt: createdAt,
	}
	if err := p.Validate(); err != nil {
		return Palette{}, err
	}
	return p, nil
}

// Validate enforces the business invariants of the palette.
func (p Palette) Validate() error {
	switch {
	case p.Name == "":
		return ErrInvalidPaletteName
	case len(p.Colors) > MaxPaletteColors:
		return ErrTooManyPaletteColors
	}
	for _, c := range p.Colors {
		if err := c.Validate(); err != nil {
			return err
		}
	}
	if hasDuplicateColors(p.Colors) {
		return ErrDuplicatedPaletteColor
	}
	return nil
}

// AddColor appends a color. A palette with at least one color is defined.
func (p *Palette) AddColor(c Color) error {
	if err := c.Validate(); err != nil {
		return err
	}
	if len(p.Colors) >= MaxPaletteColors {
		return ErrTooManyPaletteColors
	}
	if p.ContainsColor(c) {
		return ErrDuplicatedPaletteColor
	}
	p.Colors = append(p.Colors, c)
	p.IsDefined = true
	return nil
}

// RemoveColor drops the color that matches the given hex code.
func (p *Palette) RemoveColor(hex string) error {
	for i, c := range p.Colors {
		if strings.EqualFold(c.Hex, hex) {
			p.Colors = append(p.Colors[:i], p.Colors[i+1:]...)
			return nil
		}
	}
	return ErrPaletteColorNotFound
}

// Rename changes the palette name, keeping the non-empty invariant.
func (p *Palette) Rename(name string) error {
	if strings.TrimSpace(name) == "" {
		return ErrInvalidPaletteName
	}
	p.Name = strings.TrimSpace(name)
	return nil
}

// ReplaceColors swaps the whole color list and recalculates "defined".
func (p *Palette) ReplaceColors(colors []Color) error {
	if hasDuplicateColors(colors) {
		return ErrDuplicatedPaletteColor
	}
	if len(colors) > MaxPaletteColors {
		return ErrTooManyPaletteColors
	}
	for _, c := range colors {
		if err := c.Validate(); err != nil {
			return err
		}
	}
	p.Colors = append(p.Colors[:0], colors...)
	p.IsDefined = len(p.Colors) > 0
	return nil
}

// MarkDefined flags the palette as complete.
func (p *Palette) MarkDefined() { p.IsDefined = true }

// MarkUndefined flags the palette as incomplete.
func (p *Palette) MarkUndefined() { p.IsDefined = false }

// SnapshotColors returns a defensive copy so callers cannot mutate state.
func (p Palette) SnapshotColors() []Color {
	return append([]Color(nil), p.Colors...)
}

// ColorCount returns the number of colors in the palette.
func (p Palette) ColorCount() int { return len(p.Colors) }

// ContainsColor reports whether the palette already owns the color.
func (p Palette) ContainsColor(c Color) bool {
	for _, existing := range p.Colors {
		if existing.Equal(c) {
			return true
		}
	}
	return false
}

// hasDuplicateColors reports duplicate hex codes across the list.
func hasDuplicateColors(colors []Color) bool {
	seen := make(map[string]struct{}, len(colors))
	for _, c := range colors {
		key := strings.ToUpper(c.Hex)
		if _, ok := seen[key]; ok {
			return true
		}
		seen[key] = struct{}{}
	}
	return false
}
