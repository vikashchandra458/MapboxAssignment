import React from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

const MENU_ITEMS = [
    {
        id: 1,
        title: "Camera",
        icon: "📷",
    },
    {
        id: 2,
        title: "Gallery",
        icon: "🖼",
    },
    {
        id: 3,
        title: "Document",
        icon: "📄",
    },
];

export default function Lesson8FabMenu() {
    const progress = useSharedValue(0);

    const toggleMenu = () => {
        progress.value = withTiming(
            progress.value === 0 ? 1 : 0,
            {
                duration: 300,
            }
        );
    };

    const fabStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            progress.value,
            [0, 1],
            [0, 45]
        );

        return {
            transform: [
                {
                    rotate: `${rotate}deg`,
                },
            ],
        };
    });

    return (
        <View style={styles.container}>

            {MENU_ITEMS.map((item, index) => {

                const menuStyle = useAnimatedStyle(() => {

                    const translateY = interpolate(
                        progress.value,
                        [0, 1],
                        [0, -(index + 1) * 70]
                    );

                    const opacity = interpolate(
                        progress.value,
                        [0, 1],
                        [0, 1]
                    );

                    const scale = interpolate(
                        progress.value,
                        [0, 1],
                        [0.5, 1]
                    );

                    return {
                        opacity,
                        transform: [
                            { translateY },
                            { scale },
                        ],
                    };
                });

                return (
                    <Animated.View
                        key={item.id}
                        style={[
                            styles.menuItem,
                            menuStyle,
                        ]}
                    >
                        <Text style={styles.icon}>
                            {item.icon}
                        </Text>

                        <Text style={styles.menuText}>
                            {item.title}
                        </Text>
                    </Animated.View>
                );
            })}

            <Pressable
                style={styles.fab}
                onPress={toggleMenu}
            >
                <Animated.Text
                    style={[styles.plus, fabStyle]}
                >
                    +
                </Animated.Text>
            </Pressable>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "flex-end",
        padding: 30,
    },

    fab: {
        width: 65,
        height: 65,
        borderRadius: 33,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
        elevation: 10,
    },

    plus: {
        color: "#FFF",
        fontSize: 34,
        fontWeight: "700",
    },

    menuItem: {
        position: "absolute",
        right: 30,
        bottom: 30,

        width: 180,
        height: 55,

        borderRadius: 14,
        backgroundColor: "#FFF",

        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 15,

        elevation: 6,
    },

    icon: {
        fontSize: 24,
    },

    menuText: {
        marginLeft: 12,
        fontSize: 17,
        fontWeight: "600",
    },

});