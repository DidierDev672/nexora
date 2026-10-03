package roomtariff

import "nexora-api-rest/internal/domain"

// normalizeStatus defaults an empty status to active so a room tariff is
// usable right after creation unless the operator explicitly disables it.
func normalizeStatus(raw string) (domain.RoomTariffStatus, error) {
	if raw == "" {
		return domain.RoomTariffStatusActive, nil
	}
	return domain.ParseRoomTariffStatus(raw)
}
