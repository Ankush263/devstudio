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
	Title            string      `json:"title"`
	Description      string      `json:"description"`
	VideoURL         string      `json:"videourl"`
	OplogURL         string      `json:"oplogurl"`
	Duration         int32       `json:"duration"`
	Videodescription interface{} `json:"videodescription"`
	ScrimID          string      `json:"scrimid"`
	Published        bool        `json:"published"`
}

func (h *ScrimHandler) CreateScrim(c *gin.Context) {
	userID := c.GetString("userID")

	var req ScrimRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, "invalid request")
		return
	}

	scrim, err := h.scrimService.CreateScrim(
		c,
		userID,
		req.Title,
		req.Description,
		req.VideoURL,
		req.OplogURL,
		req.Duration,
		req.Videodescription,
	)

	if err != nil {
		response.Error(c, 500, "failed to create scrim")
		return
	}

	response.OK(c, dto.ToScrimResponse(scrim))
}

func (h *ScrimHandler) AttachScrim(c *gin.Context) {
	userID := c.GetString("userID")

	var req ScrimRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, "invalid request")
		return
	}

	_, err := h.scrimService.AttachScrim(
		c,
		string(userID),
		c.Param("scrimid"),
		req.Title,
		req.Description,
		req.VideoURL,
		req.OplogURL,
		req.Duration,
		req.Published,
		req.Videodescription,
	)

	if err != nil {
		response.Error(c, 500, "failed to update scrim")
		return
	}

	response.OK(c, "updated")
}
