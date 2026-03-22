// Package handlers handles all HTTP request controllers.
package handlers

import (
	"net/http"

	"github.com/Ankush263/devstudio/internal/api/middleware"
	"github.com/Ankush263/devstudio/internal/pkg/response"
	"github.com/Ankush263/devstudio/internal/pkg/validator"
	"github.com/Ankush263/devstudio/internal/services"
	"github.com/gin-gonic/gin"
	playgroundValidator "github.com/go-playground/validator/v10"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(s *services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: s,
	}
}

type registerRequest struct {
	Username string `json:"username" validate:"omitempty,min=3"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

func formatValidationError(err error) string {
	if errs, ok := err.(playgroundValidator.ValidationErrors); ok {
		for _, e := range errs {
			switch e.Field() {
			case "Email":
				return "invalid email"
			case "Password":
				return "password must be at least 8 characters"
			case "Username":
				return "username must be at least 3 characters"
			}
		}
	}
	return "invalid input"
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req registerRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(&middleware.AppError{
			Code:    http.StatusBadRequest,
			Message: "invalid request",
		})
		return
	}

	if err := validator.ValidateStruct(req); err != nil {
		c.Error(&middleware.AppError{
			Code:    http.StatusBadRequest,
			Message: formatValidationError(err),
		})
		return
	}

	user, err := h.authService.Register(c, req.Username, req.Email, req.Password)
	if err != nil {
		if err.Error() == "email already exists" {
			c.Error(&middleware.AppError{
				Code:    http.StatusBadRequest,
				Message: "Email already exists",
			})
			return
		}
		c.Error(&middleware.AppError{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}
	response.OK(c, toUserResponse(user))
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req registerRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(&middleware.AppError{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	token, err := h.authService.Login(c, req.Email, req.Password)
	if err != nil {
		c.Error(&middleware.AppError{
			Code:    http.StatusBadRequest,
			Message: "invalid credentials",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
	})
}
