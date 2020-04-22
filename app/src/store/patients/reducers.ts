import {
  Patient,
  PatientsState,
  PatientsActionType,
  PatientActionType,
  ADD_CONSENT,
  ADD_MEDIA,
  ADD_PATHOLOGY,
  ADD_PATIENT,
  NAVIGATE_PATIENT,
  DELETED_PATIENT,
  UPLOADED_PATIENT,
  SET_READY,
  Uuid,
} from './types';

export function copyPatient(other: Patient) {
  const patient = new Patient(other.id);
  patient.id = other.id;
  patient.media = other.media.slice(0);
  patient.consentUri = other.consentUri;
  patient.pathology = other.pathology ? {...other.pathology} : null;
  patient.created = other.created;
  patient.uploaded = other.uploaded;
  return patient;
}

const INITIAL_STATE = {
  ready: false,
  patients: new Map<Uuid, Patient>(),
  patientId: null,
};

export function getPatient(state: PatientsState): Patient {
  if (state.patientId == null) {
    console.error("Can't get state patient, as no one as been set");
  }
  const patient = state.patients.get(state.patientId!);
  if (patient === undefined) {
    console.error("Can't get state patient, it does not  exist in the map");
  }
  return patient!;
}

const patientReducer = (
  patient: Patient,
  action: PatientActionType,
): Patient => {
  const newPatient = copyPatient(patient);
  switch (action.type) {
    case ADD_CONSENT:
      newPatient.consentUri = action.uri;
      newPatient.uploaded = false;
      return newPatient;
    case ADD_MEDIA:
      newPatient.media.push(action.media);
      newPatient.uploaded = false;
      return newPatient;
    case ADD_PATHOLOGY:
      newPatient.pathology = action.pathology;
      newPatient.uploaded = false;
      return newPatient;
    case UPLOADED_PATIENT:
      newPatient.uploaded = true;
      return newPatient;
    default:
      break;
  }
  return patient;
};

export const patientsReducer = (
  state: PatientsState = INITIAL_STATE,
  action: PatientsActionType,
): PatientsState => {
  switch (action.type) {
    case ADD_PATIENT:
      if (state.patients.get(action.patient.id) !== undefined) {
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
    case DELETED_PATIENT:
      const patient_to_delete = state.patients.get(action.patient.id);
      if (patient_to_delete === undefined) {
        console.warn(
          `We can't delete an inexistent patient ${action.patient.id}`,
        );
        return state;
      }
      if (patient_to_delete.hasConsent()) {
        console.warn(
          `We can't delete a patient with consent${action.patient.id}`,
        );
        return state;
      }
      const newPatients2 = new Map(state.patients);
      newPatients2.delete(patient_to_delete.id);
      return {...state, patients: newPatients2};
    case ADD_CONSENT:
    case ADD_MEDIA:
    case ADD_PATHOLOGY:
    case UPLOADED_PATIENT:
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
