import {combineReducers} from 'redux';
import {Pathology, Patient, copyPatient, Media} from './patient';
import {createStore, applyMiddleware, Action as ReduxAction} from 'redux';

const INITIAL_STATE = {
  ready: false,
  patients: new Map<number, Patient>(),
  patientId: null,
};
export interface State {
  ready: boolean;
  patients: Map<number, Patient>;
  patientId: null | number;
}

export function getPatient(state: FullState): Patient {
  if (state.state.patientId == null) {
    console.error("Can't get state patient, as no one as been set");
  }
  const patient = state.state.patients.get(state.state.patientId!);
  if (patient === undefined) {
    console.error("Can't get state patient, it does not  exist in the map");
  }
  return patient!;
}

export enum ACTIONS {
  ADD_PATIENT = 'ADD_PATIENT',
  SET_READY = 'SET_READY',
  ADD_CONSENT = 'ADD_CONSENT',
  ADD_MEDIA = 'ADD_MEDIA',
  NAVIGATE_PATIENT = 'NAVIGATE_PATIENT',
  ADD_PATHOLOGY = 'ADD_PATHOLOGY',
  CHANGE_SERVER = 'CHANGE_SERVER',
}

export function addPatient(patient: Patient): NewPatientAction {
  return {
    type: ACTIONS.ADD_PATIENT,
    patient: patient,
  };
}

export function setReady(patients: Map<number, Patient>): PatientsAction {
  return {
    type: ACTIONS.SET_READY,
    patients: patients,
  };
}

export function addConsent(patient: Patient, uri: string): ConsentAction {
  return {
    type: ACTIONS.ADD_CONSENT,
    patient: patient,
    uri: uri,
  };
}
export function addMedia(patient: Patient, media: Media): MediaAction {
  return {
    type: ACTIONS.ADD_MEDIA,
    patient: patient,
    media: media,
  };
}
export function addPathology(
  patient: Patient,
  pathology: Pathology,
): PathologyAction {
  return {
    type: ACTIONS.ADD_PATHOLOGY,
    patient: patient,
    pathology: pathology,
  };
}

export function navigatePatient(patient: Patient): NavigateAction {
  return {
    type: ACTIONS.NAVIGATE_PATIENT,
    patient: patient,
  };
}

export function changeServer(server: string): ChangeServerAction {
  return {
    type: ACTIONS.CHANGE_SERVER,
    payload: server,
  };
}

interface BaseAction {
  type: ACTIONS;
}
interface PatientsAction extends BaseAction {
  type: ACTIONS.SET_READY;
  patients: Map<number, Patient>;
}
interface NewPatientAction extends BaseAction {
  type: ACTIONS.ADD_PATIENT;
  patient: Patient;
}
interface NavigateAction extends BaseAction {
  type: ACTIONS.NAVIGATE_PATIENT;
  patient: Patient;
}

interface BasePatientAction extends BaseAction {
  patient: Patient;
}
interface MediaAction extends BasePatientAction {
  type: ACTIONS.ADD_MEDIA;
  media: Media;
}
interface ConsentAction extends BasePatientAction {
  type: ACTIONS.ADD_CONSENT;
  uri: string;
}
interface PathologyAction extends BasePatientAction {
  type: ACTIONS.ADD_PATHOLOGY;
  pathology: Pathology;
}

interface ChangeServerAction extends BaseAction {
  type: ACTIONS.CHANGE_SERVER;
  payload: string;
}

type PatientAction = MediaAction | ConsentAction | PathologyAction;
type Action =
  | PatientAction
  | PatientsAction
  | NavigateAction
  | NewPatientAction
  | ChangeServerAction;

function assertUnreachable(x: never): void {
  // throw new Error("Didn't expect to get here");
}

const patientReducer = (patient: Patient, action: PatientAction): Patient => {
  const newPatient = copyPatient(patient);
  switch (action.type) {
    case ACTIONS.ADD_CONSENT:
      newPatient.consentUri = action.uri;
      return newPatient;
    case ACTIONS.ADD_MEDIA:
      newPatient.media.push(action.media);
      return newPatient;
    case ACTIONS.ADD_PATHOLOGY:
      newPatient.pathology = action.pathology;
      return newPatient;
  }
  assertUnreachable(action);
};

const mainReducer = (state: State = INITIAL_STATE, action: Action): State => {
  switch (action.type) {
    case ACTIONS.ADD_PATIENT:
      if (state.patients.get(action.patient.id) !== undefined) {
        throw new Error("Can't add already existing patient");
      }
      var newPats = new Map(state.patients);
      newPats.set(action.patient.id, action.patient);
      return {...state, patients: newPats, patientId: action.patient.id};
    //
    case ACTIONS.NAVIGATE_PATIENT:
      if (!state.patients.has(action.patient.id)) {
        throw new Error("Can't navigate to unexisting patient");
      }
      return {...state, patientId: action.patient.id};
    case ACTIONS.SET_READY:
      return {
        ...state,
        patients: action.patients,
        ready: true,
      };
    case ACTIONS.ADD_CONSENT:
    case ACTIONS.ADD_MEDIA:
    case ACTIONS.ADD_PATHOLOGY:
      const patient = state.patients.get(action.patient.id);
      if (patient === undefined) {
        console.warn(
          `Action attempted on non existing patient ${action.patient.id}`,
        );
        return state;
      }
      const newPatient = patientReducer(patient, action);
      const newPatients = new Map(state.patients);
      newPatients.set(newPatient.id, newPatient);
      return {...state, patients: newPatients};
    default:
      break;
  }
  // assertUnreachable(action);
  // Actually Here actions might be native redux actions.
  return state;
};

interface ServerState {
  server: string;
}
const SERVER_STATE: ServerState = {
  server: '128.0.0.1',
};
const serverReducer = (
  state: ServerState = SERVER_STATE,
  action: Action,
): ServerState => {
  switch (action.type) {
    case ACTIONS.CHANGE_SERVER:
      return {server: action.payload};
    default:
      break;
  }
  return state;
};

export const reducer = combineReducers({
  state: mainReducer,
  server: serverReducer,
});
export type FullState = ReturnType<typeof reducer>;

export const store = createStore(reducer);
