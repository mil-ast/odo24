package handlers

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
)

func Images(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := recover(); err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(500), 500)
		}
	}()

	/*ses := sessions.Get(w, r)
	if !ses.GetBool("auth") {
		http.Error(w, http.StatusText(403), 403)
		return
	}*/

	if r.Method != "GET" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	urlPart := strings.Split(r.URL.Path, "/")

	if len(urlPart) < 5 {
		http.Error(w, http.StatusText(404), 404)
		return
	}

	file_path := fmt.Sprintf("./fileuploads/%s/%s", urlPart[3], urlPart[4])

	data, err := ioutil.ReadFile(file_path)
	if err != nil {
		panic(err)
	}

	w.Write(data)
}
