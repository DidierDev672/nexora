package servicerequest_test

import (
	"context"
	"testing"
	"time"

	"nexora-api-rest/internal/servicerequest"
)

type mockSRRepo struct {
	items       map[servicerequest.ID]servicerequest.ServiceRequest
	ensureCount int
}

func newMockSRRepo() *mockSRRepo {
	return &mockSRRepo{
		items: make(map[servicerequest.ID]servicerequest.ServiceRequest),
	}
}

func (m *mockSRRepo) EnsureTable(ctx context.Context) error {
	m.ensureCount++
	return nil
}

func (m *mockSRRepo) Create(ctx context.Context, req servicerequest.ServiceRequest) error {
	m.items[req.ID] = req
	return nil
}

func (m *mockSRRepo) GetByID(ctx context.Context, id servicerequest.ID) (servicerequest.ServiceRequest, error) {
	req, ok := m.items[id]
	if !ok {
		return servicerequest.ServiceRequest{}, servicerequest.ErrNotFound
	}
	return req, nil
}

func (m *mockSRRepo) List(ctx context.Context, filter servicerequest.ListFilter) ([]servicerequest.ServiceRequest, error) {
	res := make([]servicerequest.ServiceRequest, 0, len(m.items))
	for _, req := range m.items {
		if filter.StayID != "" && req.StayID != filter.StayID {
			continue
		}
		if filter.RoomID != "" && req.RoomID != filter.RoomID {
			continue
		}
		res = append(res, req)
	}
	return res, nil
}

func (m *mockSRRepo) Update(ctx context.Context, req servicerequest.ServiceRequest) error {
	if _, ok := m.items[req.ID]; !ok {
		return servicerequest.ErrNotFound
	}
	m.items[req.ID] = req
	return nil
}

func (m *mockSRRepo) Delete(ctx context.Context, id servicerequest.ID) error {
	if _, ok := m.items[id]; !ok {
		return servicerequest.ErrNotFound
	}
	delete(m.items, id)
	return nil
}

type fixedIDGen struct {
	counter int
}

func (f *fixedIDGen) NewID() servicerequest.ID {
	return "sr-id-1"
}

func (f *fixedIDGen) NewOrderItemID() servicerequest.OrderItemID {
	f.counter++
	return "item-id-1"
}

func (f *fixedIDGen) NewHistoryID() servicerequest.HistoryID {
	f.counter++
	return "hist-id-1"
}

type fixedClock struct {
	now time.Time
}

func (f fixedClock) Now() time.Time {
	return f.now
}

func TestUseCase_Lifecycle(t *testing.T) {
	ctx := context.Background()
	repo := newMockSRRepo()
	fixedNow := time.Date(2026, 10, 3, 15, 0, 0, 0, time.UTC)
	idGen := &fixedIDGen{}
	clock := fixedClock{now: fixedNow}

	uc := servicerequest.NewUseCase(repo, idGen, clock)

	// 1. Create
	tip := 2.0
	created, err := uc.Create(ctx, servicerequest.CreateInput{
		OrderNumber:   "ORD-2026-001",
		StayID:        "stay-101",
		RoomID:        "room-505",
		PersonID:      "guest-77",
		Channel:       servicerequest.ChannelRoomTablet,
		PaymentMethod: servicerequest.PaymentMethodRoomCharge,
		Currency:      "USD",
		Tip:           &tip,
		Items: []servicerequest.CreateItemInput{
			{
				ItemMenuID:   "item-burger",
				NameSnapshot: "Burger Deluxe",
				PriceUnit:    16.0,
				TaxRate:      10.0,
				Amount:       1,
				Note:         "Bien cocida",
			},
		},
		CreatedBy: "guest",
	})
	if err != nil {
		t.Fatalf("failed to create: %v", err)
	}
	if created.ID != "sr-id-1" {
		t.Errorf("expected ID 'sr-id-1', got %s", created.ID)
	}
	if created.Total != 19.6 { // 16 + 1.6 (10%) + 2 (tip)
		t.Errorf("expected Total 19.6, got %f", created.Total)
	}

	// 2. GetByID
	fetched, err := uc.GetByID(ctx, "sr-id-1")
	if err != nil {
		t.Fatalf("failed to get: %v", err)
	}
	if fetched.ID != "sr-id-1" {
		t.Errorf("expected ID 'sr-id-1', got %s", fetched.ID)
	}

	// 3. List
	list, err := uc.List(ctx, servicerequest.ListFilter{StayID: "stay-101"})
	if err != nil {
		t.Fatalf("failed to list: %v", err)
	}
	if len(list) != 1 {
		t.Fatalf("expected 1 result, got %d", len(list))
	}

	// 4. Update status to Delivered
	delStatus := servicerequest.StatusDelivered
	updated, err := uc.Update(ctx, servicerequest.UpdateInput{
		ID:            "sr-id-1",
		Status:        &delStatus,
		ActorType:     servicerequest.ActorTypeStaff,
		ActorID:       "staff-12",
		StatusComment: "Entregado a satisfacción en habitación 505",
	})
	if err != nil {
		t.Fatalf("failed to update: %v", err)
	}
	if updated.Status != servicerequest.StatusDelivered {
		t.Errorf("expected Status 'delivered', got %s", updated.Status)
	}

	// 5. Delete
	if err := uc.Delete(ctx, "sr-id-1"); err != nil {
		t.Fatalf("failed to delete: %v", err)
	}

	// Verify not found
	_, err = uc.GetByID(ctx, "sr-id-1")
	if err != servicerequest.ErrNotFound {
		t.Errorf("expected ErrNotFound, got %v", err)
	}
}
