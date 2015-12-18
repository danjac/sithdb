import Vue from 'vue';
import Resource from 'vue-resource';

import App from './App.vue';

Vue.use(Resource);
Vue.component('app', App);

new Vue({
  el: '#app'
});
