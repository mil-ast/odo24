package sessions

import (
	"errors"
	"net/http"
	"odo24/server/api/models"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	sessionID string = "Authorization"
	// CookieTimeout время актуальности Access токена и cookie
	CookieTimeout time.Duration = time.Minute * 30
	// RTTimeout время жизни Refresh токена
	RTTimeout time.Duration = time.Hour * time.Duration(24*360)
)

const (
	errExpired = "expired"
)

type TokenInfo struct {
	Jwt           string    `json:"jwt"`
	RT            string    `json:"rt"`
	RtExpiration  time.Time `json:"rt_exp"`
	JwtExpiration time.Time `json:"jwt_exp"`
}

var secretKey []byte

// SetSecretKey ключ шифрования с конфига
func SetSecretKey(key string) {
	secretKey = []byte(key)
}

// NewSession создание новой сессии
func NewSession(c *gin.Context, userID uint64) (*TokenInfo, error) {
	if userID == 0 {
		return nil, errors.New("profile is empty")
	}

	tokenInfo, err := NewToken(HS256, secretKey, userID)
	if err != nil {
		return nil, err
	}

	c.SetCookie(sessionID, tokenInfo.Jwt, int(RTTimeout.Seconds()), "/", "", false, true)

	return tokenInfo, nil
}

// GetSession получение и валидация сессии
func GetSession(c *gin.Context) (*models.SessionValue, error) {
	token, err := GetToken(c)
	if err != nil {
		DeleteSession(c)
		return nil, err
	}

	if !token.Verify(secretKey) {
		DeleteSession(c)
		return nil, errors.New(errExpired)
	}

	claims := token.Claims

	now := time.Now().UTC().Unix()
	if claims.Expiration < uint64(now) {
		DeleteSession(c)
		return nil, errors.New(errExpired)
	}

	return &claims, nil
}

// GetToken получить токен без валидации
func GetToken(c *gin.Context) (*Token, error) {
	cookie, err := c.Request.Cookie(sessionID)
	if err != nil {
		return nil, err
	}

	if cookie.Value == "" {
		return nil, errors.New(errExpired)
	}

	return ParseToken(cookie.Value)
}

// DeleteSession удаление сессии
func DeleteSession(c *gin.Context) {
	cookie := &http.Cookie{
		Name:     sessionID,
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
	}

	http.SetCookie(c.Writer, cookie)
}

// VerifyToken проверка токена
func VerifyToken(token *Token) bool {
	return token.Verify(secretKey)
}
