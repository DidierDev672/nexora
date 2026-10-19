package room

import (
	"testing"

	"nexora-api-rest/internal/domain"
)

func roomWithNumber(number string) domain.Room {
	return domain.Room{Number: number}
}

func TestNextConsecutiveNumber(t *testing.T) {
	tests := []struct {
		name string
		nums []string
		want string
	}{
		{"empty inventory starts at 1-1", nil, "1-1"},
		{"single plain number gets -1", []string{"101"}, "101-1"},
		{"increments existing suffix", []string{"101", "101-1"}, "101-2"},
		{"skips to max suffix + 1", []string{"101-1", "101-3"}, "101-4"},
		{"uses highest base", []string{"101", "205", "205-2"}, "205-3"},
		{"ignores non numeric numbers", []string{"A-1", "101"}, "101-1"},
		{"all non numeric falls back", []string{"A", "B-2"}, "1-1"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rooms := make([]domain.Room, 0, len(tt.nums))
			for _, n := range tt.nums {
				rooms = append(rooms, roomWithNumber(n))
			}
			if got := nextConsecutiveNumber(rooms); got != tt.want {
				t.Errorf("nextConsecutiveNumber() = %q, want %q", got, tt.want)
			}
		})
	}
}
