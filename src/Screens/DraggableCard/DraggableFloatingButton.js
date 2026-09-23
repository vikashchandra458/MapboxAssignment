import React, { useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';

import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');
const ITEM_HEIGHT = 55;
const MENU_GAP = 10;
const DOWN_OFFSET = 5;
const MENUS = [
  {
    id: 'camera',
    label: 'Camera',
    icon: 'camera',
  },
  {
    id: 'gallery',
    label: 'Gallery',
    icon: 'image',
  },
  {
    id: 'location',
    label: 'Location',
    icon: 'map-marker',
  },
];

const MENU_HEIGHT = MENUS.length * (ITEM_HEIGHT + MENU_GAP);

export default function DraggableFloatingButton({
  size = 60,
  bottomOffset = 120,
  rightOffset = 20,
  onMenuPress,
}) {
  const [open, setOpen] = useState(false);
  const [isRightSide, setIsRightSide] = useState(true);
  const [expandUp, setExpandUp] = useState(true);

  const translateX = useSharedValue(width - size - rightOffset);
  const translateY = useSharedValue(height - bottomOffset);

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const progress = useSharedValue(0);

  const toggleMenu = () => {
    const next = !open;
    setOpen(next);
    progress.value = withTiming(next ? 1 : 0, {
      duration: 250,
    });
  };

  const pan = Gesture.Pan()
    .enabled(!open)
    .minDistance(10)
    .onBegin(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate(e => {
      translateX.value = Math.min(
        Math.max(0, startX.value + e.translationX),
        width - size,
      );

      translateY.value = Math.min(
        Math.max(20, startY.value + e.translationY),
        height - size - 20,
      );
    })
    .onEnd(() => {
      const rightSide = translateX.value > width / 2;

      const shouldExpandUp =
        translateY.value > MENU_HEIGHT + 40;

      runOnJS(setIsRightSide)(rightSide);
      runOnJS(setExpandUp)(shouldExpandUp);

      translateX.value = withSpring(
        rightSide
          ? width - size - 16
          : 16,
      );
    });

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.container,
          fabAnimatedStyle,
        ]}>
        {MENUS.map((item, index) => {
          const menuStyle = useAnimatedStyle(() => {


            const distance =
              (index + 1) * (ITEM_HEIGHT + MENU_GAP);

            const translate = interpolate(
              progress.value,
              [0, 1],
              [
                0,
                expandUp
                  ? -distance + DOWN_OFFSET
                  : distance,
              ],
              Extrapolate.CLAMP,
            );
            return {
              opacity: progress.value,
              transform: [
                {
                  translateY: translate,
                },
                {
                  scale: interpolate(
                    progress.value,
                    [0, 1],
                    [0.5, 1],
                  ),
                },
              ],
            };
          });

          return (
            <Animated.View
              key={item.id}
              style={[
                styles.menuContainer,
                menuStyle,
                isRightSide
                  ? { right: 0 }
                  : { left: 0 },

                expandUp
                  ? { top: 25 }
                  : { bottom: 25 },
              ]}
            >
              {isRightSide ? (
                <>
                  <Text
                    style={[
                      styles.label,
                      {
                        position: 'absolute',
                        right: 60, // 48 button + 12 gap
                      },
                    ]}>
                    {item.label}
                  </Text>

                  <Pressable
                    style={[
                      styles.menuButton,
                      {
                        position: 'absolute',
                        right: 0,
                      },
                    ]}
                    onPress={() => {
                      toggleMenu();
                      onMenuPress?.(item.id);
                    }}>
                    <Icon
                      name={item.icon}
                      size={22}
                      color="#fff"
                    />
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable
                    style={[
                      styles.menuButton,
                      {
                        position: 'absolute',
                        left: 0,
                      },
                    ]}
                    onPress={() => {
                      toggleMenu();
                      onMenuPress?.(item.id);
                    }}>
                    <Icon
                      name={item.icon}
                      size={22}
                      color="#fff"
                    />
                  </Pressable>

                  <Text
                    style={[
                      styles.label,
                      {
                        position: 'absolute',
                        left: 60,
                      },
                    ]}>
                    {item.label}
                  </Text>
                </>
              )}
            </Animated.View>
          );
        })}

        <Pressable
          onPress={toggleMenu}
          style={[
            styles.fab,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}>
          <Icon
            name={open ? 'close' : 'plus'}
            size={30}
            color="#fff"
          />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 9999,
  },

  fab: {
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },

  menuContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: "center",
  },

  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },

  label: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 14,
    color: '#000',
    elevation: 3,
  },
});