import _ from 'lodash';
import request from 'superagent';

import {
  CHANGE_LOCATION,
  SITH_FETCHED,
  SITH_FETCHING,
  SITH_FOUND,
  SCROLL_UP,
  SCROLL_DOWN,
  NUM_SLOTS,
} from './constants';


function createAction(type) {
  return (payload) => {
    return Object.assign({}, payload, {
      type,
    });
  };
}

// simple state changes
//
const scrollUpDone = createAction(SCROLL_UP);
const scrollDownDone = createAction(SCROLL_DOWN);
const sithFetching = createAction(SITH_FETCHING);
const sithFetched = createAction(SITH_FETCHED);

export function changeLocation(newLocation) {
  return {
    type: CHANGE_LOCATION,
    currentLocation: newLocation
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

    dispatch(scrollDownDone());

    if (nextId) {
      dispatch(fetchSith(NUM_SLOTS - 2, nextId, SCROLL_DOWN));
    }

  };
}


function fetchSith(index, id, direction) {

  return (dispatch, getState) => {

    const { isLoading, canScrollUp, canScrollDown } = getState();

    if (isLoading) return;
    if (!canScrollUp && direction === SCROLL_UP) return;
    if (!canScrollDown && direction === SCROLL_DOWN) return;

    const req = request
      .get(`/sith/${id}`)
      .end((err, res) => {

        const sith = res.body;

        dispatch(sithFetched({ sith, index }));

        const nextId = direction === SCROLL_UP ? sith.master : sith.apprentice;
        const nextIndex = direction === SCROLL_UP ? index - 1 : index + 1;

        if (nextId && nextIndex > -1 && nextIndex < NUM_SLOTS) {
          dispatch(fetchSith(nextIndex, nextId, direction));
        }
      });

    dispatch(sithFetching({ request: req }));

  };

}
