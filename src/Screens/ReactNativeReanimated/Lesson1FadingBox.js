import React, { useState } from "react";
import {
    FlatList,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import Animated, {
    cancelAnimation,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

import {
    animations,
    animationProperties,
} from "./AnimatedLessonsArray";

import { styles } from "./AnimatedStyles";

const DEFAULT_DURATION = "800";
const DEFAULT_REPEAT = "20";

export default function Lesson1AnimatedBox() {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const rotate = useSharedValue(0);
    const width = useSharedValue(120);
    const height = useSharedValue(120);
    const borderRadius = useSharedValue(12);
    const opacity = useSharedValue(1);

    const [property, setProperty] = useState("Opacity");
    const [duration, setDuration] = useState(DEFAULT_DURATION);
    const [repeatTimes, setRepeatTimes] = useState(DEFAULT_REPEAT);
    const [mode, setMode] = useState("repeat");
    const [selectedItem, setSelectedItem] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            width: width.value,
            height: height.value,
            borderRadius: borderRadius.value,
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
                { rotate: `${rotate.value}deg` },
            ],
        };
    });

    const resetValues = () => {
        translateX.value = 0;
        translateY.value = 0;
        scale.value = 1;
        rotate.value = 0;
        width.value = 120;
        height.value = 120;
        borderRadius.value = 12;
        opacity.value = 1;
    };

    const clearSelection = () => {
        setSelectedItem(null);
        setIsRunning(false);
        resetValues();
    };

    const animateValue = (
        sharedValue,
        toValue,
        config
    ) => {
        if (mode === "repeat") {
            const animation = withTiming(
                toValue,
                config
            );

            sharedValue.value = withRepeat(
                animation,
                Number(repeatTimes) ||
                Number(DEFAULT_REPEAT),
                true,
                (finished) => {
                    "worklet";

                    if (!finished) {
                        return;
                    }

                    runOnJS(clearSelection)();
                }
            );

            return;
        }

        sharedValue.value = withTiming(
            toValue,
            config,
            (finished) => {
                "worklet";

                if (!finished) {
                    return;
                }

                runOnJS(clearSelection)();
            }
        );
    };

    const startAnimation = () => {
        if (!selectedItem) return;

        setIsRunning(true);

        const config = {
            duration: Number(duration),
            easing: selectedItem.easing,
        };

        switch (property) {
            case "TranslateX":
                animateValue(
                    translateX,
                    translateX.value === 0 ? 150 : 0,
                    config
                );
                break;

            case "TranslateY":
                animateValue(
                    translateY,
                    translateY.value === 0 ? 150 : 0,
                    config
                );
                break;

            case "Scale":
                animateValue(
                    scale,
                    scale.value === 1 ? 2 : 1,
                    config
                );
                break;

            case "Rotate":
                animateValue(
                    rotate,
                    rotate.value === 0 ? 360 : 0,
                    config
                );
                break;

            case "Width":
                animateValue(
                    width,
                    width.value === 120 ? 220 : 120,
                    config
                );
                break;

            case "Height":
                animateValue(
                    height,
                    height.value === 120 ? 220 : 120,
                    config
                );
                break;

            case "BorderRadius":
                animateValue(
                    borderRadius,
                    borderRadius.value === 12 ? 60 : 12,
                    config
                );
                break;

            case "Opacity":
            default:
                animateValue(
                    opacity,
                    opacity.value === 1 ? 0 : 1,
                    config
                );
        }
    };

    const stopAnimation = () => {
        cancelAnimation(translateX);
        cancelAnimation(translateY);
        cancelAnimation(scale);
        cancelAnimation(rotate);
        cancelAnimation(width);
        cancelAnimation(height);
        cancelAnimation(borderRadius);
        cancelAnimation(opacity);

        clearSelection();
    };

    return (
        <SafeAreaView style={styles.l1Container}>
            <Animated.View
                style={[styles.l1Box, animatedStyle]}
            />

            <View style={styles.l1Card}>
                <View style={styles.l1Row}>
                    <View style={styles.l1InputContainer}>
                        <Text style={styles.l1InputLabel}>
                            Duration
                        </Text>

                        <TextInput
                            style={styles.l1Input}
                            value={duration}
                            keyboardType="number-pad"
                            onChangeText={setDuration}
                            editable={!isRunning}
                        />
                    </View>

                    <View style={styles.l1InputContainer}>
                        <Text style={styles.l1InputLabel}>
                            Repeat
                        </Text>

                        <TextInput
                            style={styles.l1Input}
                            value={repeatTimes}
                            keyboardType="number-pad"
                            onChangeText={setRepeatTimes}
                            editable={!isRunning}
                        />
                    </View>
                </View>


                <FlatList
                    horizontal
                    data={animationProperties}
                    keyExtractor={(item) => item}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.l1ButtonList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            disabled={isRunning}
                            onPress={() => setProperty(item)}
                            style={[
                                styles.l1Chip,
                                property === item &&
                                styles.l1ChipSelected,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.l1ChipText,
                                    property === item &&
                                    styles.l1ChipTextSelected,
                                ]}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />


                <FlatList
                    horizontal
                    data={animations}
                    keyExtractor={(item) => item.title}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.l1ButtonList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            disabled={isRunning}
                            onPress={() => setSelectedItem(item)}
                            style={[
                                styles.l1Chip,
                                selectedItem?.title === item.title &&
                                styles.l1ChipSelected,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.l1ChipText,
                                    selectedItem?.title === item.title &&
                                    styles.l1ChipTextSelected,
                                ]}
                            >
                                {item.title}
                            </Text>
                        </TouchableOpacity>
                    )}
                />

                <View style={styles.l1ModeContainer}>
                    <TouchableOpacity
                        style={[
                            styles.l1ModeButton,
                            mode === "single" &&
                            styles.l1ModeButtonActive,
                        ]}
                        disabled={isRunning}
                        onPress={() => setMode("single")}
                    >
                        <Text
                            style={[
                                styles.l1ModeText,
                                mode === "single" && {
                                    color: "#FFF",
                                },
                            ]}
                        >
                            Once
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.l1ModeButton,
                            mode === "repeat" &&
                            styles.l1ModeButtonActive,
                        ]}
                        disabled={isRunning}
                        onPress={() => setMode("repeat")}
                    >
                        <Text
                            style={[
                                styles.l1ModeText,
                                mode === "repeat" && {
                                    color: "#FFF",
                                },
                            ]}
                        >
                            Repeat
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.l1ModeContainer}>
                    <TouchableOpacity
                        disabled={!selectedItem || isRunning}
                        style={[
                            styles.l1ModeButton,
                            (!selectedItem || isRunning) && {
                                opacity: 0.4,
                            },
                        ]}
                        onPress={startAnimation}
                    >
                        <Text style={styles.l1ModeText}>
                            Start
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        disabled={!isRunning}
                        style={[
                            styles.l1ModeButton,
                            styles.l1StopButton,
                            !isRunning && { opacity: 0.4 },
                        ]}
                        onPress={stopAnimation}
                    >
                        <Text
                            style={[
                                styles.l1ModeText,
                                isRunning && { color: "#FFF" },
                            ]}
                        >
                            Stop
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}