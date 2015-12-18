<template>
    <div class="app-container">
        <div class="css-root">
            <h1 v-show="!isEmpty(planet)" class="css-planet-monitor">Obi-Wan currently on {{planet.name}}</h1>

            <section class="css-scrollable-list">
              <ul class="css-slots">
                <li :style="{ color: isSithHere(slot) ? 'red': '' }" v-for="slot in slots" class="css-slot" track-by="$index">
                  <h3 v-show="slot.name">{{slot.name}}</h3>
                  <h6 v-show="slot.homeworld.id">Homeworld: {{slot.homeworld.name}}</h6>
                </li>
              </ul>

              <div class="css-scroll-buttons">
                <button :class="buttonUpClass" @click.prevent="scrollUp"></button>
                <button :class="buttonDownClass" @click.prevent="scrollDown"></button>
              </div>
            </section>
      </div>
    </div>
</template>

<script>

import _ from 'lodash';

const SCROLL_UP = "scroll-up";
const SCROLL_DOWN = "scroll-down";
const PLANET_CHANGED = "planet-changed";
const EMPTY = "empty";
const PENDING = "pending";
const LOADED = "loaded";

const NUM_SLOTS = 5;
const FIRST_SITH_ID = 3616; // Palpatine!
const EMPTY_PLANET = { id: null, name: null };
const EMPTY_SLOT = { id: null, name: null, homeworld: EMPTY_PLANET, req: null, state: EMPTY };


export default {
    name: "App",
    data() {
        return {
            planet: EMPTY_PLANET,
            slots: _.fill(Array(NUM_SLOTS), EMPTY_SLOT),
            isLoading: false,
            isSithHomeworld: false,
            isFirst: true,
            isLast: true
        };
    },
    events: {
        [PLANET_CHANGED]: function(planet){
           this.planet = planet;
           this.checkIfSithHomeworld();
        }
    },
    ready() {
        // open websocket to get current planet
        new WebSocket(`ws://${window.location.host}/ws`)
            .onmessage = (event) => {
                this.$dispatch(PLANET_CHANGED, JSON.parse(event.data));
            };
        // start filling up slots
        this.fillSlots(SCROLL_DOWN, FIRST_SITH_ID, 0, 3);
    },
    computed: {
        canScrollUp() {
          return !this.isFirst && !this.isSithHomeworld && !this.isLoading;
        },
        canScrollDown() {
          return !this.isLast && !this.isSithHomeworld && !this.isLoading;
        },
        buttonUpClass() {
          return ['css-button-up', this.canScrollUp ? '' : 'css-button-disabled']; 
        },
        buttonDownClass() {
          return ['css-button-down', this.canScrollDown ? '' : 'css-button-disabled']; 
        }
    },
    methods: {
       
        isEmpty(obj)  {
            return _.get(obj, "id", null) === null;
        },
        
        fillSlots(direction, id, index, steps=2) {

          if (!id || this.isLoading) {
            return;
          }

          this.isLoading = true;

          this.$http.get("/sith/" + id, sith => {

            this.isLoading = false;
            this.slots.splice(index, 1, Object.assign({}, sith, { state: LOADED, req: null }));

            let nextId;

            if (direction === SCROLL_UP) {
              nextId = sith.master;
              index -= 1;
            } else {
              nextId = sith.apprentice;
              index += 1;
            }

            this.isFirst = direction === SCROLL_UP && !nextId;
            this.isLast = direction === SCROLL_DOWN && !nextId;

            this.checkIfSithHomeworld();

            steps --;

            if (nextId && this.isEmpty(this.slots[index]) && steps) {
              this.fillSlots(direction, nextId, index, steps);
            }

          }, {
            beforeSend(req) {
              this.slots.splice(index, 1, Object.assign({}, EMPTY_SLOT, { id, req, state: PENDING }));
            }
          });
        },

        scrollUp () {

          if (!this.canScrollUp) {
            return;
          }

          for (var i=0; i < 2; i++)  {
              const slot = this.slots[i];
              if (slot && slot.req) slot.req.abort();
          }

          let newSlots = this.slots.slice(0, 3);

          const firstSlot = newSlots[0];
          const nextId = firstSlot ? firstSlot.master : 0;

          newSlots.splice(0, 0, EMPTY_SLOT);
          newSlots.splice(1, 0, EMPTY_SLOT);

          this.slots = newSlots.slice();
          this.fillSlots(SCROLL_UP, nextId, 1);

        },

        scrollDown() {
          if (!this.canScrollDown) {
            return;
          }

          for (var i=4; i < NUM_SLOTS; i++)  {
              const slot = this.slots[i];
              if (slot && slot.req) slot.req.abort();
          }

          let newSlots = this.slots.slice(2);
          const lastSlot = newSlots[newSlots.length - 1];
          const nextId = lastSlot ? lastSlot.apprentice : 0;

          newSlots.splice(4, 0, EMPTY_SLOT);
          newSlots.splice(5, 0, EMPTY_SLOT);

          this.slots = newSlots.slice();
          this.fillSlots(SCROLL_DOWN, nextId, 3);
        },

        checkIfSithHomeworld() {
          // check if sith lives here, if so then cancel any ongoing requests.
          this.isSithHomeworld = _.some(this.slots, slot => {
            return this.isSithHere(slot);
          });
          if (this.isSithHomeworld) {
            this.slots.forEach(slot => {
                if(slot.req) slot.req.abort();
            });
          }
        },
        isSithHere(slot) {
            return !this.isEmpty(slot) && this.planet.id === slot.homeworld.id;
        }
    }

}

</script>
