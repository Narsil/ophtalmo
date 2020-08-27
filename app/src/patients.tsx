import React from "react";
import { Patient, loadPatient } from "./store/patients/types";
import { AppLoading } from "expo";
import * as FileSystem from "expo-file-system";
import { useNavigation, useNavigationParam } from "react-navigation-hooks";
import { Button, Text, FlatList, StyleSheet, View } from "react-native";

import { Uploader } from "./uploader";

// Necessary to import getRandomValues in react.
// import 'react-native-get-random-values';
// import {v4 as uuidv4} from 'uuid';
// TODO: Waiting on expo to implement correct getRandomValues
// https://github.com/expo/expo/issues/7209
// https://github.com/ai/nanoid/issues/207
// Instead for now taking solution from https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (
        c
    ) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

import { Icon } from "react-native-elements";
import { connect } from "react-redux";
import { Container } from "native-base";

import { RootState } from "./store";
import { ListItem } from "./listitem";
import { Uuid } from "./store/patients/types";
import {
    addPatient,
    setReady,
    navigatePatient
} from "./store/patients/actions";
import { Thumbnail } from "./thumbnail";

interface PatientProps {
    patients: Map<Uuid, Patient>;
    ready: boolean;
    setReady: (patients: Map<Uuid, Patient>) => void;
    addPatient: any;
    navigatePatient: any;
}
export const PatientsComponent = (props: PatientProps) => {
    const { patients, ready, setReady, addPatient, navigatePatient } = props;
    if (!ready) {
        return (
            <AppLoading
                startAsync={() => {
                    return FileSystem.readDirectoryAsync(
                        FileSystem.documentDirectory!
                    ).then(patientIds => {
                        Promise.all(patientIds.map(loadPatient)).then(
                            patients => {
                                setReady(
                                    new Map<Uuid, Patient>(
                                        patients.map(patient => [
                                            patient.id,
                                            patient
                                        ])
                                    )
                                );
                            }
                        );
                    });
                }}
                onFinish={() => {}}
                onError={console.warn}
            />
        );
    }

    const { navigate } = useNavigation();
    const renderItem = ({ item }: { item: Patient }) => {
        const patient = item;
        return (
            <ListItem
                title={patient.toString()}
                // description={`Patient ${patient.id}`}
                renderButton={() => {
                    return (
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "center"
                            }}
                        >
                            <Icon
                                iconStyle={{ margin: 10 }}
                                name="edit"
                                type="antdesign"
                                color={patient.hasPathology() ? "#0c0" : "#c00"}
                            />
                        </View>
                    );
                }}
                renderIcon={() => {
                    if (patient.hasMedia()) {
                        return (
                            <View style={{ flex: 1 }}>
                                <Thumbnail
                                    style={{
                                        height: 60,
                                        width: 60,
                                        flex: 1,
                                        margin: 5
                                    }}
                                    source={{ uri: patient.media[0].uri }}
                                />
                            </View>
                        );
                    } else {
                        return (
                            <View
                                style={{
                                    height: 60,
                                    width: 60,
                                    flex: 1,
                                    margin: 5,
                                    alignContent: "center",
                                    justifyContent: "center"
                                }}
                            >
                                <Icon
                                    name="video-camera"
                                    type="font-awesome"
                                    color="#aaa"
                                />
                            </View>
                        );
                    }
                }}
                onPress={() => {
                    navigatePatient(patient);
                    navigate("PatientDetail");
                }}
            />
        );
    };
    const questionsPatients = Array.from(patients.values())
        .filter(patient => patient.hasQuestions())
        .sort((a, b) =>
            b.created === null || a.created === null
                ? 1
                : b.created.getTime() - a.created.getTime()
        );

    return (
        <Container>
            <FlatList<Patient>
                data={questionsPatients}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id.toString()}
            />
            <Uploader />
        </Container>
    );
};
PatientsComponent.navigationOptions = () => {
    return {
        headerTitle: "Patients",
        headerRight: () => (
            <>
                <SettingsButton />
                <CAddPatientButton />
            </>
        )
    };
};

const SettingsButton = () => {
    const { navigate } = useNavigation();
    return (
        <Icon
            iconStyle={{ margin: 10 }}
            name="setting"
            type="antdesign"
            onPress={() => {
                navigate("Settings");
            }}
        />
    );
};

export const Patients = connect(
    (state: RootState) => {
        return {
            patients: state.patients.patients,
            ready: state.patients.ready
        };
    },
    { setReady, navigatePatient }
)(PatientsComponent);

interface AddPatientButtonProps {
    addPatient: typeof addPatient;
}

const AddPatientButton = (props: AddPatientButtonProps) => {
    const { navigate } = useNavigation();
    const { addPatient } = props;
    return (
        <Icon
            iconStyle={{ margin: 10 }}
            name="plus"
            type="antdesign"
            onPress={() => {
                const newPatientId = uuidv4();
                // console.log('New patient id', newPatientId);
                const newPatientDir = `${FileSystem.documentDirectory}/${newPatientId}`;
                const patient = new Patient(newPatientId);
                patient.created = new Date();
                FileSystem.makeDirectoryAsync(newPatientDir).then(() => {
                    addPatient(patient);
                    navigate("Questions");
                });
            }}
        />
    );
};
const CAddPatientButton = connect(undefined, { addPatient })(AddPatientButton);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    }
});
