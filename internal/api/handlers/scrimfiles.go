package handlers

import (
	"github.com/Ankush263/devstudio/internal/api/dto"
	"github.com/Ankush263/devstudio/internal/pkg/response"
	"github.com/Ankush263/devstudio/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ScrimFilesHandler struct {
	scrimFilesService *services.ScrimFilesService
}

func NewScrimFilesHandler(s *services.ScrimFilesService) *ScrimFilesHandler {
	return &ScrimFilesHandler{
		scrimFilesService: s,
	}
}

type ScrimFilesRequest struct {
	ScrimID     uuid.UUID   `json:"scrimid"`
	Filename    string      `json:"filename"`
	Location    string      `json:"location"`
	Language    string      `json:"language"`
	Content     string      `json:"content"`
	Description interface{} `json:"description"`
}

func (h *ScrimFilesHandler) CreateScrimFiles(c *gin.Context) {
	var req ScrimFilesRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, "invalid request")
		return
	}

	scrimfile, err := h.scrimFilesService.CreateScrimFiles(
		c,
		req.ScrimID,
		req.Filename,
		req.Language,
		req.Location,
		req.Content,
		req.Description,
	)

	if err != nil {
		response.Error(c, 500, "failed to create scrimfiles")
		return
	}

	response.OK(c, dto.ToScrimFilesResponse(scrimfile))

}

func (h *ScrimFilesHandler) GetScrimFilesByScrimID(c *gin.Context) {
	scrimIDParam := c.Param("scrimid")

	scrimID, err := uuid.Parse(scrimIDParam)
	if err != nil {
		response.Error(c, 400, "invalid scrimid")
		return
	}

	scrimfiles, err := h.scrimFilesService.GetScrimFilesByScrimID(c, scrimID)

	if err != nil {
		response.Error(c, 500, "failed to get scrim files")
		return
	}

	response.OK(c, dto.ToManyScrimFilesResponse(scrimfiles))
}
