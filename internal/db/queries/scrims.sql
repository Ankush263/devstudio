-- name: CreateScrim :one
INSERT INTO scrims (user_id, title, description, video_url, oplog_url, duration, videodescription)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: UpdateScrimAssets :exec
UPDATE scrims
SET video_url = $2,
    oplog_url = $3,
    duration = $4,
    published = $5
WHERE id = $1;

-- name: UpdateScrim :exec
UPDATE scrims
SET title = $2,
    description = $3,
    video_url = $4,
    oplog_url = $5,
    duration = $6,
    published = $7,
    videodescription = $8
WHERE id = $1;

-- name: GetScrimByID :one
SELECT * FROM scrims WHERE id = $1;

-- name: ListScrims :many
SELECT * FROM scrims WHERE published = true;

-- name: GetScrimByUser :many
SELECT * FROM scrims WHERE user_id = $1;