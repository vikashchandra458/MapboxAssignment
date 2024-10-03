import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapboxGL from '@rnmapbox/maps';
import {MAPBOX_DOWNLOADS_TOKEN} from '@env';
import PolygonControls from './DashboardComponents/PolygonControls';
import MapViewComponent from './DashboardComponents/MapViewComponent';
import MessageModal from '../Components/MessageModal';
import AreaDisplay from './DashboardComponents/AreaDisplay';
import * as turf from '@turf/turf';

MapboxGL.setAccessToken(MAPBOX_DOWNLOADS_TOKEN);

const Dashboard = () => {
  const [savedPolygons, setSavedPolygons] = useState([]);
  const [currentCoordinates, setCurrentCoordinates] = useState([]);
  const [area, setArea] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [editable, setEditable] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState([]);

  // Load saved polygons from AsyncStorage
  const loadSavedPolygons = async () => {
    try {
      const storedPolygons = await AsyncStorage.getItem('savedPolygons');
      if (storedPolygons) {
        setSavedPolygons(JSON.parse(storedPolygons));
      }
    } catch (error) {
      console.error('Error loading polygons from storage:', error);
    }
  };

  // Save polygons to AsyncStorage
  const savePolygons = async polygons => {
    try {
      if (polygons?.length == 25) return; // Limit polygons to 25
      await AsyncStorage.setItem('savedPolygons', JSON.stringify(polygons));
      setSavedPolygons(polygons);
      setCurrentCoordinates([]);
      setMarkers([]);
      setEditable(false);
      setArea(null);
    } catch (error) {
      console.error('Error saving polygons to storage:', error);
    }
  };

  // Clear the current coordinates and reset relevant states
  const clearCoordinates = () => {
    try {
      setCurrentCoordinates([]);
      setArea(null);
      setMarkers([]);
      setEditable(false);
    } catch (error) {
      console.error('Error clearing coordinates:', error);
    }
  };

  // Delete the selected polygon
  const handleDeletePolygon = () => {
    try {
      const newPolygons = savedPolygons.filter(
        current => current !== selectedCoordinates,
      );
      savePolygons(newPolygons);
      setSelectedCoordinates([]);
      setCurrentCoordinates([]);
    } catch (error) {
      console.error('Error deleting polygon:', error);
    }
  };

  const calculateArea = coords => {
    try {
      const polygon = turf.polygon([coords]); // Create a polygon with Turf.js
      const areaInSquareMeters = turf.area(polygon); // Calculate area in square meters
      const areaInAcres = areaInSquareMeters / 4046.86; // Convert to acres
      return areaInAcres;
    } catch (error) {
      console.error('Error calculating area:', error);
      return null;
    }
  };

  useEffect(() => {
    loadSavedPolygons();
  }, []);

  useEffect(() => {
    if (selectedCoordinates?.length > 0) {
      const closedCoordinates = [
        ...selectedCoordinates,
        selectedCoordinates[0],
      ]; // Close the polygon by repeating the first point
      const calculatedArea = calculateArea(closedCoordinates);
      setArea(calculatedArea);
    } else {
      setArea(null);
    }
  }, [selectedCoordinates]);

  return (
    <View style={{flex: 1}}>
      <MapViewComponent
        currentCoordinates={currentCoordinates}
        setCurrentCoordinates={setCurrentCoordinates}
        savedPolygons={savedPolygons}
        markers={markers}
        setMarkers={setMarkers}
        setArea={setArea}
        editable={editable}
        setSelectedCoordinates={setSelectedCoordinates}
        calculateArea={calculateArea}
      />
      {area && editable && <AreaDisplay area={area} />}
      <PolygonControls
        editable={editable}
        clearCoordinates={clearCoordinates}
        savePolygons={savePolygons}
        savedPolygons={savedPolygons}
        currentCoordinates={currentCoordinates}
        setEditable={setEditable}
      />
      {selectedCoordinates.length > 0 && (
        <MessageModal
          visible={selectedCoordinates.length > 0}
          setModalVisible={() => setSelectedCoordinates([])}
          handleSubmit={handleDeletePolygon}
          coordinates={selectedCoordinates}
          area={area}
        />
      )}
    </View>
  );
};

export default Dashboard;
