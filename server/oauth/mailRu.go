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

// OAuthMailRuUserInfo ответ
type OAuthMailRuUserInfo struct {
	Gender    string `json:"gender"`
	Name      string `json:"name"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
}

// OAuthMailRuUser клиент
type OAuthMailRuUser struct {
	params OAuthParams
}

// NewOAuthMailRuUser новый клиент
func NewOAuthMailRuUser(tokenURL, grantType, clientID, clientSecret, redirectURI string) OAuthMailRuUser {
	params := OAuthParams{
		TokenURL:     tokenURL,
		GrantType:    grantType,
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURI:  redirectURI,
	}
	return OAuthMailRuUser{
		params: params,
	}
}

// Auth выполнение авторизации
func (m OAuthMailRuUser) Auth(code string) (string, error) {
	token, err := m.params.GetToken(code)
	if err != nil {
		return "", err
	}

	email, err := m.getUser(token.AccessToken)
	if err != nil {
		log.Println(err)
		return "", err
	}

	return email, nil
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
