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

// ModuleHTTP maneja las peticiones HTTP para módulos.
type ModuleHTTP struct {
	service *usecase.ModuleService
}

// NewModuleHTTP crea el handler con su servicio inyectado.
func NewModuleHTTP(svc *usecase.ModuleService) *ModuleHTTP {
	return &ModuleHTTP{service: svc}
}

// Register registra las rutas del módulo en el mux.
func (h *ModuleHTTP) Register(mux *http.ServeMux) {
	mux.HandleFunc("/module", h.handleModule)
	mux.HandleFunc("/module/", h.handleModuleByID)
}

// handleModule enruta GET (listar) y POST (crear).
func (h *ModuleHTTP) handleModule(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.list(w, r)
	case http.MethodPost:
		h.create(w, r)
	default:
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
	}
}

// handleModuleByID enruta GET/PUT/DELETE por ID.
func (h *ModuleHTTP) handleModuleByID(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/module/")
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

// list retorna todos los módulos.
func (h *ModuleHTTP) list(w http.ResponseWriter, _ *http.Request) {
	modules, err := h.service.FindAll()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, modules)
}

// getByID retorna un módulo por ID.
func (h *ModuleHTTP) getByID(w http.ResponseWriter, _ *http.Request, id int) {
	mod, err := h.service.FindByID(id)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, mod)
}

// create recibe JSON, valida y persiste un nuevo módulo.
func (h *ModuleHTTP) create(w http.ResponseWriter, r *http.Request) {
	var dto usecase.CreateModuleDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "JSON inválido"})
		return
	}

	mod, err := h.service.Create(dto)
	if err != nil {
		status := http.StatusBadRequest
		if errors.Is(err, domain.ErrIDRequired) ||
			errors.Is(err, domain.ErrTypePathRequired) ||
			errors.Is(err, domain.ErrTypeComponentRequire) {
			status = http.StatusUnprocessableEntity
		}
		writeJSON(w, status, map[string]string{"error": err.Error()})
		return
	}

	saved, err := h.service.Save(mod)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, saved)
}

// update recibe JSON y actualiza un módulo existente.
func (h *ModuleHTTP) update(w http.ResponseWriter, r *http.Request, id int) {
	existing, err := h.service.FindByID(id)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
		return
	}

	var dto usecase.UpdateModuleDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "JSON inválido"})
		return
	}

	if dto.TypePath != "" {
		tp, err := domain.NewTypePath(dto.TypePath)
		if err != nil {
			writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"error": err.Error()})
			return
		}
		existing.RenameTypePath(tp)
	}
	if dto.TypeComponent != "" {
		tc, err := domain.NewTypeComponent(dto.TypeComponent)
		if err != nil {
			writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"error": err.Error()})
			return
		}
		existing.ChangeTypeComponent(tc)
	}

	saved, err := h.service.Save(existing)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, saved)
}

// delete elimina un módulo.
func (h *ModuleHTTP) delete(w http.ResponseWriter, _ *http.Request, id int) {
	if err := h.service.Delete(id); err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// writeJSON escribe una respuesta JSON.
func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
