package models

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/mil-ast/db"
)

const (
	OAuthYandex uint8 = iota
)

type OAuth struct {
	Type  uint8
	Token string
}

type OAuthYandexUser struct {
	EMail string `json:"default_email"`
}

func (oa OAuth) GetUser() (Profile, error) {
	profile := Profile{}
	userInfo := OAuthYandexUser{}

	client := http.Client{
		Timeout: time.Duration(5 * time.Second),
	}

	resp, err := client.Get(fmt.Sprintf("https://login.yandex.ru/info?format=json&oauth_token=%s", oa.Token))
	if err != nil {
		return profile, err
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return profile, err
	}

	err = json.Unmarshal(body, &userInfo)
	if err != nil {
		return profile, err
	}

	if userInfo.EMail == "" {
		return profile, errors.New("not auth")
	}

	conn, err := db.GetConnection()
	if err != nil {
		return profile, err
	}

	sqlQuery := "select user_id,login from profiles.oauthgetprofile($1);"
	row := conn.QueryRow(sqlQuery, userInfo.EMail)
	err = row.Scan(&profile.User_id, &profile.Login)
	if userInfo.EMail == "" {
		return profile, err
	}

	return profile, nil
}
