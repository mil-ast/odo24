package db

import (
	"database/sql"
	"time"

	_ "github.com/lib/pq"
)

var conn *sql.DB

// Options Параметры подключения
type Options struct {
	DriverName       string
	ConnectionString string
	СonnMaxLifetime  time.Duration
	MaxIdleConns     int
	MaxOpenConns     int
}

// CreateConnection подключение к БД
func CreateConnection(options Options) error {
	var err error
	conn, err = sql.Open(options.DriverName, options.ConnectionString)
	if err != nil {
		return err
	}

	if options.СonnMaxLifetime.Seconds() > 0 {
		conn.SetConnMaxLifetime(options.СonnMaxLifetime)
	} else {
		conn.SetConnMaxLifetime(0)
	}

	if options.MaxIdleConns > 0 {
		conn.SetMaxIdleConns(options.MaxIdleConns)
	}

	if options.MaxOpenConns > 0 {
		conn.SetMaxOpenConns(options.MaxOpenConns)
	}

	return conn.Ping()
}

// Conn получить ссылку на DB
func Conn() *sql.DB {
	return conn
}
