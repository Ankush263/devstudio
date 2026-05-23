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

	s3Service, err := services.NewS3Service(cfg.AWSAccessKey, cfg.AWSSecretKey, cfg.AWSRegion, cfg.S3Bucket)
	if err != nil {
		log.Fatal("Failed to initialize S3 service:", err)
	}
	uploadHandler := handlers.NewUploadHandler(s3Service)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
	}))

	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(middleware.ErrorHandler())

	routes.SetupRoutes(r, authHandler, cfg.JWTSecret, scrimHandler, scrimFilesHandler, uploadHandler)

	log.Println("Server running on port", cfg.Port)
	r.Run(":" + cfg.Port)
}
