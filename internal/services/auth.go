package services

import (
	"context"
	"database/sql"

	"github.com/Ankush263/devstudio/internal/db/sqlc"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	q *sqlc.Queries
}

func NewAuthService(db *sql.DB) *AuthService {
	return &AuthService{
		q: sqlc.New(db),
	}
}

func (s *AuthService) Register(ctx context.Context, username, email, password string) (*sqlc.User, error) {
	hashed, _ := bcrypt.GenerateFromPassword([]byte(password), 10)

	user, err := s.q.CreateUser(ctx, sqlc.CreateUserParams{
		Username: username,
		Email: email,
		Password: string(hashed),
	})

	return &user, err
}

