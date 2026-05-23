package services

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"math"
	"strings"

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
	description,
	videourl,
	oplogurl string,
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
	title,
	description,
	videoURL,
	oplogURL string,
	duration int32,
	publish bool,
	videodescription interface{},
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
	if err != nil {
		return "", err
	}

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

	// interface{} -> JSONB
	var videoJSON []byte
	if videodescription != nil {
		videoJSON, err = json.Marshal(videodescription)
		if err != nil {
			return "", err
		}
	}

	videoDesc := pqtype.NullRawMessage{
		RawMessage: videoJSON,
		Valid:       videodescription != nil,
	}

	err = s.q.UpdateScrim(
		ctx,
		sqlc.UpdateScrimParams{
			ID:               scrimIDUUID,
			Title:            title,
			Description:      dto.ToNullString(description),
			VideoUrl:         dto.ToNullString(videoURL),
			OplogUrl:         dto.ToNullString(oplogURL),
			Duration:         dto.ToInt32(duration),
			Published:        dto.ToBool(publish),
			Videodescription: videoDesc,
		},
	)
	if err != nil {
		return "", err
	}

	return "success", nil
}

func (s *ScrimService) GetScrimByID(ctx context.Context, scrimID string) (*sqlc.Scrim, error) {
	id, err := uuid.Parse(scrimID)
	if err != nil {
		return nil, err
	}
	scrim, err := s.q.GetScrimByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return &scrim, nil
}

func (s *ScrimService) GetScrimsByUser(ctx context.Context, userID string) ([]sqlc.Scrim, error) {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}
	return s.q.GetScrimByUser(ctx, uid)
}

type FileSnapshot struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Content string `json:"content"`
}

func (s *ScrimService) ForkScrim(
	ctx context.Context,
	userID, scrimID, title string,
	forkTime float64,
	forkOplogIndex int,
	snapshots []FileSnapshot,
	s3svc *S3Service,
) (*sqlc.Scrim, error) {
	origID, err := uuid.Parse(scrimID)
	if err != nil {
		return nil, err
	}
	orig, err := s.q.GetScrimByID(ctx, origID)
	if err != nil {
		return nil, err
	}

	uid, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}

	// Fetch, truncate, and re-upload the oplog.
	var newOplogURL string
	if orig.OplogUrl.Valid && orig.OplogUrl.String != "" && s3svc != nil {
		key := s3svc.KeyFromURL(orig.OplogUrl.String)
		data, fetchErr := s3svc.GetObject(key)
		if fetchErr == nil {
			var oplog []json.RawMessage
			if json.Unmarshal(data, &oplog) == nil {
				if forkOplogIndex < len(oplog) {
					oplog = oplog[:forkOplogIndex]
				}
				if truncated, merr := json.Marshal(oplog); merr == nil {
					newOplogURL, _ = s3svc.Upload(bytes.NewReader(truncated), "oplog", ".json", "application/json")
				}
			}
		}
	}

	duration := int32(math.Ceil(forkTime))
	newScrim, err := s.q.CreateScrim(ctx, sqlc.CreateScrimParams{
		UserID:           uid,
		Title:            title,
		Description:      dto.ToNullString(""),
		VideoUrl:         orig.VideoUrl,
		OplogUrl:         dto.ToNullString(newOplogURL),
		Duration:         dto.ToInt32(duration),
		Videodescription: pqtype.NullRawMessage{},
	})
	if err != nil {
		return nil, err
	}

	for _, snap := range snapshots {
		_, _ = s.q.CreateScrimFiles(ctx, sqlc.CreateScrimFilesParams{
			ScrimID:  newScrim.ID,
			Filename: snap.Name,
			Language: langFromName(snap.Name),
			Location: "",
			Content:  snap.Content,
		})
	}

	return &newScrim, nil
}

func langFromName(name string) string {
	switch {
	case strings.HasSuffix(name, ".html"):
		return "html"
	case strings.HasSuffix(name, ".css"):
		return "css"
	case strings.HasSuffix(name, ".js"), strings.HasSuffix(name, ".jsx"):
		return "javascript"
	case strings.HasSuffix(name, ".ts"), strings.HasSuffix(name, ".tsx"):
		return "typescript"
	default:
		return "plaintext"
	}
}
