import React from "react";
import { NavigationParams } from "react-navigation";
import * as FileSystem from "expo-file-system";
import { connect } from "react-redux";
import { RootState } from "./store";
import { changeServer } from "./store/server/actions";
import {
    Button,
    Text,
    FlatList,
    StyleSheet,
    View,
    TouchableOpacity,
    Switch
} from "react-native";
import { TextInput } from "react-native-paper";

interface Props {
    server: string | null;
    changeServer: typeof changeServer;
}

const SettingsComponent = (props: Props) => {
    const { server, changeServer } = props;
    const serverName = server == null ? "" : server;
    return (
        <View style={{ flex: 1, alignItems: "center" }}>
            <View style={{ height: 50, margin: 20, padding: 10 }}>
                <TextInput
                    label="Adresse du Serveur"
                    value={serverName}
                    style={{ minWidth: 200 }}
                    onChangeText={text => {
                        const filename = `${FileSystem.documentDirectory!}settings.json`;
                        console.log(`Writing settings in ${filename}`);
                        FileSystem.writeAsStringAsync(
                            filename,
                            JSON.stringify({
                                server: text
                            })
                        );
                        changeServer(text);
                    }}
                    mode="outlined"
                />
            </View>
        </View>
    );
};

export const Settings = connect(
    (state: RootState) => {
        return state.server;
    },
    { changeServer }
)(SettingsComponent);

SettingsComponent.navigationOptions = ({ navigation }: NavigationParams) => {
    return {
        headerTitle: `Settings`
    };
};
