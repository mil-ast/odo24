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
		listGroups := models.Groups_list{
			User_id: profile.User_id,
		}

		list, err := listGroups.Get()
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
		}

		data, err := json.Marshal(list)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
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
		}

		group.User_id = profile.User_id

		err = group.Create()
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
		}

		data, err := json.Marshal(group)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
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
				log.Println(err)
				http.Error(w, http.StatusText(500), 500)
			}
		}

		data, err := json.Marshal(group)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
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
				log.Println(err)
				http.Error(w, http.StatusText(500), 500)
			}
		}

		w.WriteHeader(204)
	default:
		http.Error(w, http.StatusText(405), 405)
	}
}

/*статистика: группы и количество записей в них*/
func GroupsStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	ses := sessions.Get(w, r)

	if !ses.GetBool("auth") {
		http.Error(w, http.StatusText(403), 403)
		return
	}

	profile := ses.Get("profile").(models.Profile)

	queryAvtoID := r.URL.Query().Get("avto_id")
	if queryAvtoID == "" {
		http.Error(w, http.StatusText(400), 400)
		return
	}

	avtoId, err := strconv.ParseUint(queryAvtoID, 10, 64)
	if err != nil {
		http.Error(w, http.StatusText(400), 400)
		return
	}

	groupList := models.Groups_list{
		User_id: profile.User_id,
		Avto_id: avtoId,
	}
	list, err := groupList.GetStats()
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}

	data, err := json.Marshal(list)
	if err != nil {
		log.Println(err)
		http.Error(w, http.StatusText(500), 500)
		return
	}

	w.Write(data)
}
