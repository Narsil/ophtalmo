import {
  ChangeServerAction,
  CHANGE_SERVER,
  SET_STATUS,
  Status,
  SetStatusServerAction,
} from './types';

export function changeServer(server: string): ChangeServerAction {
  return {
    type: CHANGE_SERVER,
    payload: server,
  };
}

export function setServerStatus(status: Status): SetStatusServerAction {
  return {
    type: SET_STATUS,
    payload: status,
  };
}
