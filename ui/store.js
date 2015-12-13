import _ from 'lodash';
import { EventEmitter } from 'events';

const store = new EventEmitter();

let location = null;
let slots = [null, null, null, null, null];
let client = null;
let nextId = 3616;
let index = 0;
let xhrRequests = [];
let canMoveUp = true;
let canMoveDown = true;
let isFirst = false;
let isLast = false;

function cancelRequests() {
  for (var i=0; i < xhrRequests.length; i++) {
    xhrRequests.shift().abort();
  }
}

function checkIfSithHomeworld() {
  let isSelectedSlot = false;
  _.each(slots, slot => {
    if (slot && location && slot.homeworld.id === location.id) {
        isSelectedSlot = true;
    }
  });
  if (isSelectedSlot) {
    canMoveUp = false;
    canMoveDown = false;
    cancelRequests();
  } else {
    canMoveUp = !isFirst;
    canMoveDown = !isLast;
  }
}

function fillSlots(direction) {

  client.get("/sith/" + nextId, data => {

    slots[index] = data;

    if (direction === "up") {
      nextId = data.master;
      index -= 1;
    } else {
      nextId = data.apprentice;
      index += 1;
    }

    if (!nextId) {
      if (direction == "up") {
        canMoveUp = false;
        isFirst = true;
      } else {
        canMoveDown = false;
        isLast = true;
      }
    } else {
        isFirst = false;
        isLast = false;
        canMoveUp = true;
        canMoveDown = true;
    }

    checkIfSithHomeworld();

    store.emit("update");

    if (nextId && slots[index] === null) {
      fillSlots(direction);
    }

  }, {
    beforeSend(req) {
      xhrRequests.push(req);
    }
  });
}


store.canMoveUp = () => canMoveUp;
store.canMoveDown = () => canMoveDown;

store.getLocation = () => {
  return location;
};

store.getSlots = () => {
  return slots;
};


store.moveUp = () => {
  if (!canMoveUp) {
    return;
  }
  cancelRequests();
  let newSlots = slots.slice(0, 3);
  nextId = newSlots[0].master;
  index = 1;
  newSlots.splice(0, 0, null);
  newSlots.splice(1, 0, null);
  slots = newSlots;
  store.emit("update");
  fillSlots("up");
};

store.moveDown = () => {
  if (!canMoveDown) {
    return;
  }
  cancelRequests();
  let newSlots = slots.slice(2);
  nextId = newSlots[newSlots.length - 1].apprentice;
  index = 3;
  newSlots.splice(4, 0, null);
  newSlots.splice(5, 0, null);
  slots = newSlots;
  store.emit("update");
  fillSlots("down");
};


store.initialize = (httpClient) => {
  client = httpClient;
  fillSlots("down");
};


store.updateLocation = (newLocation) => {
  location = newLocation;
  checkIfSithHomeworld();
  store.emit("update");
};

export default store;

