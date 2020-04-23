import {
  Patient,
  Media,
  Pathology,
  ADD_PATIENT,
  SET_READY,
  ADD_CONSENT,
  DELETED_PATIENT,
  UPLOADED_PATIENT,
  ADD_MEDIA,
  ADD_PATHOLOGY,
  NAVIGATE_PATIENT,
  PatientsActionType,
  PatientActionType,
  Uuid,
} from './types';

export function addPatient(patient: Patient): PatientsActionType {
  return {
    type: ADD_PATIENT,
    patient: patient,
  };
}

export function setReady(patients: Map<Uuid, Patient>): PatientsActionType {
  return {
    type: SET_READY,
    patients: patients,
  };
}

export function addConsent(patient: Patient, uri: string): PatientsActionType {
  return {
    type: ADD_CONSENT,
    patient: patient,
    uri: uri,
  };
}
export function addMedia(patient: Patient, media: Media): PatientsActionType {
  return {
    type: ADD_MEDIA,
    patient: patient,
    media: media,
  };
}
export function addPathology(
  patient: Patient,
  pathology: Pathology,
): PatientsActionType {
  return {
    type: ADD_PATHOLOGY,
    patient: patient,
    pathology: pathology,
  };
}

export function deletedPatient(patient: Patient): PatientsActionType {
  return {
    type: DELETED_PATIENT,
    patient: patient,
  };
}
export function uploadedPatient(patient: Patient): PatientsActionType {
  return {
    type: UPLOADED_PATIENT,
    patient: patient,
  };
}

export function navigatePatient(patient: Patient): PatientsActionType {
  return {
    type: NAVIGATE_PATIENT,
    patient: patient,
  };
}
