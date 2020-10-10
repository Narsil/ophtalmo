import {
    Patient,
    PatientsState,
    PatientsActionType,
    PatientActionType,
    ADD_MEDIA,
    ADD_INFO,
    ADD_PATIENT,
    NAVIGATE_PATIENT,
    DELETED_PATIENT,
    UPLOADED_PATIENT,
    SET_READY,
    Uuid,
} from "./types";

export function copyPatient(other: Patient) {
    const patient = new Patient(other.id);
    patient.id = other.id;
    patient.media = other.media.slice(0);
    patient.info = other.info ? { ...other.info } : null;
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
        // console.error('Existing patients ', state.patients.keys());
        console.error(
            `Can't get state patient ${state.patientId}, it does not  exist in the map`
        );
    }
    return patient!;
}

const patientReducer = (
    patient: Patient,
    action: PatientActionType
): Patient => {
    const newPatient = copyPatient(patient);
    switch (action.type) {
        case ADD_MEDIA:
            newPatient.media.push(action.media);
            newPatient.uploaded = false;
            return newPatient;
        case ADD_INFO:
            newPatient.info = action.info;
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
    action: PatientsActionType
): PatientsState => {
    // console.log(action);
    switch (action.type) {
        case ADD_PATIENT:
            if (state.patients.get(action.patient.id) !== undefined) {
                throw new Error("Can't add already existing patient");
                return state;
            }
            var newPats = new Map(state.patients);
            newPats.set(action.patient.id, action.patient);
            // console.log('ADD_PATIENT', newPats, action.patient.id);
            return {
                ...state,
                patients: newPats,
                patientId: action.patient.id,
            };
        //
        case NAVIGATE_PATIENT:
            if (!state.patients.has(action.patient.id)) {
                throw new Error("Can't navigate to unexisting patient");
            }
            return { ...state, patientId: action.patient.id };
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
                    `We can't delete an inexistent patient ${action.patient.id}`
                );
                return state;
            }
            if (
                patient_to_delete.hasQuestions() &&
                !patient_to_delete.uploaded
            ) {
                if (patient_to_delete.hasQuestions()) {
                    console.warn(
                        `We can't delete a patient with questions ${action.patient.id}`
                    );
                    return state;
                } else {
                    console.warn(
                        `We can't delete a patient that is not synced ${action.patient.id}`
                    );
                    return state;
                }
            }
            const newPatients2 = new Map(state.patients);
            newPatients2.delete(patient_to_delete.id);
            return { ...state, patients: newPatients2 };
        case ADD_MEDIA:
        case ADD_INFO:
        case UPLOADED_PATIENT:
            const patient = state.patients.get(action.patient.id);
            if (patient === undefined) {
                console.warn(
                    `Action attempted on non existing patient ${action.patient.id}`
                );
                return state;
            }
            const newPatient = patientReducer(patient, action);
            const newPatients = new Map(state.patients);
            newPatients.set(newPatient.id, newPatient);
            // console.log('Uploaded ', newPatients);
            return { ...state, patients: newPatients };
        default:
            break;
    }
    // assertUnreachable(action);
    // Actually Here actions might be native redux actions.
    return state;
};
