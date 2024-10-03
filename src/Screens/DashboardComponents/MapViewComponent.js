import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import normaliseText from '../../Components/normaliseText';

const MapViewComponent = ({
  currentCoordinates,
  setCurrentCoordinates,
  savedPolygons,
  markers,
  setMarkers,
  setArea,
  editable,
  setSelectedCoordinates,
  calculateArea,
}) => {
  const handleMapPress = async event => {
    if (!editable) return; // Prevent adding points if not in editable mode

    const newPoint = event.geometry.coordinates;
    const updatedCoordinates = [...currentCoordinates, newPoint];

    // Update state with new coordinates and markers
    setCurrentCoordinates(updatedCoordinates);
    setMarkers(prevMarkers => [
      ...prevMarkers,
      {coordinates: newPoint, area: null},
    ]);

    // Calculate the area if enough points are available
    if (updatedCoordinates.length >= 3) {
      const closedCoordinates = [...updatedCoordinates, updatedCoordinates[0]]; // Ensure the polygon is closed
      const calculatedArea = calculateArea(closedCoordinates);
      setArea(calculatedArea);

      // Update the last marker with the calculated area
      const updatedMarkers = [...markers];
      updatedMarkers[updatedMarkers.length - 1].area = calculatedArea;
      setMarkers(updatedMarkers);
    }
  };

  const calculateCentroid = coords => {
    const x = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;
    const y = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;
    return [x, y];
  };

  return (
    <MapboxGL.MapView style={{flex: 1}} onPress={handleMapPress}>
      <MapboxGL.Camera zoomLevel={10} centerCoordinate={[-73.9654, 40.7829]} />

      {/* Render current polygon if it exists */}
      {currentCoordinates.length >= 3 && (
        <MapboxGL.ShapeSource
          id="current-polygon"
          shape={{
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[...currentCoordinates, currentCoordinates[0]]], // Ensure the polygon is closed by repeating the first coordinate at the end
            },
          }}>
          <MapboxGL.FillLayer
            id="current-fill-layer"
            style={{
              fillColor: 'rgba(0, 255, 0, 0.5)',
              fillOutlineColor: 'rgba(0, 0, 0, 0.5)',
            }}
          />
        </MapboxGL.ShapeSource>
      )}

      {/* Render saved polygons */}
      {savedPolygons.map((polygon, index) => {
        const closedPolygon = [...polygon, polygon[0]]; // Ensure each saved polygon is closed
        const centroid = calculateCentroid(closedPolygon); // Calculate the centroid of the polygon

        return (
          <React.Fragment key={`saved-polygon-${index}`}>
            <MapboxGL.ShapeSource
              id={`saved-polygon-${index}`}
              onPress={() => setSelectedCoordinates(polygon)}
              shape={{
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [closedPolygon],
                },
              }}>
              <MapboxGL.FillLayer
                id={`saved-fill-layer-${index}`}
                style={{
                  fillColor: 'rgba(255, 0, 0, 0.5)',
                  fillOutlineColor: 'rgba(0, 0, 0, 0.5)',
                }}
              />
            </MapboxGL.ShapeSource>

            {/* View button at the centroid of the polygon */}
            <MapboxGL.PointAnnotation
              id={`view-button-${index}`}
              onSelected={() => setSelectedCoordinates(polygon)}
              coordinate={centroid}>
              <View style={styles.viewButton}>
                <Text style={styles.viewButtonText}>📍</Text>
              </View>
            </MapboxGL.PointAnnotation>
          </React.Fragment>
        );
      })}

      {/* Render markers with details on press */}
      {editable &&
        markers.map((marker, index) => (
          <MapboxGL.PointAnnotation
            key={`marker-${index}`}
            id={`marker-${index}`}
            coordinate={marker.coordinates}>
            <View
              style={{
                zIndex: -1,
              }}>
              <Text style={{fontSize: 20}}>📍</Text>
            </View>
          </MapboxGL.PointAnnotation>
        ))}
    </MapboxGL.MapView>
  );
};

const styles = StyleSheet.create({
  viewButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: normaliseText(20),
    color: 'white',
  },
});

export default MapViewComponent;
