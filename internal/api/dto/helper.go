package dto

import (
	"database/sql"
	"time"
)

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
