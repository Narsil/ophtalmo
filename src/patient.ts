import * as FileSystem from 'expo-file-system';

const consentFilename = 'consent.png';
export function consentUri(patient: Patient): string {
  const uri = FileSystem.documentDirectory + `${patient.id}/${consentFilename}`;
  return uri;
}

const pathologyFilename = 'pathology.json';
export function pathologyUri(patient: Patient): string {
  return FileSystem.documentDirectory + `${patient.id}/${pathologyFilename}`;
}
export function copyPatient(other: Patient) {
  const patient = new Patient(other.id);
  patient.id = other.id;
  patient.media = other.media.slice(0);
  patient.consentUri = other.consentUri;
  patient.pathology = other.pathology ? {...other.pathology} : null;
  return patient;
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
  id: number;
  media: Media[];
  consentUri: string | null;
  pathology: Pathology | null;
  created: Date;

  constructor(id: number) {
    this.id = id;
    this.media = [];
    this.consentUri = null;
    this.pathology = null;
    this.created = new Date();
  }

  hasMedia() {
    return this.media.length > 0;
  }
  hasConsent() {
    return this.consentUri !== null;
  }
  hasPathology() {
    return this.pathology !== null;
  }

  toString() {
    const t = this.created;
    const paddedMinutes = ('0' + ('' + t.getMinutes())).slice(-2);
    const time = t.getHours() + 'h' + paddedMinutes;
    const date = t.getDate() + '/' + t.getMonth();
    const str = isToday(this.created) ? time : date + ' ' + time;
    return `Patient ${str}`;
  }
}
export interface Media {
  uri: string;
  filename: string;
  thumbnailUri: string;
  timestamp: Date;
  size: number;
}

export interface Pathology {
  pathology: string;
  hasUlcer: boolean;
}

export async function loadPatient(patientId: string): Promise<Patient> {
  const patient = new Patient(parseInt(patientId));
  const directory = FileSystem.documentDirectory + patientId;
  const filenames = await FileSystem.readDirectoryAsync(directory);
  const info = await FileSystem.getInfoAsync(directory);

  patient.created = new Date(info.modificationTime * 1000);

  if (filenames.indexOf(consentFilename) !== -1) {
    patient.consentUri = consentUri(patient);
  }

  if (filenames.indexOf(pathologyFilename) !== -1) {
    const pathUri = pathologyUri(patient);
    const content = await FileSystem.readAsStringAsync(pathUri);
    const data = JSON.parse(content);
    patient.pathology = {pathology: data.pathology, hasUlcer: data.hasUlcer};
  }

  if (filenames.indexOf('media') != -1) {
    const mediaDirectory = directory + '/media';
    const mediaFilenames = await FileSystem.readDirectoryAsync(mediaDirectory);
    for (const filename of mediaFilenames) {
      if (filename.endsWith('.mp4') || filename.endsWith('.mov')) {
        const thumbnailFilename = filename.slice(filename.length - 4) + '.jpg';
        const thumbnailUri =
          mediaFilenames.indexOf(thumbnailFilename) !== -1
            ? mediaDirectory + '/' + thumbnailFilename
            : null;
        const uri = `${mediaDirectory}/${filename}`;
        const info = await FileSystem.getInfoAsync(uri);
        const media = {
          filename: filename,
          uri: uri,
          thumbnailUri: thumbnailUri,
          timestamp: new Date(info.modificationTime),
          size: info.size,
        };
        patient.media.push(media);
      }
    }
  }

  return patient;
}
