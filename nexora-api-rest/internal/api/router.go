package api

import (
	"net/http"
	"time"

	audithttp "nexora-api-rest/internal/api/audit"
	authhttp "nexora-api-rest/internal/api/auth"
	bedhttp "nexora-api-rest/internal/api/bed"
	bedtypehttp "nexora-api-rest/internal/api/bedtype"
	buildinghttp "nexora-api-rest/internal/api/building"
	headquarterhttp "nexora-api-rest/internal/api/headquarter"
	palettehttp "nexora-api-rest/internal/api/palette"
	permissionassignmenthttp "nexora-api-rest/internal/api/permissionassignment"
	personhttp "nexora-api-rest/internal/api/person"
	ratehttp "nexora-api-rest/internal/api/rate"
	reservehttp "nexora-api-rest/internal/api/reserve"
	rolehttp "nexora-api-rest/internal/api/role"
	roomhttp "nexora-api-rest/internal/api/room"
	roomtariffhttp "nexora-api-rest/internal/api/roomtariff"
	roomtypehttp "nexora-api-rest/internal/api/roomtype"
	stayhttp "nexora-api-rest/internal/api/stay"
	subheadquarterhttp "nexora-api-rest/internal/api/subheadquarter"
	userhttp "nexora-api-rest/internal/api/user"
	auditapp "nexora-api-rest/internal/application/audit"
	authapp "nexora-api-rest/internal/application/auth"
	bedapp "nexora-api-rest/internal/application/bed"
	bedtypeapp "nexora-api-rest/internal/application/bedtype"
	buildingapp "nexora-api-rest/internal/application/building"
	headquarterapp "nexora-api-rest/internal/application/headquarter"
	paletteapp "nexora-api-rest/internal/application/palette"
	permissionassignmentapp "nexora-api-rest/internal/application/permissionassignment"
	personapp "nexora-api-rest/internal/application/person"
	rateapp "nexora-api-rest/internal/application/rate"
	reserveapp "nexora-api-rest/internal/application/reserve"
	roleapp "nexora-api-rest/internal/application/role"
	roomapp "nexora-api-rest/internal/application/room"
	roomtariffapp "nexora-api-rest/internal/application/roomtariff"
	roomtypeapp "nexora-api-rest/internal/application/roomtype"
	stayapp "nexora-api-rest/internal/application/stay"
	subheadquarterapp "nexora-api-rest/internal/application/subheadquarter"
	userapp "nexora-api-rest/internal/application/user"
	"nexora-api-rest/internal/domain"
	"nexora-api-rest/internal/infrastructure/auth"
	"nexora-api-rest/internal/infrastructure/ids"
	"nexora-api-rest/internal/infrastructure/password"

	externaldomain "nexora-api-rest/domain"
	"nexora-api-rest/handler"
	"nexora-api-rest/internal/itemmenu"
	"nexora-api-rest/internal/menucategory"
	"nexora-api-rest/internal/serviceassignment"
	"nexora-api-rest/internal/servicerequest"
	"nexora-api-rest/usecase"
)

