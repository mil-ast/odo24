package sessions

import (
	"encoding/hex"
	"errors"
	"odo24/server/api/models"
	"time"
	"net/http"

	"github.com/gin-gonic/gin"
)

const (
	sessionID      string        = "sess"
	SessionTimeout time.Duration = time.Hour * time.Duration(24)
)

func NewSession(c *gin.Context, userID uint64) error {
	if userID == 0 {
		return errors.New("profile is empty")
	}

	sess := models.SessionValue{
		UserID:     userID,
		Expiration: uint64(time.Now().Add(SessionTimeout).UTC().Unix()),
	}

	sessionValue, err := encrypt(sess.Bytes())
	if err != nil {
		return err
	}

	c.SetCookie(sessionID, hex.EncodeToString(sessionValue), int(SessionTimeout.Seconds()), "/", "", false, true)

	return nil
}

func GetSession(c *gin.Context) (*models.SessionValue, error) {
	cookie, err := c.Request.Cookie(sessionID)
	if err != nil {
		return nil, err
	}

	if cookie.Value == "" {
		return nil, errors.New("expired")
	}

	decodedStr, err := hex.DecodeString(cookie.Value)
	if err != nil {
		DeleteSession(c)
		return nil, err
	}

	value, err := decrypt(decodedStr)
	if err != nil {
		DeleteSession(c)
		return nil, errors.New("expired")
	}

	sess := new(models.SessionValue)
	err = sess.Parse(value)
	if err != nil {
		DeleteSession(c)
		return nil, err
	}

	now := time.Now().UTC().Unix()
	if sess.Expiration < uint64(now) {
		return nil, errors.New("expired")
	}

	return sess, nil
}

// DeleteSession удаление сессии
func DeleteSession(c *gin.Context) {
	cookie := &http.Cookie{
			Name:     sessionID,
			Value:    "",
			Path:     "/",
			Expires: time.Unix(0, 0),
			HttpOnly: true,
	}

	http.SetCookie(c.Writer, cookie)
	// c.SetCookie(sessionID, "", 0, "/", "", false, true)
}
