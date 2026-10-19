package serviceassignment

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// Handler expone las operaciones HTTP para el vertical slice service-assignments (Delivery layer).
type Handler struct {
	uc *UseCase
}

// NewHandler construye el handler HTTP inyectando el caso de uso (DIP).
func NewHandler(uc *UseCase) *Handler {
	return &Handler{uc: uc}
}

// Register asocia las rutas HTTP soportadas al multiplexor de Go stdlib.
func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("POST /service-assignments", h.Create)
	mux.HandleFunc("POST /service-assignments/", h.Create)
	mux.HandleFunc("POST /service-assignment", h.Create)
	mux.HandleFunc("POST /service-assignment/", h.Create)

	mux.HandleFunc("GET /service-assignments", h.List)
	mux.HandleFunc("GET /service-assignments/", h.List)
	mux.HandleFunc("GET /service-assignment", h.List)
	mux.HandleFunc("GET /service-assignment/", h.List)

	mux.HandleFunc("GET /service-assignments/{id}", h.Get)
	mux.HandleFunc("GET /service-assignment/{id}", h.Get)

	mux.HandleFunc("PUT /service-assignments/{id}", h.Update)
	mux.HandleFunc("PUT /service-assignment/{id}", h.Update)
	mux.HandleFunc("PUT /service-assignments", h.Update)
	mux.HandleFunc("PUT /service-assignments/", h.Update)
	mux.HandleFunc("PUT /service-assignment", h.Update)
	mux.HandleFunc("PUT /service-assignment/", h.Update)

	mux.HandleFunc("DELETE /service-assignments/{id}", h.Delete)
	mux.HandleFunc("DELETE /service-assignment/{id}", h.Delete)
	mux.HandleFunc("DELETE /service-assignments", h.Delete)
	mux.HandleFunc("DELETE /service-assignments/", h.Delete)
	mux.HandleFunc("DELETE /service-assignment", h.Delete)
	mux.HandleFunc("DELETE /service-assignment/", h.Delete)
}

// CreateRequest representa el payload recibido en POST /service-assignments.
type CreateRequest struct {
	ServiceRequestID string `json:"service_request_id"`
	StayID           string `json:"stay_id"`
	PersonID         string `json:"person_id"`
	IsActive         *bool  `json:"is_active"`
}

// UpdateRequest representa el payload recibido en PUT /service-assignments.
type UpdateRequest struct {
	ID               string `json:"id"`
	ServiceRequestID string `json:"service_request_id"`
	StayID           string `json:"stay_id"`
	PersonID         string `json:"person_id"`
	IsActive         *bool  `json:"is_active"`
}

// Create maneja POST /service-assignments.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreateRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	assignment, err := h.uc.Create(r.Context(), CreateInput{
		ServiceRequestID: req.ServiceRequestID,
		StayID:           req.StayID,
		PersonID:         req.PersonID,
		IsActive:         isActive,
	})
	if err != nil {
		h.handleDomainError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusCreated, assignment)
}

// List maneja GET /service-assignments.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	items, err := h.uc.List(r.Context())
	if err != nil {
		httpjson.WriteInternalError(w, err)
		return
	}
	httpjson.WriteJSON(w, http.StatusOK, items)
}

// Get maneja GET /service-assignments/{id}.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id := ID(r.PathValue("id"))
	if id == "" {
		id = ID(r.URL.Query().Get("id"))
	}

	item, err := h.uc.GetByID(r.Context(), id)
	if err != nil {
		h.handleDomainError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, item)
}

// Update maneja PUT /service-assignments/{id}.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	var req UpdateRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if idStr == "" {
		idStr = req.ID
	}
	if idStr == "" {
		httpjson.WriteError(w, http.StatusBadRequest, "id is required")
		return
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	updated, err := h.uc.Update(r.Context(), UpdateInput{
		ID:               ID(idStr),
		ServiceRequestID: req.ServiceRequestID,
		StayID:           req.StayID,
		PersonID:         req.PersonID,
		IsActive:         isActive,
	})
	if err != nil {
		h.handleDomainError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, updated)
}

// Delete maneja DELETE /service-assignments/{id}.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	if idStr == "" {
		idStr = r.URL.Query().Get("id")
	}
	if idStr == "" {
		var req struct {
			ID string `json:"id"`
		}
		if err := httpjson.DecodeJSON(r, &req); err == nil && req.ID != "" {
			idStr = req.ID
		}
	}

	if idStr == "" {
		httpjson.WriteError(w, http.StatusBadRequest, "id is required")
		return
	}

	if err := h.uc.Delete(r.Context(), ID(idStr)); err != nil {
		h.handleDomainError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, map[string]string{"message": "service assignment deleted successfully"})
}

func (h *Handler) handleDomainError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrNotFound):
		httpjson.WriteError(w, http.StatusNotFound, err.Error())
	case errors.Is(err, ErrInvalidID),
		errors.Is(err, ErrInvalidServiceRequestID),
		errors.Is(err, ErrInvalidStayID),
		errors.Is(err, ErrInvalidPersonID):
		httpjson.WriteError(w, http.StatusBadRequest, err.Error())
	default:
		httpjson.WriteInternalError(w, err)
	}
}
