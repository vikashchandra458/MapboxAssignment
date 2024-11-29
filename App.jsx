import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Dashboard from './src/Screens/Dashboard';
import PolygonDraw from './src/Screens/PolygonDraw'; 
import LiveLocation from './src/Screens/LiveLocation';
import HighFrequencyCompass from './src/Screens/HighFrequencyCompass';
import Compass from './src/Screens/Compass';
import CompassComponent from './src/Screens/CompassComponent';
import WebViewDashboard from './src/Screens/WebViewDashboard';
const Stack = createNativeStackNavigator();

export default function App() {
  const [isSplashVisible, setSplashVisible] = useState(true); 

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashVisible(false); 
    }, 1900);

    return () => clearTimeout(timer); 
  }, []);

  return (
    <View style={{flex: 1}}>
      {isSplashVisible ? (
        // Splash screen with Lottie animation
        <View style={styles.container}>
          <LottieView
            source={require('./Animation.json')} // Path to your animation file
            style={styles.lottie}
            autoPlay
            loop
          />
        </View>
      ) : (
        // After the splash screen, show the navigation container with screens
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Dashboard" screenOptions={{headerShown: false}}>
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="PolygonDraw" component={PolygonDraw} />
            <Stack.Screen name="LiveLocation" component={LiveLocation} />
            <Stack.Screen name="Compass" component={Compass} />
            <Stack.Screen name="CompassComponent" component={CompassComponent} />
            <Stack.Screen name="WebViewDashboard" component={WebViewDashboard} />
            <Stack.Screen
              name="HighFrequencyCompass"
              component={HighFrequencyCompass}
            />
          </Stack.Navigator>
        </NavigationContainer>
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
