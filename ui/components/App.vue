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
                <button :class="buttonUpClass" @click.prevent="moveUp"></button>
                <button :class="buttonDownClass" @click.prevent="moveDown"></button>
              </div>
            </section>
      </div>
    </div>
</template>

<script>
import store from '../store';

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
            isFirst: false,
            isLast: false,
            buttonUpClass: 'css-button-up css-button-disabled',
            buttonDownClass: 'css-button-down css-button-disabled'
        };
    },
    created() {
        store.on("update", this.update);
    },
    destroyed() {
        store.removeListener("update", this.update);
    },
    ready() {
        this.fillSlots("down", 3616, 0);
    },
    methods: {

        canMoveUp() {
          return !this.isFirst && !this.isSithOnWorld && !this.isLoading;
        },

        canMoveDown() {
          return !this.isLast && !this.isSithOnWorld && !this.isLoading;
        },
        
        fillSlots(direction, nextId, index) {

          if (!nextId || this.isLoading) {
            return;
          }

          this.isLoading = true;

          this.$http.get("/sith/" + nextId, data => {

            this.isLoading = false;
            this.slots.splice(index, 1, data);

            if (direction === "up") {
              nextId = data.master;
              index -= 1;
            } else {
              nextId = data.apprentice;
              index += 1;
            }

            this.isFirst = direction === "up" && !nextId;
            this.isLast = direction === "down" && !nextId;

            this.update();

            if (nextId && this.slots[index] === null) {
              this.fillSlots(direction, nextId, index);
            }

          }, {
            beforeSend(req) {
              xhrRequests.push(req);
            }
          });
        },

        moveUp () {

          if (!this.canMoveUp()) {
            return;
          }

          cancelRequests();

          let newSlots = this.slots.slice(0, 3);

          const firstSlot = newSlots[0];
          const nextId = firstSlot ? firstSlot.master : 0;

          newSlots.splice(0, 0, null);
          newSlots.splice(1, 0, null);

          this.slots = newSlots.slice();
          this.fillSlots("up", nextId, 1);

        },

        moveDown() {
          if (!this.canMoveDown()) {
            return;
          }

          cancelRequests();

          let newSlots = this.slots.slice(2);
          const lastSlot = newSlots[newSlots.length - 1];
          const nextId = lastSlot ? lastSlot.apprentice : 0;

          newSlots.splice(4, 0, null);
          newSlots.splice(5, 0, null);

          this.slots = newSlots.slice();
          this.fillSlots("down", nextId, 3);
        },

        checkIfSithHomeworld() {
          this.isSithOnWorld = _.some(this.slots, slot => {
            return this.isSithHere(slot);
          });
          if (this.isSithOnWorld) {
            cancelRequests();
          }
        },

        update(event) {

            this.location = store.getLocation();
            this.checkIfSithHomeworld();

            this.buttonUpClass = 'css-button-up';

            if (!this.canMoveUp()) {
                this.buttonUpClass += ' css-button-disabled';
            }

            this.buttonDownClass = 'css-button-down';

            if (!this.canMoveDown()) {
                this.buttonDownClass += ' css-button-disabled';
            }
        },
        isSithHere(slot) {
            return slot && this.location && this.location.id === slot.homeworld.id;
        }
    }

}

</script>
