package app

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"nexora-api-rest/internal/api"
	"nexora-api-rest/internal/infrastructure/config"
	"nexora-api-rest/internal/infrastructure/persistence/postgres"
	"nexora-api-rest/internal/itemmenu"
	"nexora-api-rest/internal/menucategory"
	"nexora-api-rest/internal/serviceassignment"
	"nexora-api-rest/internal/servicerequest"
)

// ensureDatabaseExists valida si la base de datos destino existe.
// Si no existe (SQLSTATE 3D000), se conecta a la base de datos 'postgres' y la crea automáticamente.
func ensureDatabaseExists(ctx context.Context) error {
	dbURL := config.DatabaseURL()
	conn, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		return err
	}
	defer conn.Close()

	if err := conn.Ping(ctx); err != nil {
		errStr := err.Error()
		if strings.Contains(errStr, "3D000") || strings.Contains(errStr, "no existe la base de datos") || strings.Contains(errStr, "does not exist") {
			dbName := os.Getenv("DB_NAME")
			if dbName == "" {
				dbName = os.Getenv("DB_SCHEMA")
			}
			if dbName == "" {
				dbName = "nexora_db"
			}

			adminURL := fmt.Sprintf(
				"postgres://%s:%s@%s:%s/postgres?sslmode=%s&timezone=%s",
				os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"),
				os.Getenv("DB_HOST"), os.Getenv("DB_PORT"),
				os.Getenv("DB_SSLMODE"), os.Getenv("DB_TIMEZONE"),
			)

			adminConn, adminErr := pgx.Connect(ctx, adminURL)
			if adminErr != nil {
				return fmt.Errorf("no se pudo conectar a la base de datos por defecto 'postgres': %w", adminErr)
			}
			defer adminConn.Close(ctx)

			_, createErr := adminConn.Exec(ctx, fmt.Sprintf(`CREATE DATABASE "%s"`, dbName))
			if createErr != nil {
				return fmt.Errorf("error al crear la base de datos '%s': %w", dbName, createErr)
			}
			log.Printf("[INFO] Base de datos '%s' creada exitosamente en PostgreSQL\n", dbName)
			return nil
		}
		return err
	}
	return nil
}

// Run inicializa la configuración, la base de datos PostgreSQL, las migraciones
// y el router principal con todos los vertical slices de Nexora.
func Run() error {
	if err := config.Load(); err != nil {
		return fmt.Errorf("error cargando .env: %w", err)
	}

	jwtSecret := config.JWTSecret()
	if jwtSecret == "" {
		return fmt.Errorf("JWT_SECRET debe estar configurado en el archivo .env")
	}

	if err := ensureDatabaseExists(context.Background()); err != nil {
		return fmt.Errorf("error verificando/creando la base de datos: %w", err)
	}

	dbURL := config.DatabaseURL()
	conn, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		return fmt.Errorf("error creando pool de postgres: %w", err)
	}
	defer conn.Close()

	if err := conn.Ping(context.Background()); err != nil {
		return fmt.Errorf("error conectando a postgres: %w", err)
	}

	if err := postgres.Migrate(context.Background(), conn); err != nil {
		return fmt.Errorf("error ejecutando migraciones: %w", err)
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
	serviceAssignmentRepo := serviceassignment.NewPostgresRepository(conn)

	router := api.NewRouter(
		roleRepo,
		headquarterRepo,
		subHeadquarterRepo,
		paletteRepo,
		userRepo,
		permissionAssignmentRepo,
		roomTypeRepo,
		roomRepo,
		buildingRepo,
		bedTypeRepo,
		bedRepo,
		personRepo,
		reserveRepo,
		stayRepo,
		rateRepo,
		roomTariffRepo,
		auditRepo,
		moduleRepo,
		resourceRepo,
		permissionResourceRepo,
		menuCategoryRepo,
		itemMenuRepo,
		serviceRequestRepo,
		serviceAssignmentRepo,
		jwtSecret,
	)

	server := &http.Server{
		Addr:    ":8080",
		Handler: router,
	}

	log.Println("nexora-api-rest listening on :8080")
	return server.ListenAndServe()
}
