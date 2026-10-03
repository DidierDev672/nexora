package servicerequest_test

import (
	"testing"
	"time"

	"nexora-api-rest/internal/servicerequest"
)

func TestNewServiceRequest(t *testing.T) {
	now := time.Now().UTC()
	tip := 5.0

	validItems := []servicerequest.OrderItem{
		{
			ID:           "item-1",
			ItemMenuID:   "menu-item-101",
			NameSnapshot: "Club Sándwich",
			PriceUnit:    15.0,
			TaxRate:      10.0,
			Amount:       2,
			Note:         "Sin cebolla",
		},
	}

	t.Run("valid service request", func(t *testing.T) {
		req, err := servicerequest.NewServiceRequest(
			"sr-1",
			"ORD-1001",
			"stay-1",
			"room-101",
			"person-1",
			servicerequest.ChannelRoomTablet,
			servicerequest.PaymentMethodRoomCharge,
			"Favor entregar rápido",
			"Dejar frente a la puerta",
			nil,
			"USD",
			&tip,
			validItems,
			"guest_app",
			now,
		)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if req.ID != "sr-1" {
			t.Errorf("expected ID 'sr-1', got %s", req.ID)
		}
		if req.Subtotal != 30.0 {
			t.Errorf("expected Subtotal 30.0, got %f", req.Subtotal)
		}
		if req.Taxes != 3.0 {
			t.Errorf("expected Taxes 3.0, got %f", req.Taxes)
		}
		if req.Total != 38.0 {
			t.Errorf("expected Total 38.0 (30 + 3 + 5), got %f", req.Total)
		}
		if req.Status != servicerequest.StatusPending {
			t.Errorf("expected Status 'pending', got %s", req.Status)
		}
		if len(req.History) != 1 {
			t.Errorf("expected 1 history item, got %d", len(req.History))
		}
	})

	t.Run("empty items fails", func(t *testing.T) {
		_, err := servicerequest.NewServiceRequest(
			"sr-1",
			"ORD-1001",
			"stay-1",
			"room-101",
			"person-1",
			servicerequest.ChannelRoomTablet,
			servicerequest.PaymentMethodRoomCharge,
			"",
			"",
			nil,
			"USD",
			nil,
			nil,
			"guest",
			now,
		)
		if err != servicerequest.ErrEmptyItems {
			t.Fatalf("expected ErrEmptyItems, got %v", err)
		}
	})

	t.Run("empty stay id fails", func(t *testing.T) {
		_, err := servicerequest.NewServiceRequest(
			"sr-1",
			"ORD-1001",
			"",
			"room-101",
			"person-1",
			servicerequest.ChannelRoomTablet,
			servicerequest.PaymentMethodRoomCharge,
			"",
			"",
			nil,
			"USD",
			nil,
			validItems,
			"guest",
			now,
		)
		if err != servicerequest.ErrInvalidStayID {
			t.Fatalf("expected ErrInvalidStayID, got %v", err)
		}
	})
}

func TestServiceRequest_Transitions(t *testing.T) {
	now := time.Now().UTC()
	validItems := []servicerequest.OrderItem{
		{
			ID:           "item-1",
			ItemMenuID:   "menu-item-1",
			NameSnapshot: "Café",
			PriceUnit:    3.0,
			TaxRate:      0.0,
			Amount:       1,
		},
	}

	req, err := servicerequest.NewServiceRequest(
		"sr-1",
		"ORD-1002",
		"stay-1",
		"room-101",
		"person-1",
		servicerequest.ChannelRoomTablet,
		servicerequest.PaymentMethodRoomCharge,
		"",
		"",
		nil,
		"USD",
		nil,
		validItems,
		"guest",
		now,
	)
	if err != nil {
		t.Fatalf("failed to create: %v", err)
	}

	later := now.Add(time.Minute * 10)
	if err := req.TransitionStatus(servicerequest.StatusConfirmed, servicerequest.ActorTypeStaff, "waiter-1", "Aceptado", later); err != nil {
		t.Fatalf("unexpected error confirming: %v", err)
	}
	if req.Status != servicerequest.StatusConfirmed {
		t.Errorf("expected Status 'confirmed', got %s", req.Status)
	}
	if req.ConfirmedAt == nil {
		t.Errorf("expected ConfirmedAt not nil")
	}
	if len(req.History) != 2 {
		t.Errorf("expected 2 history entries, got %d", len(req.History))
	}

	// Rate order
	comment := "Excelente atención"
	if err := req.Rate(5, &comment, later); err != nil {
		t.Fatalf("unexpected error rating: %v", err)
	}
	if req.Grade == nil || *req.Grade != 5 {
		t.Errorf("expected Grade 5")
	}
}
