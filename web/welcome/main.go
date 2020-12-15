package main

import (
	"log"
	"net/http"
	"odo24/web/welcome/handlers"
)

func main() {
	serverHandler, err := handlers.NewHandler()
	if err != nil {
		panic(err)
	}

	http.HandleFunc("/", serverHandler)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
