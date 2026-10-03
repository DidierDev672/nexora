package ids

import (
	"crypto/rand"
	"encoding/hex"

	"nexora-api-rest/internal/domain"
)

// RandomID generates domain identifiers using crypto/rand.
type RandomID struct{}

func (RandomID) NewRoleID() domain.RoleID {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return domain.RoleID(hex.EncodeToString(b))
}

func (RandomID) NewPaletteID() domain.PaletteID {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return domain.PaletteID(hex.EncodeToString(b))
}

func (RandomID) NewSubHeadquarterID() domain.SubHeadquarterID {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return domain.SubHeadquarterID(hex.EncodeToString(b))
}

func (RandomID) NewHeadquarterID() domain.HeadquarterID {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return domain.HeadquarterID(hex.EncodeToString(b))
}

func (RandomID) NewUserID() domain.UserID {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return domain.UserID(hex.EncodeToString(b))
}

func (RandomID) NewPermissionAssignmentID() domain.PermissionAssignmentID {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return domain.PermissionAssignmentID(hex.EncodeToString(b))
}

func (RandomID) NewRoomTypeID() domain.RoomTypeID {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return domain.RoomTypeID(hex.EncodeToString(b))
}

func (RandomID) NewRoomID() domain.RoomID {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return domain.RoomID(hex.EncodeToString(b))
}

func (RandomID) NewBuildingID() domain.BuildingID {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return domain.BuildingID(hex.EncodeToString(b))
}

func (RandomID) NewBedTypeID() domain.BedTypeID {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return domain.BedTypeID(hex.EncodeToString(b))
}

func (RandomID) NewBedID() domain.BedID {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return domain.BedID(hex.EncodeToString(b))
}

func (RandomID) NewPersonID() domain.PersonID {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return domain.PersonID(hex.EncodeToString(b))
}

func (RandomID) NewReserveID() domain.ReserveID {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return domain.ReserveID(hex.EncodeToString(b))
}

func (RandomID) NewStayID() domain.StayID {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return domain.StayID(hex.EncodeToString(b))
}

func (RandomID) NewRateID() domain.RateID {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return domain.RateID(hex.EncodeToString(b))
}

func (RandomID) NewRoomTariffID() domain.RoomTariffID {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return domain.RoomTariffID(hex.EncodeToString(b))
}
