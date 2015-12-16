import { combineReducers } from 'redux';

import {
  CHANGE_LOCATION
} from './actions';

function currentLocation(state=null, action) {
  switch(action.type) {
    case CHANGE_LOCATION:
      return action.location;
  }
  return state;
}

const rootReducer = combineReducers({
  currentLocation
});

export default rootReducer;
