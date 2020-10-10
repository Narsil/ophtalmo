import React from "react";
import * as FileSystem from "expo-file-system";
import { connect } from "react-redux";
import { Button, View, Text, Alert } from "react-native";
import { useEffect } from "react";
import { ProgressBar, Colors } from "react-native-paper";

import { store, RootState } from "./store";
import { Status } from "./store/server/types";
import { setServerStatus } from "./store/server/actions";
import {
    infoUri,
    Uuid,
    Patient,
    directory,
    Media,
} from "./store/patients/types";
import { deletedPatient, uploadedPatient } from "./store/patients/actions";

type Action = typeof setServerStatus;
interface Props {
    status: Status;
    server: string | null;
    patients: Map<Uuid, Patient>;
    setServerStatus: Action;
    deletedPatient: typeof deletedPatient;
}

const CHECK_PERIOD = 10 * 1000; // 10s

function checkServer(server: string | null, setServerStatus: Action) {
    if (server === null) {
        setServerStatus(Status.Online);
        return;
    }
    fetch(server)
        .then((resp) => {
            if (resp.status == 200) {
                setServerStatus(Status.Online);
            } else {
                setServerStatus(Status.Offline);
            }
        })
        .catch((err) => {
            console.log("Error", err);
            setServerStatus(Status.Offline);
        });
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function uploadFile(uri: string, patient: Patient, type: string) {
    const server = store.getState().server.server;
    if (server === null) {
        return;
    }

    const formData = new FormData();
    const toks = uri.split("/");
    const filename = toks[toks.length - 1];

    const file = ({ uri, name: filename, type } as unknown) as Blob;
    formData.append("file", file);
    formData.append("patient", patient.id);
    await fetch(server, {
        method: "POST",
        body: formData,
        headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
        },
    });
}

async function uploadPathology(patient: Patient) {
    if (patient.hasPathology()) {
        console.log("Uploading info");
        await uploadFile(infoUri(patient), patient, "application/json");
    }
}

async function uploadSingleMedia(patient: Patient, media: Media) {
    console.log(`Uploading media ${media.uri} ${media.filename}`);
    await uploadFile(media.uri, patient, "video/mp4");
}
async function uploadMedia(patient: Patient) {
    if (patient.hasMedia()) {
        await Promise.all(
            patient.media.map(async (medium) => {
                uploadSingleMedia(patient, medium);
            })
        );
    }
}

function isNewPatient(patient: Patient): boolean {
    return patient.created === null;
}

async function upload(patient: Patient) {
    console.log("Starting to upload", new Date());
    await Promise.all([uploadPathology(patient), uploadMedia(patient)]);
    console.log("Upload finished", new Date());
    store.dispatch(uploadedPatient(patient));
}

function checkUpload(patients: Patient[]) {
    const to_upload_patients = patients.filter((patient) => !patient.uploaded);
    if (to_upload_patients.length > 0) {
        setTimeout(() => {
            const patient = to_upload_patients[0];
            if (patient === undefined) {
                console.error("We found undefined patient to upload");
            }
            upload(patient);
        }, 100);
    }

    const uploaded = patients.length - to_upload_patients.length;
    const total = patients.length;
    const progress = uploaded / total;

    const msg = `Uploading ${uploaded} / ${total} patients`;
    return { progress, msg: msg };
}

export const UploaderComponent = (props: Props) => {
    const { patients, status, server, setServerStatus, deletedPatient } = props;
    const height = 40;

    useEffect(() => {
        if (status == Status.Loading) {
            checkServer(server, setServerStatus);
        } else {
            const interval = setInterval(() => {
                checkServer(server, setServerStatus);
            }, CHECK_PERIOD);
            return () => clearInterval(interval);
        }
    });

    if (status == Status.Offline || status == Status.Loading) {
        const color =
            status == Status.Offline
                ? "rgb(253, 236, 234)"
                : "rgb(255, 244, 229)";
        const text =
            status == Status.Offline
                ? "Serveur indisponible"
                : "Vérification du serveur";
        return (
            <View style={{ height: height, backgroundColor: color }}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Text>{text}</Text>
                </View>
            </View>
        );
    }
    // Status is Online here
    const upload_patients = Array.from(patients.values()).filter(
        (patient: Patient, index: number) => {
            return !isNewPatient(patient) || index != patients.size - 1;
        }
    );
    const isEmpty = upload_patients.length === 0;
    if (isEmpty) {
        return <></>;
    }
    const { progress, msg } = checkUpload(upload_patients);

    const cleanUploaded = () => {
        Alert.alert(
            "Suppression des fichiers",
            "Êtes-vous sûrs de vouloir supprimer les fichiers de ce téléphone (ils sont sauvegardés sur un autre serveur) ?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                },
                {
                    text: "OK",
                    onPress: () => {
                        // console.log('OK Pressed');
                        patients.forEach(
                            (patient: Patient, patientId: Uuid) => {
                                if (patient.uploaded) {
                                    FileSystem.deleteAsync(
                                        directory(patient)
                                    ).then(() => {
                                        deletedPatient(patient);
                                    });
                                }
                            }
                        );
                    },
                },
            ],
            { cancelable: false }
        );
    };
    const content =
        progress == 1 ? (
            <View
                style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Button
                    title="Vider les anciens patients"
                    onPress={cleanUploaded}
                />
            </View>
        ) : (
            <>
                <View>
                    <Text>{msg}</Text>
                </View>
                <ProgressBar progress={progress} color={Colors.red800} />
            </>
        );
    return <View style={{ height: height }}>{content}</View>;
};

export const Uploader = connect(
    (state: RootState) => {
        return {
            status: state.server.status,
            server: state.server.server,
            patients: state.patients.patients,
        };
    },
    { setServerStatus, deletedPatient }
)(UploaderComponent);
