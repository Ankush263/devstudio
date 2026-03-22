package handlers

import (
	"github.com/Ankush263/devstudio/internal/api/dto"
	"github.com/Ankush263/devstudio/internal/pkg/response"
	"github.com/Ankush263/devstudio/internal/services"
	"github.com/gin-gonic/gin"
)

type ScrimHandler struct {
	scrimService *services.ScrimService
}

func NewScrimHandler(s *services.ScrimService) *ScrimHandler {
	return &ScrimHandler{
		scrimService: s,
	}
}

type ScrimRequest struct {
	Title            string      `json:"title" validate:"required"`
	Description      string      `json:"description"`
	Videodescription interface{} `json:"videodescription"`
}

func (h *ScrimHandler) CreateScrim(c *gin.Context) {
	userID := c.GetString("userID")

	var req ScrimRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, "invalid request")
		return
	}

	scrim, err := h.scrimService.CreateScrim(c, userID, req.Title, req.Description, req.Videodescription)
	if err != nil {
		response.Error(c, 500, "failed to create scrim")
		return
	}

	response.OK(c, dto.ToScrimResponse(scrim))
}
