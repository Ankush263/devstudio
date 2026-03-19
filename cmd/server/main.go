package main

import (
	"log"

	"github.com/Ankush263/devstudio/internal/api/handlers"
	"github.com/Ankush263/devstudio/internal/api/routes"
	"github.com/Ankush263/devstudio/internal/config"
	"github.com/Ankush263/devstudio/internal/db"
	"github.com/Ankush263/devstudio/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)


func main() {
	err := godotenv.Load()

	if err != nil {
		log.Println("No .env file found")
	}
	
	cfg := config.LoadConfig()

	database := db.NewDB(cfg.DBUrl)

	authService := services.NewAuthService(database)
	authHandler := handlers.NewAuthHandler(authService)

	r := gin.Default()

	routes.SetupRoutes(r, authHandler)

	log.Println("Server running on port", cfg.Port)
	r.Run(":" + cfg.Port)
}
