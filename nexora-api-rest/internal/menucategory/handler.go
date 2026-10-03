package menucategory

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"nexora-api-rest/internal/api/httpjson"
)

// Handler expone las operaciones HTTP para el vertical slice menu-category (Delivery layer).
type Handler struct {
	uc *UseCase
}

// NewHandler construye el handler HTTP inyectando el caso de uso (DIP).
func NewHandler(uc *UseCase) *Handler {
	return &Handler{uc: uc}
}

// Register asocia las rutas HTTP soportadas al multiplexor de Go stdlib.
func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("POST /menu-category", h.Create)
	mux.HandleFunc("POST /menu-categories", h.Create)

	mux.HandleFunc("GET /menu-category", h.List)
	mux.HandleFunc("GET /menu-categories", h.List)

	mux.HandleFunc("GET /menu-category/{id}", h.Get)
	mux.HandleFunc("GET /menu-categories/{id}", h.Get)

	mux.HandleFunc("PUT /menu-category/{id}", h.Update)
	mux.HandleFunc("PUT /menu-category", h.Update)
	mux.HandleFunc("PUT /menu-categories/{id}", h.Update)
	mux.HandleFunc("PUT /menu-categories", h.Update)

	mux.HandleFunc("DELETE /menu-category/{id}", h.Delete)
	mux.HandleFunc("DELETE /menu-category", h.Delete)
	mux.HandleFunc("DELETE /menu-categories/{id}", h.Delete)
	mux.HandleFunc("DELETE /menu-categories", h.Delete)
}

// CreateRequest representa el payload recibido en POST /menu-category.
type CreateRequest struct {
	HeadquarterID        string  `json:"headquartes_id"`
	HeadquartersIDAlt    string  `json:"headquarters_id"`
	SubHeadquarterID     *string `json:"sub_headquartes_id"`
	SubHeadquartersIDAlt *string `json:"sub_headquarters_id"`
	BuildingID           *string `json:"building_id"`
	Name                 string  `json:"name"`
	Description          string  `json:"description"`
	Order                int     `json:"order"`
	Asset                string  `json:"asset"`
	CreatedBy            string  `json:"created_by"`
}

// UpdateRequest representa el payload recibido en PUT /menu-category.
type UpdateRequest struct {
	ID                   string  `json:"id"`
	SubHeadquarterID     *string `json:"sub_headquartes_id"`
	SubHeadquartersIDAlt *string `json:"sub_headquarters_id"`
	BuildingID           *string `json:"building_id"`
	Name                 string  `json:"name"`
	Description          string  `json:"description"`
	Order                int     `json:"order"`
	Asset                string  `json:"asset"`
}

// DeleteRequest representa el payload opcional recibido en DELETE /menu-category.
type DeleteRequest struct {
	ID string `json:"id"`
}

