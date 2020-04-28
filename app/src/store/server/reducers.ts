import {
  ServerState,
  CHANGE_SERVER,
  SET_STATUS,
  ServerAction,
  Status,
} from './types';

const SERVER_STATE: ServerState = {
  server: null,
  status: Status.Loading,
};

export const serverReducer = (
  state: ServerState = SERVER_STATE,
  action: ServerAction,
): ServerState => {
  switch (action.type) {
    case CHANGE_SERVER:
      const server = action.payload === '' ? null : action.payload;
      return {...state, server: server};
    case SET_STATUS:
      return {...state, status: action.payload};
    default:
      break;
  }
  return state;
};
