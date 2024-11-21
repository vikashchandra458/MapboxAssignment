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
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Geolocation from 'react-native-geolocation-service';
import {MAPBOX_DOWNLOADS_TOKEN} from '@env';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomInput from '../Components/CustomInput';
MapboxGL.setAccessToken(MAPBOX_DOWNLOADS_TOKEN);
import {useAvailableDimensions} from '../Components/AvailableDimensions';
import Compass from './Compass';
const LiveLocation = ({route}) => {
  const {width, height, landscape} = useAvailableDimensions();
  const [isLive, setIsLive] = useState(true);
  const [location, setLocation] = useState(
    route?.params?.propslocation || null,
  );
  const [centerlocation, setCenterLocation] = useState(
    route?.params?.propslocation || null,
  );
  const [watchId, setWatchId] = useState([]);
  const [error, setError] = useState(null);
  const [mapStyle, setMapStyle] = useState(MapboxGL.StyleURL.Satellite);
  const [zoomLevel, setZoomLevel] = useState(18); // Track zoom level
  const desired_accuracy = route?.params?.desiredAccuracy || 20;
  const [animationMode, setAnimationMode] = useState('none');
  const [currentAngle, setCurrentAngle] = useState(0);
  const [isCompassOn, setIsCompassOn] = useState(false); // Track compass state
  const [showDetails, setShowDetails] = useState(true); // Track details visibility
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [bounds, setBounds] = useState(null);
  const [autoCenter, setAutoCenter] = useState(false);
  const [direction, setDirection] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(
    route?.params?.propslocation || null,
  );
  let updatedZoom = null;
  let accuracyZoomLevel = 18;
  let mapBoxObject = {};
  const handleSearch = async text => {
    setSearchText(text);
    if (text.length < 3) {
      setSearchResults([]);
      return;
    }

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        text,
      )}.json?access_token=${MAPBOX_DOWNLOADS_TOKEN}&limit=5`,
    );
    const data = await response.json();

    setSearchResults(
      data.features.map(feature => ({
        id: feature.id,
        name: feature.place_name,
        coordinates: feature.center,
      })),
    );
  };
  const toggleLiveMode = () => {
    if (isLive) {
      stopTrackingLocation('stopAll');
    } else {
      setSearchText('');
      setDirection(false);
      setRouteCoordinates([]);
      accuracyZoomLevel = 18;
      setZoomLevel(18);
      updatedZoom = 18;
      setCenterLocation(location);
      setAnimationMode('flyTo');
      startTrackingLocation();
    }
    setAutoCenter(isLive ? false : true);
    setIsLive(!isLive);
  };
  const handleSearchSelect = async item => {
    setCenterLocation({
      latitude: item.coordinates[1],
      longitude: item.coordinates[0],
    });
    // toggleLiveMode();
    setAutoCenter(false);
    setIsLive(false);
    stopTrackingLocation('stopAll');
    setZoomLevel(18);
    setSearchText(item.name);
    setAnimationMode('flyTo');
    setSearchResults([]);
    setLocation(prevLocation => ({
      latitude: item.coordinates[1],
      longitude: item.coordinates[0],
      accuracy: prevLocation?.accuracy,
      altitude: prevLocation?.altitude,
      heading: prevLocation?.heading,
      speed: prevLocation?.speed,
      autoUpdatedCount: prevLocation?.autoUpdatedCount || 0,
      updatedCount: prevLocation?.updatedCount || 0,
    }));
    setAutoCenter(false);
    Keyboard.dismiss();
    const destination = {
      latitude: item.coordinates[1],
      longitude: item.coordinates[0],
    };
    await getRoute(currentLocation, destination);
  };
  const getRoute = async (startLocation, endLocation) => {
    const start = `${startLocation.longitude},${startLocation.latitude}`;
    const end = `${endLocation.longitude},${endLocation.latitude}`;

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?geometries=geojson&access_token=${MAPBOX_DOWNLOADS_TOKEN}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const route = data.routes[0].geometry.coordinates;
      setDirection(true);
      setRouteCoordinates(route);
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };
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
  const startTrackingLocation = async type => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    if (watchId.length > 0) {
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
        setZoomLevel(updatedZoom || accuracyZoomLevel);
        setCurrentLocation(position.coords);
        if (updatedZoom) {
          setCenterLocation(position.coords);
          updatedZoom = null;
        }
        setAnimationMode('');

        if (Number(accuracy?.toFixed(2)) < desired_accuracy) {
          setAutoCenter(false);
          setIsLive(false);
          stopTrackingLocation('stopAll');
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
          Geolocation.clearWatch(element);
        } catch (error) {
          console.log('Error clearing watch ID:', element, error.message);
        }
      });
      Geolocation.stopObserving();
      setWatchId([]); // Clear all watch IDs
    } else {
      if (watchId?.length > 0) {
        const lastWatchId = watchId[watchId.length - 1];
        try {
          Geolocation.clearWatch(lastWatchId);
          setWatchId(watchId.slice(0, -1)); // Remove the last watch ID
        } catch (error) {
          console.log(
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
    setCenterLocation(location);
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
        setCurrentLocation(position.coords);
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

        // if (Number(accuracy?.toFixed(2)) < desired_accuracy) {
        //   stopTrackingLocation('stopAll');
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
    mapBoxObject = camera;
    const visibleBounds = camera?.properties?.bounds;
    if (visibleBounds) {
      setBounds(visibleBounds);
    }
    accuracyZoomLevel = camera?.properties?.zoom;
  };
  const isCoordinateInBounds = (coordinate, bounds) => {
    const {sw, ne} = bounds; // Destructure southwest and northeast bounds
    const [longitude, latitude] = coordinate;

    // Check if the coordinate is within the bounds
    return (
      latitude >= sw[1] &&
      latitude <= ne[1] && // Latitude should be between sw[1] and ne[1]
      longitude >= sw[0] &&
      longitude <= ne[0] // Longitude should be between sw[0] and ne[0]
    );
  };
  useEffect(() => {
    if (bounds && location) {
      const coordinate = [location.longitude, location.latitude];
      const inBounds = isCoordinateInBounds(coordinate, bounds);
      if (!inBounds && isLive && autoCenter) {
        accuracyZoomLevel = 18;
        setZoomLevel(18);
        updatedZoom = 18;
        setCenterLocation(location);
        setAnimationMode('flyTo');
      }
    }
  }, [location, bounds]);
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
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
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
          {routeCoordinates && direction && (
            <MapboxGL.ShapeSource
              id="routeSource"
              shape={{
                type: 'Feature',
                geometry: {type: 'LineString', coordinates: routeCoordinates},
              }}>
              <MapboxGL.LineLayer
                id="routeLayer"
                style={{
                  lineColor: '#3887be',
                  lineWidth: 5,
                }}
              />
            </MapboxGL.ShapeSource>
          )}

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
      </TouchableWithoutFeedback>
      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {
            top: 30,
            alignItems: landscape ? 'flex-start' : 'center',
          },
        ]}>
        <CustomInput
          placeholder="Search for a location"
          value={searchText}
          containerStyle={{
            left: landscape ? '-2.5%' : 0,
          }}
          onChangeText={handleSearch}
        />
        {searchResults.length > 0 && (
          <FlatList
            data={searchResults}
            keyExtractor={item => item.id}
            style={styles.searchResults}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSearchSelect(item)}>
                <Text style={styles.resultText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
      {isCompassOn && <Compass independent={true} setAngle={setCurrentAngle} />}
      <View style={styles.detailsContainer}>
        {/* Compass Toggle Button */}
        <TouchableOpacity
          style={[styles.toggleButton2, {marginTop: 90}]}
          onPress={() => setIsCompassOn(!isCompassOn)}>
          <Icon
            name={isCompassOn ? 'compass' : 'compass-off'}
            size={25}
            color="white"
          />
        </TouchableOpacity>

        {/* Details Show/Hide Button */}
        <TouchableOpacity
          style={styles.toggleButton2}
          onPress={() => {
            setShowDetails(!showDetails);
          }}>
          <Icon
            name={showDetails ? 'information' : 'information-off'}
            size={25}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={zoomLevel == 20 ? 0.5 : 1}
          style={styles.toggleButton2}
          disabled={zoomLevel == 20}
          onPress={() => {
            if (zoomLevel < 20) {
              const newZoomLevel = zoomLevel + 1; // Increase zoom level
              setZoomLevel(newZoomLevel);
              accuracyZoomLevel = newZoomLevel;
            }
          }}>
          <Icon name="plus-circle" size={25} color="white" />
        </TouchableOpacity>

        {/* Zoom Out Button */}
        <TouchableOpacity
          style={styles.toggleButton2}
          onPress={() => {
            const newZoomLevel = zoomLevel + 1;
            setZoomLevel(newZoomLevel);
            accuracyZoomLevel = newZoomLevel;
          }}>
          <Icon name="minus-circle" size={25} color="white" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.toggleButton, {bottom: 220}]}
        disabled={routeCoordinates?.length == 0 || !routeCoordinates}
        onPress={() => setDirection(!direction)}>
        <Icon
          name={'directions'}
          size={25}
          color={direction ? 'red' : 'white'}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.toggleButton, {bottom: 170}]}
        onPress={() => setAutoCenter(!autoCenter)}>
        <Icon
          name={
            autoCenter
              ? 'image-filter-center-focus-strong'
              : 'image-filter-center-focus-weak'
          }
          size={25}
          color={autoCenter ? 'red' : 'white'}
        />
      </TouchableOpacity>
      {/* Live/Not Live Toggle Button */}
      <TouchableOpacity
        style={[styles.toggleButton, {bottom: 120}]}
        onPress={toggleLiveMode}>
        <Icon
          name={isLive ? 'record-circle' : 'record-circle-outline'}
          size={25}
          color={isLive ? 'red' : 'white'}
        />
      </TouchableOpacity>
      {/* Toggle Button for Satellite/Street View */}
      <TouchableOpacity style={styles.toggleButton} onPress={toggleMapStyle}>
        <Icon
          name={
            mapStyle === MapboxGL.StyleURL.Street ? 'satellite-uplink' : 'map'
          }
          size={25}
          color="white"
        />
      </TouchableOpacity>

      {/* Current Location Button */}
      <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
        <Icon name="crosshairs-gps" size={25} color="white" />
      </TouchableOpacity>

      {/* Location Information */}
      {location && showDetails && (
        <View
          style={[
            styles.locationInfo,
            {top: landscape ? 10 : 100, right: landscape ? 70 : 10},
          ]}>
          <Text style={styles.locationText}>
            Latitude: {location?.latitude.toFixed(6) || 0}
          </Text>
          <Text style={styles.locationText}>
            Longitude: {location?.longitude.toFixed(6) || 0}
          </Text>
          <Text style={styles.locationText}>
            Accuracy: {location?.accuracy.toFixed(2) || 0} m
          </Text>
          <Text style={styles.locationText}>
            Altitude: {location?.altitude.toFixed(2) || 0} m
          </Text>
          <Text style={styles.locationText}>
            Heading: {location?.heading.toFixed(2) || 0}°
          </Text>
          <Text style={styles.locationText}>
            Speed: {location?.speed.toFixed(2) || 0} m/s
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
    bottom: 20,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    padding: 10,
  },
  toggleButton: {
    position: 'absolute',
    bottom: 70,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    padding: 10,
  },
  detailsContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  toggleButton2: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    padding: 5,
  },
  locationInfo: {
    position: 'absolute',
    top: 85,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
  locationText: {color: '#fff', fontSize: 14},
  error: {position: 'absolute', bottom: 100, left: 10},
  errorText: {color: 'red'},
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 10,
    // backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 10,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResults: {
    marginTop: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    color: '#757575',
  },
  resultText: {
    fontSize: 16,
    color: '#757575',
  },
});

export default LiveLocation;
