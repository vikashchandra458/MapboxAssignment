import React from "react";
import {
    View,
    Text,
    StyleSheet,
} from "react-native";

const SecurityOverlay = () => {
    console.log("SecurityOverlay Rendered");
    console.log("******** SecurityOverlay Rendered ********");

    return (
        <View
            pointerEvents="none"
            style={styles.container}
        >
            <Text style={styles.title}>
                Recording Detected
            </Text>

            <Text style={styles.subtitle}>
                Sensitive information has been hidden.
            </Text>
        </View>
    );
};

export default SecurityOverlay;

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
    },

    title: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
    },

    subtitle: {
        color: "#ccc",
        fontSize: 16,
        marginTop: 10,
    },
});