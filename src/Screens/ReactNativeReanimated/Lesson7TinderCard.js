import React from "react";
import {
    Alert,
    Dimensions,
    Image,
    StyleSheet,
    Text,
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

const SWIPE_THRESHOLD = width * 0.35;

export default function Lesson7TinderCard() {
    const translateX = useSharedValue(0);
    const startX = useSharedValue(0);

    const showResult = (text) => {
        Alert.alert(text);
    };

    const gesture = Gesture.Pan()

        .onStart(() => {
            startX.value = translateX.value;
        })

        .onUpdate((event) => {
            translateX.value = startX.value + event.translationX;
        })

        .onEnd((event) => {

            if (
                translateX.value > SWIPE_THRESHOLD ||
                event.velocityX > 900
            ) {

                translateX.value = withTiming(width + 200);

                runOnJS(showResult)("Liked ❤️");

                return;
            }

            if (
                translateX.value < -SWIPE_THRESHOLD ||
                event.velocityX < -900
            ) {

                translateX.value = withTiming(-(width + 200));

                runOnJS(showResult)("Rejected 👎");

                return;
            }

            translateX.value = withSpring(0);

        });

    const cardStyle = useAnimatedStyle(() => {

        const rotate = interpolate(
            translateX.value,
            [-width, 0, width],
            [-20, 0, 20]
        );

        return {
            transform: [
                {
                    translateX: translateX.value,
                },
                {
                    rotate: `${rotate}deg`,
                },
            ],
        };
    });

    const likeStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            translateX.value,
            [0, width / 4],
            [0, 1]
        ),
    }));

    const nopeStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            translateX.value,
            [-width / 4, 0],
            [1, 0]
        ),
    }));

    return (
        <>
            <Animated.Text
                style={[styles.like, likeStyle]}
            >
                LIKE 👍
            </Animated.Text>

            <Animated.Text
                style={[styles.nope, nopeStyle]}
            >
                NOPE 👎
            </Animated.Text>

            <GestureDetector gesture={gesture}>
                <Animated.View
                    style={[styles.card, cardStyle]}
                >
                    <Image
                        source={{
                            uri: "https://picsum.photos/300/400",
                        }}
                        style={styles.image}
                    />

                    <Text style={styles.name}>
                        Alex, 25
                    </Text>

                    <Text style={styles.bio}>
                        Loves React Native ❤️
                    </Text>

                </Animated.View>
            </GestureDetector>
        </>
    );
}

const styles = StyleSheet.create({

    card: {
        width: 320,
        height: 480,
        backgroundColor: "#FFF",
        alignSelf: "center",
        marginTop: 40,
        borderRadius: 25,
        overflow: "hidden",
        elevation: 10,
    },

    image: {
        width: "100%",
        height: 350,
    },

    name: {
        fontSize: 28,
        fontWeight: "700",
        marginTop: 20,
        marginLeft: 20,
    },

    bio: {
        marginLeft: 20,
        marginTop: 8,
        color: "#666",
        fontSize: 16,
    },

    like: {
        position: "absolute",
        top: 80,
        left: 40,
        fontSize: 34,
        color: "green",
        fontWeight: "700",
        zIndex: 100,
    },

    nope: {
        position: "absolute",
        top: 80,
        right: 40,
        fontSize: 34,
        color: "red",
        fontWeight: "700",
        zIndex: 100,
    },

});