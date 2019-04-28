package handlers

import (
	"net/http"
)

const (
	DATE_FORMAT_MYSQL string = "2006-01-02 15:04:05"
	DATE_FORMAT       string = "2006-01-02"
)

func CheckStatusCode(w http.ResponseWriter, err error) {
	switch err.Error() {
	case "pq: bad_request":
		http.Error(w, http.StatusText(400), 400)
	case "pq: forbidden":
		http.Error(w, http.StatusText(403), 403)
	case "pq: not_found":
		http.Error(w, http.StatusText(404), 404)
	default:
		http.Error(w, http.StatusText(500), 500)
	}
}
