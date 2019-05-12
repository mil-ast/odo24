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

type OAuthGoogleComUserInfo struct {
	Login string `json:"login"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

type OAuthGoogleComUser struct {
	token string
}

func (g OAuthGoogleComUser) Auth(code string) (string, error) {
	token, err := g.getToken(code)
	if err != nil {
		log.Println(err)
		return "", err
	}

	email, err := g.getUser(token)
	if err != nil {
		log.Println(err)
		return "", err
	}

	return email, nil
}

func (g OAuthGoogleComUser) getToken(code string) (string, error) {
	oauth := OAuthParams{
		TokenURL:     "https://accounts.google.com/o/oauth2/token",
		GrantType:    "authorization_code",
		ClientID:     "195955516861.apps.googleusercontent.com",
		ClientSecret: "AfJ0ysuTZm-F-qWBbjkm6dPm",
		RedirectURI:  "https://odo24.ru/book/?service=google",
	}
	token, err := oauth.GetToken(code)
	return token.AccessToken, err
}

func (g OAuthGoogleComUser) getUser(token string) (string, error) {
	client := http.Client{
		Timeout: time.Duration(ClientTimeout),
	}

	resp, err := client.Get(fmt.Sprintf("https://www.googleapis.com/oauth2/v1/userinfo?access_token=%s", token))
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

	var user OAuthGoogleComUserInfo

	err = json.Unmarshal(body, &user)
	if err != nil {
		return "", err
	}

	return user.Email, nil
}
