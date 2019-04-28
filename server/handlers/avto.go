package handlers

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"sto/server/models"
	"sto/server/sessions"
	"strconv"
)

/**
	авто текущего пользователя
**/
func Avto(w http.ResponseWriter, r *http.Request) {
	profile, err := sessions.GetSession(w, r)
	if err != nil {
		http.Error(w, http.StatusText(403), 403)
		return
	}

	switch r.Method {
	case "GET":
		listAvto := models.AvtoList{
			UserID: profile.User_id,
		}

		list, err := listAvto.Get()
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

		avto := models.Avto{}

		err := json.Unmarshal(buf.Bytes(), &avto)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
			return
		}

		avto.UserID = profile.User_id

		err = avto.Create()
		if err != nil {
			CheckStatusCode(w, err)
			return
		}

		data, err := json.Marshal(avto)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
			return
		}

		w.WriteHeader(201)
		w.Write(data)
	case "PUT":
		r.ParseForm()
		r.ParseMultipartForm(32 << 20)

		var (
			form_name    string = r.FormValue("name")
			form_odo     string = r.FormValue("odo")
			form_avto_id string = r.FormValue("avto_id")
		)

		avto_id, err := strconv.ParseUint(form_avto_id, 10, 64)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
			return
		}

		odo, err := strconv.ParseUint(form_odo, 10, 32)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
		}

		avto := models.Avto{
			AvtoID: avto_id,
			Name:   form_name,
			Odo:    uint32(odo),
			UserID: profile.User_id,
		}

		file, handler, err := r.FormFile("file")
		if err == nil {
			defer file.Close()

			err = avto.FileUpload(file, handler)
			if err != nil {
				log.Println(err)
				http.Error(w, http.StatusText(500), 500)
			}

			avto.Avatar = true
		}

		err = avto.Update()
		if err != nil {
			CheckStatusCode(w, err)
			return
		}

		data, err := json.Marshal(avto)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
			return
		}

		w.WriteHeader(202)
		w.Write(data)
	case "DELETE":
		getAvtoID := r.URL.Query().Get("avto_id")
		if getAvtoID == "" {
			http.Error(w, http.StatusText(400), 400)
			return
		}

		avtoID, err := strconv.ParseUint(getAvtoID, 10, 64)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
			return
		}

		avto := models.Avto{
			AvtoID: avtoID,
			UserID: profile.User_id,
		}

		err = avto.Delete()
		if err != nil {
			CheckStatusCode(w, err)
			return
		}

		w.WriteHeader(204)
	default:
		http.Error(w, http.StatusText(405), 405)
	}
}