// Response es la proyección JSON estándar de una categoría de menú.
type Response struct {
	ID               string    `json:"id"`
	HeadquarterID    string    `json:"headquartes_id"`
	SubHeadquarterID *string   `json:"sub_headquartes_id,omitempty"`
	BuildingID       *string   `json:"building_id,omitempty"`
	Name             string    `json:"name"`
	Description      string    `json:"description"`
	Order            int       `json:"order"`
	Asset            string    `json:"asset"`
	CreatedBy        string    `json:"created_by"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

func newResponse(c MenuCategory) Response {
	return Response{
		ID:               string(c.ID),
		HeadquarterID:    c.HeadquarterID,
		SubHeadquarterID: c.SubHeadquarterID,
		BuildingID:       c.BuildingID,
		Name:             c.Name,
		Description:      c.Description,
		Order:            c.Order,
		Asset:            c.Asset,
		CreatedBy:        c.CreatedBy,
		CreatedAt:        c.CreatedAt,
		UpdatedAt:        c.UpdatedAt,
	}
}

// Create maneja POST /menu-category.
// En su primera ejecución en el servidor, dispara la creación automática de la tabla en Postgres.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreateRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	hqID := req.HeadquarterID
	if hqID == "" {
		hqID = req.HeadquartersIDAlt
	}

	subHQ := req.SubHeadquarterID
	if subHQ == nil {
		subHQ = req.SubHeadquartersIDAlt
	}

	created, err := h.uc.Create(r.Context(), CreateInput{
		HeadquarterID:    hqID,
		SubHeadquarterID: subHQ,
		BuildingID:       req.BuildingID,
		Name:             req.Name,
		Description:      req.Description,
		Order:            req.Order,
		Asset:            req.Asset,
		CreatedBy:        req.CreatedBy,
	})
	if err != nil {
		h.handleDomainError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusCreated, newResponse(created))
}

// Get maneja GET /menu-category/{id}.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id := ID(strings.TrimSpace(r.PathValue("id")))
	if id == "" {
		id = ID(strings.TrimSpace(r.URL.Query().Get("id")))
	}

	category, err := h.uc.GetByID(r.Context(), id)
	if err != nil {
		h.handleDomainError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newResponse(category))
}

// List maneja GET /menu-category con soporte para filtrado por query params.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	hqID := query.Get("headquartes_id")
	if hqID == "" {
		hqID = query.Get("headquarters_id")
	}

	var subHQ *string
	if val := query.Get("sub_headquartes_id"); val != "" {
		subHQ = &val
	} else if val := query.Get("sub_headquarters_id"); val != "" {
		subHQ = &val
	}

	var bld *string
	if val := query.Get("building_id"); val != "" {
		bld = &val
	}

	categories, err := h.uc.List(r.Context(), ListFilter{
		HeadquarterID:    hqID,
		SubHeadquarterID: subHQ,
		BuildingID:       bld,
	})
	if err != nil {
		httpjson.WriteInternalError(w, err)
		return
	}

	responses := make([]Response, len(categories))
	for i, c := range categories {
		responses[i] = newResponse(c)
	}

	httpjson.WriteJSON(w, http.StatusOK, responses)
}

// Update maneja PUT /menu-category/{id} o PUT /menu-category.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	var req UpdateRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	idStr := strings.TrimSpace(r.PathValue("id"))
	if idStr == "" {
		idStr = strings.TrimSpace(req.ID)
	}
	if idStr == "" {
		idStr = strings.TrimSpace(r.URL.Query().Get("id"))
	}

	subHQ := req.SubHeadquarterID
	if subHQ == nil {
		subHQ = req.SubHeadquartersIDAlt
	}

	updated, err := h.uc.Update(r.Context(), UpdateInput{
		ID:               ID(idStr),
		SubHeadquarterID: subHQ,
		BuildingID:       req.BuildingID,
		Name:             req.Name,
		Description:      req.Description,
		Order:            req.Order,
		Asset:            req.Asset,
	})
	if err != nil {
		h.handleDomainError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newResponse(updated))
}

// Delete maneja DELETE /menu-category/{id} o DELETE /menu-category.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimSpace(r.PathValue("id"))
	if idStr == "" {
		idStr = strings.TrimSpace(r.URL.Query().Get("id"))
	}
	if idStr == "" && r.Body != nil {
		var req DeleteRequest
		_ = httpjson.DecodeJSON(r, &req)
		idStr = strings.TrimSpace(req.ID)
	}

	if err := h.uc.Delete(r.Context(), ID(idStr)); err != nil {
		h.handleDomainError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) handleDomainError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrNotFound):
		httpjson.WriteError(w, http.StatusNotFound, err.Error())
	case errors.Is(err, ErrInvalidID),
		errors.Is(err, ErrInvalidHeadquarterID),
		errors.Is(err, ErrEmptyName),
		errors.Is(err, ErrInvalidOrder):
		httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
	default:
		httpjson.WriteInternalError(w, err)
	}
}
