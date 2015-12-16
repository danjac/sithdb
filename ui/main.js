import React from 'react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';

import App from './app';
import { changeLocation } from './actions';
import createStore from './store';

const store = createStore();

window.addEventListener("load", function(event) {
    var ws = new WebSocket("ws://localhost:3001/ws");
    ws.onclose = function(event) {
        ws = null;
    };
    ws.onmessage = function(event) {
      const location = JSON.parse(event.data);
      store.dispatch(changeLocation(location));
    };
    ws.onerror = function(event) {
        console.log("SOCKET ERR", event.data);
    };
});

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);




