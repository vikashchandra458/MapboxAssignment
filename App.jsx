import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import Dashboard from './src/Screens/Dashboard';

export default function App() {
  const [isSplashVisible, setSplashVisible] = useState(true); // State to control the splash screen

  useEffect(() => {
    // Hide the splash screen after 2 seconds
    const timer = setTimeout(() => {
      setSplashVisible(false); // Toggle splash screen visibility
    }, 1900);

    return () => clearTimeout(timer); // Cleanup the timer when component unmounts
  }, []);

  return (
    <View style={{flex: 1}}>
      {isSplashVisible ? (
        <View style={styles.container}>
          <LottieView
            source={require('./Animation.json')}
            style={styles.lottie}
            autoPlay
            loop
          />
        </View>
      ) : (
        <Dashboard />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: '50%',
    height: '50%',
  },
});
