package db

import (
	"os"

	"github.com/jmoiron/sqlx"
	_ "github.com/joho/godotenv/autoload"
)


	var (
		Host = os.Getenv("DB_HOST")
		Port = os.Getenv("DB_PORT")
		User = os.Getenv("DB_USERNAME")
		Password = os.Getenv("DB_PASSWORD")
		Dbname = os.Getenv("DB_NAME")
		Conn *sqlx.DB
	)
