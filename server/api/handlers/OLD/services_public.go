package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"sto/server/models"
	"strconv"
)

/**
	сервисы публичные
**/
func ServicesPublic(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := recover(); err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
		}
	}()

	if r.Method != "GET" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	query_avto_id := r.URL.Query().Get("avto_id")
	if query_avto_id == "" {
		http.Error(w, http.StatusText(404), 404)
		return
	}

	avto_id, err := strconv.ParseUint(query_avto_id, 10, 64)
	if err != nil {
		panic(err)
	}

	list_services := models.Services_list{
		Avto_id: avto_id,
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
}
