import { EventEmitter } from 'events';

const store = new EventEmitter();

let location = null;
let slots = [null, null, null, null, null];
let client = null;

function fetchSithLord(id, index) {
  client.get("/sith/" + id, function(data) {
    slots[index] = data;
    store.emit("update");
  });
}

store.getLocation = () => {
  return location;
};

store.getSlots = () => {
  return slots;
};

store.initialize = (httpClient) => {
  client = httpClient;
  fetchSithLord(3616, 0);
};

store.updateLocation = (newLocation) => {
  location = newLocation;
  store.emit("update");
};

export default store;

