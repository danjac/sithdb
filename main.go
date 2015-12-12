package main

import (
	"github.com/gorilla/mux"
	"github.com/unrolled/render"
	"net/http"
)

func main() {

	router := mux.NewRouter()

	router.PathPrefix("/static").Handler(http.StripPrefix("/static",
		http.FileServer(http.Dir("./static"))))

	render := render.New()

	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		render.HTML(w, http.StatusOK, "index", nil)
	})

	http.ListenAndServe(":3000", router)

}
