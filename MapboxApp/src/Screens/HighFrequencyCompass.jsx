import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import { Magnetometer } from 'react-native-sensors';

const HighFrequencyCompass = () => {
  const [heading, setHeading] = useState(0);

  const requestPermissions = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.HIGH_SAMPLING_RATE_SENSORS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('High sampling rate permission not granted.');
      }
    }
  };

  useEffect(() => {
    requestPermissions();

    // Start the magnetometer sensor with a high sampling rate
    const subscription = new Magnetometer({
      updateInterval: 0, // Set to 0 for highest possible sampling rate
    }).subscribe(
      ({ x, y }) => {
        const angle = Math.atan2(y, x) * (180 / Math.PI); // Calculate heading in degrees
        setHeading(angle);
      },
      (error) => {
        console.log('Magnetometer error:', error);
      }
    );

    return () => {
      // Unsubscribe from the magnetometer when the component unmounts
      subscription.unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headingText}>Heading: {heading.toFixed(2)}°</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headingText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default HighFrequencyCompass;
