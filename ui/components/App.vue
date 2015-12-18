<template>
    <div class="app-container">
        <div class="css-root">
            <h1 v-if="location" class="css-planet-monitor">Obi-Wan currently on {{location.name}}</h1>

            <section class="css-scrollable-list">
              <ul class="css-slots">
                <li :style="{ color: isSithHere(slot) ? 'red': '' }" v-for="slot in slots" class="css-slot" track-by="$index">
                  <h3 v-if="slot && slot.name">{{slot.name}}</h3>
                  <h6 v-if="slot && slot.homeworld">Homeworld: {{slot.homeworld.name}}</h6>
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

const SCROLL_UP = "scroll_up";
const SCROLL_DOWN = "scroll_down";

let xhrRequests = [];

function cancelRequests() {
  for (var i=0; i < xhrRequests.length; i++) {
    xhrRequests.shift().abort();
  }
}

export default {
    name: "App",
    data() {
        return {
            location: null,
            slots: [null, null, null, null, null],
            isLoading: false,
            isSithOnWorld: false,
            isFirst: true,
            isLast: true
        };
    },
    events: {
        "new-location": function(newLocation){
           this.location = newLocation;
           this.checkIfSithHomeworld();
        }
    },
    ready() {
        this.fillSlots(SCROLL_DOWN, 3616, 0);
        new WebSocket("ws://localhost:3001/ws")
            .onmessage = (event) => {
                this.$dispatch("new-location", JSON.parse(event.data));
            };
    },
    computed: {
        canScrollUp() {
          return !this.isFirst && !this.isSithOnWorld && !this.isLoading;
        },
        canScrollDown() {
          return !this.isLast && !this.isSithOnWorld && !this.isLoading;
        },
        buttonUpClass() {
            return ['css-button-up', this.canScrollUp ? '' : 'css-button-disabled']; 
        },
        buttonDownClass() {
            return ['css-button-down', this.canScrollDown ? '' : 'css-button-disabled']; 
        }
    },
    methods: {
       
        fillSlots(direction, nextId, index) {

          if (!nextId || this.isLoading) {
            return;
          }

          this.isLoading = true;

          this.$http.get("/sith/" + nextId, data => {

            this.isLoading = false;
            this.slots.splice(index, 1, data);

            if (direction === SCROLL_UP) {
              nextId = data.master;
              index -= 1;
            } else {
              nextId = data.apprentice;
              index += 1;
            }

            this.isFirst = direction === SCROLL_UP && !nextId;
            this.isLast = direction === SCROLL_DOWN && !nextId;

            this.checkIfSithHomeworld();

            if (nextId && this.slots[index] === null) {
              this.fillSlots(direction, nextId, index);
            }

          }, {
            beforeSend(req) {
              xhrRequests.push(req);
            }
          });
        },

        scrollUp () {

          if (!this.canScrollUp) {
            return;
          }

          cancelRequests();

          let newSlots = this.slots.slice(0, 3);

          const firstSlot = newSlots[0];
          const nextId = firstSlot ? firstSlot.master : 0;

          newSlots.splice(0, 0, null);
          newSlots.splice(1, 0, null);

          this.slots = newSlots.slice();
          this.fillSlots(SCROLL_UP, nextId, 1);

        },

        scrollDown() {
          if (!this.canScrollDown) {
            return;
          }

          cancelRequests();

          let newSlots = this.slots.slice(2);
          const lastSlot = newSlots[newSlots.length - 1];
          const nextId = lastSlot ? lastSlot.apprentice : 0;

          newSlots.splice(4, 0, null);
          newSlots.splice(5, 0, null);

          this.slots = newSlots.slice();
          this.fillSlots(SCROLL_DOWN, nextId, 3);
        },

        checkIfSithHomeworld() {
          this.isSithOnWorld = _.some(this.slots, slot => {
            return this.isSithHere(slot);
          });
          if (this.isSithOnWorld) {
            cancelRequests();
          }
        },
        isSithHere(slot) {
            return slot && this.location && this.location.id === slot.homeworld.id;
        }
    }

}

</script>
