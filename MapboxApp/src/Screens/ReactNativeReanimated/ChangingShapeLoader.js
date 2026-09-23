import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Polygon } from "react-native-svg";

import Animated, {
    Easing,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

const AnimatedPolygon =
    Animated.createAnimatedComponent(Polygon);

const SIZE = 80;
const CENTER = SIZE / 2;
const RADIUS = 30;
const MAX_POINTS = 20;

export default function ChangingShapeLoader() {
    const progress = useSharedValue(1);
    const rotation = useSharedValue(0);

    useEffect(() => {
        progress.value = withRepeat(
            withTiming(MAX_POINTS, {
                duration: 3000,
                easing: Easing.linear,
            }),
            -1,
            true
        );

        rotation.value = withRepeat(
            withTiming(360, {
                duration: 3000,
                easing: Easing.linear,
            }),
            -1,
            false
        );
    }, []);

    const animatedProps = useAnimatedProps(() => {
        const p = progress.value;

        const currentCount = Math.floor(p);
        const nextCount = Math.min(
            currentCount + 1,
            MAX_POINTS
        );

        const fraction = p - currentCount;

        const getPoint = (index, count) => {
            "worklet";

            // 1 point
            if (count === 1) {
                return {
                    x: CENTER,
                    y: CENTER - RADIUS,
                };
            }

            // 2 points = line
            if (count === 2) {
                const angle =
                    index === 0
                        ? -Math.PI / 2
                        : Math.PI / 2;

                return {
                    x:
                        CENTER +
                        Math.cos(angle) * RADIUS,

                    y:
                        CENTER +
                        Math.sin(angle) * RADIUS,
                };
            }

            // Extra points stay on first point
            if (index >= count) {
                return {
                    x: CENTER,
                    y: CENTER - RADIUS,
                };
            }

            const angle =
                (index / count) * Math.PI * 2 -
                Math.PI / 2;

            return {
                x:
                    CENTER +
                    Math.cos(angle) * RADIUS,

                y:
                    CENTER +
                    Math.sin(angle) * RADIUS,
            };
        };

        const points = [];

        for (let i = 0; i < MAX_POINTS; i++) {
            const current = getPoint(
                i,
                currentCount
            );

            const next = getPoint(
                i,
                nextCount
            );

            const x =
                current.x +
                (next.x - current.x) * fraction;

            const y =
                current.y +
                (next.y - current.y) * fraction;

            points.push(`${x},${y}`);
        }

        return {
            points: points.join(" "),
        };
    });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                rotate: `${rotation.value}deg`,
            },
        ],
    }));

    return (
        <View style={styles.container}>
            <Animated.View style={animatedStyle}>
                <Svg
                    width={SIZE}
                    height={SIZE}
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                >
                    <AnimatedPolygon
                        animatedProps={animatedProps}
                        fill="#168C99"
                        stroke="#168C99"
                        strokeWidth={4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </Svg>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});