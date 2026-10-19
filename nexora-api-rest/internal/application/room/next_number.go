package room

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"nexora-api-rest/internal/domain"
)

// RoomNextNumberGetter is the narrow port used by the HTTP layer (ISP).
type RoomNextNumberGetter interface {
	NextNumber(ctx context.Context) (string, error)
}

// NextNumberUseCase computes the next room number across the whole room
// inventory, in "<base>-<consecutive>" form.
type NextNumberUseCase struct {
	repo domain.RoomRepository
}

func NewNextNumberUseCase(repo domain.RoomRepository) *NextNumberUseCase {
	return &NextNumberUseCase{repo: repo}
}

func (uc *NextNumberUseCase) NextNumber(ctx context.Context) (string, error) {
	rooms, err := uc.repo.FindAll(ctx)
	if err != nil {
		return "", err
	}
	return nextConsecutiveNumber(rooms), nil
}

// nextConsecutiveNumber returns "<base+1>-<suffix+1>": the initial room number
// is bumped by one and the "-<consecutive>" companion is bumped alongside it.
// A plain number ("101") has suffix 0, so a lone "101" yields "102-1"; a prior
// "102-1" then yields "103-2". Numbers with no numeric base are ignored; an
// empty inventory starts at "1-1".
func nextConsecutiveNumber(rooms []domain.Room) string {
	found := false
	maxBase := 0
	maxSuffix := 0

	for _, room := range rooms {
		base, suffix, ok := parseRoomNumber(room.Number)
		if !ok {
			continue
		}
		switch {
		case !found || base > maxBase:
			found = true
			maxBase = base
			maxSuffix = suffix
		case base == maxBase && suffix > maxSuffix:
			maxSuffix = suffix
		}
	}

	if !found {
		return "1-1"
	}
	return fmt.Sprintf("%d-%d", maxBase+1, maxSuffix+1)
}

// parseRoomNumber splits a room number into its numeric base and optional
// "-<suffix>" consecutive ("101" -> 101/0, "101-2" -> 101/2, "A-12" -> not ok).
func parseRoomNumber(number string) (base, suffix int, ok bool) {
	s := strings.TrimSpace(number)
	if s == "" {
		return 0, 0, false
	}
	if idx := strings.LastIndex(s, "-"); idx >= 0 {
		b, errBase := strconv.Atoi(strings.TrimSpace(s[:idx]))
		n, errSuffix := strconv.Atoi(strings.TrimSpace(s[idx+1:]))
		if errBase == nil && errSuffix == nil && b >= 0 && n >= 0 {
			return b, n, true
		}
	}
	b, err := strconv.Atoi(s)
	if err != nil || b < 0 {
		return 0, 0, false
	}
	return b, 0, true
}
