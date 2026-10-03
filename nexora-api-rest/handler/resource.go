package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"nexora-api-rest/domain"
	"nexora-api-rest/usecase"
)

// ResourceHTTP maneja las peticiones HTTP para recursos.
type ResourceHTTP struct {
	service *usecase.ResourceService
}

// NewResourceHTTP crea el handler con su servicio inyectado.
func NewResourceHTTP(svc *usecase.ResourceService) *ResourceHTTP {
	return &ResourceHTTP{service: svc}
}

// Register registra las rutas del recurso en el mux.
func (h *ResourceHTTP) Register(mux *http.ServeMux) {
	mux.HandleFunc("/resource", h.handleResource)
	mux.HandleFunc("/resource/", h.handleResourceByID)
}

// handleResource enruta GET (listar) y POST (crear).
func (h *ResourceHTTP) handleResource(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.list(w, r)
	case http.MethodPost:
		h.create(w, r)
	default:
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
	}
}

// handleResourceByID enruta GET/PUT/DELETE por ID.
func (h *ResourceHTTP) handleResourceByID(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/resource/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "ID inválido"})
		return
	}

	switch r.Method {
	case http.MethodGet:
		h.getByID(w, r, id)
	case http.MethodPut:
		h.update(w, r, id)
	case http.MethodDelete:
		h.delete(w, r, id)
	default:
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
	}
}

// list retorna todos los recursos.
func (h *ResourceHTTP) list(w http.ResponseWriter, _ *http.Request) {
	resources, err := h.service.FindAll()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, resources)
}

// getByID retorna un recurso por ID.
func (h *ResourceHTTP) getByID(w http.ResponseWriter, _ *http.Request, id int) {
	res, err := h.service.FindByID(id)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, res)
}

// create recibe JSON, valida y persiste un nuevo recurso.
func (h *ResourceHTTP) create(w http.ResponseWriter, r *http.Request) {
	var dto usecase.CreateResourceDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "JSON inválido"})
		return
	}

	res, err := h.service.Create(dto)
	if err != nil {
		status := http.StatusBadRequest
		if errors.Is(err, domain.ErrResourceIDRequired) ||
			errors.Is(err, domain.ErrComponentRequired) ||
			errors.Is(err, domain.ErrResourceNameRequired) ||
			errors.Is(err, domain.ErrModuleIDRequired) {
			status = http.StatusUnprocessableEntity
		}
		writeJSON(w, status, map[string]string{"error": err.Error()})
		return
	}

	saved, err := h.service.Save(res)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, saved)
}

// update recibe JSON y actualiza un recurso existente.
func (h *ResourceHTTP) update(w http.ResponseWriter, r *http.Request, id int) {
	existing, err := h.service.FindByID(id)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
		return
	}

	var dto usecase.UpdateResourceDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "JSON inválido"})
		return
	}

	if dto.Name != "" {
		name, err := domain.NewResourceName(dto.Name)
		if err != nil {
			writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"error": err.Error()})
			return
		}
		existing.Rename(name)
	}
	if dto.Component != "" {
		comp, err := domain.NewComponent(dto.Component)
		if err != nil {
			writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"error": err.Error()})
			return
		}
		existing.ChangeComponent(comp)
	}
	if dto.ModuleID > 0 {
		if err := existing.ReassignModule(dto.ModuleID); err != nil {
			writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"error": err.Error()})
			return
		}
	}

	saved, err := h.service.Save(existing)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, saved)
}

// delete elimina un recurso.
func (h *ResourceHTTP) delete(w http.ResponseWriter, _ *http.Request, id int) {
	if err := h.service.Delete(id); err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
