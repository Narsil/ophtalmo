import {
  ServerState,
  CHANGE_SERVER,
  SET_STATUS,
  ServerAction,
  Status,
} from './types';

const SERVER_STATE: ServerState = {
  server: 'http://192.168.0.33:5000',
  status: Status.Loading,
};

export const serverReducer = (
  state: ServerState = SERVER_STATE,
  action: ServerAction,
): ServerState => {
  switch (action.type) {
    case CHANGE_SERVER:
      return {...state, server: action.payload};
    case SET_STATUS:
      return {...state, status: action.payload};
    default:
      break;
  }
  return state;
};
