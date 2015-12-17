import React from 'react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';

import App from './app';
import { changeLocation } from './actions';
import createStore from './store';

const store = createStore();

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);


new WebSocket("ws://localhost:3001/ws").onmessage = event => store.dispatch(changeLocation(JSON.parse(event.data)));


