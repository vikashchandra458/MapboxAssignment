import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function EmptyState() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📡</Text>

      <Text style={styles.title}>No Bluetooth Devices</Text>

      <Text style={styles.subtitle}>
        Tap Scan Bluetooth to discover nearby devices.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },

  icon: {
    fontSize: 70,
  },

  title: {
    color: '#fff',
    fontSize: 22,
    marginTop: 15,
    fontWeight: '700',
  },

  subtitle: {
    color: '#94A3B8',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
