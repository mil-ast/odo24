package handlers

import (
	"encoding/json"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"path/filepath"
	"time"
)

var pages map[string]map[string]interface{}
var t *template.Template

// NewHandler обработчик запросов
func NewHandler() (func(w http.ResponseWriter, r *http.Request), error) {
	files, err := ioutil.ReadDir("./templates/")
	if err != nil {
		panic(err)
	}

	pages = make(map[string]map[string]interface{})
	for _, file := range files {
		if file.IsDir() {
			continue
		}

		name := file.Name()
		extension := filepath.Ext(name)
		htmlName := name[0:len(name)-len(extension)] + ".html"

		_, ok := pages[htmlName]
		if !ok {
			pages[htmlName] = make(map[string]interface{})
		}

		switch extension {
		case ".json":
			body, err := readJSON(file.Name())
			if err != nil {
				panic(err)
			}

			pages[htmlName] = body
		}
	}

	funcMap := getCustomFunc()
	t = template.Must(template.New("main").Funcs(funcMap).ParseGlob("./templates/*"))

	return servePage, nil
}

func servePage(w http.ResponseWriter, r *http.Request) {
	page := r.URL.Path[1:]
	if page == "" {
		page = "index.html"
	}
	data, ok := pages[page]

	if ok && t.Lookup(page) != nil {
		w.WriteHeader(http.StatusOK)
		t.ExecuteTemplate(w, page, data)
		return
	}

	w.WriteHeader(http.StatusNotFound)
	w.Write([]byte(http.StatusText(http.StatusNotFound)))
}

func readJSON(fileName string) (map[string]interface{}, error) {
	body, err := ioutil.ReadFile("./templates/" + fileName)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	model := make(map[string]interface{})
	err = json.Unmarshal(body, &model)

	return model, err
}

func getCustomFunc() template.FuncMap {
	return template.FuncMap{
		"now": time.Now,
		"unescape": func(s string) template.HTML {
			return template.HTML(s)
		},
	}
}
