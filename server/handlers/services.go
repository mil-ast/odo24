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
	сервисы
**/
func Services(w http.ResponseWriter, r *http.Request) {
	ses := sessions.Get(w, r)

	if !ses.GetBool("auth") {
		http.Error(w, http.StatusText(403), 403)
		return
	}

	profile := ses.Get("profile").(models.Profile)

	switch r.Method {
	case "GET":
		getAvtoId := r.URL.Query().Get("avto_id")
		if getAvtoId == "" {
			http.Error(w, http.StatusText(400), 400)
			return
		}

		getGroupId := r.URL.Query().Get("group_id")
		if getGroupId == "" {
			http.Error(w, http.StatusText(400), 400)
			return
		}

		avtoID, err := strconv.ParseUint(getAvtoId, 10, 64)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
		}

		groupID, err := strconv.ParseUint(getGroupId, 10, 64)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
		}

		listServices := models.Services_list{
			Avto_id:  avtoID,
			Group_id: groupID,
			User_id:  profile.User_id,
		}

		list, err := listServices.Get()
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

		service := models.Service{}

		err := json.Unmarshal(buf.Bytes(), &service)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
			return
		}

		if service.Avto_id == 0 || service.Group_id == 0 {
			http.Error(w, http.StatusText(400), 400)
			return
		}

		service.User_id = profile.User_id

		err = service.Create()
		if err != nil {
			CheckStatusCode(w, err)
			return
		}

		data, err := json.Marshal(service)
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

		service := models.Service{}

		err := json.Unmarshal(buf.Bytes(), &service)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
			return
		}

		service.User_id = profile.User_id

		err = service.Update()
		if err != nil {
			CheckStatusCode(w, err)
			return
		}

		data, err := json.Marshal(service)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
			return
		}

		w.WriteHeader(202)
		w.Write(data)
	case "DELETE":
		get_service_id := r.URL.Query().Get("service_id")
		if get_service_id == "" {
			http.Error(w, http.StatusText(404), 404)
			return
		}

		service_id, err := strconv.ParseUint(get_service_id, 10, 64)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
			return
		}

		service := models.Service{
			Service_id: service_id,
			User_id:    profile.User_id,
		}

		err = service.Delete()
		if err != nil {
			CheckStatusCode(w, err)
			return
		}

		w.WriteHeader(204)
	default:
		http.Error(w, http.StatusText(405), 405)
	}
}
