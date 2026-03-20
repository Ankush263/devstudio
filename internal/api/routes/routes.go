package routes

import (
	"github.com/Ankush263/devstudio/internal/api/handlers"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, authHandler *handlers.AuthHandler) {
	api := r.Group("/api")

	auth := api.Group("/auth")
	{
		auth.POST("/signup", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}
}