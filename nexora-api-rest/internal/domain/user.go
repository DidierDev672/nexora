package domain

import (
	"errors"
	"net/mail"
	"time"
)

// UserStatus represents the lifecycle state of a user.
type UserStatus string

const (
	UserStatusActive   UserStatus = "active"
	UserStatusInactive UserStatus = "inactive"

	// DefaultUserCreatedBy is the audit value used when a user is created
	// by the system itself (seeders, migrations, automation). When a human
	// creates the user, the caller sends "user(<id>)" explicitly.
	DefaultUserCreatedBy = "user_system"
)

// UserID identifies a user within the system.
type UserID string

// Sentinel errors represent the invariant violations of the user aggregate.
var (
	ErrUserNotFound                 = errors.New("user not found")
	ErrUserDuplicated               = errors.New("a user with this email already exists")
	ErrInvalidUserName              = errors.New("user name must not be empty")
	ErrInvalidUserEmail             = errors.New("user email must be a valid email address")
	ErrInvalidUserPassword          = errors.New("password must be at least 8 characters")
	ErrInvalidUserRoleID            = errors.New("role id must not be empty")
	ErrInvalidUserSubUnit           = errors.New("sub_headquarters_id requires headquarters_id")
	ErrInvalidUserReference         = errors.New("referenced role, headquarter or sub headquarter does not exist")
	ErrInvalidUserRoleRef           = errors.New("role does not exist")
	ErrInvalidUserHeadquarterRef    = errors.New("headquarter does not exist")
	ErrInvalidUserSubHeadquarterRef = errors.New("sub headquarter does not exist")
	ErrInvalidUserStatus            = errors.New("invalid user status")
)

// User is the core domain entity. It has no dependencies on other layers.
// HeadquartersID and SubHeadquartersID are optional references, hence pointers
// (nil means "not assigned"). PasswordHash must never contain the raw password.
type User struct {
	ID                UserID
	Name              string
	Email             string
	PasswordHash      string
	RoleID            RoleID
	HeadquartersID    *HeadquarterID
	SubHeadquartersID *SubHeadquarterID
	Status            UserStatus
	CreatedBy         string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

// Validate enforces the business invariants of a user.
func (u User) Validate() error {
	switch {
	case u.Name == "":
		return ErrInvalidUserName
	case !isValidEmail(u.Email):
		return ErrInvalidUserEmail
	case u.PasswordHash == "":
		return ErrInvalidUserPassword
	case u.RoleID == "":
		return ErrInvalidUserRoleID
	case u.SubHeadquartersID != nil && u.HeadquartersID == nil:
		return ErrInvalidUserSubUnit
	}
	switch u.Status {
	case UserStatusActive, UserStatusInactive:
		return nil
	default:
		return ErrInvalidUserStatus
	}
}

// ValidateUserPassword checks the raw password policy BEFORE hashing. The
// entity only stores the hash, so the password rule lives here and is enforced
// by the application layer before invoking the password hasher.
func ValidateUserPassword(password string) error {
	if len(password) < 8 {
		return ErrInvalidUserPassword
	}
	return nil
}

// ParseUserStatus converts a string representation into a valid status.
func ParseUserStatus(s string) (UserStatus, error) {
	status := UserStatus(s)
	switch status {
	case UserStatusActive, UserStatusInactive:
		return status, nil
	default:
		return "", ErrInvalidUserStatus
	}
}

func isValidEmail(email string) bool {
	parsed, err := mail.ParseAddress(email)
	return err == nil && parsed.Address == email
}
