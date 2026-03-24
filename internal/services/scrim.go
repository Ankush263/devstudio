package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"

	"github.com/Ankush263/devstudio/internal/api/dto"
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

func (s *ScrimService) CreateScrim(
	ctx context.Context,
	userID,
	title,
	videourl,
	oplogurl,
	description string,
	duration int32,
	videodescription interface{},
) (*sqlc.Scrim, error) {
	// string -> uuid
	uid, err := uuid.Parse(userID)

	if err != nil {
		return nil, err
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
		Description:      dto.ToNullString(description),
		VideoUrl:         dto.ToNullString(videourl),
		OplogUrl:         dto.ToNullString(oplogurl),
		Duration:         dto.ToInt32(duration),
		Videodescription: videoDesc,
	})
	if err != nil {
		return nil, err
	}

	return &scrim, nil
}

// AttachScrim function attach video url and other details to the created scrim
// It checks for owner of the scrim before proceed
func (s *ScrimService) AttachScrim(
	ctx context.Context,
	userID,
	scrimID,
	videoURL,
	oplogURL string,
	duration int32,
	publish bool,
) (string, error) {
	userid, err := uuid.Parse(userID)

	if err != nil {
		return "", err
	}

	// Check for the owner
	scrims, err := s.q.GetScrimByUser(ctx, userid)

	if err != nil {
		return "", err
	}

	scrimIDUUID, err := uuid.Parse(scrimID)

	found := false
	for _, scrim := range scrims {
		if scrim.UserID == userid {
			if scrim.ID == scrimIDUUID {
				found = true
				break
			}
		}
	}

	if !found {
		return "", errors.New("only owner can update the scrim")
	}

	if err != nil {
		return "", err
	}

	err = s.q.UpdateScrimAssets(
		ctx,
		sqlc.UpdateScrimAssetsParams{
			ID:        scrimIDUUID,
			VideoUrl:  dto.ToNullString(videoURL),
			OplogUrl:  dto.ToNullString(oplogURL),
			Duration:  dto.ToInt32(duration),
			Published: dto.ToBool(publish),
		},
	)
	if err != nil {
		return "", err
	}

	return "success", nil
}
