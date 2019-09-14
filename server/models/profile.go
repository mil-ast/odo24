package models

import (
	"context"
	"errors"
	"time"

	"github.com/mil-ast/db"
)

type LoginFromBody struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

type Profile struct {
	UserID    uint64    `json:"user_id"`
	Login     string    `json:"login"`
	Confirmed bool      `json:"confirmed,omitempty"`
	LastTime  time.Time `json:"-"`
}

// Login авторизация
func Login(login, password string) (*Profile, error) {
	if password == "" {
		return nil, errors.New("no password is set")
	}
	if login == "" {
		return nil, errors.New("login is not specified")
	}

	conn, err := db.GetConnection()
	if err != nil {
		return nil, err
	}

	profile := new(Profile)

	sqlQuery := "select user_id,login,confirmed from profiles.login($1, $2::bytea);"
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	row := conn.QueryRowContext(ctx, sqlQuery, login, password)
	err = row.Scan(&profile.UserID, &profile.Login, &profile.Confirmed)
	if err != nil {
		switch err.Error() {
		case "user not found", "password error":
			return nil, errors.New("incorrect login/password")
		default:
			return nil, err
		}
	}

	if profile.UserID == 0 {
		return nil, errors.New("user is not exists")
	}

	return profile, nil
}

