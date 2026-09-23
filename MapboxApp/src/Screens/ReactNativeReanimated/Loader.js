import React from "react";
import { StyleSheet, View } from "react-native";

import Animated, {
    useAnimatedStyle,
    useFrameCallback,
    useSharedValue,
} from "react-native-reanimated";

export default function Loader({ numberOfBars = 20 }) {
    const progress = useSharedValue(0);

    useFrameCallback((frame) => {
        const delta = frame.timeSincePreviousFrame ?? 0;

        progress.value += (delta / 1000) * 5;

        if (progress.value >= Math.PI * 2) {
            progress.value -= Math.PI * 2;
        }
    });

    const phase = (2 * Math.PI) / numberOfBars;

    return (
        <View style={styles.container}>
            {Array.from({ length: numberOfBars }, (_, index) => (
                <Bar
                    key={index}
                    progress={progress}
                    phase={phase * index}
                />
            ))}
        </View>
    );
}

function Bar({ progress, phase }) {
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scaleY:
                    0.6 +
                    ((Math.sin(progress.value + phase) + 1) / 2) * 0.4,
            },
        ],
    }));

    return <Animated.View style={[styles.bar, animatedStyle]} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    bar: {
        width: 6,
        height: 30,
        marginHorizontal: 5,
        borderRadius: 10,
        backgroundColor: "#168C99",
    },
});