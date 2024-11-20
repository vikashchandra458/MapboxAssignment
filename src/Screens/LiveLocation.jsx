import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Text,
  TouchableOpacity,
  ToastAndroid,
  Alert,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Geolocation from 'react-native-geolocation-service';
import {MAPBOX_DOWNLOADS_TOKEN} from '@env';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
MapboxGL.setAccessToken(MAPBOX_DOWNLOADS_TOKEN);

import Compass from './Compass';
const LiveLocation = ({route}) => {
  const [location, setLocation] = useState(
    route?.params?.propslocation || null,
  );
  const [centerlocation, setCenterLocation] = useState(
    route?.params?.propslocation || null,
  );
  const [watchId, setWatchId] = useState([]);
  const [error, setError] = useState(null);
  const [mapStyle, setMapStyle] = useState(MapboxGL.StyleURL.Street);
  const [zoomLevel, setZoomLevel] = useState(18); // Track zoom level
  const [accuracyZoomLevel, setaccuracyZoomLevel] = useState(18);
  const desired_accuracy = route?.params?.desiredAccuracy || 20;
  const [animationMode, setAnimationMode] = useState('none');
  const [currentAngle, setCurrentAngle] = useState(0);
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
        setZoomLevel(accuracyZoomLevel);
        setAnimationMode('');
        // setCenterLocation([]);
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
        distanceFilter: 0,
        interval: 1,
        fastestInterval: 1,
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
  const toggleMapStyle = () => {
    setMapStyle(prevStyle =>
      prevStyle === MapboxGL.StyleURL.Street
        ? MapboxGL.StyleURL.Satellite
        : MapboxGL.StyleURL.Street,
    );
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;
    setCenterLocation(location)
    setAnimationMode('flyTo');
    setZoomLevel(18);
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
        setCenterLocation({
          latitude,
          longitude,
          accuracy,
          altitude,
          heading,
          speed,
          autoUpdatedCount: location?.autoUpdatedCount || 0,
          updatedCount: location?.updatedCount ? location.updatedCount + 1 : 1,
        });
        // setAnimationMode('flyTo');
        // setZoomLevel(18);

        console.log('Current location:', position.coords);

        // if (Number(accuracy?.toFixed(2)) < desired_accuracy) {
        //   stopTrackingLocation('stopAll');
        //   console.log('Desired accuracy reached:', accuracy?.toFixed(2));
        // }
      },
      error => {
        setError(error.message);
        console.log('Error getting current location:', error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const onRegionDidChange = async camera => {
    // console.log(camera?.properties?.zoom);
    // const cameraState = await MapboxGL.Camera.getCamera();
    setaccuracyZoomLevel(camera?.properties?.zoom);
  };

  useEffect(() => {
    getCurrentLocation();
    startTrackingLocation();
  }, []);
  const calculateScaledCircleRadius = (accuracy, zoom) => {
    // Ensure accuracy is positive
    if (accuracy <= 0) {
      return 0; // Return 0 or some other default value if accuracy is invalid
    }

    // Calculate the zoom scale factor based on the zoom level (22 being the highest zoom level)
    const zoomScaleFactor = Math.pow(2, 18 - zoom);

    // Calculate the scaled radius based on accuracy and zoom
    const result = accuracy / zoomScaleFactor;

    return result;
  };

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={mapStyle}
        onCameraChanged={onRegionDidChange}>
        <MapboxGL.Camera
          centerCoordinate={[
            centerlocation?.longitude || 0,
            centerlocation?.latitude || 0,
          ]}
          zoomLevel={zoomLevel}
          maxZoomLevel={20}
          animationMode={animationMode}
          animationDuration={500}
        />
        {/* Accuracy Ring */}
        {location?.accuracy && (
          <MapboxGL.ShapeSource
            id="accuracyCircle"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [location.longitude, location.latitude],
              },
            }}>
            <MapboxGL.CircleLayer
              id="circle"
              style={{
                circleRadius: calculateScaledCircleRadius(
                  location.accuracy,
                  accuracyZoomLevel,
                ),
                circleColor: 'rgba(0, 122, 255, 0.3)',
                circleStrokeWidth: 1,
                circleStrokeColor: 'rgba(0, 122, 255, 0.8)',
              }}
            />
          </MapboxGL.ShapeSource>
        )}
        {/* User Location Marker */}
        {location?.longitude && (
          <MapboxGL.ShapeSource
            id="userLocationSource"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [location.longitude, location.latitude],
              },
            }}>
            <MapboxGL.CircleLayer
              id="userCircle"
              style={{
                circleRadius: 5,
                circleColor: 'rgba(0, 122, 255, 0.8)',
                circleStrokeWidth: 2,
                circleStrokeColor: 'white',
              }}
            />
            {/* <MapboxGL.SymbolLayer
              id="userArrow"
              style={{
                iconImage: 'marker-15', // Use a valid Mapbox icon like 'marker-15'
                iconSize: 3,
                iconRotate: currentAngle,
                iconAnchor: 'center',
                iconColor: 'red',
              }}
            /> */}
          </MapboxGL.ShapeSource>
        )}
      </MapboxGL.MapView>

      <Compass independent={true} setAngle={setCurrentAngle} />

      {/* Toggle Button for Satellite/Street View */}
      <TouchableOpacity style={styles.toggleButton} onPress={toggleMapStyle}>
        <Icon
          name={
            mapStyle === MapboxGL.StyleURL.Street ? 'satellite-uplink' : 'map'
          }
          size={30}
          color="white"
        />
      </TouchableOpacity>

      {/* Current Location Button */}
      <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
        <Icon name="crosshairs-gps" size={30} color="white" />
      </TouchableOpacity>

      {/* Location Information */}
      {location && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            Latitude: {location.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Longitude: {location.longitude.toFixed(6)}
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
  button: {
    position: 'absolute',
    bottom: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    padding: 10,
  },
  toggleButton: {
    position: 'absolute',
    bottom: 110,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    padding: 10,
  },
  locationInfo: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
  locationText: {color: '#fff', fontSize: 14},
  error: {position: 'absolute', bottom: 100, left: 10},
  errorText: {color: 'red'},
});

export default LiveLocation;
