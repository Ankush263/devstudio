package handlers

import "github.com/Ankush263/devstudio/internal/db/sqlc"

type userResponse struct {
	UserID    string      `json:"userid"`
	Username  string      `json:"username"`
	Email     string      `json:"email"`
	Enabled   bool        `json:"enabled"`
	Description interface{} `json:"description"`
	CreatedAt string      `json:"created_at"`
	UpdatedAt string      `json:"updated_at"`
}

func toUserResponse(u *sqlc.User) userResponse {
	var desc interface{} = map[string]interface{}{}

	if u.Description.Valid {
		desc = u.Description.RawMessage
	}

	return userResponse{
		UserID:    u.Userid.String(),
		Username:  u.Username,
		Email:     u.Email,
		Enabled:   u.Enabled,
		Description: desc,
		CreatedAt: u.CreatedAt.String(),
		UpdatedAt: u.UpdatedAt.String(),
	}
}
