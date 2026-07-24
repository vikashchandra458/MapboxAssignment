import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

export default function ActionButton({title, icon, onPress}) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>
        {icon} {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563EB',
    marginHorizontal: 15,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    elevation: 6,
  },

  text: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
});
