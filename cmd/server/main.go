package main

import (
	"log"

	"github.com/Ankush263/devstudio/internal/api/handlers"
	"github.com/Ankush263/devstudio/internal/api/middleware"
	"github.com/Ankush263/devstudio/internal/api/routes"
	"github.com/Ankush263/devstudio/internal/config"
	"github.com/Ankush263/devstudio/internal/db"
	"github.com/Ankush263/devstudio/internal/services"
	"github.com/gin-contrib/cors"
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

	authService := services.NewAuthService(database, cfg.JWTSecret)
	authHandler := handlers.NewAuthHandler(authService)

	scrimService := services.NewScrimService(database)
	scrimHandler := handlers.NewScrimHandler(scrimService)

	scrimFilesService := services.NewScrimFilesService(database)
	scrimFilesHandler := handlers.NewScrimFilesHandler(scrimFilesService)

	r := gin.Default()

	r.Use(cors.Default())

	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(middleware.ErrorHandler())

	routes.SetupRoutes(r, authHandler, cfg.JWTSecret, scrimHandler, scrimFilesHandler)

	log.Println("Server running on port", cfg.Port)
	r.Run(":" + cfg.Port)
}
