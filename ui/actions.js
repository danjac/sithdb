import _ from 'lodash';
import request from 'superagent';

let xhrRequests = [];

export const CHANGE_LOCATION = 'CHANGE_LOCATION';
export const SCROLL_UP = 'SCROLL_UP';
export const SCROLL_DOWN = 'SCROLL_DOWN';
export const FETCH_SITH = 'FETCH_SITH';
export const SITH_FETCHING = 'SITH_FETCHING';
export const SITH_FETCHED = 'SITH_FETCHED';
export const SITH_FOUND = 'SITH_FOUND';
export const NUM_SLOTS = 5;

function createAction(type) {
  return (payload) => {
    return Object.assign({}, payload, {
      type,
    });
  };
}

function cancelRequests() {
  for (var i=0; i < xhrRequests.length; i++){
    xhrRequests.shift().abort();
  }
}

function checkIfSithFound(location, slots) {

  if (location === null) return false;

  const isFound = _.some(slots, slot => {
    return slot && slot.homeworld.id === location.id;
  });

  if (isFound) {
    cancelRequests();
  }
  return isFound;

}

// simple state changes
//
const sithFound = createAction(SITH_FOUND);
const locationChanged = createAction(CHANGE_LOCATION);
const scrollUpDone = createAction(SCROLL_UP);
const scrollDownDone = createAction(SCROLL_DOWN);
const sithFetching = createAction(SITH_FETCHING);
const sithFetched = createAction(SITH_FETCHED);

export function changeLocation(location) {

  return (dispatch, getState) => {

    const state = getState();
    const isSithFound = checkIfSithFound(location, state.slots);

    dispatch(sithFound({ isSithFound }));
    dispatch(locationChanged({ location }));

  };
}

export function initBoard() {
  // fetch the first sith
  return dispatch => {
    dispatch(fetchSith(0, 3616, SCROLL_DOWN));
  };
}

export function scrollUp() {

  return (dispatch, getState) => {

    const state = getState();
    const firstSlot = state.slots[0];

    const nextId = firstSlot ? firstSlot.master : 0;

    cancelRequests();

    dispatch(scrollUpDone());

    if (nextId) {
      // skip first 2 slots
      dispatch(fetchSith(1, nextId, SCROLL_UP));
    }

  };
}

export function scrollDown() {

  return (dispatch, getState) => {

    const { slots } = getState();
    const lastSlot = slots[slots.length - 1];

    const nextId = lastSlot ? lastSlot.apprentice : 0;

    cancelRequests();

    dispatch(scrollDownDone());

    if (nextId) {
      dispatch(fetchSith(NUM_SLOTS - 2, nextId, SCROLL_DOWN));
    }

  };
}


function fetchSith(index, id, direction) {

  return (dispatch, getState) => {

    const { currentLocation, isSithFound, slots } = getState();

    if (isSithFound) return;

    dispatch(sithFetching());

    const req = request
      .get(`/sith/${id}`)
      .end((err, res) => {

        // error handling etc TBD
        const sith = res.body;

        dispatch(sithFetched({ sith, index }));
        const isSithFound = checkIfSithFound(currentLocation, slots);
        dispatch(sithFound({ isSithFound }));

        const nextId = direction === SCROLL_UP ? sith.master : sith.apprentice;
        const nextIndex = direction === SCROLL_UP ? index - 1 : index + 1;

        if (nextId && nextIndex > -1 && nextIndex < NUM_SLOTS) {
          dispatch(fetchSith(nextIndex, nextId, direction));
        }
      });

    // we can abort this request later
    xhrRequests.push(req);

  };

}
