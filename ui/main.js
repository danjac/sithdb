import Vue from 'vue';
import Resource from 'vue-resource';

import store from './store';
import App from './components/App.vue';

window.addEventListener("load", function(event) {
    var ws = new WebSocket("ws://localhost:3000/ws");
    ws.onclose = function(event) {
        ws = null;
    };
    ws.onmessage = function(event) {
        store.updateLocation(JSON.parse(event.data));
    };
    ws.onerror = function(event) {
        console.log("SOCKET ERR", event.data);
    };
});

Vue.use(Resource);
Vue.component('app', App);

new Vue({
  el: '#app'
});
