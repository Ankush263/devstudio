package dto

import (
	"database/sql"
	"time"
)

// String function change type sql.NullString into string
func String(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}
	return ""
}

func Int32(n sql.NullInt32) int32 {
	if n.Valid {
		return n.Int32
	}
	return 0
}

func Bool(nb sql.NullBool) bool {
	if nb.Valid {
		return nb.Bool
	}
	return false
}

func Time(nt sql.NullTime) string {
	if nt.Valid {
		return nt.Time.Format(time.RFC3339)
	}
	return ""
}

// ToNullString function converts string into sql.NullString
func ToNullString(s string) sql.NullString {
	if s == "" {
		return sql.NullString{
			Valid: false,
		}
	}
	return sql.NullString{
		String: s,
		Valid:  true,
	}
}

func ToInt32(i int32) sql.NullInt32 {
	if i == 0 {
		return sql.NullInt32{Valid: false}
	}
	return sql.NullInt32{
		Int32: i,
		Valid: true,
	}
}
