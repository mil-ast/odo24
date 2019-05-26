package sessions

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"sto/server/config"
	"sto/server/models"
	"time"

	"bitbucket.org/mil-ast/memcached"
)

const (
	SessionID       string        = "odo24.uuid"
	SessionTimeLife time.Duration = time.Second * 3600
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

	expires := time.Now().Add(SessionTimeLife)
	cookie, err := r.Cookie(SessionID)
	if err != nil {
		return profile, err
	}
	//log.Println(cookie.Value)

	data, err := memc.Get(cookie.Value)
	if err != nil {

		// если проблемы с Memcached, смотрим сессию в БД
		return profile, err
	}

	cookie.Expires = expires
	http.SetCookie(w, cookie)

	err = json.Unmarshal(data, &profile)
	if err != nil {
		return profile, err
	}

	return profile, nil
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

	err = memc.Set(cookie.Value, SessionTimeLife, data)
	if err != nil {
		return err
	}

	return nil
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
	b := make([]byte, 24)
	if _, err := io.ReadFull(rand.Reader, b); err != nil {
		return ""
	}
	return base64.URLEncoding.EncodeToString(b)
}
