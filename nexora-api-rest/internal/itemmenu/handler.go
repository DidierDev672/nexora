package itemmenu

import (
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"nexora-api-rest/internal/api/httpjson"
)

// Handler expone las operaciones HTTP para el vertical slice item-menu (Delivery layer).
type Handler struct {
	uc *UseCase
}

// NewHandler construye el handler HTTP inyectando el caso de uso (DIP).
func NewHandler(uc *UseCase) *Handler {
	return &Handler{uc: uc}
}

// Register asocia las rutas HTTP soportadas al multiplexor de Go stdlib.
func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("POST /item-menu", h.Create)
	mux.HandleFunc("POST /item-menus", h.Create)

	mux.HandleFunc("GET /item-menu", h.List)
	mux.HandleFunc("GET /item-menus", h.List)

	mux.HandleFunc("GET /item-menu/{id}", h.Get)
	mux.HandleFunc("GET /item-menus/{id}", h.Get)

	mux.HandleFunc("PUT /item-menu/{id}", h.Update)
	mux.HandleFunc("PUT /item-menu", h.Update)
	mux.HandleFunc("PUT /item-menus/{id}", h.Update)
	mux.HandleFunc("PUT /item-menus", h.Update)

	mux.HandleFunc("DELETE /item-menu/{id}", h.Delete)
	mux.HandleFunc("DELETE /item-menu", h.Delete)
	mux.HandleFunc("DELETE /item-menus/{id}", h.Delete)
	mux.HandleFunc("DELETE /item-menus", h.Delete)
}

// CreateRequest representa el payload recibido en POST /item-menu.
type CreateRequest struct {
	CategoryID      string  `json:"category_id"`
	Name            string  `json:"name"`
	Description     string  `json:"description"`
	Price           float64 `json:"price"`
	TaxPercentage   float64 `json:"tax_percentage"`
	PrepTime        *int    `json:"prep_time"`
	IsVegetarian    *bool   `json:"isVegetarian"`
	IsVegetarianAlt *bool   `json:"is_vegetarian"`
	IsVegan         *bool   `json:"isVegan"`
	IsVeganAlt      *bool   `json:"is_vegan"`
	ImageURL        string  `json:"imageURL"`
	ImageURLAlt     string  `json:"image_url"`
	StartTime       string  `json:"start_time"`
	EndTime         string  `json:"end_time"`
	Available       *bool   `json:"available"`
	CreatedBy       string  `json:"created_by"`
}

// UpdateRequest representa el payload recibido en PUT /item-menu.
type UpdateRequest struct {
	ID              string  `json:"id"`
	Name            string  `json:"name"`
	Description     string  `json:"description"`
	Price           float64 `json:"price"`
	TaxPercentage   float64 `json:"tax_percentage"`
	PrepTime        *int    `json:"prep_time"`
	IsVegetarian    *bool   `json:"isVegetarian"`
	IsVegetarianAlt *bool   `json:"is_vegetarian"`
	IsVegan         *bool   `json:"isVegan"`
	IsVeganAlt      *bool   `json:"is_vegan"`
	ImageURL        string  `json:"imageURL"`
	ImageURLAlt     string  `json:"image_url"`
	StartTime       string  `json:"start_time"`
	EndTime         string  `json:"end_time"`
	Available       *bool   `json:"available"`
}

// DeleteRequest representa el payload opcional en DELETE /item-menu.
type DeleteRequest struct {
	ID string `json:"id"`
}

// Response es la proyección JSON estándar de un ítem de menú.
type Response struct {
	ID            string    `json:"id"`
	CategoryID    string    `json:"category_id"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	Price         float64   `json:"price"`
	TaxPercentage float64   `json:"tax_percentage"`
	PrepTime      *int      `json:"prep_time,omitempty"`
	IsVegetarian  bool      `json:"isVegetarian"`
	IsVegan       bool      `json:"isVegan"`
	ImageURL      string    `json:"imageURL"`
	StartTime     string    `json:"start_time"`
	EndTime       string    `json:"end_time"`
	Available     bool      `json:"available"`
	CreatedBy     string    `json:"created_by"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func newResponse(item ItemMenu) Response {
	return Response{
		ID:            string(item.ID),
		CategoryID:    item.CategoryID,
		Name:          item.Name,
		Description:   item.Description,
		Price:         item.Price,
		TaxPercentage: item.TaxPercentage,
		PrepTime:      item.PrepTime,
		IsVegetarian:  item.IsVegetarian,
		IsVegan:       item.IsVegan,
		ImageURL:      item.ImageURL,
		StartTime:     item.StartTime,
		EndTime:       item.EndTime,
		Available:     item.Available,
		CreatedBy:     item.CreatedBy,
		CreatedAt:     item.CreatedAt,
		UpdatedAt:     item.UpdatedAt,
	}
}

// Create maneja POST /item-menu.
// En su primera ejecución en el servidor, dispara la creación automática de la tabla en Postgres.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreateRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	isVeg := false
	if req.IsVegetarian != nil {
		isVeg = *req.IsVegetarian
	} else if req.IsVegetarianAlt != nil {
		isVeg = *req.IsVegetarianAlt
	}

	isVegan := false
	if req.IsVegan != nil {
		isVegan = *req.IsVegan
	} else if req.IsVeganAlt != nil {
		isVegan = *req.IsVeganAlt
	}

	imgURL := req.ImageURL
	if imgURL == "" {
		imgURL = req.ImageURLAlt
	}

	avail := true
	if req.Available != nil {
		avail = *req.Available
	}

	created, err := h.uc.Create(r.Context(), CreateInput{
		CategoryID:    req.CategoryID,
		Name:          req.Name,
		Description:   req.Description,
		Price:         req.Price,
		TaxPercentage: req.TaxPercentage,
		PrepTime:      req.PrepTime,
		IsVegetarian:  isVeg,
		IsVegan:       isVegan,
		ImageURL:      imgURL,
		StartTime:     req.StartTime,
		EndTime:       req.EndTime,
		Available:     avail,
		CreatedBy:     req.CreatedBy,
	})
	if err != nil {
		h.handleDomainError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusCreated, newResponse(created))
}

