import React from "react";
import { ListItem } from "./listitem";
import { Icon } from "react-native-elements";
import { Pathology, Patient, infoUri } from "./store/patients/types";
import * as FileSystem from "expo-file-system";
import {
    Button,
    Text,
    FlatList,
    StyleSheet,
    View,
    TouchableOpacity,
    Switch
} from "react-native";
import { NavigationParams } from "react-navigation";
import { connect } from "react-redux";
import { useNavigationParam } from "react-navigation-hooks";
import { useState, useEffect } from "react";
import { RootState } from "./store";
import { getPatient } from "./store/patients/reducers";
import { addInfo } from "./store/patients/actions";
import { Info } from "./store/patients/types";
import { writeInfo } from "./utils";

interface PathologyProps {
    patient: Patient;
    addInfo: typeof addInfo;
}
function PathologyComponent(props: PathologyProps) {
    const { addInfo, patient } = props;

    const pathology: Pathology = patient.info?.pathology || {
        pathology: "",
        hasUlcer: false
    };

    const filename = infoUri(patient);

    const data = [
        "Chalazion",
        "Blepharite",
        "Allergie",
        "Uvéite",
        "Conjonctivite allergique",
        "conjonctivite infectieuse",
        "Conjonctivite indéterminée",
        "Episclerite/sclérite",
        "Pingueculite",
        "Pterygion",
        "Hémorragie sous conjonctivale",
        "Abcès",
        "Endophtalmie",
        "Herpès/zona épithélia",
        "Uniquement ulcère",
        "Autre"
    ];
    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={data}
                renderItem={({ item }) => (
                    <ListItem
                        title={item}
                        renderIcon={() =>
                            item === pathology.pathology ? (
                                <Icon
                                    name="radio-button-checked"
                                    type="material"
                                />
                            ) : (
                                <Icon
                                    name="radio-button-unchecked"
                                    type="material"
                                />
                            )
                        }
                        onPress={() => {
                            const newPathology = {
                                pathology: item,
                                hasUlcer: pathology.hasUlcer
                            };
                            const defaultInfo = {
                                questions: null,
                                inclusion: null,
                                pathology: newPathology
                            };
                            const info: Info =
                                patient.info !== null
                                    ? {
                                          ...patient.info,
                                          pathology: newPathology
                                      }
                                    : defaultInfo;
                            writeInfo(info, filename).then(() => {
                                addInfo(patient, info);
                            });
                            // setUlcer(value);
                        }}
                    />
                )}
                keyExtractor={(item, index) => item.toString()}
            />
            <View
                style={{
                    height: 70,
                    padding: 5,
                    justifyContent: "center",
                    backgroundColor: "#fff",
                    borderTopColor: "#ccc",
                    borderTopWidth: 2
                }}
            >
                <TouchableOpacity
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignContent: "center"
                    }}
                    onPress={() => {
                        const newPathology = {
                            pathology: pathology.pathology,
                            hasUlcer: !pathology.hasUlcer
                        };
                        const defaultInfo = {
                            questions: null,
                            inclusion: null,
                            pathology: newPathology
                        };
                        const info: Info =
                            patient.info !== null
                                ? { ...patient.info, pathology: newPathology }
                                : defaultInfo;
                        writeInfo(info, filename).then(() => {
                            addInfo(patient, info);
                        });
                    }}
                >
                    <Text
                        style={{
                            flex: 1,
                            fontWeight: "bold",
                            fontSize: 24,
                            alignSelf: "center"
                        }}
                    >
                        Avec ulcère
                    </Text>
                    <Switch
                        style={{
                            alignSelf: "center"
                        }}
                        value={pathology.hasUlcer}
                        onValueChange={value => {
                            const newPathology = {
                                pathology: pathology.pathology,
                                hasUlcer: value
                            };
                            const defaultInfo = {
                                questions: null,
                                inclusion: null,
                                pathology: newPathology
                            };
                            const info: Info =
                                patient.info !== null
                                    ? {
                                          ...patient.info,
                                          pathology: newPathology
                                      }
                                    : defaultInfo;
                            writeInfo(info, filename).then(() => {
                                addInfo(patient, info);
                            });
                        }}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}
PathologyComponent.navigationOptions = ({ navigation }: NavigationParams) => {
    return {
        headerTitle: "Pathologie",
        headerRight: () => {
            return (
                <TouchableOpacity
                    style={{ justifyContent: "center", margin: 10 }}
                    onPress={() => {
                        navigation.goBack();
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
            );
        }
    };
};

export const PathologyDetail = connect(
    (state: RootState) => {
        return {
            patient: getPatient(state.patients)
        };
    },
    { addInfo }
)(PathologyComponent);
