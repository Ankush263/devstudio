package handlers

import (
	"github.com/Ankush263/devstudio/internal/pkg/response"
	"github.com/Ankush263/devstudio/internal/services"
	"github.com/gin-gonic/gin"
)

type UploadHandler struct {
	s3 *services.S3Service
}

func NewUploadHandler(s *services.S3Service) *UploadHandler {
	return &UploadHandler{s3: s}
}

func (h *UploadHandler) Upload(c *gin.Context) {
	fileType := c.Query("type")
	if fileType != "video" && fileType != "oplog" {
		response.Error(c, 400, "query param 'type' must be 'video' or 'oplog'")
		return
	}

	file, _, err := c.Request.FormFile("file")
	if err != nil {
		response.Error(c, 400, "file field is required")
		return
	}
	defer file.Close()

	var ext, contentType string
	if fileType == "video" {
		ext = ".webm"
		contentType = "audio/webm"
	} else {
		ext = ".json"
		contentType = "application/json"
	}

	url, err := h.s3.Upload(file, fileType, ext, contentType)
	if err != nil {
		response.Error(c, 500, err.Error())
		return
	}

	response.OK(c, gin.H{"url": url})
}
