package main

import (
	"log"

	"nexora-api-rest/internal/app"
)

func main() {
	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
