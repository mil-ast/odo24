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

type OAuthMailRuUserInfo struct {
	Gender    string `json:"gender"`
	Name      string `json:"name"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
}

type OAuthMailRuUser struct {
	token string
}

func (m OAuthMailRuUser) Auth(code string) (string, error) {
	token, err := m.getToken(code)
	if err != nil {
		log.Println(err)
		return "", err
	}

	email, err := m.getUser(token)
	if err != nil {
		log.Println(err)
		return "", err
	}

	return email, nil
}

func (m OAuthMailRuUser) getToken(code string) (string, error) {
	oauth := OAuthParams{
		TokenURL:     "https://oauth.mail.ru/token",
		GrantType:    "authorization_code",
		ClientID:     "65ff8fc8b7ea4b409f61a465790f80b1",
		ClientSecret: "f289ba761b31475380765fa7f5244108",
		RedirectURI:  "http://localhost:4200/?service=mail.ru",
	}
	token, err := oauth.GetToken(code)
	return token.AccessToken, err
}

func (m OAuthMailRuUser) getUser(token string) (string, error) {
	client := http.Client{
		Timeout: time.Duration(ClientTimeout),
	}

	resp, err := client.Get(fmt.Sprintf("https://oauth.mail.ru/userinfo?access_token=%s", token))
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

	var user OAuthMailRuUserInfo
	err = json.Unmarshal(body, &user)
	if err != nil {
		return "", err
	}

	return user.Email, nil
}
