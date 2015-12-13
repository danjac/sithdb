<template>
    <div class="app-container">
        <div class="css-root">
            <h1 v-show="location" class="css-planet-monitor">Obi-Wan currently on {{location.name}}</h1>

            <section class="css-scrollable-list">
              <ul class="css-slots">
                <li :style="{ color: isSithOnWorld(slot) ? 'red': '' }" v-for="slot in slots" class="css-slot" track-by="$index">
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

export default {
    name: "App",
    data() {
        return {
            location: null,
            slots: [],
            buttonUpClass: 'css-button-up css-button-disabled',
            buttonDownClass: 'css-button-down css-button-disabled'
        };
    },
    ready() {
        store.initialize(this.$http);
    },
    created() {
        store.on("update", this.update);
    },
    destroyed() {
        store.removeListener("update", this.update);
    },
    methods: {
        update(event) {
            this.location = store.getLocation();
            this.slots = store.getSlots().slice();
            this.buttonUpClass = 'css-button-up';
            if (!store.canMoveUp()) {
                this.buttonUpClass += ' css-button-disabled';
            }
            this.buttonDownClass = 'css-button-down';
            if (!store.canMoveDown()) {
                this.buttonDownClass += ' css-button-disabled';
            }

        },
        isSithOnWorld(slot) {
            return slot && this.location && this.location.id === slot.homeworld.id;
        },
        moveUp(event) {
            store.moveUp();
        },
        moveDown(event) {
            store.moveDown();
        }
    }

}

</script>
