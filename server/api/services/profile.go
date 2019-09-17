package services

import (
	"context"
	"errors"
	"odo24/server/api/models"
	"odo24/server/utils"
	"time"

	"github.com/mil-ast/db"
)

// Login авторизация
func Login(login, password string) (*models.Profile, error) {
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

	profile := new(models.Profile)

	sqlQuery := "select user_id,login,confirmed from profiles.login($1, $2::bytea);"
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	row := conn.QueryRowContext(ctx, sqlQuery, login, password)
	err = row.Scan(&profile.UserID, &profile.Login, &profile.Confirmed)
	if err != nil {
		return nil, err
	}

	if profile.UserID == 0 {
		return nil, errors.New("user is not exists")
	}

	return profile, nil
}

// Register регистрация
func Register(login, password string) (*models.Profile, error) {
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

	profile := new(models.Profile)

	code := utils.GenerateRandomNumber(10000, 99999)
	linkKey := utils.GenerateRandomString(32)

	sqlQuery := "select from profiles.register($1, $2::bytea, $3, $4::varchar(32))"
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	_, err = conn.ExecContext(ctx, sqlQuery, login, password, code, linkKey)
	if err != nil {
		return nil, err
	}

	return profile, nil
}
