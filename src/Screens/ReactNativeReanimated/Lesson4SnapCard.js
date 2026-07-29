import React from "react";
import { Dimensions, StyleSheet, Text } from "react-native";

import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import {
    Gesture,
    GestureDetector,
} from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

const CARD_WIDTH = 180;
const CARD_HEIGHT = 100;

export default function Lesson4SnapCard() {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const startX = useSharedValue(0);
    const startY = useSharedValue(0);

    const panGesture = Gesture.Pan()

        .onStart(() => {
            startX.value = translateX.value;
            startY.value = translateY.value;
        })

        .onUpdate((event) => {
            translateX.value = startX.value + event.translationX;
            translateY.value = startY.value + event.translationY;
        })

        .onEnd(() => {
            const centerX = translateX.value + CARD_WIDTH / 2;

            const screenCenter = width / 2;

            if (centerX < screenCenter) {
                translateX.value = withSpring(-100);
            } else {
                translateX.value = withSpring(width - CARD_WIDTH - 40);
            }
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        };
    });

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.card, animatedStyle]}>
                <Text style={styles.text}>Drag Me</Text>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: "#2563EB",
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 250,
        alignSelf: "center",
        elevation: 8,
    },

    text: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
    },
});