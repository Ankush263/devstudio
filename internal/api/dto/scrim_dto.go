package dto

import (
	"github.com/Ankush263/devstudio/internal/db/sqlc"
	"github.com/google/uuid"
)

type scrimResponse struct {
	ID               uuid.UUID   `json:"id"`
	UserID           string      `json:"userid"`
	Title            string      `json:"title"`
	Description      string      `json:"description"`
	Videodescription interface{} `json:"videodescription"`
	VideoURL         string      `json:"videourl"`
	OplogURL         string      `json:"oplogurl"`
	Duration         int32       `json:"duration"`
	Published        bool        `json:"published"`
	ForkedFromID     string      `json:"forked_from_id,omitempty"`
	CreatedAt        string      `json:"created_at"`
	UpdatedAt        string      `json:"updated_at"`
}

func ToManyScrimResponse(scrims []sqlc.Scrim) []scrimResponse {
	res := make([]scrimResponse, 0, len(scrims))
	for i := range scrims {
		res = append(res, ToScrimResponse(&scrims[i]))
	}
	return res
}

func ToScrimResponse(s *sqlc.Scrim) scrimResponse {
	var videoDesc interface{} = map[string]interface{}{}

	if s.Videodescription.Valid {
		videoDesc = s.Videodescription.RawMessage
	}

	forkedFromID := ""
	if s.ForkedFromID.Valid {
		forkedFromID = s.ForkedFromID.UUID.String()
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
		ForkedFromID:     forkedFromID,
		CreatedAt:        Time(s.CreatedAt),
		UpdatedAt:        Time(s.UpdatedAt),
	}
}
