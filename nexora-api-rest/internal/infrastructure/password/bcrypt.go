package password

import "golang.org/x/crypto/bcrypt"

// BcryptHasher hashes passwords with bcrypt. It is the security adapter of the
// PasswordHasher port (DIP: the algorithm is an infrastructure concern).
type BcryptHasher struct{}

func (BcryptHasher) Hash(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// Compare verifies a raw password against a stored bcrypt hash. It returns a
// non-nil error when they do not match.
func (BcryptHasher) Compare(password, hash string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}

// DummyHash is a precomputed bcrypt hash of a non-secret password. Login uses
// it to spend the same verification work when a user is not found, equalizing
// response time so clients cannot infer which emails exist (timing-based user
// enumeration). Its value is irrelevant; only the fixed computation cost is.
var DummyHash = func() string {
	hash, err := bcrypt.GenerateFromPassword([]byte("nexora-login-timing-dummy"), bcrypt.DefaultCost)
	if err != nil {
		panic("password: precompute dummy hash: " + err.Error())
	}
	return string(hash)
}()
