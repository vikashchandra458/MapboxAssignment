import React from "react";
import {
    Alert,
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native";

import Animated, {
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

import {
    Gesture,
    GestureDetector,
} from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

const CARD_WIDTH = width - 40;
const CARD_HEIGHT = 95;

const ACTION_WIDTH = 130;
const DELETE_THRESHOLD = -110;

export default function Lesson5SwipeDelete() {
    const translateX = useSharedValue(0);
    const startX = useSharedValue(0);
    const rowHeight = useSharedValue(CARD_HEIGHT);
    const opacity = useSharedValue(1);

    const onDelete = () => {
        opacity.value = withTiming(0, {
            duration: 250,
        });

        rowHeight.value = withTiming(0, {
            duration: 250,
        });

        setTimeout(() => {
            rowHeight.value = withTiming(CARD_HEIGHT);
            opacity.value = withTiming(1);
            translateX.value = 0;
        }, 200);
    };

    const panGesture = Gesture.Pan()

        .onBegin(() => {
            startX.value = translateX.value;
        })

        .onUpdate((event) => {
            let x = startX.value + event.translationX;

            // Don't allow swipe right
            if (x > 0) {
                x = 0;
            }

            // Rubber band after max distance
            if (x < -ACTION_WIDTH) {
                const extra = x + ACTION_WIDTH;
                x = -ACTION_WIDTH + extra * 0.25;
            }

            translateX.value = x;
        })

        .onFinalize(() => {
            if (translateX.value < DELETE_THRESHOLD) {
                translateX.value = withTiming(
                    -CARD_WIDTH,
                    {
                        duration: 300,
                    },
                    (finished) => {
                        if (finished) {
                            runOnJS(onDelete)();
                        }
                    }
                );
            } else {
                translateX.value = withSpring(0, {
                    damping: 15,
                    stiffness: 180,
                });
            }
        });

    const cardStyle = useAnimatedStyle(() => {
        return {
            height: rowHeight.value,
            opacity: opacity.value,
            transform: [
                {
                    translateX: translateX.value,
                },
            ],
        };
    });
    const deleteStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(
                translateX.value,
                [-ACTION_WIDTH, -10],
                [1, 0]
            ),

            transform: [
                {
                    translateX: interpolate(
                        translateX.value,
                        [-ACTION_WIDTH, 0],
                        [0, 45]
                    ),
                },
                {
                    scale: interpolate(
                        translateX.value,
                        [-ACTION_WIDTH, 0],
                        [1, 0.6]
                    ),
                },
                {
                    rotate: `${interpolate(
                        translateX.value,
                        [-ACTION_WIDTH, 0],
                        [0, 25]
                    )}deg`,
                },
            ],
        };
    });

    return (
        <View style={styles.container}>
            {/* Delete Background */}

            <View style={styles.deleteContainer}>
                <Animated.View style={[styles.deleteContent, deleteStyle]}>
                    <Text style={styles.icon}>🗑️</Text>

                    <Text style={styles.deleteText}>
                        Delete
                    </Text>
                </Animated.View>
            </View>

            {/* Swipe Card */}

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.card, cardStyle]}>
                    <View style={styles.iconCircle}>
                        <Text style={styles.mail}>📩</Text>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title}>
                            Swipe Left
                        </Text>

                        <Text style={styles.subtitle}>
                            Swipe to reveal delete action
                        </Text>
                    </View>

                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            NEW
                        </Text>
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 50,
        alignItems: "center",
        justifyContent: "center",
    },

    deleteContainer: {
        position: "absolute",

        width: CARD_WIDTH,
        height: CARD_HEIGHT,

        backgroundColor: "#EF4444",

        borderRadius: 24,

        justifyContent: "center",

        alignItems: "flex-end",

        paddingRight: 28,
    },

    deleteContent: {
        flexDirection: "row",
        alignItems: "center",
    },

    icon: {
        fontSize: 26,
        marginRight: 10,
    },

    deleteText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 20,
    },

    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,

        backgroundColor: "#2563EB",

        borderRadius: 24,

        flexDirection: "row",

        alignItems: "center",

        paddingHorizontal: 18,

        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOpacity: 0.18,
                shadowRadius: 12,
                shadowOffset: {
                    width: 0,
                    height: 8,
                },
            },

            android: {
                elevation: 10,
            },
        }),
    },

    iconCircle: {
        width: 54,
        height: 54,

        borderRadius: 27,

        backgroundColor: "#FFFFFF20",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 15,
    },

    mail: {
        fontSize: 24,
    },

    content: {
        flex: 1,
    },

    title: {
        color: "#fff",
        fontSize: 21,
        fontWeight: "700",
    },

    subtitle: {
        color: "#DBEAFE",
        marginTop: 4,
        fontSize: 15,
    },

    badge: {
        backgroundColor: "#FFFFFF25",

        paddingHorizontal: 10,
        paddingVertical: 5,

        borderRadius: 12,
    },

    badgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },
});