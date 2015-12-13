<template>
    <div class="app-container">
        <div class="css-root">
            <h1 v-if="location" class="css-planet-monitor">Obi-Wan currently on {{location.name}}</h1>

            <section class="css-scrollable-list">
              <ul class="css-slots">
                <li v-for="slot in slots" class="css-slot" track-by="$index">
                  <h3 v-if="slot && slot.name">{{slot.name}}</h3>
                  <h6 v-if="slot && slot.homeworld">Homeworld: {{slot.homeworld.name}}</h6>
                </li>
              </ul>

              <div class="css-scroll-buttons">
                <button class="css-button-up"></button>
                <button class="css-button-down"></button>
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
            slots: []
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
            this.slots = store.getSlots();
        }
    }

}

</script>
