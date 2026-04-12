// Package routes handles the routing logic of the Application
package routes

import (
	"github.com/Ankush263/devstudio/internal/api/handlers"
	"github.com/Ankush263/devstudio/internal/api/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, authHandler *handlers.AuthHandler, secret string, scrimHandler *handlers.ScrimHandler, scrimFilesHandler *handlers.ScrimFilesHandler) {
	api := r.Group("/api")

	auth := api.Group("/auth")
	{
		auth.POST("/signup", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware(secret))
	{
		protected.GET("/me", func(c *gin.Context) {
			userID, _ := c.Get("UserID")
			c.JSON(200, gin.H{"userid": userID})
		})
	}

	scrim := api.Group("/scrims")
	scrim.Use(middleware.AuthMiddleware(secret))
	{
		scrim.POST("", scrimHandler.CreateScrim)
		scrim.PATCH("/:scrimid", scrimHandler.AttachScrim)
	}

	scrimfiles := api.Group("/scrimfiles")
	scrimfiles.Use(middleware.AuthMiddleware(secret))
	{
		scrimfiles.POST("", scrimFilesHandler.CreateScrimFiles)
		scrimfiles.GET("/:scrimid", scrimFilesHandler.GetScrimFilesByScrimID)
	}
}
