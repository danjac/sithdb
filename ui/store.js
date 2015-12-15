import _ from 'lodash';
import { EventEmitter } from 'events';

const store = new EventEmitter();

let location = null;

store.getLocation = () => {
  return location;
}

store.updateLocation = (newLocation) => {
  location = newLocation;
  store.emit("update");
};

export default store;

