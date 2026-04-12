-- name: CreateScrimFiles :one
INSERT INTO scrimfiles (scrim_id, filename, language, location, content, description)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetScrimFilesByScrimId :many
SELECT * FROM scrimfiles WHERE scrim_id = $1;


-- name: GetScrimFileById :one
SELECT * FROM scrimfiles WHERE id = $1;
