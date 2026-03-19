package db

import (
	"database/sql"
	"log"
)

func NewDB(dbUrl string) *sql.DB {
	db, err := sql.Open("postgres", dbUrl)
	if err != nil {
		log.Fatal("Failed to connect DB: ", db)
	}

	if err := db.Ping(); err != nil {
		log.Fatal("DB not reachable", err)
	}

	return db
}