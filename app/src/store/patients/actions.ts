import {
    Patient,
    Media,
    Pathology,
    Info,
    ADD_PATIENT,
    SET_READY,
    DELETED_PATIENT,
    UPLOADED_PATIENT,
    ADD_MEDIA,
    ADD_INFO,
    ADD_INCLUSION,
    NAVIGATE_PATIENT,
    PatientsActionType,
    PatientActionType,
    Uuid
} from "./types";

export function addPatient(patient: Patient): PatientsActionType {
    return {
        type: ADD_PATIENT,
        patient: patient
    };
}

export function setReady(patients: Map<Uuid, Patient>): PatientsActionType {
    return {
        type: SET_READY,
        patients: patients
    };
}

export function addMedia(patient: Patient, media: Media): PatientsActionType {
    return {
        type: ADD_MEDIA,
        patient: patient,
        media: media
    };
}
export function addInfo(patient: Patient, info: Info): PatientsActionType {
    return {
        type: ADD_INFO,
        patient: patient,
        info: info
    };
}
export function deletedPatient(patient: Patient): PatientsActionType {
    return {
        type: DELETED_PATIENT,
        patient: patient
    };
}
export function uploadedPatient(patient: Patient): PatientsActionType {
    return {
        type: UPLOADED_PATIENT,
        patient: patient
    };
}

export function navigatePatient(patient: Patient): PatientsActionType {
    return {
        type: NAVIGATE_PATIENT,
        patient: patient
    };
}
