include .env
export

migrate-up:
	migrate -path internal/db/migrations -database "$(DB_URL)" up

migrate-down:
	migrate -path internal/db/migrations -database "$(DB_URL)" down 1

migrate-create:
	migrate create -ext sql -dir internal/db/migrations -seq $(name)

sqlc:
	sqlc generate