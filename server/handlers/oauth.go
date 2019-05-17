package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"sto/server/models"
	"sto/server/oauth"
	"sto/server/sessions"
)

func OAuth(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	codeQuery := r.URL.Query().Get("code")
	if codeQuery == "" {
		http.Error(w, http.StatusText(400), 400)
		return
	}
	serviceQuery := r.URL.Query().Get("service")
	if serviceQuery == "" {
		http.Error(w, http.StatusText(400), 400)
		return
	}

	var serviceType oauth.OAuthUserInfo
	switch serviceQuery {
	case "yandex.ru":
		serviceType = oauth.OAuthYandexRuUser{}
	case "mail.ru":
		serviceType = oauth.OAuthMailRuUser{}
	case "google":
		serviceType = oauth.OAuthGoogleComUser{}
	default:
		http.Error(w, http.StatusText(400), 400)
		return
	}

	token := models.OAuth{
		Type: serviceType,
		Code: codeQuery,
	}

	profile, err := token.GetUser()
	if err != nil {
		if err.Error() == oauth.ErrAuthError {
			http.Error(w, http.StatusText(401), 401)
		} else {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
		}

		return
	}

	err = sessions.NewSession(w, r, profile)
	if err != nil {
		log.Println(err)
		http.Error(w, http.StatusText(500), 500)
		return
	}

	data, err := json.Marshal(profile)
	if err != nil {
		log.Println(err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	w.Write(data)
}
