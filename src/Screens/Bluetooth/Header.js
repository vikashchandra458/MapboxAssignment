import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function Header() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluetooth & NFC</Text>

      <Text style={styles.subtitle}>Device Scanner</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
  },

  subtitle: {
    color: '#94A3B8',
    marginTop: 5,
    fontSize: 15,
  },
});
