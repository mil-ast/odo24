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
	ses := sessions.Get(w, r)

	if !ses.GetBool("auth") {
		http.Error(w, http.StatusText(403), 403)
		return
	}

	profile := ses.Get("profile").(models.Profile)

	switch r.Method {
	case "GET":
		avtoIDQuery := r.URL.Query().Get("avto_id")
		var avtoID uint64
		var err error
		if avtoIDQuery != "" {
			avtoID, err = strconv.ParseUint(avtoIDQuery, 10, 64)
			if err != nil {
				http.Error(w, http.StatusText(400), 400)
				return
			}
		}

		listGroups := models.Groups_list{
			User_id: profile.User_id,
			Avto_id: avtoID,
		}

		list, err := listGroups.Get()
		if err != nil {
			CheckStatusCode(w, err)
			return
		}

		data, err := json.Marshal(list)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
			return
		}

		w.Write(data)
	case "POST":
		var buf bytes.Buffer
		buf.ReadFrom(r.Body)

		group := models.Group{}

		err := json.Unmarshal(buf.Bytes(), &group)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
			return
		}

		group.User_id = profile.User_id

		err = group.Create()
		if err != nil {
			CheckStatusCode(w, err)
			return
		}

		data, err := json.Marshal(group)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
			return
		}

		w.WriteHeader(201)
		w.Write(data)
	case "PUT":
		var buf bytes.Buffer
		buf.ReadFrom(r.Body)

		group := models.Group{}

		err := json.Unmarshal(buf.Bytes(), &group)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
			return
		}

		group.User_id = profile.User_id

		err = group.Update()
		if err != nil {
			CheckStatusCode(w, err)
			return
		}

		data, err := json.Marshal(group)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
			return
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
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
			return
		}

		group := models.Group{
			Group_id: group_id,
			User_id:  profile.User_id,
		}

		err = group.Delete()
		if err != nil {
			CheckStatusCode(w, err)
			return
		}

		w.WriteHeader(204)
	default:
		http.Error(w, http.StatusText(405), 405)
	}
}
