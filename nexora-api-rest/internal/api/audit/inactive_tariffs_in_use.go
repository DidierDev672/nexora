package audit

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// InactiveTariffsInUse handles GET /audit/tariffs-inactive-in-use: the pricing
// consistency breaches where an active assignment points at an inactive rate.
func (h *Handler) InactiveTariffsInUse(w http.ResponseWriter, r *http.Request) {
	items, err := h.InactiveTariffsInUseList.InactiveTariffsInUse(r.Context())
	if err != nil {
		writeAuditError(w, err)
		return
	}

	response := make([]inactiveTariffInUseResponse, 0, len(items))
	for _, item := range items {
		response = append(response, newInactiveTariffInUseResponse(item))
	}

	httpjson.WriteJSON(w, http.StatusOK, response)
}
