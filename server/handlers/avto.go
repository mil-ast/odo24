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
	авто текущего пользователя
**/
func Avto(w http.ResponseWriter, r *http.Request) {
	ses := sessions.Get(w, r)

	if !ses.GetBool("auth") {
		http.Error(w, http.StatusText(403), 403)
		return
	}

	profile := ses.Get("profile").(models.Profile)

	switch r.Method {
	case "GET":
		listAvto := models.Avto_list{
			User_id: profile.User_id,
		}

		list, err := listAvto.Get()
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

		avto := models.Avto{}

		err := json.Unmarshal(buf.Bytes(), &avto)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
		}

		avto.User_id = profile.User_id

		err = avto.Create()
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
		}

		data, err := json.Marshal(avto)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
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
		}

		odo, err := strconv.ParseUint(form_odo, 10, 32)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
		}

		avto := models.Avto{
			Avto_id: avto_id,
			Name:    form_name,
			Odo:     uint32(odo),
			User_id: profile.User_id,
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
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
		}

		data, err := json.Marshal(avto)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
		}

		w.WriteHeader(202)
		w.Write(data)
	case "DELETE":
		get_avto_id := r.URL.Query().Get("avto_id")
		if get_avto_id == "" {
			http.Error(w, http.StatusText(400), 400)
			return
		}

		avto_id, err := strconv.ParseUint(get_avto_id, 10, 64)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
		}

		avto := models.Avto{
			Avto_id: avto_id,
			User_id: profile.User_id,
		}

		err = avto.Delete()
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
		}

		w.WriteHeader(204)
	default:
		http.Error(w, http.StatusText(405), 405)
	}
}

//convert dragon.gif -resize 64x64^ -gravity center -extent 64x64  fill_crop_dragon.gif
