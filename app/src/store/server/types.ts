export enum Status {
  Online = 'online',
  Loading = 'loading',
  Offline = 'offline',
}
export interface ServerState {
  server: string | null;
  status: Status;
}

export const CHANGE_SERVER = 'CHANGE_SERVER';
export const SET_STATUS = 'SET_STATUS';

export interface ChangeServerAction {
  type: typeof CHANGE_SERVER;
  payload: string;
}

export interface SetStatusServerAction {
  type: typeof SET_STATUS;
  payload: Status;
}

export type ServerAction = ChangeServerAction | SetStatusServerAction;
