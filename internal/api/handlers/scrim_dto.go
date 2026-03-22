package handlers

import (
	"github.com/Ankush263/devstudio/internal/db/sqlc"
	"github.com/google/uuid"
)

type scrimResponse struct {
	ID               uuid.UUID   `json:"id"`
	UserID           string      `json:"string"`
	Title            string      `json:"title"`
	Description      string      `json:"description"`
	Videodescription interface{} `json:"videodescription"`
	VideoURL         string      `json:"videourl"`
	OplogURL         string      `json:"oplogurl"`
	Duration         int32       `json:"duration"`
	Published        bool        `json:"published"`
	CreatedAt        string      `json:"created_at"`
	UpdatedAt        string      `json:"updated_at"`
}

func toScrimResponse(s *sqlc.Scrim) scrimResponse {
	var videoDesc interface{} = map[string]interface{}{}

	if s.Videodescription.Valid {
		videoDesc = s.Videodescription.RawMessage
	}

	// Handle description NullRawMessage -> String
	var description string
	if s.Description.Valid {
		description = s.Description.String
	}

	var videoURL string
	if s.Description.Valid {
		videoURL = s.VideoUrl.String
	}

	var oplogURL string
	if s.Description.Valid {
		oplogURL = s.OplogUrl.String
	}

	return scrimResponse{
		ID:               s.ID,
		UserID:           s.UserID.String(),
		Title:            s.Title,
		Description:      description,
		Videodescription: videoDesc,
		VideoURL:         videoURL,
		OplogURL:         oplogURL,
		Duration:         s.Duration.Int32,
	}
}
