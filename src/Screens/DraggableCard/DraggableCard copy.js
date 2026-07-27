import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    Animated,
    PanResponder,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

const CARD_WIDTH = 280;
const CARD_HEIGHT = 150;
const EDGE_PADDING = 18;

const CARD_DATA = [
    {
        id: 'field',
        title: 'Field Survey',
        subtitle: 'Drag, toss, or snap this card to a zone.',
        accent: '#2DD4BF',
        meta: 'Active',
    },
    {
        id: 'route',
        title: 'Route Plan',
        subtitle: 'Bounded movement keeps it inside the workspace.',
        accent: '#F59E0B',
        meta: '12 km',
    },
    {
        id: 'area',
        title: 'Area Review',
        subtitle: 'Release near a target to magnetically snap.',
        accent: '#60A5FA',
        meta: '4 pins',
    },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

const nearestPoint = (point, points) =>
    points.reduce((nearest, candidate) =>
        distance(point, candidate) < distance(point, nearest) ? candidate : nearest,
    );

const ControlButton = ({ active, disabled, label, onPress }) => (
    <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
            styles.controlButton,
            active && styles.controlButtonActive,
            disabled && styles.controlButtonDisabled,
            pressed && !disabled && styles.controlButtonPressed,
        ]}>
        <Text
            style={[
                styles.controlButtonText,
                active && styles.controlButtonTextActive,
            ]}>
            {label}
        </Text>
    </Pressable>
);

const SnapTarget = ({ label, point, active }) => (
    <View
        pointerEvents="none"
        style={[
            styles.snapTarget,
            {
                left: point.x - 34,
                top: point.y - 34,
            },
            active && styles.snapTargetActive,
        ]}>
        <Text
            style={[styles.snapTargetText, active && styles.snapTargetTextActive]}>
            {label}
        </Text>
    </View>
);

const AdvancedDraggableCard = ({
    card,
    bounds,
    disabled,
    initialPosition,
    onDragStart,
    onMove,
    onRelease,
    snapPoints,
    zIndex,
}) => {
    const translate = useRef(new Animated.ValueXY(initialPosition)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const lift = useRef(new Animated.Value(0)).current;
    const current = useRef(initialPosition);

    const commitPosition = useCallback(
        position => {
            current.current = position;
            translate.setValue(position);
            onMove(position);
        },
        [onMove, translate],
    );

    const animateTo = useCallback(
        position => {
            current.current = position;
            onMove(position);

            Animated.spring(translate, {
                toValue: position,
                friction: 8,
                tension: 90,
                useNativeDriver: false,
            }).start();
        },
        [onMove, translate],
    );

    const setLifted = useCallback(
        isLifted => {
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: isLifted ? 1.04 : 1,
                    friction: 7,
                    tension: 120,
                    useNativeDriver: false,
                }),
                Animated.timing(lift, {
                    toValue: isLifted ? 1 : 0,
                    duration: 120,
                    useNativeDriver: false,
                }),
            ]).start();
        },
        [lift, scale],
    );

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponder: (_, gesture) =>
                    !disabled && Math.abs(gesture.dx) + Math.abs(gesture.dy) > 6,
                onPanResponderGrant: () => {
                    onDragStart(card.id);
                    setLifted(true);
                },
                onPanResponderMove: (_, gesture) => {
                    const next = {
                        x: clamp(current.current.x + gesture.dx, bounds.minX, bounds.maxX),
                        y: clamp(current.current.y + gesture.dy, bounds.minY, bounds.maxY),
                    };

                    translate.setValue(next);
                    onMove(next);
                },
                onPanResponderRelease: (_, gesture) => {
                    setLifted(false);

                    const projected = {
                        x: clamp(
                            current.current.x + gesture.dx + gesture.vx * 80,
                            bounds.minX,
                            bounds.maxX,
                        ),
                        y: clamp(
                            current.current.y + gesture.dy + gesture.vy * 80,
                            bounds.minY,
                            bounds.maxY,
                        ),
                    };
                    const snapTarget = nearestPoint(projected, snapPoints);
                    const shouldSnap =
                        distance(projected, snapTarget) < 130 ||
                        Math.abs(gesture.vx) + Math.abs(gesture.vy) > 1.3;
                    const nextPosition = shouldSnap ? snapTarget : projected;

                    animateTo(nextPosition);
                    onRelease(card.id, nextPosition);
                },
                onPanResponderTerminate: () => {
                    setLifted(false);
                    commitPosition(current.current);
                },
            }),
        [
            animateTo,
            bounds,
            card.id,
            commitPosition,
            disabled,
            onDragStart,
            onMove,
            onRelease,
            setLifted,
            snapPoints,
            translate,
        ],
    );

    const shadowOpacity = lift.interpolate({
        inputRange: [0, 1],
        outputRange: [0.2, 0.38],
    });

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={[
                styles.card,
                {
                    borderColor: card.accent,
                    shadowColor: card.accent,
                    shadowOpacity,
                    transform: [
                        { translateX: translate.x },
                        { translateY: translate.y },
                        { scale },
                    ],
                    zIndex,
                },
                disabled && styles.cardDisabled,
            ]}>
            <View style={styles.cardHeader}>
                <View style={[styles.accentDot, { backgroundColor: card.accent }]} />
                <Text style={styles.cardMeta}>{card.meta}</Text>
            </View>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            <View style={styles.dragHandle}>
                <View style={styles.dragHandleLine} />
                <View style={styles.dragHandleLine} />
            </View>
        </Animated.View>
    );
};

