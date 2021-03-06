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
import { StackActions } from "react-navigation";
import { useNavigation, useNavigationParam } from "react-navigation-hooks";
import { useState, useEffect } from "react";
import { RootState } from "./store";
import { addInfo } from "./store/patients/actions";
import { writeInfo } from "./utils";
import { getPatient } from "./store/patients/reducers";
import { Info, Questions } from "./store/patients/types";

interface QuestionsProps {
    addInfo: typeof addInfo;
    patient: Patient;
}

interface QuestionItem {
    id: number;
    question: string;
    key: string;
    value: boolean;
}

const QUESTIONS: QuestionItem[] = [
    { id: 0, question: "Démangeaisons ?", key: "itching", value: false },
    {
        id: 1,
        question: "Yeux collés au réveil ?",
        key: "morning_stuck_eyes",
        value: false
    },
    { id: 2, question: "Douleurs ?", key: "pain", value: false },
    {
        id: 3,
        question: "Baisse de vision ?",
        key: "impaired_vision",
        value: false
    },
    {
        id: 4,
        question: "Port de lentilles ?",
        key: "wears_lenses",
        value: false
    },
    { id: 5, question: "Bilatéral ?", key: "is_bilateral", value: false }
];

const defaultQuestions: Questions = {
    itching: false,
    morning_stuck_eyes: false,
    pain: false,
    impaired_vision: false,
    wears_lenses: false,
    is_bilateral: false
};

function QuestionsComponent(props: QuestionsProps) {
    const { patient, addInfo } = props;
    const filename = infoUri(patient);
    const navigation = useNavigation();

    const renderItem = ({ item }: { item: QuestionItem }) => {
        return (
            <View style={styles.item}>
                <Text style={styles.text}>{item.question}</Text>
                <Switch
                    // style={styles.switch}
                    value={item.value}
                    onValueChange={value => {
                        const info: Info = patient.info
                            ? { ...patient.info }
                            : {
                                  questions: null,
                                  pathology: null,
                                  inclusion: null
                              };
                        if (info.questions === null) {
                            info.questions = { ...defaultQuestions };
                        }
                        console.log("value", value);
                        info.questions[item.key] = value;
                        writeInfo(info, filename).then(() => {
                            addInfo(patient, info);
                        });
                    }}
                />
            </View>
        );
    };

    const data = QUESTIONS.map(item => {
        const question_item = { ...item };
        if (patient.info !== null && patient.info.questions !== null) {
            question_item.value = patient.info.questions[question_item.key];
        }
        return question_item;
    });

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
            />
        </View>
    );
}

QuestionsComponent.navigationOptions = ({ navigation }: NavigationParams) => {
    return {
        headerTitle: `Questions`,
        headerRight: () => {
            return <ValidateButton />;
        }
    };
};
export const QuestionsItem = connect(
    (state: RootState) => {
        const patient = getPatient(state.patients);
        return { patient };
    },
    { addInfo }
)(QuestionsComponent);

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
                            routeName: "PatientDetail"
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
        flex: 1
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
