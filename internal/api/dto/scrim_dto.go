package dto

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

func ToScrimResponse(s *sqlc.Scrim) scrimResponse {
	var videoDesc interface{} = map[string]interface{}{}

	if s.Videodescription.Valid {
		videoDesc = s.Videodescription.RawMessage
	}

	return scrimResponse{
		ID:               s.ID,
		UserID:           s.UserID.String(),
		Title:            s.Title,
		Description:      String(s.Description),
		Videodescription: videoDesc,
		VideoURL:         String(s.VideoUrl),
		OplogURL:         String(s.OplogUrl),
		Duration:         Int32(s.Duration),
		Published:        Bool(s.Published),
		CreatedAt:        Time(s.CreatedAt),
		UpdatedAt:        Time(s.UpdatedAt),
	}
}