// NewRouter wires the whole onion and exposes the /roles, /palette,
// /headquarters, /sub-headquarters, /users, /permission-assignment, /login,
// /room-types, /rooms, /building, /reserve, /stays, /rates, /room_tariffs,
// /menu-category, /item-menu, /service-request and /service-assignments vertical slices.
func NewRouter(roleRepo domain.RoleRepository, headquarterRepo domain.HeadquarterRepository, subHeadquarterRepo domain.SubHeadquarterRepository, paletteRepo domain.PaletteRepository, userRepo domain.UserRepository, permissionAssignmentRepo domain.PermissionAssignmentRepository, roomTypeRepo domain.RoomTypeRepository, roomRepo domain.RoomRepository, buildingRepo domain.BuildingRepository, bedTypeRepo domain.BedTypeRepository, bedRepo domain.BedRepository, personRepo domain.PersonRepository, reserveRepo domain.ReserveRepository, stayRepo domain.StayRepository, rateRepo domain.RateRepository, roomTariffRepo domain.RoomTariffRepository, auditRepo domain.AuditRepository, moduleRepo externaldomain.ModuleRepository, resourceRepo externaldomain.ResourceRepository, permissionResourceRepo externaldomain.PermissionResourceRepository, menuCategoryRepo menucategory.Repository, itemMenuRepo itemmenu.Repository, serviceRequestRepo servicerequest.Repository, serviceAssignmentRepo serviceassignment.Repository, jwtSecret string) http.Handler {
	roleHandler := &rolehttp.Handler{
		Creator: roleapp.NewCreateRoleUseCase(roleRepo, ids.RandomID{}),
		Lister:  roleapp.NewListRolesUseCase(roleRepo),
		Getter:  roleapp.NewGetRoleUseCase(roleRepo),
		Updater: roleapp.NewUpdateRoleUseCase(roleRepo),
		Deleter: roleapp.NewDeleteRoleUseCase(roleRepo),
	}

	headquarterHandler := &headquarterhttp.Handler{
		Creator: headquarterapp.NewCreateHeadquarterUseCase(headquarterRepo, ids.RandomID{}),
		Lister:  headquarterapp.NewListHeadquartersUseCase(headquarterRepo),
		Getter:  headquarterapp.NewGetHeadquarterUseCase(headquarterRepo),
		Updater: headquarterapp.NewUpdateHeadquarterUseCase(headquarterRepo),
		Deleter: headquarterapp.NewDeleteHeadquarterUseCase(headquarterRepo),
	}

	subHeadquarterHandler := &subheadquarterhttp.Handler{
		Creator:       subheadquarterapp.NewCreateSubHeadquarterUseCase(subHeadquarterRepo, ids.RandomID{}),
		Lister:        subheadquarterapp.NewListSubHeadquartersUseCase(subHeadquarterRepo),
		ByHeadquarter: subheadquarterapp.NewListSubHeadquartersByHeadquarterUseCase(subHeadquarterRepo),
		Getter:        subheadquarterapp.NewGetSubHeadquarterUseCase(subHeadquarterRepo),
		Updater:       subheadquarterapp.NewUpdateSubHeadquarterUseCase(subHeadquarterRepo),
		Deleter:       subheadquarterapp.NewDeleteSubHeadquarterUseCase(subHeadquarterRepo),
	}

	userHandler := &userhttp.Handler{
		Creator: userapp.NewCreateUserUseCase(userRepo, ids.RandomID{}, password.BcryptHasher{}),
		Lister:  userapp.NewListUsersUseCase(userRepo),
		Getter:  userapp.NewGetUserUseCase(userRepo),
		Updater: userapp.NewUpdateUserUseCase(userRepo, password.BcryptHasher{}),
		Deleter: userapp.NewDeleteUserUseCase(userRepo),
	}

	authHandler := &authhttp.Handler{
		Authenticator: authapp.NewAuthenticateUseCase(
			userRepo,
			password.BcryptHasher{},
			auth.NewJWTTokenGenerator(jwtSecret, 15*time.Minute),
			password.DummyHash,
		),
	}

	paletteHandler := &palettehttp.Handler{
		Creator: paletteapp.NewCreatePaletteUseCase(paletteRepo, ids.RandomID{}),
		Lister:  paletteapp.NewListPalettesUseCase(paletteRepo),
		Getter:  paletteapp.NewGetPaletteUseCase(paletteRepo),
		Updater: paletteapp.NewUpdatePaletteUseCase(paletteRepo),
		Deleter: paletteapp.NewDeletePaletteUseCase(paletteRepo),
	}

	permissionAssignmentHandler := &permissionassignmenthttp.Handler{
		Creator: permissionassignmentapp.NewCreatePermissionAssignmentUseCase(permissionAssignmentRepo, ids.RandomID{}),
		Lister:  permissionassignmentapp.NewListPermissionAssignmentsUseCase(permissionAssignmentRepo),
		Getter:  permissionassignmentapp.NewGetPermissionAssignmentUseCase(permissionAssignmentRepo),
		Updater: permissionassignmentapp.NewUpdatePermissionAssignmentUseCase(permissionAssignmentRepo),
		Deleter: permissionassignmentapp.NewDeletePermissionAssignmentUseCase(permissionAssignmentRepo),
	}

	roomTypeHandler := &roomtypehttp.Handler{
		Creator: roomtypeapp.NewCreateRoomTypeUseCase(roomTypeRepo, ids.RandomID{}),
		Lister:  roomtypeapp.NewListRoomTypesUseCase(roomTypeRepo),
		Getter:  roomtypeapp.NewGetRoomTypeUseCase(roomTypeRepo),
		Updater: roomtypeapp.NewUpdateRoomTypeUseCase(roomTypeRepo),
		Deleter: roomtypeapp.NewDeleteRoomTypeUseCase(roomTypeRepo),
	}

	roomHandler := &roomhttp.Handler{
		Creator:          roomapp.NewCreateRoomUseCase(roomRepo, ids.RandomID{}),
		Lister:           roomapp.NewListRoomsUseCase(roomRepo),
		Getter:           roomapp.NewGetRoomUseCase(roomRepo),
		Updater:          roomapp.NewUpdateRoomUseCase(roomRepo),
		Deleter:          roomapp.NewDeleteRoomUseCase(roomRepo),
		NextNumberGetter: roomapp.NewNextNumberUseCase(roomRepo),
	}

	buildingHandler := &buildinghttp.Handler{
		Creator: buildingapp.NewCreateBuildingUseCase(buildingRepo, ids.RandomID{}),
		Lister:  buildingapp.NewListBuildingsUseCase(buildingRepo),
		Getter:  buildingapp.NewGetBuildingUseCase(buildingRepo),
		Updater: buildingapp.NewUpdateBuildingUseCase(buildingRepo),
		Deleter: buildingapp.NewDeleteBuildingUseCase(buildingRepo),
	}

	bedTypeHandler := &bedtypehttp.Handler{
		Creator: bedtypeapp.NewCreateBedTypeUseCase(bedTypeRepo, ids.RandomID{}),
		Lister:  bedtypeapp.NewListBedTypesUseCase(bedTypeRepo),
		Getter:  bedtypeapp.NewGetBedTypeUseCase(bedTypeRepo),
		Updater: bedtypeapp.NewUpdateBedTypeUseCase(bedTypeRepo),
		Deleter: bedtypeapp.NewDeleteBedTypeUseCase(bedTypeRepo),
	}

	bedHandler := &bedhttp.Handler{
		Creator: bedapp.NewCreateBedUseCase(bedRepo, ids.RandomID{}),
		Lister:  bedapp.NewListBedsUseCase(bedRepo),
		Getter:  bedapp.NewGetBedUseCase(bedRepo),
		Updater: bedapp.NewUpdateBedUseCase(bedRepo),
		Deleter: bedapp.NewDeleteBedUseCase(bedRepo),
	}

	personHandler := &personhttp.Handler{
		Creator: personapp.NewCreatePersonUseCase(personRepo, ids.RandomID{}),
		Lister:  personapp.NewListPersonsUseCase(personRepo),
		Getter:  personapp.NewGetPersonUseCase(personRepo),
		Updater: personapp.NewUpdatePersonUseCase(personRepo),
		Deleter: personapp.NewDeletePersonUseCase(personRepo),
	}

	reserveHandler := &reservehttp.Handler{
		Creator: reserveapp.NewCreateReserveUseCase(reserveRepo, ids.RandomID{}),
		Lister:  reserveapp.NewListReservesUseCase(reserveRepo),
		Getter:  reserveapp.NewGetReserveUseCase(reserveRepo),
		Updater: reserveapp.NewUpdateReserveUseCase(reserveRepo),
		Deleter: reserveapp.NewDeleteReserveUseCase(reserveRepo),
	}

	stayHandler := &stayhttp.Handler{
		Creator:         stayapp.NewCreateStayUseCase(stayRepo, ids.RandomID{}),
		Lister:          stayapp.NewListStaysUseCase(stayRepo),
		Getter:          stayapp.NewGetStayUseCase(stayRepo),
		Updater:         stayapp.NewUpdateStayUseCase(stayRepo),
		Deleter:         stayapp.NewDeleteStayUseCase(stayRepo),
		ReceptionGetter: stayapp.NewGetRoomReceptionUseCase(stayRepo),
		PersonsLister:   stayapp.NewListStayPersonsUseCase(stayRepo),
	}

	rateHandler := &ratehttp.Handler{
		Creator: rateapp.NewCreateRateUseCase(rateRepo, ids.RandomID{}),
		Lister:  rateapp.NewListRatesUseCase(rateRepo),
		Getter:  rateapp.NewGetRateUseCase(rateRepo),
		Updater: rateapp.NewUpdateRateUseCase(rateRepo),
		Deleter: rateapp.NewDeleteRateUseCase(rateRepo),
	}

	roomTariffHandler := &roomtariffhttp.Handler{
		Creator: roomtariffapp.NewCreateRoomTariffUseCase(roomTariffRepo, ids.RandomID{}),
		Lister:  roomtariffapp.NewListRoomTariffsUseCase(roomTariffRepo),
		Getter:  roomtariffapp.NewGetRoomTariffUseCase(roomTariffRepo),
		ByRoom:  roomtariffapp.NewListRoomTariffsByRoomUseCase(roomTariffRepo),
		Updater: roomtariffapp.NewUpdateRoomTariffUseCase(roomTariffRepo),
		Deleter: roomtariffapp.NewDeleteRoomTariffUseCase(roomTariffRepo),
	}

	auditHandler := &audithttp.Handler{
		Summarizer:               auditapp.NewSummaryUseCase(auditRepo),
		RoomsLister:              auditapp.NewRoomsUseCase(auditRepo),
		RoomsByStatusLister:      auditapp.NewRoomsByStatusUseCase(auditRepo),
		RatesLister:              auditapp.NewRatesUseCase(auditRepo),
		RoomsWithoutTariffLister: auditapp.NewRoomsWithoutTariffUseCase(auditRepo),
		InactiveTariffsInUseList: auditapp.NewInactiveTariffsInUseUseCase(auditRepo),
	}

	moduleHTTP := handler.NewModuleHTTP(usecase.NewModuleService(moduleRepo))
	resourceHTTP := handler.NewResourceHTTP(usecase.NewResourceService(resourceRepo))
	permissionResourceHTTP := handler.NewPermissionResourceHTTP(usecase.NewPermissionResourceService(permissionResourceRepo))
	menuCategoryHTTP := menucategory.NewHandler(menucategory.NewUseCase(menuCategoryRepo, nil, nil))
	itemMenuHTTP := itemmenu.NewHandler(itemmenu.NewUseCase(itemMenuRepo, nil, nil))
	serviceRequestHTTP := servicerequest.NewHandler(servicerequest.NewUseCase(serviceRequestRepo, nil, nil))
	serviceAssignmentHTTP := serviceassignment.NewHandler(serviceassignment.NewUseCase(serviceAssignmentRepo, nil, nil))

	mux := http.NewServeMux()
	mux.HandleFunc("POST /login", authHandler.Login)
	mux.HandleFunc("POST /roles", roleHandler.Create)
	mux.HandleFunc("GET /roles", roleHandler.List)
	mux.HandleFunc("GET /roles/{id}", roleHandler.Get)
	mux.HandleFunc("PUT /roles/{id}", roleHandler.Update)
	mux.HandleFunc("DELETE /roles/{id}", roleHandler.Delete)

	mux.HandleFunc("POST /headquarters", headquarterHandler.Create)
	mux.HandleFunc("GET /headquarters", headquarterHandler.List)
	mux.HandleFunc("GET /headquarters/{id}", headquarterHandler.Get)
	mux.HandleFunc("PUT /headquarters/{id}", headquarterHandler.Update)
	mux.HandleFunc("DELETE /headquarters/{id}", headquarterHandler.Delete)

	mux.HandleFunc("POST /sub-headquarters", subHeadquarterHandler.Create)
	mux.HandleFunc("GET /sub-headquarters", subHeadquarterHandler.List)
	mux.HandleFunc("GET /sub-headquarters/by-headquarter/{id_headquarters}", subHeadquarterHandler.ListByHeadquarter)
	mux.HandleFunc("GET /sub-headquarters/{id}", subHeadquarterHandler.Get)
	mux.HandleFunc("PUT /sub-headquarters/{id}", subHeadquarterHandler.Update)
	mux.HandleFunc("DELETE /sub-headquarters/{id}", subHeadquarterHandler.Delete)

	mux.HandleFunc("POST /users", userHandler.Create)
	mux.HandleFunc("GET /users", userHandler.List)
	mux.HandleFunc("GET /users/{id}", userHandler.Get)
	mux.HandleFunc("PUT /users/{id}", userHandler.Update)
	mux.HandleFunc("DELETE /users/{id}", userHandler.Delete)

	mux.HandleFunc("POST /palette", paletteHandler.Create)
	mux.HandleFunc("GET /palette", paletteHandler.List)
	mux.HandleFunc("GET /palette/{id}", paletteHandler.Get)
	mux.HandleFunc("PUT /palette/{id}", paletteHandler.Update)
	mux.HandleFunc("DELETE /palette/{id}", paletteHandler.Delete)

	mux.HandleFunc("POST /permission-assignment", permissionAssignmentHandler.Create)
	mux.HandleFunc("GET /permission-assignment", permissionAssignmentHandler.List)
	mux.HandleFunc("GET /permission-assignment/{id}", permissionAssignmentHandler.Get)
	mux.HandleFunc("PUT /permission-assignment/{id}", permissionAssignmentHandler.Update)
	mux.HandleFunc("DELETE /permission-assignment/{id}", permissionAssignmentHandler.Delete)

	mux.HandleFunc("POST /room-types", roomTypeHandler.Create)
	mux.HandleFunc("GET /room-types", roomTypeHandler.List)
	mux.HandleFunc("GET /room-types/{id}", roomTypeHandler.Get)
	mux.HandleFunc("PUT /room-types/{id}", roomTypeHandler.Update)
	mux.HandleFunc("DELETE /room-types/{id}", roomTypeHandler.Delete)

	mux.HandleFunc("POST /room", roomHandler.Create)
	mux.HandleFunc("GET /room", roomHandler.List)
	mux.HandleFunc("GET /room/next-number", roomHandler.NextNumber)
	mux.HandleFunc("GET /room/{id}", roomHandler.Get)
	mux.HandleFunc("GET /room/{id}/reception", roomHandler.Reception)
	mux.HandleFunc("PUT /room/{id}", roomHandler.Update)
	mux.HandleFunc("DELETE /room/{id}", roomHandler.Delete)

	mux.HandleFunc("POST /building", buildingHandler.Create)
	mux.HandleFunc("GET /building", buildingHandler.List)
	mux.HandleFunc("GET /building/{id}", buildingHandler.Get)
	mux.HandleFunc("PUT /building/{id}", buildingHandler.Update)
	mux.HandleFunc("DELETE /building/{id}", buildingHandler.Delete)

	mux.HandleFunc("POST /types-bed", bedTypeHandler.Create)
	mux.HandleFunc("GET /types-bed", bedTypeHandler.List)
	mux.HandleFunc("GET /types-bed/{id}", bedTypeHandler.Get)
	mux.HandleFunc("PUT /types-bed/{id}", bedTypeHandler.Update)
	mux.HandleFunc("DELETE /types-bed/{id}", bedTypeHandler.Delete)

	// Beds: plural is the canonical form (matches /rooms, /users,
	// /headquarters); the singular alias is kept for backwards compatibility.
	mux.HandleFunc("POST /beds", bedHandler.Create)
	mux.HandleFunc("POST /bed", bedHandler.Create)
	mux.HandleFunc("GET /beds", bedHandler.List)
	mux.HandleFunc("GET /bed", bedHandler.List)
	mux.HandleFunc("GET /beds/{id}", bedHandler.Get)
	mux.HandleFunc("GET /bed/{id}", bedHandler.Get)
	mux.HandleFunc("PUT /beds/{id}", bedHandler.Update)
	mux.HandleFunc("PUT /bed/{id}", bedHandler.Update)
	mux.HandleFunc("DELETE /beds/{id}", bedHandler.Delete)
	mux.HandleFunc("DELETE /bed/{id}", bedHandler.Delete)

	// Persons: plural is the canonical form (matches /beds, /users, etc.);
	// singular alias is kept for backwards compatibility.
	mux.HandleFunc("POST /persons", personHandler.Create)
	mux.HandleFunc("POST /person", personHandler.Create)
	mux.HandleFunc("GET /persons", personHandler.List)
	mux.HandleFunc("GET /person", personHandler.List)
	mux.HandleFunc("GET /persons/{id}", personHandler.Get)
	mux.HandleFunc("GET /person/{id}", personHandler.Get)
	mux.HandleFunc("PUT /persons/{id}", personHandler.Update)
	mux.HandleFunc("PUT /person/{id}", personHandler.Update)
	mux.HandleFunc("DELETE /persons/{id}", personHandler.Delete)
	mux.HandleFunc("DELETE /person/{id}", personHandler.Delete)

	// Reserves
	mux.HandleFunc("POST /reserve", reserveHandler.Create)
	mux.HandleFunc("GET /reserve", reserveHandler.List)
	mux.HandleFunc("GET /reserve/{id}", reserveHandler.Get)
	mux.HandleFunc("PUT /reserve/{id}", reserveHandler.Update)
	mux.HandleFunc("PUT /reserve", reserveHandler.Update)
	mux.HandleFunc("DELETE /reserve/{id}", reserveHandler.Delete)
	mux.HandleFunc("DELETE /reserve", reserveHandler.Delete)

	// Stays
	mux.HandleFunc("POST /stays", stayHandler.Create)
	mux.HandleFunc("POST /stay", stayHandler.Create)
	mux.HandleFunc("GET /stays", stayHandler.List)
	mux.HandleFunc("GET /stay", stayHandler.List)
	mux.HandleFunc("GET /stays/{id}", stayHandler.Get)
	mux.HandleFunc("GET /stay/{id}", stayHandler.Get)
	mux.HandleFunc("GET /stay/reception/{room_id}", stayHandler.Reception)
	mux.HandleFunc("GET /stays_person/{stay_id}", stayHandler.StayPersons)
	mux.HandleFunc("GET /stay_person/{stay_id}", stayHandler.StayPersons)
	mux.HandleFunc("PUT /stays/{id}", stayHandler.Update)
	mux.HandleFunc("PUT /stay/{id}", stayHandler.Update)
	mux.HandleFunc("PUT /stays", stayHandler.Update)
	mux.HandleFunc("PUT /stay", stayHandler.Update)
	mux.HandleFunc("DELETE /stays/{id}", stayHandler.Delete)
	mux.HandleFunc("DELETE /stay/{id}", stayHandler.Delete)
	mux.HandleFunc("DELETE /stays", stayHandler.Delete)
	mux.HandleFunc("DELETE /stay", stayHandler.Delete)

	// Rates
	mux.HandleFunc("POST /rates", rateHandler.Create)
	mux.HandleFunc("POST /rate", rateHandler.Create)
	mux.HandleFunc("GET /rates", rateHandler.List)
	mux.HandleFunc("GET /rate", rateHandler.List)
	mux.HandleFunc("GET /rates/{id}", rateHandler.Get)
	mux.HandleFunc("GET /rate/{id}", rateHandler.Get)
	mux.HandleFunc("PUT /rates/{id}", rateHandler.Update)
	mux.HandleFunc("PUT /rate/{id}", rateHandler.Update)
	mux.HandleFunc("PUT /rates", rateHandler.Update)
	mux.HandleFunc("PUT /rate", rateHandler.Update)
	mux.HandleFunc("DELETE /rates/{id}", rateHandler.Delete)
	mux.HandleFunc("DELETE /rate/{id}", rateHandler.Delete)
	mux.HandleFunc("DELETE /rates", rateHandler.Delete)
	mux.HandleFunc("DELETE /rate", rateHandler.Delete)

	// Room tariffs
	mux.HandleFunc("POST /room_tariffs", roomTariffHandler.Create)
	mux.HandleFunc("POST /room_tariff", roomTariffHandler.Create)
	mux.HandleFunc("GET /room_tariffs", roomTariffHandler.List)
	mux.HandleFunc("GET /room_tariff", roomTariffHandler.List)
	mux.HandleFunc("GET /room_tariffs/{id}", roomTariffHandler.Get)
	mux.HandleFunc("GET /room_tariff/{id}", roomTariffHandler.Get)
	mux.HandleFunc("GET /room_tariffs/by-room/{room_id}", roomTariffHandler.ListByRoom)
	mux.HandleFunc("GET /room_tariff/by-room/{room_id}", roomTariffHandler.ListByRoom)
	mux.HandleFunc("PUT /room_tariffs/{id}", roomTariffHandler.Update)
	mux.HandleFunc("PUT /room_tariff/{id}", roomTariffHandler.Update)
	mux.HandleFunc("PUT /room_tariffs", roomTariffHandler.Update)
	mux.HandleFunc("PUT /room_tariff", roomTariffHandler.Update)
	mux.HandleFunc("DELETE /room_tariffs/{id}", roomTariffHandler.Delete)
	mux.HandleFunc("DELETE /room_tariff/{id}", roomTariffHandler.Delete)
	mux.HandleFunc("DELETE /room_tariffs", roomTariffHandler.Delete)
	mux.HandleFunc("DELETE /room_tariff", roomTariffHandler.Delete)

	// Audit (read-only slice: evidence for the hotel auditor)
	mux.HandleFunc("GET /audit/summary", auditHandler.Summary)
	mux.HandleFunc("GET /audit/rooms", auditHandler.Rooms)
	mux.HandleFunc("GET /audit/rooms/by-status/{status}", auditHandler.RoomsByStatus)
	mux.HandleFunc("GET /audit/rates", auditHandler.Rates)
	mux.HandleFunc("GET /audit/rooms-without-tariff", auditHandler.RoomsWithoutTariff)
	mux.HandleFunc("GET /audit/tariffs-inactive-in-use", auditHandler.InactiveTariffsInUse)

	moduleHTTP.Register(mux)
	resourceHTTP.Register(mux)
	permissionResourceHTTP.Register(mux)
	menuCategoryHTTP.Register(mux)
	itemMenuHTTP.Register(mux)
	serviceRequestHTTP.Register(mux)
	// Service Assignments: registra POST, GET, PUT, DELETE para /service-assignments y /service-assignment
	serviceAssignmentHTTP.Register(mux)

	return corsMiddleware(rateLimitMiddleware(mux))
}
