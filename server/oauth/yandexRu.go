package oauth

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"
)

type OAuthYandexRuUserInfo struct {
	Login        string `json:"login"`
	DefaultEmail string `json:"default_email"`
	ClientID     string `json:"client_id"`
}

type OAuthYandexRuUser struct {
	token string
}

func (y OAuthYandexRuUser) Auth(code string) (string, error) {
	token, err := y.getToken(code)
	if err != nil {
		log.Println(err)
		return "", err
	}

	email, err := y.getUser(token)
	if err != nil {
		log.Println(err)
		return "", err
	}

	return email, nil
}

func (y OAuthYandexRuUser) getToken(code string) (string, error) {
	oauth := OAuthParams{
		TokenURL:     "https://oauth.yandex.ru/token",
		GrantType:    "authorization_code",
		ClientID:     "591440f4698d49158536afd3e276b829",
		ClientSecret: "9fca96127b324a68a1edcf16de351080",
		RedirectURI:  "https://odo24.ru/book/?service=yandex.ru",
	}
	token, err := oauth.GetToken(code)
	return token.AccessToken, err
}

func (y OAuthYandexRuUser) getUser(token string) (string, error) {
	client := http.Client{
		Timeout: time.Duration(ClientTimeout),
	}

	resp, err := client.Get(fmt.Sprintf("https://login.yandex.ru/info?format=json&oauth_token=%s", token))
	if err != nil {
		return "", err
	}

	if resp.StatusCode == http.StatusUnauthorized {
		return "", errors.New(ErrAuthError)
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var user OAuthYandexRuUserInfo

	err = json.Unmarshal(body, &user)
	if err != nil {
		return "", err
	}

	return user.DefaultEmail, nil
}
