import React from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    View,
} from "react-native";

import Animated, {
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";

import {
    Gesture,
    GestureDetector,
} from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

export default function Lesson10CombinedGestures() {

    // Pan
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const startX = useSharedValue(0);
    const startY = useSharedValue(0);

    // Scale
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    // Rotation
    const rotation = useSharedValue(0);
    const savedRotation = useSharedValue(0);

    // ---------------- PAN ----------------

    const panGesture = Gesture.Pan()

        .onStart(() => {
            startX.value = translateX.value;
            startY.value = translateY.value;
        })

        .onUpdate((event) => {
            translateX.value =
                startX.value + event.translationX;

            translateY.value =
                startY.value + event.translationY;
        });

    // ---------------- PINCH ----------------

    const pinchGesture = Gesture.Pinch()

        .onUpdate((event) => {
            scale.value =
                savedScale.value * event.scale;
        })

        .onEnd(() => {
            savedScale.value = scale.value;
        });

    // ---------------- ROTATION ----------------

    const rotationGesture = Gesture.Rotation()

        .onUpdate((event) => {
            rotation.value =
                savedRotation.value + event.rotation;
        })

        .onEnd(() => {
            savedRotation.value = rotation.value;
        });

    // Run all gestures together
    const gesture = Gesture.Simultaneous(
        panGesture,
        pinchGesture,
        rotationGesture
    );

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
                { rotateZ: `${rotation.value}rad` },
            ],
        };
    });

    return (
        <View style={styles.container}>
            <GestureDetector gesture={gesture}>
                <Animated.View style={animatedStyle}>
                    <Image
                        source={{
                            uri: "https://picsum.photos/300",
                        }}
                        style={styles.image}
                    />
                </Animated.View>
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

    image: {
        width: width - 60,
        height: 300,
        borderRadius: 20,
    },

});