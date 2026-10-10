package api

import (
	"net/http"

	"nexora-api-rest/internal/infrastructure/config"
)

const (
	corsAllowMethods = "GET, POST, PUT, DELETE, OPTIONS"
	corsAllowHeaders = "Content-Type, Authorization, auth-token"
	corsMaxAge       = "600"
)

// corsMiddleware applies the CORS policy to every response. The allowed
// origins come from CORS_ALLOWED_ORIGINS (see config.CORSAllowedOrigins).
// Requests with no Origin header (curl, server-to-server, tests) always pass.
// Browser preflights (OPTIONS) are answered transparently and must not be
// confused with a failed POST: the actual POST still returns its own status.
func corsMiddleware(next http.Handler) http.Handler {
	allowed := config.CORSAllowedOrigins()
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			if !containsOrigin(allowed, origin) {
				// Origin not allowed: omit CORS headers so the browser blocks
				// it, and fail the preflight visibly instead of pretending.
				if r.Method == http.MethodOptions {
					http.Error(w, "origin not allowed", http.StatusForbidden)
					return
				}
				next.ServeHTTP(w, r)
				return
			}
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}

		w.Header().Set("Access-Control-Allow-Methods", corsAllowMethods)
		w.Header().Set("Access-Control-Allow-Headers", corsAllowHeaders)
		w.Header().Set("Access-Control-Max-Age", corsMaxAge)

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func containsOrigin(origins []string, origin string) bool {
	for _, o := range origins {
		if o == origin {
			return true
		}
	}
	return false
}
