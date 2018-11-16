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
		list_services := models.Services_list{
			User_id: profile.User_id,
		}

		list, err := list_services.Get()
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

		service := models.Service{}

		err := json.Unmarshal(buf.Bytes(), &service)
		if err != nil {
			panic(err)
		}

		if service.Avto_id == 0 || service.Group_id == 0 {
			http.Error(w, http.StatusText(400), 400)
			return
		}

		service.User_id = profile.User_id

		err = service.Create()
		if err != nil {
			panic(err)
		}

		data, err := json.Marshal(service)
		if err != nil {
			panic(err)
		}

		w.WriteHeader(201)
		w.Write(data)
	case "PUT":
		var buf bytes.Buffer
		buf.ReadFrom(r.Body)

		service := models.Service{}

		err := json.Unmarshal(buf.Bytes(), &service)
		if err != nil {
			panic(err)
		}

		service.User_id = profile.User_id

		err = service.Update()
		if err != nil {
			panic(err)
		}

		data, err := json.Marshal(service)
		if err != nil {
			panic(err)
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
			panic(err)
		}

		service := models.Service{
			Service_id: service_id,
			User_id:    profile.User_id,
		}

		err = service.Delete()
		if err != nil {
			panic(err)
		}

		w.WriteHeader(204)
	default:
		http.Error(w, http.StatusText(405), 405)
	}
}
