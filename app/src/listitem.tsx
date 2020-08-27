import React from "react";
import { StyleSheet } from "react-native";
import { View, TouchableOpacity, Text } from "react-native";

interface ListProps {
    title: string;
    description?: string;
    renderIcon?: any;
    renderButton?: any;
    onPress?: any;
}

export function ListItem(props: ListProps) {
    return (
        <TouchableOpacity onPress={props.onPress} style={styles.listElement}>
            {props.renderIcon && (
                <View style={styles.icon}>{props.renderIcon()}</View>
            )}
            <View style={styles.content}>
                <View>
                    <Text style={styles.title}>{props.title}</Text>
                </View>
                {props.description && (
                    <View>
                        <Text>{props.description}</Text>
                    </View>
                )}
            </View>
            {props.renderButton && (
                <View style={styles.button}>{props.renderButton()}</View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    listElement: {
        padding: 5,
        height: 70,
        flex: 1,
        flexDirection: "row",
        borderBottomColor: "#ccc",
        borderBottomWidth: 1
    },
    content: {
        justifyContent: "center",
        flex: 1
    },
    title: {
        fontWeight: "bold",
        fontSize: 24
    },
    icon: {
        justifyContent: "center"
    },
    button: {
        justifyContent: "center"
    }
});