const DraggableCard = () => {
    const { width, height } = useWindowDimensions();
    const workspaceHeight = Math.max(430, height - 255);
    const maxX = Math.max(EDGE_PADDING, width - CARD_WIDTH - EDGE_PADDING);
    const maxY = Math.max(EDGE_PADDING, workspaceHeight - CARD_HEIGHT - 18);
    const [activeCardId, setActiveCardId] = useState(CARD_DATA[0].id);
    const [locked, setLocked] = useState(false);
    const [resetVersion, setResetVersion] = useState(0);
    const [positions, setPositions] = useState(() => ({
        field: { x: EDGE_PADDING, y: 34 },
        route: {
            x: Math.min(maxX, EDGE_PADDING + 26),
            y: Math.min(maxY, 104),
        },
        area: {
            x: Math.min(maxX, EDGE_PADDING + 52),
            y: Math.min(maxY, 174),
        },
    }));

    const bounds = {
        minX: EDGE_PADDING,
        minY: EDGE_PADDING,
        maxX,
        maxY,
    };

    const snapPoints = useMemo(
        () => [
            { x: EDGE_PADDING, y: EDGE_PADDING },
            { x: maxX, y: EDGE_PADDING },
            { x: EDGE_PADDING, y: maxY },
            { x: maxX, y: maxY },
            { x: Math.round(maxX / 2), y: Math.round(maxY / 2) },
        ],
        [maxX, maxY],
    );

    const activePosition = positions[activeCardId] || positions.field;

    const resetCards = () => {
        setActiveCardId(CARD_DATA[0].id);
        setResetVersion(version => version + 1);
        setPositions({
            field: { x: EDGE_PADDING, y: 34 },
            route: {
                x: Math.min(maxX, EDGE_PADDING + 26),
                y: Math.min(maxY, 104),
            },
            area: {
                x: Math.min(maxX, EDGE_PADDING + 52),
                y: Math.min(maxY, 174),
            },
        });
    };

    const updatePosition = (cardId, position) => {
        setPositions(prev => ({
            ...prev,
            [cardId]: position,
        }));
    };

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.header}>
                <Text style={styles.title}>Draggable Cards</Text>
                <Text style={styles.subtitle}>
                    Drag a card, toss it toward a snap zone, or lock the workspace.
                </Text>
            </View>

            <View style={styles.controls}>
                <ControlButton
                    active={locked}
                    label={locked ? 'Locked' : 'Lock'}
                    onPress={() => setLocked(value => !value)}
                />
                <ControlButton label="Reset" onPress={resetCards} />
            </View>

            <View style={[styles.workspace, { height: workspaceHeight }]}>
                {snapPoints.map((point, index) => (
                    <SnapTarget
                        key={`${point.x}-${point.y}`}
                        label={index === 4 ? 'C' : `${index + 1}`}
                        point={point}
                        active={distance(point, activePosition) < 10}
                    />
                ))}

                {CARD_DATA.map((card, index) => (
                    <AdvancedDraggableCard
                        key={`${card.id}-${resetVersion}`}
                        bounds={bounds}
                        card={card}
                        disabled={locked}
                        initialPosition={positions[card.id]}
                        onDragStart={setActiveCardId}
                        onMove={position => updatePosition(card.id, position)}
                        onRelease={(cardId, position) => {
                            setActiveCardId(cardId);
                            updatePosition(cardId, position);
                        }}
                        snapPoints={snapPoints}
                        zIndex={activeCardId === card.id ? 20 : 10 + index}
                    />
                ))}
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerTitle}>Active card</Text>
                <Text style={styles.footerValue}>
                    {activeCardId.toUpperCase()} X:{Math.round(activePosition.x)} Y:
                    {Math.round(activePosition.y)}
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#0B1220',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 22,
        paddingBottom: 14,
    },
    title: {
        color: '#F8FAFC',
        fontSize: 30,
        fontWeight: '800',
    },
    subtitle: {
        color: '#AAB4C5',
        fontSize: 14,
        lineHeight: 20,
        marginTop: 8,
    },
    controls: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        paddingBottom: 14,
    },
    controlButton: {
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderColor: '#334155',
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 82,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    controlButtonActive: {
        backgroundColor: '#0F766E',
        borderColor: '#2DD4BF',
    },
    controlButtonDisabled: {
        opacity: 0.55,
    },
    controlButtonPressed: {
        transform: [{ scale: 0.97 }],
    },
    controlButtonText: {
        color: '#D8E0EC',
        fontSize: 13,
        fontWeight: '700',
    },
    controlButtonTextActive: {
        color: '#FFFFFF',
    },
    workspace: {
        marginHorizontal: 14,
        overflow: 'hidden',
        position: 'relative',
    },
    snapTarget: {
        alignItems: 'center',
        backgroundColor: 'rgba(148, 163, 184, 0.12)',
        borderColor: 'rgba(148, 163, 184, 0.38)',
        borderRadius: 34,
        borderStyle: 'dashed',
        borderWidth: 1,
        height: 68,
        justifyContent: 'center',
        position: 'absolute',
        width: 68,
    },
    snapTargetActive: {
        backgroundColor: 'rgba(45, 212, 191, 0.18)',
        borderColor: '#2DD4BF',
    },
    snapTargetText: {
        color: '#8EA0B8',
        fontSize: 13,
        fontWeight: '800',
    },
    snapTargetTextActive: {
        color: '#CCFBF1',
    },
    card: {
        backgroundColor: '#172033',
        borderRadius: 8,
        borderWidth: 1,
        elevation: 7,
        height: CARD_HEIGHT,
        justifyContent: 'space-between',
        padding: 16,
        position: 'absolute',
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 20,
        width: CARD_WIDTH,
    },
    cardDisabled: {
        opacity: 0.82,
    },
    cardHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    accentDot: {
        borderRadius: 6,
        height: 12,
        width: 12,
    },
    cardMeta: {
        color: '#CBD5E1',
        fontSize: 12,
        fontWeight: '800',
    },
    cardTitle: {
        color: '#FFFFFF',
        fontSize: 21,
        fontWeight: '800',
    },
    cardSubtitle: {
        color: '#AAB4C5',
        fontSize: 13,
        lineHeight: 18,
    },
    dragHandle: {
        alignSelf: 'flex-end',
        gap: 3,
        width: 34,
    },
    dragHandleLine: {
        backgroundColor: '#64748B',
        borderRadius: 2,
        height: 3,
    },
    footer: {
        backgroundColor: '#111A2C',
        borderColor: '#273449',
        borderTopWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    footerTitle: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    footerValue: {
        color: '#F8FAFC',
        fontSize: 15,
        fontWeight: '800',
        marginTop: 4,
    },
});

export default DraggableCard;
