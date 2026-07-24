import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function StatusCard({title, value, color}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <View style={[styles.dot, {backgroundColor: color}]} />

      <Text style={[styles.value, {color}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 18,
  },

  title: {
    color: '#94A3B8',
  },

  dot: {
    width: 14,
    height: 14,
    borderRadius: 8,
    marginVertical: 10,
  },

  value: {
    fontWeight: '700',
    fontSize: 17,
  },
});
