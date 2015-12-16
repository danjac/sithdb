import request from 'superagent';

let xhrRequests = [];

export const CHANGE_LOCATION = 'CHANGE_LOCATION';
export const SCROLL_UP = 'SCROLL_UP';
export const SCROLL_DOWN = 'SCROLL_DOWN';
export const FETCH_SITH = 'FETCH_SITH';
export const SITH_FETCHED = 'SITH_FETCHED';

export function changeLocation(location) {
  return {
    type: CHANGE_LOCATION,
    location
  };
}


