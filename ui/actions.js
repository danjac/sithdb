import _ from 'lodash';
import request from 'superagent';

let xhrRequests = [];

export const CHANGE_LOCATION = 'CHANGE_LOCATION';
export const SCROLL_UP = 'SCROLL_UP';
export const SCROLL_DOWN = 'SCROLL_DOWN';
export const FETCH_SITH = 'FETCH_SITH';
export const SITH_FETCHED = 'SITH_FETCHED';
export const SITH_FOUND = 'SITH_FOUND';
export const NUM_SLOTS = 5;

function cancelRequests() {
  for (var i=0; i < xhrRequests.length; i++){
    xhrRequests.shift().abort();
  }
}

function checkIfSithFound(location, slots) {

  if (location === null) return false;

  const isSithFound = _.some(slots, slot => {
    return slot && slot.homeworld.id === location.id;
  });

  if (!isSithFound) {
    cancelRequests();
  }
  return isSithFound;

}

export function locationChanged(location) {
    return {
      type: CHANGE_LOCATION,
      location
    };
}

export function changeLocation(location) {
  return (dispatch, getState) => {
    const state = getState();
    const isFound = checkIfSithFound(location, state.board.slots);
    dispatch(sithFound(isFound));
    dispatch(locationChanged(location));
  };
}

export function sithFound(isFound) {
  return {
    type: SITH_FOUND,
    isSithFound: isFound
  }
}

export function initBoard() {
  // fetch the first sith
  return dispatch => {
    dispatch(fetchSith(0, 3616, SCROLL_DOWN));
  };
}

function scrollUpDone() {
  return {
        type: SCROLL_UP
  };
}

export function scrollUp() {

  return (dispatch, getState) => {

    const state = getState();
    const firstSlot = state.board.slots[0];

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

    const state = getState();
    const lastSlot = state.board.slots[state.slots.length - 1];

    const nextId = lastSlot ? lastSlot.apprentice : 0;

    cancelRequests();

    if (nextId) {
      // skip last 2 slots
      dispatch(fetchSith(NUM_SLOTS - 2, nextId, SCROLL_DOWN));
    }

    return {
        type: SCROLL_DOWN
    };
  };
}


function fetchSith(index, id, direction) {

  // we need to fill the board with 5 slots.

  // to do this, start with the first slot.
  // if slot is empty then fetch sith from the API.
  // if slot is not empty then move to next slot.

  // we need direction (up/down) to determine whether to look for master/apprentice
  // if either is 0 (depending on direction) then stop.

  return (dispatch, getState) => {

    const { currentLocation, board } = getState();
    const { isSithFound, slots } = board;

    if (isSithFound) return;

    const req = request
      .get(`/sith/${id}`)
      .end((err, res) => {

        // error handling etc TBD
        const sith = res.body;
        dispatch(sithFetched(sith, index));

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

function sithFetched(sith, index) {
  return {
    type: SITH_FETCHED,
    sith,
    index
  };
}
