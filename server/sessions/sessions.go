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
	// SessionTimeout время актуальности токена
	SessionTimeout time.Duration = time.Hour * time.Duration(24*31)
)

const (
	errExpired = "expired"
)

var secretKey []byte

// SetSecretKey ключ шифрования с конфига
func SetSecretKey(key string) {
	secretKey = []byte(key)
}

// NewSession создание новой сессии
func NewSession(c *gin.Context, userID uint64) error {
	if userID == 0 {
		return errors.New("profile is empty")
	}

	sess := models.SessionValue{
		UserID:     userID,
		Expiration: uint64(time.Now().Add(SessionTimeout).UTC().Unix()),
	}

	token, err := NewToken(HS256, secretKey, sess)
	if err != nil {
		return err
	}

	c.SetCookie(sessionID, *token, int(SessionTimeout.Seconds()), "/", "", false, true)

	return nil
}

// GetSession получение и валидация сессии
func GetSession(c *gin.Context) (*models.SessionValue, error) {
	cookie, err := c.Request.Cookie(sessionID)
	if err != nil {
		return nil, err
	}

	if cookie.Value == "" {
		return nil, errors.New(errExpired)
	}

	token, err := ParseToken(cookie.Value)
	if err != nil {
		DeleteSession(c)
		return nil, errors.New(errExpired)
	}

	if !token.Verify(secretKey) {
		return nil, errors.New(errExpired)
	}

	claims := token.Claims

	now := time.Now().UTC().Unix()
	if claims.Expiration < uint64(now) {
		return nil, errors.New(errExpired)
	}

	return &claims, nil
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
