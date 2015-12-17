import _ from 'lodash';

import {
  CHANGE_LOCATION,
  SITH_FETCHED,
  SITH_FETCHING,
  SITH_FOUND,
  SCROLL_UP,
  SCROLL_DOWN,
  NUM_SLOTS,
} from './constants';

const initialSlots = _.fill(Array(NUM_SLOTS), null);

const initialState = {
  currentLocation: null,
  slots: initialSlots,
  isLoading: false,
  canScrollUp: true,
  canScrollDown: true,
  xhrRequests: []
};


function cancelRequests(xhrRequests) {
  for (var i=0; i < xhrRequests.length; i++) {
    xhrRequests[i].abort();
  }
}

function transform(fn) {
  // does various housekeeping on the state
  return (state, action) => {

    // function should return new (mutable) data
    let payload = Object.assign({}, state, fn(state, action));

    const { slots, currentLocation, isLoading, xhrRequests } = payload;

    const isFirst = _.some(slots, sith => sith && sith.master === 0);
    const isLast = _.some(slots, sith => sith && sith.apprentice === 0);

    const isSithOnPlanet = _.some(slots, sith => sith && currentLocation && sith.homeworld.id === currentLocation.id);

    payload.canScrollUp = !isFirst && !isLoading && !isSithOnPlanet;
    payload.canScrollDown = !isLast && !isLoading && !isSithOnPlanet;

    // this is really cheating, as it's a side effect
    if (isSithOnPlanet) {
      const xhrRequests = state.xhrRequests.slice();
      cancelRequests(xhrRequests);
      payload.xhrRequests = [];
    }
    return payload;
  }
}

function changeLocation(state, action) {
  let { currentLocation } = action;
  return { currentLocation };
}

function abortRequests(state, action) {

  const xhrRequests = state.xhrRequests.slice();
  return {
    xhrRequests: []
  }

}


function scrollUp(state, action) {

  // take the first 3 slots and prepend

  // problem: if we have empty slots due to loading

  // take last 3 slices
//

  // if first slot empty, do nothing

  if (state.slots[0] === null) {
    return {};
  }

  const slots = state.slots.slice(0, 3);

  slots.splice(0, 0, null);
  slots.splice(1, 0, null);

  cancelRequests(state.xhrRequests);

  return { slots, xhrRequests: [] };
}

function scrollDown(state, action) {

  const slots = state.slots.slice(2);

  slots.splice(4, 0, null);
  slots.splice(5, 0, null);

  cancelRequests(state.xhrRequests);

  return { slots, xhrRequests: [] };

}

function loading(state, action) {

  const xhrRequests = state.xhrRequests.slice();
  xhrRequests.push(action.request);

  return { isLoading: true, xhrRequests };
}

function sithFetched(state, action) {

  const slots = state.slots.slice();
  const { index, sith } = action;
  slots.splice(index, 1, sith);

  return { slots, isLoading: false };

}

export default function (state=initialState, action) {

  switch(action.type) {

    case CHANGE_LOCATION:
      return transform(changeLocation)(state, action);

    case SCROLL_UP:
      return transform(scrollUp)(state, action);

    case SCROLL_DOWN:
      return transform(scrollDown)(state, action);

    case SITH_FETCHING:
      return transform(loading)(state, action);

    case SITH_FETCHED:
      return transform(sithFetched)(state, action);

  }

  return state;
}

