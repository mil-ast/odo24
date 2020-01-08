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

// OAuthYandexRuUserInfo ответ
type OAuthYandexRuUserInfo struct {
	Login        string `json:"login"`
	DefaultEmail string `json:"default_email"`
	ClientID     string `json:"client_id"`
}

// OAuthYandexRuUser клиент
type OAuthYandexRuUser struct {
	params OAuthParams
}

// NewOAuthYandexRuUser новый клиент
func NewOAuthYandexRuUser(tokenURL, grantType, clientID, clientSecret, redirectURI string) OAuthYandexRuUser {
	params := OAuthParams{
		TokenURL:     tokenURL,
		GrantType:    grantType,
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURI:  redirectURI,
	}
	return OAuthYandexRuUser{
		params: params,
	}
}

// Auth выполнение авторизации
func (y OAuthYandexRuUser) Auth(code string) (string, error) {
	token, err := y.params.GetToken(code)
	if err != nil {
		return "", err
	}

	email, err := y.getUser(token.AccessToken)
	if err != nil {
		log.Println(err)
		return "", err
	}

	return email, nil
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
