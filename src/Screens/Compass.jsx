import React, {useEffect, useState} from 'react';
import {View, Animated, Text, StyleSheet} from 'react-native';
import {magnetometer} from 'react-native-sensors';
import {throttle} from 'lodash';
import {useAvailableDimensions} from '../Components/AvailableDimensions';

// Initialize LPF - ensure this is part of your LPF class or logic
class LPF {
  static alpha = 0.1; // Smoothing factor
  static previousValue = 0;

  static init(initialValue) {
    this.previousValue = initialValue;
  }

  static next(value) {
    this.previousValue =
      this.alpha * value + (1 - this.alpha) * this.previousValue;
    return this.previousValue;
  }
}

const Compass = ({rotation, heading, setHeading, independent, setAngle}) => {
  const [internalHeading, setInternalHeading] = useState(0);
  const [rotateAnim] = useState(new Animated.Value(0)); // Start with 0
  const {width, height, landscape} = useAvailableDimensions();
  const [currentAngle, setCurrentAngle] = useState(0);
  // Define the degree update rate and directions based on custom ranges
  const directionRanges = [
    {range: [330, 360], direction: 'North'},
    {range: [0, 1], direction: 'North'},
    {range: [1, 89], direction: 'North East'},
    {range: [90, 179], direction: 'South East'},
    {range: [180, 269], direction: 'South West'},
    {range: [270, 329], direction: 'North West'},
  ];
  // useEffect(() => {
  //   setTimeout(() => {
  //     setAngle(currentAngle);
  //   }, 1000);
  // }, [currentAngle]);
  // Determine whether we should use internal state or props
  const currentHeading = heading !== undefined ? heading : internalHeading;
  const currentSetHeading = setHeading || setInternalHeading;

  useEffect(() => {
    const throttledSetHeading = throttle(angle => {
      currentSetHeading(angle); // Update either internal or parent state
      // Smoothly animate the rotation
      Animated.spring(rotateAnim, {
        toValue: angle,
        useNativeDriver: true,
        damping: 500, // Controls the bounce of the animation (lower is more bouncy)
        stiffness: 100, // Controls the "tightness" of the spring (higher is more stiff)
      }).start();
    }, 500); // 500ms throttle interval

    // Subscribe to magnetometer updates
    const magnetometerSubscription = magnetometer.subscribe(({x, y}) => {
      // Angle calculation with LPF smoothing and handling negative angles
      let angle = Math.atan2(x, y) * (180 / Math.PI);
      // angle = Math.abs(angle);
      angle = (angle + 360) % 360;
      angle = 360 - angle;
      setCurrentAngle(angle);
      // console.log(angle);

      // if (angle < 0) {
      //   angle += 360;
      // }
      throttledSetHeading(angle); // Call the throttled setter
    });

    // Cleanup magnetometer subscription
    return () => {
      if (magnetometerSubscription) {
        magnetometerSubscription.unsubscribe();
      }
    };
  }, [rotateAnim, currentSetHeading]);

  // Helper function to determine compass direction based on angle
  const getCompassDirection = angle => {
    const direction = directionRanges.find(range => {
      return (
        (angle >= range.range[0] && angle <= range.range[1]) ||
        (range.range[0] > range.range[1] &&
          (angle >= range.range[0] || angle <= range.range[1]))
      );
    });
    return direction ? direction.direction : 'Unknown';
  };

  // Rotation interpolation for smoother animation
  const rotationInterpolated = rotateAnim.interpolate({
    inputRange: [0, 360], // Angle ranges from 0 to 360
    outputRange: ['0deg', '360deg'],
    extrapolate: 'clamp', // Make sure the interpolation stays within range
  });

  const compassImage = require('./assets/compass.png');

  const getCalculatedDegree = degree => {
    degree = Math.round(degree); // Round the degree to the nearest integer
    if (degree >= 90 && degree < 180) {
      return degree - 90; // Mapping 90° to 180° -> 0° to 89°
    }
    if (degree >= 180 && degree < 270) {
      return degree - 180; // Mapping 180° to 270° -> 0° to 89°
    }
    if (degree >= 270 && degree <= 360) {
      return 360 - degree; // Mapping 270° to 360° -> 89° to 0°
    }
    return degree; // Default case for other angles
  };

  return (
    <View
      style={
        independent
          ? {}
          : {
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }
      }>
      <View
        style={
          independent
            ? [styles.compassContainer, landscape && {left: 60}]
            : {
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                padding: 10,
                borderRadius: 100,
              }
        }>
        <Animated.Image
          source={compassImage}
          style={[
            independent
              ? styles.compass
              : {
                  width: width * 0.8,
                  height: width * 0.7,
                  marginBottom: 5,
                  resizeMode: 'contain',
                },
            {
              transform: [
                {
                  rotateZ: currentAngle
                    ? `${360 - currentAngle} deg`
                    : '45 deg',
                },
              ],
            },
            // {transform: [{rotate: rotationInterpolated}]}, // Apply rotation animation here
          ]}
        />
        <Text style={styles.headingText}>
          {`${getCalculatedDegree(currentHeading)}° ${getCompassDirection(
            currentHeading,
          )}`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  compassContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 10,
  },
  compass: {
    width: 120,
    height: 120,
    marginBottom: 5,
    resizeMode: 'contain',
  },
  headingText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default Compass;
