import React from "react";
import { Icon } from "react-native-elements";
import { Patient, infoUri } from "./store/patients/types";
import { connect } from "react-redux";
import * as FileSystem from "expo-file-system";
import { NavigationParams } from "react-navigation";
import {
    Button,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    View,
    TouchableOpacity,
    Switch,
    Image,
} from "react-native";
import { StackActions } from "react-navigation";
import { useNavigation, useNavigationParam } from "react-navigation-hooks";
import { useState, useEffect } from "react";
import { RootState } from "./store";
import { addInfo } from "./store/patients/actions";
import { writeInfo } from "./utils";
import { getPatient } from "./store/patients/reducers";
import { Inclusion } from "./store/patients/types";

interface InclusionProps {
    addInfo: (patient: Patient, uri: string) => void;
    patient: Patient;
}

function default_inclusion(): Inclusion {
    return {
        inclusion_number: "",
        accepted: false,
    };
}

function InclusionComponent(props: InclusionProps) {
    const { patient, addInfo } = props;
    const filename = infoUri(patient);
    const navigation = useNavigation();

    const inclusion = patient.info?.inclusion;
    const inclusion_number: string =
        inclusion != null ? inclusion.inclusion_number : "e23";
    const accepted: boolean = inclusion != null ? inclusion.accepted : false;

    return (
        <View style={styles.container}>
            <View>
                <TextInput
                    value={inclusion_number}
                    onChangeText={(value) => {
                        const info = patient.info
                            ? { ...patient.info }
                            : {
                                  questions: null,
                                  pathology: null,
                                  inclusion: default_inclusion(),
                              };
                        if (info.inclusion === null) {
                            info.inclusion = default_inclusion();
                        }
                        info.inclusion.inclusion_number = value;
                        writeInfo(info, filename).then(() => {
                            addInfo(patient, info);
                        });
                    }}
                />
            </View>
            <View>
                <Text>
                    J’accepte l’utilisation des images et données recueillies
                    dans le cadre des études ultérieures de perfectionnement de
                    cet algorithme
                </Text>
                <Switch
                    style={styles.switch}
                    value={accepted}
                    onValueChange={(value) => {
                        const info = patient.info
                            ? { ...patient.info }
                            : {
                                  inclusion: {
                                      inclusion_number: 0,
                                      accepted: false,
                                  },
                                  questions: null,
                                  pathology: null,
                              };
                        if (info.inclusion === null) {
                            info.inclusion = default_inclusion();
                        }
                        info.inclusion.accepted = value;
                        writeInfo(info, filename).then(() => {
                            addInfo(patient, info);
                        });
                    }}
                />
            </View>
        </View>
    );
}

InclusionComponent.navigationOptions = ({ navigation }: NavigationParams) => {
    return {
        headerTitle: `Inclusion`,
        headerRight: () => {
            return <ValidateButton />;
        },
    };
};
export const InclusionItem = connect(
    (state: RootState) => {
        const patient = getPatient(state.patients);
        return { patient };
    },
    { addInfo }
)(InclusionComponent);

const ValidateButtonComponent = (props: { patient: Patient }) => {
    const { patient } = props;
    const navigation = useNavigation();
    return (
        <>
            <TouchableOpacity
                style={{ justifyContent: "center", margin: 10 }}
                onPress={() => {
                    navigation.dispatch(
                        StackActions.replace({
                            routeName: "PatientDetail",
                        })
                    );
                    if (!patient.hasMedia()) {
                        navigation.dispatch(
                            StackActions.push({ routeName: "AddVideo" })
                        );
                    }
                }}
            >
                <Text
                    style={{
                        fontSize: 24,
                    }}
                >
                    Ok
                </Text>
            </TouchableOpacity>
        </>
    );
};
export const ValidateButton = connect((state: RootState) => {
    const patient = getPatient(state.patients);
    return { patient };
})(ValidateButtonComponent);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    item: {
        padding: 5,
        height: 70,
        flex: 1,
        flexDirection: "row",
        borderBottomColor: "#ccc",
        borderBottomWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        flex: 1,
        fontSize: 20,
    },
});
