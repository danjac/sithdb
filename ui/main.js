import Vue from 'vue';
import Resource from 'vue-resource';

import app from './app.vue';

Vue.use(Resource);
Vue.component('app', app);

new Vue({
  el: '#app'
});
