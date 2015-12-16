package main

import (
	"bytes"
	"encoding/json"
	"flag"
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

const (
	staticURL    = "/static/"
	staticDir    = "./static/"
	devServerURL = "http://localhost:8080"
)

var upgrader = websocket.Upgrader{}

var (
	env  = flag.String("env", "prod", "environment ('prod' or 'dev')")
	port = flag.String("port", "3001", "server port")
)

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

func readJSONFromFile(filename string, data interface{}) error {
	f, err := ioutil.ReadFile(filename)
	if err != nil {
		return err
	}
	d := json.NewDecoder(bytes.NewReader(f))

	if err := d.Decode(data); err != nil {
		return err
	}

	return nil
}

func main() {

	flag.Parse()

	rand.Seed(time.Now().UTC().UnixNano())

	router := mux.NewRouter()

	router.PathPrefix(staticURL).Handler(http.StripPrefix(staticURL,
		http.FileServer(http.Dir(staticDir))))

	render := render.New()

	router.HandleFunc("/sith/{id}", func(w http.ResponseWriter, r *http.Request) {

		id, err := strconv.Atoi(mux.Vars(r)["id"])
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		var sithLords []Sith

		if err := readJSONFromFile("./data/sith.json", &sithLords); err != nil {
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

			var worlds []World

			if err := readJSONFromFile("./data/worlds.json", &worlds); err != nil {
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

		jsBaseURL := ""
		if *env == "dev" {
			jsBaseURL = devServerURL
		}
		ctx := map[string]string{
			"jsBaseURL": jsBaseURL,
			"staticURL": staticURL,
		}
		render.HTML(w, http.StatusOK, "index", ctx)
	})

	if err := http.ListenAndServe(":"+*port, router); err != nil {
		panic(err)
	}

}
