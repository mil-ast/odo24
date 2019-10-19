package models

import (
	"errors"
	"odo24/server/oauth"

	"github.com/mil-ast/db"
)

type OAuthQueryParams struct {
	Code    string `form:"code" binding:"required"`
	Service string `form:"service" binding:"required"`
}

type OAuth struct {
	Type oauth.OAuthUserInfo
	Code string
}

func (a OAuth) GetUser() (Profile, error) {
	profile := Profile{
		Confirmed: true,
	}

	email, err := a.Type.Auth(a.Code)
	if err != nil {
		return profile, err
	}
	if email == "" {
		return profile, errors.New(oauth.ErrAuthError)
	}

	conn, err := db.GetConnection()
	if err != nil {
		return profile, err
	}

	sqlQuery := "select user_id,login from profiles.oauthgetprofile($1);"
	row := conn.QueryRow(sqlQuery, email)
	err = row.Scan(&profile.UserID, &profile.Login)
	if err != nil {
		return profile, err
	}

	return profile, nil
}
