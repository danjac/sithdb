import { combineReducers } from 'redux';

import {
  CHANGE_LOCATION,
  SITH_FETCHED,
  SITH_FETCHING,
  SITH_FOUND,
  SCROLL_UP,
  SCROLL_DOWN
} from './actions';

const initialSlots = [null, null, null, null, null];

const initialState = {
  currentLocation: null,
  slots: initialSlots,
  isSithFound: false,
  isFirst: true,
  isLast: true,
  isLoading: false
};


export default function (state=initialState, action) {

  let currentLocation, slots, isSithFound, isFirst, isLast;

  switch(action.type) {

    case CHANGE_LOCATION:

      return Object.assign({}, state, { currentLocation: action.location });

    case SCROLL_UP:

      slots = state.slots.slice(0, 3);

      slots.splice(0, 0, null);
      slots.splice(1, 0, null);

      return Object.assign({}, state, { slots });

    case SCROLL_DOWN:

      slots = state.slots.slice(2);

      slots.splice(4, 0, null);
      slots.splice(5, 0, null);

      return Object.assign({}, state, { slots });

    case SITH_FETCHING:

      return Object.assign({}, state, { isLoading: true });

    case SITH_FETCHED:

      const sith = action.sith;

      slots = state.slots.slice();
      slots.splice(action.index, 1, sith);

      isLast = sith.apprentice === 0;
      isFirst = sith.master === 0;

      return Object.assign({}, state, { slots, isFirst, isLast, isLoading: false });

    case SITH_FOUND:

      return Object.assign({}, state, { isSithFound: action.isSithFound });

  }

  return state;
}

