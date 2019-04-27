package handlers

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"sto/server/models"
	"time"

	"bitbucket.org/mil-ast/memcached"
)

const (
	DATE_FORMAT_MYSQL string        = "2006-01-02 15:04:05"
	DATE_FORMAT       string        = "2006-01-02"
	SessionID         string        = "go.sid"
	SessionTimeLife   time.Duration = time.Second * 3600
)

var memc *memcached.Memcached

func init() {
	var err error
	memc, err = memcached.NewConn("81.177.26.40:11211", SessionTimeLife)
	if err != nil {
		panic(err)
	}
}

func CheckStatusCode(w http.ResponseWriter, err error) {
	switch err.Error() {
	case "pq: bad_request":
		http.Error(w, http.StatusText(400), 400)
	case "pq: forbidden":
		http.Error(w, http.StatusText(403), 403)
	case "pq: not_found":
		http.Error(w, http.StatusText(404), 404)
	default:
		http.Error(w, http.StatusText(500), 500)
	}
}

func getSession(w http.ResponseWriter, r *http.Request) (models.Profile, error) {
	var profile models.Profile
	cookie, err := r.Cookie(SessionID)
	if err != nil {
		sesID := createSessionID()

		cookie = &http.Cookie{Name: SessionID, Value: sesID, Path: "/", HttpOnly: true, MaxAge: int(SessionTimeLife.Seconds())}
		http.SetCookie(w, cookie)

		return profile, errors.New("not found")
	}

	data, err := memc.Get(cookie.Value)
	if err != nil {
		return profile, err
	}

	err = json.Unmarshal(data, profile)
	if err != nil {
		return profile, err
	}

	return profile, nil
}

func newSession(w http.ResponseWriter, r *http.Request, profile models.Profile) error {
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

func createSessionID() string {
	b := make([]byte, 24)
	if _, err := io.ReadFull(rand.Reader, b); err != nil {
		return ""
	}
	return base64.URLEncoding.EncodeToString(b)
}
