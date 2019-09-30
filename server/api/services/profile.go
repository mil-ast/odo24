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
func Register(login string) error {
	if login == "" {
		return errors.New("login is not specified")
	}

	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	code := utils.GenerateRandomNumber(10000, 99999)
	linkKey := utils.GenerateRandomString(32)

	sqlQuery := "SELECT FROM profiles.register($1, $2, $3::varchar(32))"
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	_, err = conn.ExecContext(ctx, sqlQuery, login, code, linkKey)
	return err
}

// ConfirmCode подтверждение почты
func ConfirmCode(login string, code *uint32, linkKey *string) error {
	if login == "" {
		return errors.New("login is not specified")
	}

	if code == nil && linkKey == nil {
		return errors.New("code and linkKey is empty")
	}

	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	sqlQuery := "SELECT confirm ok FROM profiles.confirm($1, $2, $3::varchar(32))"
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	row := conn.QueryRowContext(ctx, sqlQuery, login, code, linkKey)

	var isOk bool
	err = row.Scan(&isOk)
	if err != nil {
		return err
	}

	if !isOk {
		return errors.New("incorrect")
	}
	return nil
}
