package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"sto/server/models"
	"strconv"
)

/**
	авто текущего пользователя
**/
func AvtoPublic(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := recover(); err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
		}
	}()

	query_id := r.URL.Query().Get("id")
	if query_id == "" {
		http.Error(w, http.StatusText(400), 400)
	}

	id, err := strconv.ParseUint(query_id, 10, 64)
	if err != nil {
		panic(err)
	}

	avto := models.Avto{
		AvtoID: id,
	}

	err = avto.GetPublic()
	if err != nil {
		if err.Error() == "hidden" {
			http.Error(w, http.StatusText(403), 403)
		} else {
			panic(err)
		}
	}

	data, err := json.Marshal(avto)
	if err != nil {
		panic(err)
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	w.Write(data)
}