// Get maneja GET /item-menu/{id}.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id := ID(strings.TrimSpace(r.PathValue("id")))
	if id == "" {
		id = ID(strings.TrimSpace(r.URL.Query().Get("id")))
	}

	item, err := h.uc.GetByID(r.Context(), id)
	if err != nil {
		h.handleDomainError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newResponse(item))
}

// List maneja GET /item-menu con soporte para filtros por query params.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	categoryID := query.Get("category_id")

	var avail *bool
	if val := query.Get("available"); val != "" {
		b, err := strconv.ParseBool(val)
		if err == nil {
			avail = &b
		}
	}

	var isVeg *bool
	if val := query.Get("isVegetarian"); val != "" {
		b, err := strconv.ParseBool(val)
		if err == nil {
			isVeg = &b
		}
	} else if val := query.Get("is_vegetarian"); val != "" {
		b, err := strconv.ParseBool(val)
		if err == nil {
			isVeg = &b
		}
	}

	var isVegan *bool
	if val := query.Get("isVegan"); val != "" {
		b, err := strconv.ParseBool(val)
		if err == nil {
			isVegan = &b
		}
	} else if val := query.Get("is_vegan"); val != "" {
		b, err := strconv.ParseBool(val)
		if err == nil {
			isVegan = &b
		}
	}

	items, err := h.uc.List(r.Context(), ListFilter{
		CategoryID:   categoryID,
		Available:    avail,
		IsVegetarian: isVeg,
		IsVegan:      isVegan,
	})
	if err != nil {
		httpjson.WriteInternalError(w, err)
		return
	}

	responses := make([]Response, len(items))
	for i, item := range items {
		responses[i] = newResponse(item)
	}

	httpjson.WriteJSON(w, http.StatusOK, responses)
}

// Update maneja PUT /item-menu/{id} o PUT /item-menu.
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

	isVeg := false
	if req.IsVegetarian != nil {
		isVeg = *req.IsVegetarian
	} else if req.IsVegetarianAlt != nil {
		isVeg = *req.IsVegetarianAlt
	}

	isVegan := false
	if req.IsVegan != nil {
		isVegan = *req.IsVegan
	} else if req.IsVeganAlt != nil {
		isVegan = *req.IsVeganAlt
	}

	imgURL := req.ImageURL
	if imgURL == "" {
		imgURL = req.ImageURLAlt
	}

	avail := true
	if req.Available != nil {
		avail = *req.Available
	}

	updated, err := h.uc.Update(r.Context(), UpdateInput{
		ID:            ID(idStr),
		Name:          req.Name,
		Description:   req.Description,
		Price:         req.Price,
		TaxPercentage: req.TaxPercentage,
		PrepTime:      req.PrepTime,
		IsVegetarian:  isVeg,
		IsVegan:       isVegan,
		ImageURL:      imgURL,
		StartTime:     req.StartTime,
		EndTime:       req.EndTime,
		Available:     avail,
	})
	if err != nil {
		h.handleDomainError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newResponse(updated))
}

// Delete maneja DELETE /item-menu/{id} o DELETE /item-menu.
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
		errors.Is(err, ErrInvalidCategoryID),
		errors.Is(err, ErrEmptyName),
		errors.Is(err, ErrInvalidPrice),
		errors.Is(err, ErrInvalidTaxPercentage),
		errors.Is(err, ErrInvalidPrepTime):
		httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
	default:
		httpjson.WriteInternalError(w, err)
	}
}
