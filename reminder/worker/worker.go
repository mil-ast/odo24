package worker

import (
	"database/sql"
	"time"
)

var conn *sql.DB

func Start(db *sql.DB) {
	conn = db

	ticker := time.NewTicker(time.Hour)

	for now := range ticker.C {
		go run(now)
	}
}

func run(now time.Time) {

}
