import React from "react";
import {
    StyleSheet,
    Text,
    Pressable,
} from "react-native";

import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Lesson2ScaleCard() {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: scale.value,
                },
            ],
        };
    });

    const onPressIn = () => {
        scale.value = withSpring(0.92);
    };

    const onPressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <AnimatedPressable
            style={[styles.card, animatedStyle]}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
        >
            <Text style={styles.title}>Scale Card</Text>

            <Text style={styles.subtitle}>
                Press and Hold Me
            </Text>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 280,
        height: 180,
        backgroundColor: "#2563EB",
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginTop: 80,
        elevation: 8,
    },

    title: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "700",
    },

    subtitle: {
        color: "#E5E7EB",
        marginTop: 10,
        fontSize: 16,
    },
});