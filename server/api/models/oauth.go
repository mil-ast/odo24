package models

import (
	"errors"
	"odo24/server/oauth"
	"odo24/server/utils"

	"odo24/server/db"
)

type OAuthQueryParams struct {
	Code    string `form:"code" binding:"required"`
	Service string `form:"service" binding:"required"`
}

// OAuth аторизация/регистрация через сторонние сервисы
type OAuth struct {
	Type oauth.OAuthUserInfo
	Code string
}

// GetUser получение пользователя через сторонние сервисы
func (a OAuth) GetUser() (Profile, *Password, error) {
	profile := Profile{
		Confirmed: true,
	}

	email, err := a.Type.Auth(a.Code)
	if err != nil {
		return profile, nil, err
	}
	if email == "" {
		return profile, nil, errors.New(oauth.ErrAuthError)
	}

	conn := db.Conn()

	newPassword := utils.GenerateRandomString(8)

	var isNew bool
	var resultPassword *Password

	sqlQuery := "select user_id,login,is_new from profiles.oauth_getprofile($1,$2);"
	row := conn.QueryRow(sqlQuery, email, newPassword)
	err = row.Scan(&profile.UserID, &profile.Login, &isNew)
	if err != nil {
		return profile, resultPassword, err
	}

	if isNew {
		pwd := Password(newPassword)
		resultPassword = &pwd
	}

	return profile, resultPassword, nil
}
