package main

import (
	"bytes"
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/unrolled/render"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"
)

var upgrader = websocket.Upgrader{}

type Sith struct {
	ID         int    `json:"id"`
	Name       string `json:"name"`
	Homeworld  World  `json:"homeworld"`
	Master     int    `json:"master"`
	Apprentice int    `json:"apprentice"`
}

type World struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

func main() {

	router := mux.NewRouter()

	router.PathPrefix("/static").Handler(http.StripPrefix("/static",
		http.FileServer(http.Dir("./static"))))

	render := render.New()

	router.HandleFunc("/sith/{id}", func(w http.ResponseWriter, r *http.Request) {

		id, err := strconv.Atoi(mux.Vars(r)["id"])
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		f, err := ioutil.ReadFile("./data/sith.json")

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		d := json.NewDecoder(bytes.NewReader(f))

		var sithLords []Sith

		if err := d.Decode(&sithLords); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		for _, sith := range sithLords {
			if sith.ID == id {
				render.JSON(w, http.StatusOK, sith)
				return
			}
		}

		http.Error(w, "No sith found for this ID", http.StatusNotFound)
	})

	router.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		// return a random world
		c, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer c.Close()

		for {
			f, err := ioutil.ReadFile("./data/worlds.json")

			if err != nil {
				log.Println(err)
				break
			}

			d := json.NewDecoder(bytes.NewReader(f))

			var worlds []World

			if err := d.Decode(&worlds); err != nil {
				log.Println(err)
				break
			}

			world := worlds[rand.Intn(len(worlds))]
			log.Println("World:", world.Name)

			if err := c.WriteJSON(world); err != nil {
				log.Println("write:", err)
				break
			}

			time.Sleep(10 * time.Second)
		}

	})

	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		render.HTML(w, http.StatusOK, "index", nil)
	})

	http.ListenAndServe(":3000", router)

}
