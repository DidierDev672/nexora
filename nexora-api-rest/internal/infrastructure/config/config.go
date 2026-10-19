package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Database struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
	Timezone string
}

func Load() error {
	return godotenv.Load()
}

// JWTSecret returns the symmetric key used to sign access tokens. It must be
// a high-entropy value loaded from the environment, never hardcoded.
func JWTSecret() string {
	return os.Getenv("JWT_SECRET")
}

// CORSAllowedOrigins returns the browser origins allowed to call the API,
// read from CORS_ALLOWED_ORIGINS (comma separated). Defaults to the local
// Vite origin so the API works out of the box.
func CORSAllowedOrigins() []string {
	raw := os.Getenv("CORS_ALLOWED_ORIGINS")
	if raw == "" {
		return []string{"http://localhost:5173"}
	}
	parts := strings.Split(raw, ",")
	origins := make([]string, 0, len(parts))
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			origins = append(origins, p)
		}
	}
	return origins
}

func DatabaseURL() string {
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = os.Getenv("DB_SCHEMA")
	}
	db := Database{
		Host:     os.Getenv("DB_HOST"),
		Port:     os.Getenv("DB_PORT"),
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
		Name:     dbName,
		SSLMode:  os.Getenv("DB_SSLMODE"),
		Timezone: os.Getenv("DB_TIMEZONE"),
	}

	return fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s&timezone=%s",
		db.User, db.Password, db.Host, db.Port, db.Name, db.SSLMode, db.Timezone,
	)
}
