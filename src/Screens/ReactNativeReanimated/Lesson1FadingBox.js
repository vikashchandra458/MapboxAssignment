import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

export default function Lesson1FadingBox() {
    // Shared value controls the opacity.
    const opacity = useSharedValue(1);

    // Animated style that reacts to opacity changes.
    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    const toggleFade = () => {
        opacity.value = withTiming(opacity.value === 1 ? 0 : 1, {
            duration: 800,
        });
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.box, animatedStyle]} />

            <TouchableOpacity
                style={styles.button}
                onPress={toggleFade}
            >
                <Text style={styles.buttonText}>Fade In / Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },

    box: {
        width: 150,
        height: 150,
        borderRadius: 16,
        backgroundColor: "#4CAF50",
        marginBottom: 30,
    },

    button: {
        backgroundColor: "#1976D2",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },

    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});