import {combineReducers} from 'redux';
import {Pathology, Patient, copyPatient, Media} from './patient';
import {createStore, applyMiddleware, Action as ReduxAction} from 'redux';
import thunk, {ThunkAction} from 'redux-thunk';

export interface FullState {
  state: State;
}
export interface State {
  ready: boolean;
  patients: Map<number, Patient>;
  patientId: number | null;
}

const INITIAL_STATE = {
  ready: false,
  patients: new Map<number, Patient>(),
  patientId: null,
};

export const ADD_PATIENT = 'ADD_PATIENT';
export function addPatient(patient: Patient): NewPatientAction {
  return {
    type: ADD_PATIENT,
    patient: patient,
  };
}
interface NewPatientAction {
  type: typeof ADD_PATIENT;
  patient: Patient;
}

export const SET_READY = 'SET_READY';
export function setReady(patients: Map<number, Patient>): PatientsAction {
  return {
    type: SET_READY,
    patients: patients,
  };
}
interface PatientsAction {
  type: typeof SET_READY;
  patients: Map<number, Patient>;
}

export const ADD_CONSENT = 'ADD_CONSENT';
export function addConsent(patient: Patient, uri: string): ConsentAction {
  return {
    type: ADD_CONSENT,
    patient: patient,
    uri: uri,
  };
}
interface ConsentAction {
  type: typeof ADD_CONSENT;
  patient: Patient;
  uri: string;
}

export const ADD_MEDIA = 'ADD_MEDIA';
export function addMedia(patient: Patient, media: Media): MediaAction {
  return {
    type: ADD_MEDIA,
    patient: patient,
    media: media,
  };
}
interface MediaAction {
  type: typeof ADD_MEDIA;
  patient: Patient;
  media: Media;
}
export const ADD_PATHOLOGY = 'ADD_PATHOLOGY';
export function addPathology(
  patient: Patient,
  pathology: Pathology,
): PathologyAction {
  return {
    type: ADD_PATHOLOGY,
    patient: patient,
    pathology: pathology,
  };
}
interface PathologyAction {
  type: typeof ADD_PATHOLOGY;
  patient: Patient;
  pathology: Pathology;
}

export const NAVIGATE_PATIENT = 'NAVIGATE_PATIENT';
export function navigatePatient(patient: Patient): NavigateAction {
  return {
    type: NAVIGATE_PATIENT,
    patient: patient,
  };
}
interface NavigateAction {
  type: typeof NAVIGATE_PATIENT;
  patient: Patient;
}

export type PatientAction = ConsentAction | MediaAction | PathologyAction;
export type Action =
  | NavigateAction
  | NewPatientAction
  | PatientsAction
  | PatientAction;

function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}

export const addNewPatient = (patient: Patient) => {
  return async dispatch => {
    return dispatch(addPatient(patient));
  };
};
const patientReducer = (patient: Patient, action: PatientAction): Patient => {
  const newPatient = copyPatient(patient);
  switch (action.type) {
    case ADD_CONSENT:
      newPatient.consentUri = action.uri;
      return newPatient;
    case ADD_MEDIA:
      newPatient.media.push(action.media);
      return newPatient;
    case ADD_PATHOLOGY:
      newPatient.pathology = action.pathology;
    default:
      return newPatient;
    // assertUnreachable(action.type);
  }
};

const mainReducer = (state: State = INITIAL_STATE, action: Action): State => {
  switch (action.type) {
    case ADD_PATIENT:
      if (state.patients[action.patient.id]) {
        throw new Error("Can't add already existing patient");
      }
      var newPats = new Map(state.patients);
      newPats.set(action.patient.id, action.patient);
      return {...state, patients: newPats, patientId: action.patient.id};
    //
    case NAVIGATE_PATIENT:
      if (!state.patients.has(action.patient.id)) {
        throw new Error("Can't navigate to unexisting patient");
      }
      return {...state, patientId: action.patient.id};
    case SET_READY:
      return {
        ...state,
        patients: action.patients,
        ready: true,
      };
    case ADD_CONSENT:
    case ADD_MEDIA:
    case ADD_PATHOLOGY:
      const patient = state.patients.get(action.patient.id);
      const newPatient = patientReducer(patient, action);
      const newPatients = new Map(state.patients);
      newPatients.set(newPatient.id, newPatient);
      return {...state, patients: newPatients};

    // default:
    // throw Error('Unknown action');
    // return assertUnreachable(action.type);
  }
  return state;
};

export const reducer = combineReducers({
  state: mainReducer,
});

export const store = createStore(reducer, applyMiddleware(thunk));
