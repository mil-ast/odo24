package sessions

import (
	"crypto/rand"
	"errors"
	"sto/server/api/models"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	SessionSize     int           = 32
	SessionID       string        = "odo.s"
	SessionTimeLife time.Duration = time.Hour * 24 * 91
	SessionTimeout  time.Duration = time.Hour
	charts          string        = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
)

var storage Storage = NewStorage()

func NewSession(c *gin.Context, profile *models.Profile) error {
	if profile == nil {
		return errors.New("profile is empty")
	}

	// Если после логина удалить куки и снова войти, будут накапливаться storage.
	// Поэтому сперва поищем в хранилище по ID
	sesID, foundProfile := storage.GetByUserID(profile.UserID)
	if foundProfile != nil {
		c.SetCookie(SessionID, sesID, int(SessionTimeout.Seconds()), "/", "odo24.ru", true, true)
		foundProfile.LastTime = time.Now()
		return nil
	}

	sesID = createSessionID()

	err := storage.Set(sesID, profile)
	if err != nil {
		return err
	}

	c.SetCookie(SessionID, sesID, int(SessionTimeout.Seconds()), "/", "odo24.ru", true, true)

	return nil
}

func GetSession(c *gin.Context) (*models.Profile, error) {
	cookie, err := c.Request.Cookie(SessionID)
	if err != nil {
		return nil, err
	}

	profile, err := storage.Get(cookie.Value)
	if err != nil {
		return nil, err
	}

	expires := profile.LastTime.Add(SessionTimeout)
	cookie.Expires = expires

	return profile, nil
}

func DeleteSession(c *gin.Context) {
	cookie, err := c.Request.Cookie(SessionID)
	if err != nil {
		return
	}

	sesID := cookie.Value

	c.SetCookie(SessionID, "", 0, "/", "odo24.ru", true, true)
	storage.Delete(sesID)
}

func getProfileByUUID(uuid string) (models.Profile, error) {
	var profile models.Profile
	return profile, nil
}

func createSessionID() string {
	output := make([]byte, SessionSize)
	randomness := make([]byte, SessionSize)
	_, err := rand.Read(randomness)
	if err != nil {
		return ""
	}
	l := len(charts)
	for pos := range output {
		random := uint8(randomness[pos])
		randomPos := random % uint8(l)
		output[pos] = charts[randomPos]
	}
	return string(output)
}

/*func saveSessionToDB(uuid, userAgent string, profile models.Profile) error {
	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	query := fmt.Sprintf("select profiles.profileaddsession($1::bigint,$2::uuid,$3::varchar,now()::timestamp + interval '%0.f hours')", SessionTimeLife.Hours())
	_, err = conn.Exec(query, profile.User_id, uuid, userAgent)
	return err
}*/

/*func deleteSessionFromoDB(uuid string) error {
	conn, err := db.GetConnection()
	if err != nil {
		return err
	}
	_, err = conn.Exec("select profiles.profiledelsession($1::uuid)", uuid)
	return err
}
*/
