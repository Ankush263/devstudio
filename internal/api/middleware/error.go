package middleware

import (
	"net/http"

	"github.com/Ankush263/devstudio/internal/pkg/response"
	"github.com/gin-gonic/gin"
)

type AppError struct {
	Code    int
	Message string
}

func (e *AppError) Error() string {
	return e.Message
}

func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) > 0 {
			err := c.Errors.Last().Err

			if appErr, ok := err.(*AppError); ok {
				response.Error(c, appErr.Code, appErr.Message)
				return
			}

			response.Error(c, http.StatusInternalServerError, "internal server error")
		}
	}
}
