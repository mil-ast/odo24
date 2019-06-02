package sessions

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"sto/server/config"
	"sto/server/models"
	"time"

	"bitbucket.org/mil-ast/memcached"
	"github.com/mil-ast/db"
)

const (
	SessionID          string        = "odo.s"
	SessionTimeLife    time.Duration = time.Hour * 24 * 91
	SessionMemcTimeout time.Duration = time.Hour
)

var memc *memcached.Memcached

func init() {
	cfg := config.GetInstance()
	var err error
	memc, err = memcached.NewConn(cfg.App.MemcachedAddr)
	if err != nil {
		panic(err)
	}
}

func GetSession(w http.ResponseWriter, r *http.Request) (models.Profile, error) {
	var profile models.Profile

	cookie, err := r.Cookie(SessionID)
	if err != nil {
		log.Println(err)
		return profile, err
	}

	data, err := memc.Get(cookie.Value)
	if err != nil {
		// если ошибки с Memcached, смотрим сессию в БД
		if err != nil {
			userAgent := r.Header.Get("user-agent")
			profile, err = getSessionFromDB(cookie.Value, userAgent)
			if err != nil {
				return profile, err
			}

			return profile, nil
		}

		return profile, err
	}

	err = json.Unmarshal(data, &profile)
	if err != nil {
		return profile, err
	}

	err = UpdateSession(w, r, profile)
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

	expires := time.Now().Add(SessionTimeLife)
	cookie.Expires = expires

	return memc.Set(cookie.Value, SessionMemcTimeout, data)
}

func NewSession(w http.ResponseWriter, r *http.Request, profile models.Profile) error {
	cookie, err := r.Cookie(SessionID)
	if err == nil {
		memc.Delete(cookie.Value)
	}

	sesID := createSessionID()
	expires := time.Now().Add(SessionTimeLife)
	cookie = &http.Cookie{Name: SessionID, Value: sesID, Path: "/", HttpOnly: true, Expires: expires}
	http.SetCookie(w, cookie)

	data, err := json.Marshal(profile)
	if err != nil {
		return err
	}

	err = memc.Add(cookie.Value, SessionMemcTimeout, data)
	if err != nil {
		return err
	}

	userAgent := r.Header.Get("user-agent")

	err = saveSessionToDB(cookie.Value, userAgent, profile)
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

	row := conn.QueryRow("select user_id,login,is_no_confirmed from profiles.getprofilebyuuid($1,$2)", uuid, userAgent)
	err = row.Scan(&profile.User_id, &profile.Login, &profile.IsNoConfirmed)
	return profile, err
}

func saveSessionToDB(uuid, userAgent string, profile models.Profile) error {
	conn, err := db.GetConnection()
	if err != nil {
		return err
	}

	query := fmt.Sprintf("select profiles.profileaddsession($1::bigint,$2::uuid,$3::varchar,now()::timestamp + interval '%0.f hours')", SessionTimeLife.Hours())
	_, err = conn.Exec(query, profile.User_id, uuid, userAgent)
	return err
}
