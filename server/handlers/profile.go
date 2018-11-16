package handlers

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"sto/server/models"

	"github.com/mil-ast/sessions"
)

/*
	подтверждение почты
*/
func ProfileConfirmEmail(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := recover(); err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
		}
	}()

	profile := models.Profile{}

	var buf bytes.Buffer
	buf.ReadFrom(r.Body)

	err := json.Unmarshal(buf.Bytes(), &profile)
	if err != nil {
		panic(err)
	}

	err = profile.ConfirmEmail()
	if err != nil {
		switch err.Error() {
		case "login is exists":
			http.Error(w, http.StatusText(409), 409)
			return
		default:
			panic(err)
		}
	}

	w.WriteHeader(204)
}

/*
	регистрация
*/
func Profile_register(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := recover(); err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
		}
	}()

	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	profile := models.Profile{}

	var buf bytes.Buffer
	buf.ReadFrom(r.Body)

	err := json.Unmarshal(buf.Bytes(), &profile)
	if err != nil {
		panic(err)
	}

	err = profile.Register()
	if err != nil {
		panic(err)
	}

	// сразу авторизовываем
	ses := sessions.Get(w, r)
	ses.Set("auth", true)
	ses.Set("profile", profile)

	data, err := json.Marshal(profile)
	if err != nil {
		panic(err)
	}

	w.WriteHeader(201)
	w.Write(data)
}

/**
	текущий профиль пользователя
**/
func Profile(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := recover(); err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
		}
	}()

	ses := sessions.Get(w, r)

	if !ses.GetBool("auth") {
		http.Error(w, http.StatusText(403), 403)
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	switch r.Method {
	case "GET":
		data, err := json.Marshal(ses.Get("profile").(models.Profile))
		if err != nil {
			panic(err)
		}

		w.Write(data)
	case "PATCH":
		var buf bytes.Buffer
		buf.ReadFrom(r.Body)

		// дополняем данные
		var empty_profile map[string]interface{} = make(map[string]interface{})
		err := json.Unmarshal(buf.Bytes(), &empty_profile)
		if err != nil {
			panic(err)
		}

		var password string

		if empty_profile["password"] != nil {
			password = empty_profile["password"].(string)
		}

		profile := ses.Get("profile").(models.Profile)

		err = profile.Save(password)
		if err != nil {
			panic(err)
		}

		ses.Set("profile", profile)

		data, err := json.Marshal(profile)
		if err != nil {
			panic(err)
		}

		w.WriteHeader(202)
		w.Write(data)
	default:
		http.Error(w, http.StatusText(405), 405)
	}
}

/**
	авторизация
**/
func Profile_login(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := recover(); err != nil {
			log.Println("Login", err)
			http.Error(w, http.StatusText(500), 500)
		}
	}()

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	ses := sessions.Get(w, r)

	switch r.Method {
	case "POST":
		var buf bytes.Buffer
		buf.ReadFrom(r.Body)

		var profile models.Profile

		err := json.Unmarshal(buf.Bytes(), &profile)
		if err != nil {
			panic(err)
		}

		// auth
		err = profile.Auth()
		if err == nil {
			ses.Set("auth", true)
			ses.Set("profile", profile)

			data, err := json.Marshal(profile)
			if err != nil {
				panic(err)
			}

			w.Write(data)
		} else {
			ses.Set("auth", false)

			switch err.Error() {
			case "incorrect login", "user is not exists", "incorrect password":
				w.WriteHeader(403)
			default:
				panic(err)
			}
		}
	default:
		http.Error(w, http.StatusText(405), 405)
	}
}

/**
	выход из профиля
**/
func Profile_logout(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := recover(); err != nil {
			log.Println("Logout", err)
			http.Error(w, http.StatusText(500), 500)
		}
	}()

	ses := sessions.Get(w, r)

	sessions.Delete(w, r)

	var user_id uint64
	if ses.GetBool("auth") {
		user_id = ses.Get("profile").(models.Profile).User_id

		var profile models.Profile = models.Profile{User_id: user_id}
		profile.Logout()
	}

	w.WriteHeader(204)
}
