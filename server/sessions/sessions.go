package sessions

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"sto/server/config"
	"sto/server/models"
	"time"

	"bitbucket.org/mil-ast/memcached"
	"github.com/mil-ast/db"
)

const (
	SessionID          string        = "odo24.sess"
	SessionTimeLife    time.Duration = time.Hour * 8760 // 365d
	SessionMemcTimeout time.Duration = time.Hour
)

var memc *memcached.Memcached

func init() {
	cfg := config.GetInstance()
	var err error
	memc, err = memcached.NewConn(cfg.App.MemcachedAddr, SessionTimeLife)
	if err != nil {
		panic(err)
	}
}

func GetSession(w http.ResponseWriter, r *http.Request) (models.Profile, error) {
	var profile models.Profile

	cookie, err := r.Cookie(SessionID)
	if err != nil {
		return profile, err
	}

	data, err := memc.Get(cookie.Value)
	if err != nil {
		// если проблемы с Memcached, смотрим сессию в БД
		if err.Error() == "NOT_STORED" {
			userAgent := r.Header.Get("user-agent")
			profile, err = getSessionFromDB(cookie.Value, userAgent)
			if err != nil {
				return profile, err
			}
		} else {
			return profile, err
		}
	}

	expires := time.Now().Add(SessionTimeLife)
	cookie.Expires = expires
	http.SetCookie(w, cookie)

	err = json.Unmarshal(data, &profile)
	return profile, err
}

func getProfileByUUID(uuid string) (models.Profile, error) {
	var profile models.Profile
	return profile, nil
}

func UpdateSession(w http.ResponseWriter, r *http.Request, profile models.Profile) error {
	cookie, err := r.Cookie(SessionID)
	if err != nil {
		return err
	}

	if cookie.Value == "" {
		return errors.New("empty session id")
	}

	data, err := json.Marshal(profile)
	if err != nil {
		return err
	}

	return memc.Set(cookie.Value, SessionMemcTimeout, data)
}

func NewSession(w http.ResponseWriter, r *http.Request, profile models.Profile) error {
	cookie, err := r.Cookie(SessionID)
	if err != nil {
		sesID := createSessionID()
		expires := time.Now().Add(SessionTimeLife)
		cookie = &http.Cookie{Name: SessionID, Value: sesID, Path: "/", HttpOnly: true, Expires: expires}
		http.SetCookie(w, cookie)
	}

	data, err := json.Marshal(profile)
	if err != nil {
		return err
	}

	err = memc.Set(cookie.Value, SessionTimeLife, data)
	if err != nil {
		return err
	}

	return nil
}

func DelSession(w http.ResponseWriter, r *http.Request) error {
	cookie, err := r.Cookie(SessionID)
	if err != nil {
		return err
	}

	memc.Delete(cookie.Value)

	expires := time.Now().Add(time.Hour * -1)
	cookie = &http.Cookie{Name: SessionID, Value: "", HttpOnly: true, Expires: expires}
	http.SetCookie(w, cookie)

	return nil
}

func createSessionID() string {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		return ""
	}

	return fmt.Sprintf("%X-%X-%X-%X-%X", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}

func getSessionFromDB(uuid, userAgent string) (models.Profile, error) {
	var profile models.Profile

	conn, err := db.GetConnection()
	if err != nil {
		return profile, err
	}

	row := conn.QueryRow("select * from profiles.getprofilebyuuid(?,?)", uuid, userAgent)
	err = row.Scan(&profile.User_id, &profile.Login, &profile.IsNoConfirmed)
	return profile, err
}
