import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import Animated, {
    Easing,
    useAnimatedProps,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const AnimatedBorderBox = ({
    width = 300,
    height = 200,

    borderWidth = 4,
    borderRadius = 24,

    // Length of moving highlight
    segmentLength = 90,

    // Animation speed
    duration = 2200,

    // Normal border
    borderColor = '#D8DCE1',

    // Moving highlight
    glowColor = '#0099FF',
}) => {
    const progress = useSharedValue(0);

    /*
     * SVG rectangle dimensions
     */
    const x = borderWidth / 2;
    const y = borderWidth / 2;

    const rectWidth = width - borderWidth;
    const rectHeight = height - borderWidth;

    /*
     * Rounded corner radius
     */
    const radius = Math.min(
        borderRadius - borderWidth / 2,
        rectWidth / 2,
        rectHeight / 2
    );

    /*
     * Rounded rectangle perimeter
     */
    const perimeter =
        2 * (rectWidth - 2 * radius) +
        2 * (rectHeight - 2 * radius) +
        2 * Math.PI * radius;

    /*
     * Prevent segment from becoming larger
     * than the entire perimeter.
     */
    const actualSegmentLength = Math.min(
        segmentLength,
        perimeter - 1
    );

    useEffect(() => {
        progress.value = 0;

        progress.value = withRepeat(
            withTiming(1, {
                duration,
                easing: Easing.linear,
            }),
            -1,
            false
        );
    }, [duration]);

    /*
     * Move dash around the entire rounded rectangle.
     */
    const animatedProps = useAnimatedProps(() => {
        return {
            strokeDashoffset: progress.value * perimeter,
        };
    });

    /*
     * Smaller white highlight inside the main segment.
     */
    const highlightLength = actualSegmentLength * 0.35;

    return (
        <View
            style={[
                styles.container,
                {
                    width,
                    height,
                },
            ]}
        >
            <Svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
            >
                {/* =====================================================
            NORMAL BORDER
            ===================================================== */}

                <Rect
                    x={x}
                    y={y}
                    width={rectWidth}
                    height={rectHeight}
                    rx={radius}
                    ry={radius}
                    fill="none"
                    stroke={borderColor}
                    strokeWidth={borderWidth}
                />

                {/* =====================================================
            OUTER GLOW
            ===================================================== */}

                <AnimatedRect
                    x={x}
                    y={y}
                    width={rectWidth}
                    height={rectHeight}
                    rx={radius}
                    ry={radius}
                    fill="none"
                    stroke={glowColor}
                    strokeWidth={borderWidth * 4}
                    strokeOpacity={0.10}
                    strokeLinecap="round"
                    strokeDasharray={`${actualSegmentLength} ${perimeter - actualSegmentLength
                        }`}
                    animatedProps={animatedProps}
                />

                {/* =====================================================
            SECOND GLOW
            ===================================================== */}

                <AnimatedRect
                    x={x}
                    y={y}
                    width={rectWidth}
                    height={rectHeight}
                    rx={radius}
                    ry={radius}
                    fill="none"
                    stroke={glowColor}
                    strokeWidth={borderWidth * 2.2}
                    strokeOpacity={0.25}
                    strokeLinecap="round"
                    strokeDasharray={`${actualSegmentLength} ${perimeter - actualSegmentLength
                        }`}
                    animatedProps={animatedProps}
                />

                {/* =====================================================
            MAIN MOVING SEGMENT
            ===================================================== */}

                <AnimatedRect
                    x={x}
                    y={y}
                    width={rectWidth}
                    height={rectHeight}
                    rx={radius}
                    ry={radius}
                    fill="none"
                    stroke={glowColor}
                    strokeWidth={borderWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${actualSegmentLength} ${perimeter - actualSegmentLength
                        }`}
                    animatedProps={animatedProps}
                />

                {/* =====================================================
            WHITE GLOSS / REFLECTION
            ===================================================== */}

                <AnimatedRect
                    x={x}
                    y={y}
                    width={rectWidth}
                    height={rectHeight}
                    rx={radius}
                    ry={radius}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={borderWidth * 0.45}
                    strokeOpacity={0.9}
                    strokeLinecap="round"
                    strokeDasharray={`${highlightLength} ${perimeter - highlightLength
                        }`}
                    animatedProps={animatedProps}
                />
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AnimatedBorderBox;