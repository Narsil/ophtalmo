import React from "react";
import { Icon } from "react-native-elements";
import { Patient, infoUri } from "./store/patients/types";
import { connect } from "react-redux";
import * as FileSystem from "expo-file-system";
import { NavigationParams } from "react-navigation";
import {
    Button,
    Text,
    FlatList,
    StyleSheet,
    View,
    TouchableOpacity,
    Switch,
    Image
} from "react-native";
import { TextInput } from "react-native-paper";
import { StackActions } from "react-navigation";
import { useNavigation, useNavigationParam } from "react-navigation-hooks";
import { useState, useEffect } from "react";
import { RootState } from "./store";
import { addInfo } from "./store/patients/actions";
import { writeInfo } from "./utils";
import { getPatient } from "./store/patients/reducers";
import { Inclusion, Info } from "./store/patients/types";

interface InclusionsProps {
    addInfo: typeof addInfo;
    patient: Patient;
}

function InclusionsComponent(props: InclusionsProps) {
    const { patient, addInfo } = props;
    const filename = infoUri(patient);
    const navigation = useNavigation();

    const inclusion_number = patient?.info?.inclusion?.inclusion_number || "";
    const accepted: boolean = patient?.info?.inclusion?.accepted || false;

    return (
        <View style={styles.container}>
            <Text></Text>
            <TextInput
                label="Numéro d'inclusion"
                value={inclusion_number}
                style={{ minWidth: 100 }}
                onChangeText={text => {
                    const info: Info = patient.info
                        ? { ...patient.info }
                        : {
                              questions: null,
                              pathology: null,
                              inclusion: { inclusion_number, accepted }
                          };
                    info.inclusion = { inclusion_number: text, accepted };
                    writeInfo(info, filename).then(() => {
                        addInfo(patient, info);
                    });
                }}
                mode="outlined"
            />
            <Text style={{ marginTop: 50 }}>
                J’accepte l’utilisation des images et données recueillies dans
                le cadre des études ultérieures de perfectionnement de cet
                algorithme
            </Text>
            <Switch
                value={accepted}
                onValueChange={value => {
                    const info: Info = patient.info
                        ? { ...patient.info }
                        : {
                              questions: null,
                              pathology: null,
                              inclusion: { inclusion_number, accepted }
                          };
                    info.inclusion = { inclusion_number, accepted: value };
                    writeInfo(info, filename).then(() => {
                        addInfo(patient, info);
                    });
                }}
            />
        </View>
    );
}

InclusionsComponent.navigationOptions = ({ navigation }: NavigationParams) => {
    return {
        headerTitle: `Inclusion`,
        headerRight: () => {
            return <ValidateButton />;
        }
    };
};
export const InclusionItem = connect(
    (state: RootState) => {
        const patient = getPatient(state.patients);
        return { patient };
    },
    { addInfo }
)(InclusionsComponent);

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
                            routeName: "Questions"
                        })
                    );
                }}
            >
                <Text
                    style={{
                        fontSize: 24
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
        margin: 50
    },
    item: {
        padding: 5,
        height: 70,
        flex: 1,
        flexDirection: "row",
        borderBottomColor: "#ccc",
        borderBottomWidth: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    text: {
        flex: 1,
        fontSize: 20
    }
});
