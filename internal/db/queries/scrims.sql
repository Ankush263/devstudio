-- name: CreateScrim :one
INSERT INTO scrims (user_id, title, description, videodescription)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: UpdateScrimAssets :exec
UPDATE scrims
SET video_url = $2,
    oplog_url = $3,
    duration = $4
WHERE id = $1;

-- name: GetScrimByID :one
SELECT * FROM scrims WHERE id = $1;

-- name: ListScrims :many
SELECT * FROM scrims WHERE published = true;