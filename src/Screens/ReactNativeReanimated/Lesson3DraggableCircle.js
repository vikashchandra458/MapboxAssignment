import React from "react";
import { StyleSheet, View } from "react-native";

import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import {
    Gesture,
    GestureDetector,
} from "react-native-gesture-handler";

export default function Lesson3DraggableCircle() {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const startX = useSharedValue(0);
    const startY = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .onBegin(() => {
            startX.value = translateX.value;
            startY.value = translateY.value;
        })
        .onUpdate((event) => {
            translateX.value = startX.value + event.translationX;
            translateY.value = startY.value + event.translationY;
        })
        .onFinalize(() => {
            translateX.value = withSpring(0, {
                damping: 12,
                stiffness: 120,
            });

            translateY.value = withSpring(0, {
                damping: 12,
                stiffness: 120,
            });
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: translateX.value,
                },
                {
                    translateY: translateY.value,
                },
            ],
        };
    });

    return (
        <View style={styles.container}>
            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[styles.circle, animatedStyle]}
                />
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    circle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#2563EB",
    },
});