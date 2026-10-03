package memory

import (
	"context"
	"sync"

	"nexora-api-rest/internal/domain"
)

// PaletteRepository is an in-memory, concurrency-safe implementation of
// domain.PaletteRepository (the persistence adapter of the DIP).
type PaletteRepository struct {
	mu       sync.RWMutex
	palettes map[domain.PaletteID]domain.Palette
}

func NewPaletteRepository() *PaletteRepository {
	return &PaletteRepository{palettes: make(map[domain.PaletteID]domain.Palette)}
}

var _ domain.PaletteRepository = (*PaletteRepository)(nil)

func (r *PaletteRepository) FindAll(_ context.Context) ([]domain.Palette, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	out := make([]domain.Palette, 0, len(r.palettes))
	for _, p := range r.palettes {
		out = append(out, p)
	}
	return out, nil
}

func (r *PaletteRepository) FindByID(_ context.Context, id domain.PaletteID) (domain.Palette, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	p, ok := r.palettes[id]
	if !ok {
		return domain.Palette{}, domain.ErrPaletteNotFound
	}
	return p, nil
}

func (r *PaletteRepository) FindByName(_ context.Context, name string) (domain.Palette, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, p := range r.palettes {
		if p.Name == name {
			return p, nil
		}
	}
	return domain.Palette{}, domain.ErrPaletteNotFound
}

func (r *PaletteRepository) Save(_ context.Context, p domain.Palette) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.palettes[p.ID]; ok {
		return domain.ErrPaletteDuplicated
	}
	r.palettes[p.ID] = p
	return nil
}

func (r *PaletteRepository) Update(_ context.Context, p domain.Palette) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.palettes[p.ID]; !ok {
		return domain.ErrPaletteNotFound
	}
	r.palettes[p.ID] = p
	return nil
}

func (r *PaletteRepository) Delete(_ context.Context, id domain.PaletteID) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.palettes[id]; !ok {
		return domain.ErrPaletteNotFound
	}
	delete(r.palettes, id)
	return nil
}
