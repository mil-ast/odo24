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

	fs := http.FileServer(http.Dir("./assets"))
	http.Handle("/assets/", http.StripPrefix("/assets", fs))

	http.HandleFunc("/", serverHandler)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
