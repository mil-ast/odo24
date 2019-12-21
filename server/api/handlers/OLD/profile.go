package handlers

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"sto/server/models"
	"sto/server/sessions"
)

/*
	подтверждение почты
*/
func ProfileConfirmEmail(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	var buf bytes.Buffer
	buf.ReadFrom(r.Body)

	var profile models.Profile

	err := json.Unmarshal(buf.Bytes(), &profile)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	err = profile.ConfirmEmail()
	if err != nil {
		log.Println(err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(204)
}

/*
	регистрация
*/
func Profile_register(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	profile := models.Profile{}

	var buf bytes.Buffer
	buf.ReadFrom(r.Body)

	err := json.Unmarshal(buf.Bytes(), &profile)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	err = profile.Register()
	if err != nil {
		if err.Error() == "pq: login is exists" {
			http.Error(w, http.StatusText(http.StatusConflict), http.StatusConflict)
		} else {
			log.Println(err.Error())
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		}

		return
	}

	data, err := json.Marshal(profile)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(201)
	w.Write(data)
}

/**
	текущий профиль пользователя
**/
func Profile(w http.ResponseWriter, r *http.Request) {
	profile, err := sessions.GetSession(w, r)
	if err != nil {
		http.Error(w, http.StatusText(403), 403)
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	switch r.Method {
	case "GET":
		data, err := json.Marshal(profile)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		w.Write(data)
	case "PATCH":
		var buf bytes.Buffer
		buf.ReadFrom(r.Body)

		// дополняем данные
		var empty_profile map[string]interface{} = make(map[string]interface{})
		err := json.Unmarshal(buf.Bytes(), &empty_profile)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		var password string

		if empty_profile["password"] != nil {
			password = empty_profile["password"].(string)
		}

		err = profile.Save(password)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		sessions.UpdateSession(w, r, profile)

		data, err := json.Marshal(profile)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
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
func ProfileLogin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	switch r.Method {
	case "POST":
		userAgent := r.Header.Get("user-agent")
		if userAgent == "" {
			http.Error(w, http.StatusText(http.StatusForbidden), http.StatusForbidden)
			return
		}

		var buf bytes.Buffer
		buf.ReadFrom(r.Body)
		defer r.Body.Close()

		var profile models.Profile

		err := json.Unmarshal(buf.Bytes(), &profile)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		// auth
		err = profile.Auth()
		if err == nil {
			err = sessions.NewSession(w, r, profile)
			if err != nil {
				log.Println(err)
				http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
				return
			}

			data, err := json.Marshal(profile)
			if err != nil {
				log.Println(err)
				http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
				return
			}

			w.Write(data)
		} else {
			switch err.Error() {
			case "pq: password error", "pq: user not found", "pq: incorrect password":
				w.WriteHeader(403)
			case "no password is set", "login is not specified":
				w.WriteHeader(400)
			default:
				http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
				return
			}
		}
	default:
		http.Error(w, http.StatusText(405), 405)
	}
}

/**
	выход из профиля
**/
func ProfileLogout(w http.ResponseWriter, r *http.Request) {
	/*profile, err := sessions.GetSession(w, r)
	if err != nil {
		http.Error(w, http.StatusText(403), 403)
		return
	}*/
	sessions.DelSession(w, r)

	w.WriteHeader(204)
}

/**
	восстановление пароля
**/
func ProfileRecovery(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	var buf bytes.Buffer
	buf.ReadFrom(r.Body)

	var recovery models.ProfileRecovery

	err := json.Unmarshal(buf.Bytes(), &recovery)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	err = recovery.CreateCode()
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(204)
}

/**
	подтверждение кода
**/
func ProfileRecoveryConfirmCode(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	var buf bytes.Buffer
	buf.ReadFrom(r.Body)

	var recovery models.ProfileRecovery

	err := json.Unmarshal(buf.Bytes(), &recovery)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	err = recovery.ConfirmCode()
	if err != nil {
		if err.Error() == "incorrect" {
			http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		} else {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		}

		return
	}

	w.WriteHeader(204)
}

/**
	подтверждение кода для проверки почты
**/
func ProfileConfirmCode(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	profile, err := sessions.GetSession(w, r)
	if err != nil {
		http.Error(w, http.StatusText(403), 403)
		return
	}

	var buf bytes.Buffer
	buf.ReadFrom(r.Body)

	err = json.Unmarshal(buf.Bytes(), &profile)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	err = profile.ConfirmCode()
	if err != nil {
		if err.Error() == "incorrect" {
			http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		} else {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		}

		return
	}

	profile.IsNoConfirmed = false

	sessions.UpdateSession(w, r, profile)

	w.WriteHeader(204)
}

/**
	Сброс пароля
**/
func ProfileRecoveryResetPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	var buf bytes.Buffer
	buf.ReadFrom(r.Body)

	var recovery models.ProfileRecovery

	err := json.Unmarshal(buf.Bytes(), &recovery)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	if len(recovery.Email) < 6 || len(recovery.Password) < 4 {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}

	err = recovery.ResetPassword()
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(204)
}

/**
	изменение пароля
**/
func ProfileUpdatePassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != "PUT" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	profile, err := sessions.GetSession(w, r)

	if err != nil {
		http.Error(w, http.StatusText(403), 403)
		return
	}

	var buf bytes.Buffer
	buf.ReadFrom(r.Body)

	err = json.Unmarshal(buf.Bytes(), &profile)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}

	if len(profile.Password) < 4 {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}

	err = profile.UpdatePassword()
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(204)
}