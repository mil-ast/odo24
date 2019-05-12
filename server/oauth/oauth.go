package oauth

import (
	"bytes"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
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

	params := make(map[string]string)
	params["code"] = code
	params["grant_type"] = p.GrantType
	params["client_id"] = p.ClientID
	params["client_secret"] = p.ClientSecret
	params["redirect_uri"] = p.RedirectURI

	data, err := json.Marshal(params)
	if err != nil {
		return token, err
	}

	req, err := http.NewRequest("POST", p.TokenURL, bytes.NewBuffer(data))
	if err != nil {
		return token, err
	}

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
