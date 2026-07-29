import React from "react";
import {
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import {
    Gesture,
    GestureDetector,
} from "react-native-gesture-handler";

const { height } = Dimensions.get("window");

const SHEET_HEIGHT = height * 0.7;

// Hidden Position
const CLOSED = SHEET_HEIGHT;

// Visible Position
const OPEN = 0;

export default function Lesson6BottomSheet() {
    const translateY = useSharedValue(CLOSED);

    const startY = useSharedValue(0);

    const panGesture = Gesture.Pan()

        .onStart(() => {
            startY.value = translateY.value;
        })

        .onUpdate((event) => {
            let nextY = startY.value + event.translationY;

            // Clamp value
            if (nextY < OPEN) {
                nextY = OPEN;
            }

            if (nextY > CLOSED) {
                nextY = CLOSED;
            }

            translateY.value = nextY;
        })

        .onEnd(() => {
            if (translateY.value < SHEET_HEIGHT / 2) {
                translateY.value = withSpring(OPEN);
            } else {
                translateY.value = withSpring(CLOSED);
            }
        });

    const sheetStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: translateY.value,
                },
            ],
        };
    });

    const backdropStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(
                translateY.value,
                [CLOSED, OPEN],
                [0, 0.5]
            ),
        };
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Bottom Sheet Example
            </Text>

            {/* Open Button */}

            <Pressable
                style={styles.button}
                onPress={() => {
                    translateY.value = withSpring(OPEN);
                }}
            >
                <Text style={styles.buttonText}>
                    Open Bottom Sheet
                </Text>
            </Pressable>

            {/* Backdrop */}

            <Animated.View
                pointerEvents="none"
                style={[
                    styles.backdrop,
                    backdropStyle,
                ]}
            />

            {/* Bottom Sheet */}

            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[styles.sheet, sheetStyle]}
                >
                    <View style={styles.handle} />

                    <Text style={styles.heading}>
                        Lesson 6
                    </Text>

                    <Text style={styles.description}>
                        Drag me down to close.
                    </Text>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
    },

    title: {
        fontSize: 22,
        fontWeight: "700",
    },

    button: {
        marginTop: 20,
        backgroundColor: "#2563EB",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
    },

    buttonText: {
        color: "#fff",
        fontWeight: "700",
    },

    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#000",
    },

    sheet: {
        position: "absolute",
        bottom: -SHEET_HEIGHT,
        width: "100%",
        height: SHEET_HEIGHT,
        backgroundColor: "#FFF",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingTop: 15,
        alignItems: "center",
        elevation: 10,
    },

    handle: {
        width: 70,
        height: 6,
        borderRadius: 4,
        backgroundColor: "#CCC",
        marginBottom: 20,
    },

    heading: {
        fontSize: 26,
        fontWeight: "700",
    },

    description: {
        marginTop: 15,
        fontSize: 18,
        color: "#666",
    },
});