import React from 'react';
import { View, StyleSheet } from 'react-native';

const Arrow = () => {
    return (
        <View style={styles.arrow} />
    );
};

const styles = StyleSheet.create({
    arrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderBottomWidth: 20,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'blue', // Color of the arrow
    },
});

export default Arrow;
