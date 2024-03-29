import * as FileSystem from "expo-file-system";

export type Uuid = string;

export interface PatientsState {
    ready: boolean;
    patients: Map<Uuid, Patient>;
    patientId: null | Uuid;
}

export function directory(patient: Patient) {
    const uri = FileSystem.documentDirectory + `/${patient.id}`;
    return uri;
}

const infoFilename = "info.json";
export function infoUri(patient: Patient): string {
    const uri = `${directory(patient)}/${infoFilename}`;
    return uri;
}

const isToday = (someDate: Date): boolean => {
    const today = new Date();
    return (
        someDate.getDate() == today.getDate() &&
        someDate.getMonth() == today.getMonth() &&
        someDate.getFullYear() == today.getFullYear()
    );
};

export class Patient {
    id: Uuid;
    media: Media[];
    info: Info | null;
    inclusion: Inclusion | null;
    uploaded: boolean;
    created: Date | null;

    constructor(id: Uuid) {
        this.id = id;
        this.media = [];
        this.info = null;
        this.inclusion = null;
        this.created = null;
        this.uploaded = false;
    }

    hasMedia() {
        return this.media.length > 0;
    }

    hasPathology() {
        return this.info != null && this.info.pathology !== null;
    }

    hasQuestions() {
        return this.info != null && this.info.questions !== null;
    }

    toString() {
        const t = this.created;
        if (t !== null) {
            const paddedMinutes = ("0" + ("" + t.getMinutes())).slice(-2);
            const time = t.getHours() + "h" + paddedMinutes;
            const date = t.getDate() + "/" + t.getMonth();
            const str = isToday(t) ? time : date + " " + time;
            return `Patient ${str}`;
        } else {
            return `Patient`;
        }
    }
}
export interface Media {
    uri: string;
    filename: string;
    timestamp: Date;
    size: number;
}

export interface Info {
    pathology: Pathology | null;
    questions: Questions | null;
    inclusion: Inclusion | null;
}

export interface Inclusion {
    inclusion_number: string;
    accepted: boolean;
}

export interface Questions {
    itching: boolean;
    morning_stuck_eyes: boolean;
    pain: boolean;
    impaired_vision: boolean;
    wears_lenses: boolean;
    is_bilateral: boolean;
}

export interface Pathology {
    pathology: string;
    hasUlcer: boolean;
}

export async function loadPatient(patientId: Uuid): Promise<Patient> {
    const patient = new Patient(patientId);
    const directory = FileSystem.documentDirectory + patientId;
    const filenames = await FileSystem.readDirectoryAsync(directory);
    const info = await FileSystem.getInfoAsync(directory);

    if (info.modificationTime !== undefined) {
        patient.created = new Date(info.modificationTime * 1000);
    }

    if (filenames.indexOf(infoFilename) !== -1) {
        const pathUri = infoUri(patient);
        try {
            const content = await FileSystem.readAsStringAsync(pathUri);
            const info = JSON.parse(content);
            patient.info = info;
        } catch (e) {
            console.error;
        }
    }

    if (filenames.indexOf("media") != -1) {
        const mediaDirectory = directory + "/media";
        const mediaFilenames = await FileSystem.readDirectoryAsync(
            mediaDirectory
        );
        for (const filename of mediaFilenames) {
            if (filename.endsWith(".mp4") || filename.endsWith(".mov")) {
                const uri = `${mediaDirectory}/${filename}`;
                const info = await FileSystem.getInfoAsync(uri);

                if (info.modificationTime !== undefined) {
                    const timestamp = new Date(info.modificationTime);
                    const media = {
                        filename: filename,
                        uri: uri,
                        timestamp: timestamp,
                        size: info.size
                    };
                    patient.media.push(media);
                }
            }
        }
    }

    return patient;
}

export const ADD_MEDIA = "ADD_MEDIA";
export const ADD_PATHOLOGY = "ADD_PATHOLOGY";
export const ADD_INFO = "ADD_INFO";
export const ADD_INCLUSION = "ADD_INCLUSION";
export const ADD_PATIENT = "ADD_PATIENT";
export const SET_READY = "SET_READY";
export const NAVIGATE_PATIENT = "NAVIGATE_PATIENT";
export const DELETED_PATIENT = "DELETED_PATIENT";
export const UPLOADED_PATIENT = "UPLOADED_PATIENT";

interface PatientsReadyAction {
    type: typeof SET_READY;
    patients: Map<Uuid, Patient>;
}

interface AddPatientAction {
    type: typeof ADD_PATIENT;
    patient: Patient;
}

interface NavigateAction {
    type: typeof NAVIGATE_PATIENT;
    patient: Patient;
}

interface BasePatientAction {
    patient: Patient;
}
interface MediaAction extends BasePatientAction {
    type: typeof ADD_MEDIA;
    media: Media;
}
interface InfoAction extends BasePatientAction {
    type: typeof ADD_INFO;
    info: Info;
}
interface DeletedPatientAction extends BasePatientAction {
    type: typeof DELETED_PATIENT;
}
interface UploadedPatientAction extends BasePatientAction {
    type: typeof UPLOADED_PATIENT;
}

export type PatientActionType =
    | MediaAction
    | DeletedPatientAction
    | UploadedPatientAction
    | InfoAction;

export type PatientsActionType =
    | PatientActionType
    | PatientsReadyAction
    | AddPatientAction
    | NavigateAction;
