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

// OAuthGoogleComUserInfo ответ
type OAuthGoogleComUserInfo struct {
	Login string `json:"login"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

// OAuthGoogleComUser клиент
type OAuthGoogleComUser struct {
	params OAuthParams
}

// NewOAuthGoogleCom новый клиент
func NewOAuthGoogleCom(tokenURL, grantType, clientID, clientSecret, redirectURI string) OAuthGoogleComUser {
	params := OAuthParams{
		TokenURL:     tokenURL,
		GrantType:    grantType,
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURI:  redirectURI,
	}
	return OAuthGoogleComUser{
		params: params,
	}
}

// Auth выполнение авторизации
func (g OAuthGoogleComUser) Auth(code string) (string, error) {
	token, err := g.params.GetToken(code)
	if err != nil {
		return "", err
	}

	email, err := g.getUser(token.AccessToken)
	if err != nil {
		log.Println(err)
		return "", err
	}

	return email, nil
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
