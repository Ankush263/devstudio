package dto

import (
	"github.com/Ankush263/devstudio/internal/db/sqlc"
	"github.com/google/uuid"
)

type scrimfilesResponse struct {
	ID          uuid.UUID   `json:"id"`
	ScrimID     uuid.UUID   `json:"scrimid"`
	Filename    string      `json:"filename"`
	Language    string      `json:"language"`
	Location    string      `json:"location"`
	Content     string      `json:"content"`
	Description interface{} `json:"description"`
	CreatedAt   string      `json:"created_at"`
	UpdatedAt   string      `json:"updated_at"`
}

func ToScrimFilesResponse(s *sqlc.Scrimfile) scrimfilesResponse {
	var scrimFileDesc interface{} = map[string]interface{}{}

	if s.Description.Valid {
		scrimFileDesc = s.Description.RawMessage
	}

	return scrimfilesResponse{
		ID:          s.ID,
		ScrimID:     s.ScrimID,
		Filename:    s.Filename,
		Language:    s.Language,
		Location:    s.Location,
		Content:     s.Content,
		Description: scrimFileDesc,
		CreatedAt:   Time(s.CreatedAt),
		UpdatedAt:   Time(s.UpdatedAt),
	}
}

func ToManyScrimFilesResponse(files []sqlc.Scrimfile) []scrimfilesResponse {
	res := make([]scrimfilesResponse, 0, len(files))

	for i := range files {
		res = append(res, ToScrimFilesResponse(&files[i]))
	}

	return res
}
