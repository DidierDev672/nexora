package httpjson

import (
	"encoding/json"
	"log"
	"net/http"
)

// DecodeJSON reads a request body into dst, rejecting unknown fields.
func DecodeJSON(r *http.Request, dst any) error {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	return decoder.Decode(dst)
}

// WriteJSON renders v as JSON with the given status code.
func WriteJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// WriteError renders a JSON error body with the given status code.
func WriteError(w http.ResponseWriter, status int, message string) {
	WriteJSON(w, status, map[string]string{"error": message})
}

// WriteInternalError logs the underlying error and renders a generic 500
// response without leaking its details to the client.
func WriteInternalError(w http.ResponseWriter, err error) {
	log.Printf("internal server error: %v", err)
	WriteError(w, http.StatusInternalServerError, "internal server error")
}
