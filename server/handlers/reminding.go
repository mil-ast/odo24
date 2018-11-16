package handlers

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"sto/server/models"
	"strconv"

	"github.com/mil-ast/sessions"
)

/**
	Напоминания
**/
func Reminding(w http.ResponseWriter, r *http.Request) {
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

	profile := ses.Get("profile").(models.Profile)

	switch r.Method {
	case "GET":
		list := models.Remining_list{
			User_id: profile.User_id,
		}

		items, err := list.Get()
		if err != nil {
			panic(err)
		}

		data, err := json.Marshal(items)
		if err != nil {
			panic(err)
		}

		w.Write(data)
	case "POST":
		var buf bytes.Buffer
		buf.ReadFrom(r.Body)

		rem := models.Remining{}

		err := json.Unmarshal(buf.Bytes(), &rem)
		if err != nil {
			panic(err)
		}

		rem.User_id = profile.User_id

		err = rem.Create()
		if err != nil {
			panic(err)
		}

		data, err := json.Marshal(rem)
		if err != nil {
			panic(err)
		}

		w.WriteHeader(201)
		w.Write(data)
	case "PUT":
		var buf bytes.Buffer
		buf.ReadFrom(r.Body)

		rem := models.Remining{}

		err := json.Unmarshal(buf.Bytes(), &rem)
		if err != nil {
			panic(err)
		}

		rem.User_id = profile.User_id

		err = rem.Update()
		if err != nil {
			switch err.Error() {
			case "not found", "not the owner":
				http.Error(w, http.StatusText(404), 404)
				return
			default:
				panic(err)
			}
		}

		data, err := json.Marshal(rem)
		if err != nil {
			panic(err)
		}

		w.WriteHeader(202)
		w.Write(data)
	case "DELETE":
		get_id := r.URL.Query().Get("id")
		if get_id == "" {
			http.Error(w, http.StatusText(400), 400)
			return
		}

		id, err := strconv.ParseUint(get_id, 10, 64)
		if err != nil {
			panic(err)
		}

		rem := models.Remining{
			Id:      id,
			User_id: profile.User_id,
		}

		err = rem.Delete()
		if err != nil {
			switch err.Error() {
			case "not found":
				http.Error(w, http.StatusText(404), 404)
				return
			case "not the owner":
				http.Error(w, http.StatusText(403), 403)
				return
			default:
				panic(err)
			}
		}

		w.WriteHeader(204)
	default:
		http.Error(w, http.StatusText(405), 405)
	}
}
