package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"

	"nexora-api-rest/internal/domain"
)

// defaultIssuer labels tokens produced by this service so another service can
// never validate/accept them.
const defaultIssuer = "nexora-api-rest"

// JWTTokenGenerator signs short-lived JWT access tokens with HS256. It is the
// security adapter of the TokenGenerator port (DIP: the signing algorithm and
// the secret are infrastructure concerns).
type JWTTokenGenerator struct {
	secret []byte
	issuer string
	ttl    time.Duration
}

// NewJWTTokenGenerator builds a signer with a fixed time-to-live. The secret
// must be high-entropy and is provided from configuration, never hardcoded.
func NewJWTTokenGenerator(secret string, ttl time.Duration) *JWTTokenGenerator {
	return &JWTTokenGenerator{
		secret: []byte(secret),
		issuer: defaultIssuer,
		ttl:    ttl,
	}
}

// GenerateForUser signs a token whose claims carry the user id as Subject and
// a short expiry (15 minutes). No personal data is embedded: the id is enough
// for the protected endpoints to reload the user.
func (g *JWTTokenGenerator) GenerateForUser(id domain.UserID) (string, error) {
	now := time.Now()
	claims := jwt.RegisteredClaims{
		Subject:   string(id),
		Issuer:    g.issuer,
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(now.Add(g.ttl)),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(g.secret)
	if err != nil {
		return "", err
	}
	return signed, nil
}
