// Package routes handles the routing logic of the Application
package routes

import (
	"github.com/Ankush263/devstudio/internal/api/handlers"
	"github.com/Ankush263/devstudio/internal/api/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, authHandler *handlers.AuthHandler, secret string, scrimHandler *handlers.ScrimHandler, scrimFilesHandler *handlers.ScrimFilesHandler, uploadHandler *handlers.UploadHandler) {
	api := r.Group("/api")

	auth := api.Group("/auth")
	{
		auth.POST("/signup", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	// Public scrim listing — no auth required
	api.GET("/scrims/public", scrimHandler.ListPublicScrims)

	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware(secret))
	{
		protected.GET("/me", authHandler.GetMe)
	}

	scrim := api.Group("/scrims")
	scrim.Use(middleware.AuthMiddleware(secret))
	{
		scrim.GET("", scrimHandler.GetScrimsByUser)
		scrim.GET("/myforks", scrimHandler.GetForksByUser)
		scrim.GET("/:scrimid", scrimHandler.GetScrimByID)
		scrim.POST("", scrimHandler.CreateScrim)
		scrim.PATCH("/:scrimid", scrimHandler.AttachScrim)
		scrim.POST("/:scrimid/fork", scrimHandler.ForkScrim)
	}

	scrimfiles := api.Group("/scrimfiles")
	scrimfiles.Use(middleware.AuthMiddleware(secret))
	{
		scrimfiles.POST("", scrimFilesHandler.CreateScrimFiles)
		scrimfiles.GET("/:scrimid", scrimFilesHandler.GetScrimFilesByScrimID)
	}

	upload := api.Group("/upload")
	upload.Use(middleware.AuthMiddleware(secret))
	{
		upload.POST("", uploadHandler.Upload)
	}
}
