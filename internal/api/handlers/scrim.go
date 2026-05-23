package handlers

import (
	"github.com/Ankush263/devstudio/internal/api/dto"
	"github.com/Ankush263/devstudio/internal/pkg/response"
	"github.com/Ankush263/devstudio/internal/services"
	"github.com/gin-gonic/gin"
)

type ScrimHandler struct {
	scrimService *services.ScrimService
	s3Service    *services.S3Service
}

func NewScrimHandler(s *services.ScrimService, s3 *services.S3Service) *ScrimHandler {
	return &ScrimHandler{
		scrimService: s,
		s3Service:    s3,
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

func (h *ScrimHandler) GetScrimByID(c *gin.Context) {
	scrim, err := h.scrimService.GetScrimByID(c, c.Param("scrimid"))
	if err != nil {
		response.Error(c, 404, "scrim not found")
		return
	}
	response.OK(c, dto.ToScrimResponse(scrim))
}

type ForkRequest struct {
	Title          string                   `json:"title"`
	ForkTime       float64                  `json:"fork_time"`
	ForkOplogIndex int                      `json:"fork_oplog_index"`
	FileSnapshots  []services.FileSnapshot  `json:"file_snapshots"`
}

func (h *ScrimHandler) ForkScrim(c *gin.Context) {
	userID := c.GetString("userID")
	scrimID := c.Param("scrimid")

	var req ForkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, "invalid request")
		return
	}

	scrim, err := h.scrimService.ForkScrim(
		c,
		userID,
		scrimID,
		req.Title,
		req.ForkTime,
		req.ForkOplogIndex,
		req.FileSnapshots,
		h.s3Service,
	)
	if err != nil {
		response.Error(c, 500, err.Error())
		return
	}

	response.OK(c, dto.ToScrimResponse(scrim))
}

func (h *ScrimHandler) GetScrimsByUser(c *gin.Context) {
	userID := c.GetString("userID")
	scrims, err := h.scrimService.GetScrimsByUser(c, userID)
	if err != nil {
		response.Error(c, 500, "failed to get scrims")
		return
	}
	response.OK(c, gin.H{"scrims": dto.ToManyScrimResponse(scrims)})
}
