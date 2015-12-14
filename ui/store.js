import _ from 'lodash';
import { EventEmitter } from 'events';

const store = new EventEmitter();

let client = null;

let location = null;
let slots = [null, null, null, null, null];

let xhrRequests = [];

let isLoading = false;
let isSithOnWorld = false;
let isFirst = false;
let isLast = false;

function cancelRequests() {
  for (var i=0; i < xhrRequests.length; i++) {
    xhrRequests.shift().abort();
  }
}

function checkIfSithHomeworld() {
  isSithOnWorld = _.some(slots, slot => {
    return slot && location && slot.homeworld.id === location.id;
  });
  if (isSithOnWorld) {
    cancelRequests();
  }

}

function fillSlots(direction, nextId, index) {

  if (!nextId || isLoading) {
    return;
  }

  isLoading = true;

  client.get("/sith/" + nextId, data => {

    isLoading = false;

    slots[index] = data;

    if (direction === "up") {
      nextId = data.master;
      index -= 1;
    } else {
      nextId = data.apprentice;
      index += 1;
    }

    isFirst = direction == "up" && !nextId;
    isLast = direction == "down" && !nextId;

    checkIfSithHomeworld();

    store.emit("update");

    if (nextId && slots[index] === null) {
      fillSlots(direction, nextId, index);
    } else {
      isLoading = false;
    }

  }, {
    beforeSend(req) {
      xhrRequests.push(req);
    }
  });
}


store.canMoveUp = () => {
  return !isFirst && !isSithOnWorld && !isLoading;
};

store.canMoveDown = () => {
  return !isLast && !isSithOnWorld && !isLoading;
};

store.getLocation = () => {
  return location;
};

store.getSlots = () => {
  return slots;
};


store.moveUp = () => {
  if (!store.canMoveUp()) {
    return;
  }

  cancelRequests();

  let newSlots = slots.slice(0, 3);

  const firstSlot = newSlots[0];
  const nextId = firstSlot ? firstSlot.master : 0;

  newSlots.splice(0, 0, null);
  newSlots.splice(1, 0, null);

  slots = newSlots;
  store.emit("update");

  fillSlots("up", nextId, 1);
};

store.moveDown = () => {
  if (!store.canMoveDown()) {
    return;
  }

  cancelRequests();

  let newSlots = slots.slice(2);
  const lastSlot = newSlots[newSlots.length - 1];
  const nextId = lastSlot ? lastSlot.apprentice : 0;

  newSlots.splice(4, 0, null);
  newSlots.splice(5, 0, null);

  slots = newSlots;
  store.emit("update");

  fillSlots("down", nextId, 3);
};


store.initialize = (httpClient) => {
  client = httpClient;
  fillSlots("down", 3616, 0);
};


store.updateLocation = (newLocation) => {
  location = newLocation;
  checkIfSithHomeworld();
  store.emit("update");
};

export default store;

