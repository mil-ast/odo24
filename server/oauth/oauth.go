package oauth

import (
	"bytes"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"net/url"
	"time"
)

const ClientTimeout = 5 * time.Second
const ErrAuthError = "Auth error"

type OAuthUserInfo interface {
	Auth(code string) (email string, err error)
}

type OAuthToken struct {
	TokenType    string `json:"token_type"`
	AccessToken  string `json:"access_token"`
	ExpiresIn    uint64 `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
}

type OAuthParams struct {
	TokenURL     string
	GrantType    string
	ClientID     string
	ClientSecret string
	RedirectURI  string
}

func (p OAuthParams) GetToken(code string) (OAuthToken, error) {
	token := OAuthToken{}

	params := url.Values{}
	params.Set("code", code)
	params.Set("grant_type", p.GrantType)
	params.Set("client_id", p.ClientID)
	params.Set("client_secret", p.ClientSecret)
	params.Set("redirect_uri", p.RedirectURI)

	req, err := http.NewRequest("POST", p.TokenURL, bytes.NewBufferString(params.Encode()))
	if err != nil {
		return token, err
	}

	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	client := http.Client{
		Timeout: time.Duration(ClientTimeout),
	}

	resp, err := client.Do(req)
	if err != nil {
		return token, err
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return token, err
	}

	err = json.Unmarshal(body, &token)
	if err != nil {
		return token, err
	}

	if len(token.AccessToken) == 0 {
		return token, errors.New(ErrAuthError)
	}

	return token, nil
}
