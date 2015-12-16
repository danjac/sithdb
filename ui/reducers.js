import { combineReducers } from 'redux';

import {
  CHANGE_LOCATION,
  SITH_FETCHED,
  SITH_FOUND,
  SCROLL_UP
} from './actions';

const initialSlots = [null, null, null, null, null];

const initialBoard = {
  slots: initialSlots,
  isSithFound: false,
  isFirst: true,
  isLast: true
};

function currentLocation(state=null, action) {
  switch(action.type) {
    case CHANGE_LOCATION:
      return action.location;
  }
  return state;
}

function board(state=initialBoard, action) {

  let currentLocation, slots, isSithFound, isFirst, isLast;

  switch(action.type) {

    case SCROLL_UP:

    slots = state.slots.slice();
    slots.splice(0, 0, null);
    slots.splice(1, 0, null);

    return Object.assign({}, state, { slots });

    case SITH_FETCHED:

    const sith = action.sith;

    slots = state.slots.slice();
    slots.splice(action.index, 1, sith);

    isLast = sith.apprentice === 0;
    isFirst = sith.master === 0;

    return Object.assign({}, state, { slots, isFirst, isLast });

    case SITH_FOUND:

    isSithFound = action.isSithFound;

    return Object.assign({}, state, { isSithFound });

  }

  return state;
}

const rootReducer = combineReducers({
  currentLocation,
  board
});


export default rootReducer;
