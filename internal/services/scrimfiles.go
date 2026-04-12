package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"

	"github.com/Ankush263/devstudio/internal/db/sqlc"
	"github.com/google/uuid"
	"github.com/sqlc-dev/pqtype"
)

type ScrimFilesService struct {
	q *sqlc.Queries
}

func NewScrimFilesService(db *sql.DB) *ScrimFilesService {
	return &ScrimFilesService{
		q: sqlc.New(db),
	}
}

func (s *ScrimFilesService) CreateScrimFiles(
	ctx context.Context,
	scrimID uuid.UUID,
	filename,
	language,
	location,
	content string,
	description interface{},
) (*sqlc.Scrimfile, error) {

	_, err := s.q.GetScrimByID(ctx, scrimID)

	if err != nil {
		return nil, errors.New("scrim with that id doesn't exists")
	}

	// interface{} -> JSONB
	var desc pqtype.NullRawMessage

	if description != nil {
		videoJSON, err := json.Marshal(description)

		if err != nil {
			return nil, err
		}

		desc = pqtype.NullRawMessage{
			RawMessage: videoJSON,
			Valid:      videoJSON != nil,
		}
	}

	scrimfiles, err := s.q.CreateScrimFiles(ctx, sqlc.CreateScrimFilesParams{
		ScrimID:     scrimID,
		Filename:    filename,
		Language:    language,
		Location:    location,
		Content:     content,
		Description: desc,
	})

	if err != nil {
		return nil, err
	}

	return &scrimfiles, nil
}

func (s *ScrimFilesService) GetScrimFilesByScrimID(
	ctx context.Context,
	scrimID uuid.UUID,
) ([]sqlc.Scrimfile, error) {

	_, err := s.q.GetScrimByID(ctx, scrimID)
	if err != nil {
		return nil, err
	}

	scrimfiles, err := s.q.GetScrimFilesByScrimId(ctx, scrimID)
	if err != nil {
		return nil, err
	}

	return scrimfiles, nil
}
