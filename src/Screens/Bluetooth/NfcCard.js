import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function NfcCard({data}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>📶 NFC Information</Text>

      <Text selectable style={styles.data}>
        {data || 'No NFC tag scanned'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 15,
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
  },

  title: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 15,
  },

  data: {
    color: '#CBD5E1',
    lineHeight: 22,
  },
});
