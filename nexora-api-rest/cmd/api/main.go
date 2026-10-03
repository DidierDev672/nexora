package main

import (
	"context"
	"log"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"

	"nexora-api-rest/internal/api"
	"nexora-api-rest/internal/infrastructure/config"
	"nexora-api-rest/internal/infrastructure/persistence/postgres"
	"nexora-api-rest/internal/itemmenu"
	"nexora-api-rest/internal/menucategory"
	"nexora-api-rest/internal/servicerequest"
)

func main() {
	if err := config.Load(); err != nil {
		log.Fatal("error loading .env: ", err)
	}

	jwtSecret := config.JWTSecret()
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET must be set in .env")
	}

	conn, err := pgxpool.New(context.Background(), config.DatabaseURL())
	if err != nil {
		log.Fatal("error creating postgres pool: ", err)
	}
	defer conn.Close()

	if err := conn.Ping(context.Background()); err != nil {
		log.Fatal("error pinging postgres: ", err)
	}

	if err := postgres.Migrate(context.Background(), conn); err != nil {
		log.Fatal("error running migrations: ", err)
	}

	roleRepo := postgres.NewRoleRepository(conn)
	headquarterRepo := postgres.NewHeadquarterRepository(conn)
	subHeadquarterRepo := postgres.NewSubHeadquarterRepository(conn)
	paletteRepo := postgres.NewPaletteRepository(conn)
	userRepo := postgres.NewUserRepository(conn)
	permissionAssignmentRepo := postgres.NewPermissionAssignmentRepository(conn)
	roomTypeRepo := postgres.NewRoomTypeRepository(conn)
	roomRepo := postgres.NewRoomRepository(conn)
	buildingRepo := postgres.NewBuildingRepository(conn)
	bedTypeRepo := postgres.NewBedTypeRepository(conn)
	bedRepo := postgres.NewBedRepository(conn)
	personRepo := postgres.NewPersonRepository(conn)
	reserveRepo := postgres.NewReserveRepository(conn)
	stayRepo := postgres.NewStayRepository(conn)
	rateRepo := postgres.NewRateRepository(conn)
	roomTariffRepo := postgres.NewRoomTariffRepository(conn)
	auditRepo := postgres.NewAuditRepository(conn)
	moduleRepo := postgres.NewModuleRepository(conn)
	resourceRepo := postgres.NewResourceRepository(conn)
	permissionResourceRepo := postgres.NewPermissionResourceRepository(conn)
	menuCategoryRepo := menucategory.NewPostgresRepository(conn)
	itemMenuRepo := itemmenu.NewPostgresRepository(conn)
	serviceRequestRepo := servicerequest.NewPostgresRepository(conn)
	router := api.NewRouter(roleRepo, headquarterRepo, subHeadquarterRepo, paletteRepo, userRepo, permissionAssignmentRepo, roomTypeRepo, roomRepo, buildingRepo, bedTypeRepo, bedRepo, personRepo, reserveRepo, stayRepo, rateRepo, roomTariffRepo, auditRepo, moduleRepo, resourceRepo, permissionResourceRepo, menuCategoryRepo, itemMenuRepo, serviceRequestRepo, jwtSecret)

	server := &http.Server{
		Addr:    ":8080",
		Handler: router,
	}

	log.Println("nexora-api-rest listening on :8080")
	log.Fatal(server.ListenAndServe())
}
