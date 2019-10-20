package sessions

import (
	"encoding/hex"
	"errors"
	"odo24/server/api/models"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	sessionID      string        = "sess"
	SessionTimeout time.Duration = time.Hour * time.Duration(2)
)

func NewSession(c *gin.Context, profile *models.Profile) error {
	if profile == nil {
		return errors.New("profile is empty")
	}

	sess := models.SessionValue{
		UserID:     profile.UserID,
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

	decodedStr, err := hex.DecodeString(cookie.Value)
	if err != nil {
		return nil, err
	}

	value, err := decrypt(decodedStr)
	if err != nil {
		return nil, err
	}

	sess := new(models.SessionValue)
	err = sess.Parse(value)
	if err != nil {
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
	c.SetCookie(sessionID, "", 0, "/", "", false, true)
}
