package middleware

import (
	"net/http"
	"strings"

	"github.com/Ankush263/devstudio/internal/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHandler := c.GetHeader("Authorization")

		if authHandler == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			return
		}

		tokenStr := strings.TrimPrefix(authHandler, "Bearer ")

		claims, err := jwt.VerifyToken(tokenStr, secret)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return 
		}

		c.Set("userID", claims.UserID)
		c.Next()
	}
}