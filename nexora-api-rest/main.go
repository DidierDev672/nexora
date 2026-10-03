package main

import (
	"log"
	"net/http"

	"nexora-api-rest/handler"
	"nexora-api-rest/repository"
	"nexora-api-rest/usecase"
)

func main() {
	// Repositorios
	moduleRepo := repository.NewInMemoryModuleRepo()
	resourceRepo := repository.NewInMemoryResourceRepo()
	permRepo := repository.NewInMemoryPermissionResourceRepo()

	// Servicios
	moduleSvc := usecase.NewModuleService(moduleRepo)
	resourceSvc := usecase.NewResourceService(resourceRepo)
	permSvc := usecase.NewPermissionResourceService(permRepo)

	// Handlers
	moduleH := handler.NewModuleHTTP(moduleSvc)
	resourceH := handler.NewResourceHTTP(resourceSvc)
	permH := handler.NewPermissionResourceHTTP(permSvc)

	// Registro de rutas
	mux := http.NewServeMux()
	moduleH.Register(mux)
	resourceH.Register(mux)
	permH.Register(mux)

	log.Println("Servidor escuchando en :8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
