import Vue from 'vue';
import Resource from 'vue-resource';

import store from './store';
import App from './components/App.vue';

window.addEventListener("load", function(event) {
    var ws = new WebSocket("ws://localhost:3000/ws");
    ws.onopen = function(event) {
        console.log("OPEN SOCKET");
    };
    ws.onclose = function(event) {
        console.log("CLOSE SOCKET");
        ws = null;
    };
    ws.onmessage = function(event) {
        store.updateLocation(JSON.parse(event.data));
        console.log("SOCKET MSG", event.data);
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
