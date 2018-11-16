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
	группы
**/
func Groups(w http.ResponseWriter, r *http.Request) {
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
		list_groups := models.Groups_list{
			User_id: profile.User_id,
		}

		list, err := list_groups.Get()
		if err != nil {
			panic(err)
		}

		data, err := json.Marshal(list)
		if err != nil {
			panic(err)
		}

		w.Write(data)
	case "POST":
		var buf bytes.Buffer
		buf.ReadFrom(r.Body)

		group := models.Group{}

		err := json.Unmarshal(buf.Bytes(), &group)
		if err != nil {
			panic(err)
		}

		group.User_id = profile.User_id

		err = group.Create()
		if err != nil {
			panic(err)
		}

		data, err := json.Marshal(group)
		if err != nil {
			panic(err)
		}

		w.WriteHeader(201)
		w.Write(data)
	case "PUT":
		var buf bytes.Buffer
		buf.ReadFrom(r.Body)

		group := models.Group{}

		err := json.Unmarshal(buf.Bytes(), &group)
		if err != nil {
			panic(err)
		}

		group.User_id = profile.User_id

		err = group.Update()
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

		data, err := json.Marshal(group)
		if err != nil {
			panic(err)
		}

		w.WriteHeader(202)
		w.Write(data)
	case "DELETE":
		get_group_id := r.URL.Query().Get("group_id")
		if get_group_id == "" {
			http.Error(w, http.StatusText(400), 400)
			return
		}

		group_id, err := strconv.ParseUint(get_group_id, 10, 64)
		if err != nil {
			panic(err)
		}

		group := models.Group{
			Group_id: group_id,
			User_id:  profile.User_id,
		}

		err = group.Delete()
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
