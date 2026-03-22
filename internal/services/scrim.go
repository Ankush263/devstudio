package services

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/Ankush263/devstudio/internal/db/sqlc"
	"github.com/google/uuid"
	"github.com/sqlc-dev/pqtype"
)

type ScrimService struct {
	q *sqlc.Queries
}

func NewScrimService(db *sql.DB) *ScrimService {
	return &ScrimService{
		q: sqlc.New(db),
	}
}

func (s *ScrimService) CreateScrim(ctx context.Context, userID, title, description string, videodescription interface{}) (*sqlc.Scrim, error) {
	// string -> uuid
	uid, err := uuid.Parse(userID)

	if err != nil {
		return nil, err
	}

	// string -> NullString
	desc := sql.NullString{
		String: description,
		Valid:  description != "",
	}

	// interface{} -> JSONB
	var videoJSON []byte
	if videodescription != nil {
		videoJSON, err = json.Marshal(videodescription)
		if err != nil {
			return nil, err
		}
	}

	videoDesc := pqtype.NullRawMessage{
		RawMessage: videoJSON,
		Valid:      videodescription != nil,
	}

	scrim, err := s.q.CreateScrim(ctx, sqlc.CreateScrimParams{
		UserID:           uid,
		Title:            title,
		Description:      desc,
		Videodescription: videoDesc,
	})
	if err != nil {
		return nil, err
	}

	return &scrim, nil
}
