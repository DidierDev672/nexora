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

// PermissionResourceHTTP maneja las peticiones HTTP para permisos de recursos.
type PermissionResourceHTTP struct {
	service *usecase.PermissionResourceService
}

// NewPermissionResourceHTTP crea el handler con su servicio inyectado.
func NewPermissionResourceHTTP(svc *usecase.PermissionResourceService) *PermissionResourceHTTP {
	return &PermissionResourceHTTP{service: svc}
}

// Register registra las rutas en el mux.
func (h *PermissionResourceHTTP) Register(mux *http.ServeMux) {
	mux.HandleFunc("/permission-resource", h.handlePermissionResource)
	mux.HandleFunc("/permission-resource/", h.handlePermissionResourceByID)
}

// handlePermissionResource enruta GET (listar) y POST (crear).
func (h *PermissionResourceHTTP) handlePermissionResource(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.list(w, r)
	case http.MethodPost:
		h.create(w, r)
	default:
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
	}
}

// handlePermissionResourceByID enruta GET/PUT/DELETE por ID.
func (h *PermissionResourceHTTP) handlePermissionResourceByID(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/permission-resource/")
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

// list retorna todos los permisos de recursos.
func (h *PermissionResourceHTTP) list(w http.ResponseWriter, _ *http.Request) {
	items, err := h.service.FindAll()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, items)
}

// getByID retorna un permiso-recurso por ID.
func (h *PermissionResourceHTTP) getByID(w http.ResponseWriter, _ *http.Request, id int) {
	item, err := h.service.FindByID(id)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, item)
}

// create recibe JSON, valida y persiste un nuevo permiso-recurso.
func (h *PermissionResourceHTTP) create(w http.ResponseWriter, r *http.Request) {
	var dto usecase.CreatePermissionResourceDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "JSON inválido"})
		return
	}

	item, err := h.service.Create(dto)
	if err != nil {
		status := http.StatusBadRequest
		if errors.Is(err, domain.ErrPermissionResourceIDRequired) ||
			errors.Is(err, domain.ErrResourceIDRequired) {
			status = http.StatusUnprocessableEntity
		}
		writeJSON(w, status, map[string]string{"error": err.Error()})
		return
	}

	saved, err := h.service.Save(item)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, saved)
}

// update recibe JSON y actualiza el permiso.
func (h *PermissionResourceHTTP) update(w http.ResponseWriter, r *http.Request, id int) {
	existing, err := h.service.FindByID(id)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
		return
	}

	var dto usecase.UpdatePermissionResourceDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "JSON inválido"})
		return
	}

	if dto.Permission != nil {
		if *dto.Permission {
			existing.Grant()
		} else {
			existing.Revoke()
		}
	}

	saved, err := h.service.Save(existing)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, saved)
}

// delete elimina un permiso-recurso.
func (h *PermissionResourceHTTP) delete(w http.ResponseWriter, _ *http.Request, id int) {
	if err := h.service.Delete(id); err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
