import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const AreaDisplay = ({area, style}) => {
  if (area === null) return null; // Do not render if area is null

  return (
    <View style={style ? style : styles.areaContainer}>
      <Text style={styles.areaText}>Area: {area.toFixed(2)} acres</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  areaContainer: {
    position: 'absolute',
    bottom: 60,
    left: 10,
    backgroundColor: 'rgba(128, 0, 0, 0.5)',
    borderRadius: 5,
    padding: 10,
  },
  areaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default AreaDisplay;
