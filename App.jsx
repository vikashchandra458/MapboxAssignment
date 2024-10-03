import React from 'react';
import {View, StyleSheet} from 'react-native';
import Dashboard from './src/Screens/Dashboard';

const App = () => {
  return (
    <View style={styles.container}>
      <Dashboard />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
