// Package services contains business logic for the application.
package services

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/Ankush263/devstudio/internal/db/sqlc"
	"github.com/Ankush263/devstudio/internal/pkg/jwt"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	q         *sqlc.Queries
	jwtSecret string
}

func NewAuthService(db *sql.DB, secret string) *AuthService {
	return &AuthService{
		q:         sqlc.New(db),
		jwtSecret: secret,
	}
}

func (s *AuthService) Register(ctx context.Context, username, email, password string) (*sqlc.User, error) {
	hashed, _ := bcrypt.GenerateFromPassword([]byte(password), 10)

	user, err := s.q.CreateUser(ctx, sqlc.CreateUserParams{
		Username: username,
		Email:    email,
		Password: string(hashed),
	})

	if err != nil {
		if pqError, ok := err.(*pq.Error); ok {
			if pqError.Code == "23505" {
				return nil, errors.New("email already exists")
			}
		}
		return nil, err
	}

	return &user, err
}

func (s *AuthService) Login(ctx context.Context, email, password string) (string, error) {
	user, err := s.q.GetUserByEmail(ctx, email)
	if err != nil {
		return "", errors.New("invalid credential")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", errors.New("invalid credential")
	}

	token, err := jwt.GenerateToken(user.Userid.String(), s.jwtSecret, 24*time.Hour)
	if err != nil {
		return "", err
	}

	return token, nil
}
