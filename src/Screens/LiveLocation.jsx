import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Animated,
  Image,
  Text,
  TouchableOpacity,
  ToastAndroid,
  Alert,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Geolocation from 'react-native-geolocation-service';
import {MAPBOX_DOWNLOADS_TOKEN} from '@env';
import Compass from './Compass';

MapboxGL.setAccessToken(MAPBOX_DOWNLOADS_TOKEN);

const LiveLocation = ({route}) => {
  const [location, setLocation] = useState(
    route?.params?.propslocation || null,
  );
  const [watchId, setWatchId] = useState([]);
  const [error, setError] = useState(null);
  const desired_accuracy = route?.params?.desiredAccuracy || 20;
  const [showImage, setShowImage] = useState(true);
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use this feature.',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Open Settings',
              onPress: () => PermissionsAndroid.openSettings(),
            },
          ],
        );
        return false;
      }
    }
    return true; // iOS permission handled via Info.plist
  };

  const startTrackingLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    if (watchId.length > 0) {
      console.warn('Stopping existing watchers before starting a new one.');
      stopTrackingLocation('stopAll');
    }

    const id = Geolocation.watchPosition(
      position => {
        const {latitude, longitude, accuracy, altitude, heading, speed} =
          position.coords;

        setLocation(prevLocation => ({
          latitude,
          longitude,
          accuracy,
          altitude,
          heading,
          speed,
          autoUpdatedCount: prevLocation?.autoUpdatedCount
            ? prevLocation.autoUpdatedCount + 1
            : 1,
          updatedCount: prevLocation?.updatedCount || 0,
        }));

        console.log('Auto current location:', position.coords);

        if (Number(accuracy?.toFixed(2)) < desired_accuracy) {
          stopTrackingLocation('stopAll');
          console.log('Desired accuracy reached:', accuracy?.toFixed(2));
        }
      },
      error => {
        setError(error.message);
        console.log('Location error:', error.message);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 1,
        interval: 2000,
        fastestInterval: 1000,
      },
    );
    setWatchId(prevWatchIds => [...prevWatchIds, id]);
  };

  const stopTrackingLocation = type => {
    if (type === 'stopAll') {
      watchId.forEach(element => {
        try {
          console.log('Deleting watch ID:', element);
          Geolocation.clearWatch(element);
        } catch (error) {
          console.error('Error clearing watch ID:', element, error.message);
        }
      });
      Geolocation.stopObserving();
      setWatchId([]); // Clear all watch IDs
      // Alert.alert(
      //   'Tracking Stopped',
      //   'All location watchers have been stopped.',
      // );
    } else {
      if (watchId?.length > 0) {
        const lastWatchId = watchId[watchId.length - 1];
        try {
          Geolocation.clearWatch(lastWatchId);
          console.log('Deleted last watch ID:', lastWatchId);
          setWatchId(watchId.slice(0, -1)); // Remove the last watch ID
        } catch (error) {
          console.error(
            'Error clearing the last watch ID:',
            lastWatchId,
            error.message,
          );
        }
        if (Platform.OS === 'android' && location?.accuracy < 10) {
          ToastAndroid.show(
            'Tracking stopped due to desired accuracy',
            ToastAndroid.SHORT,
          );
        }
      }
    }
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude, accuracy, altitude, heading, speed} =
          position.coords;

        setLocation(prevLocation => ({
          latitude,
          longitude,
          accuracy,
          altitude,
          heading,
          speed,
          autoUpdatedCount: prevLocation?.autoUpdatedCount || 0,
          updatedCount: prevLocation?.updatedCount
            ? prevLocation.updatedCount + 1
            : 1,
        }));

        console.log('Current location:', position.coords);

        if (Number(accuracy?.toFixed(2)) < desired_accuracy) {
          stopTrackingLocation('stopAll');
          console.log('Desired accuracy reached:', accuracy?.toFixed(2));
        }
      },
      error => {
        setError(error.message);
        console.log('Error getting current location:', error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  useEffect(() => {
    getCurrentLocation();
    startTrackingLocation();

    // return () => {
    //   stopTrackingLocation('stopAll');
    // };
  }, []);
  useEffect(() => {
    setShowImage(false);
    setTimeout(() => {
      setShowImage(true);
    }, 100);
  }, [location]);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map}>
        {location?.longitude && (
          <MapboxGL.Camera
            centerCoordinate={[location.longitude, location.latitude]}
            zoomLevel={16}
            animationMode="flyTo"
            animationDuration={500}
          />
        )}
        {showImage && (
          <MapboxGL.PointAnnotation
            id="userLocation"
            coordinate={[location?.longitude, location?.latitude]}>
            <Image
              source={require('./assets/arrow.png')}
              style={styles.arrow}
            />
          </MapboxGL.PointAnnotation>
        )}
      </MapboxGL.MapView>

      <Compass independent={true} />

      <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
        <Image
          source={require('./assets/current.png')}
          style={{width: 46, height: 46, borderRadius: 100}}
        />
      </TouchableOpacity>

      {location && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            Latitude: {location.latitude.toFixed(2)}
          </Text>
          <Text style={styles.locationText}>
            Longitude: {location.longitude.toFixed(2)}
          </Text>
          <Text style={styles.locationText}>
            Accuracy: {location.accuracy.toFixed(2)} m
          </Text>
          <Text style={styles.locationText}>
            Altitude: {location.altitude.toFixed(2)} m
          </Text>
          <Text style={styles.locationText}>
            Heading: {location.heading.toFixed(2)}°
          </Text>
          <Text style={styles.locationText}>
            Speed: {location.speed.toFixed(2)} m/s
          </Text>
          <Text style={styles.locationText}>
            AU Count: {location?.autoUpdatedCount}
          </Text>
          <Text style={styles.locationText}>
            MU Count: {location?.updatedCount}
          </Text>
          <Text style={styles.locationText}>
            D Accuracy: {desired_accuracy}
          </Text>
        </View>
      )}
      {error && (
        <View style={styles.error}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {flex: 1},
  arrow: {width: 50, height: 50, resizeMode: 'contain'},
  button: {position: 'absolute', bottom: 50, right: 10},
  locationInfo: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
  },
  locationText: {color: '#fff', fontSize: 14},
  error: {position: 'absolute', bottom: 100, left: 10},
  errorText: {color: 'red'},
});

export default LiveLocation;
