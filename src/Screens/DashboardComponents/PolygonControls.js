import React from 'react';
import {View, Alert, StyleSheet} from 'react-native';
import CustomButton from '../../Components/CustomButton';

const PolygonControls = ({
  editable,
  savedPolygons,
  clearCoordinates,
  savePolygons,
  currentCoordinates,
  setEditable,
}) => {
  return (
    <View style={styles.buttonContainer}>
      {editable ? (
        <>
          <View
            style={{
              justifyContent: 'space-between',
              flexDirection: 'row',
              width: '100%',
            }}>
            <CustomButton
              onPress={clearCoordinates}
              isValid={true}
              title={'Clear'}
              style={{
                maxWidth: 150,
                width: '40%',
                marginTop: 20,
                backgroundColor: '#757575',
              }}
            />
            <CustomButton
              onPress={() => {
                // Ensure at least 3 points to form a polygon
                if (currentCoordinates.length < 3) {
                  Alert.alert(
                    'Invalid!',
                    'You need at least 3 points to save a polygon.',
                  );
                  return;
                }
                // Ensure not to save more than 25 polygons
                else if (savedPolygons?.length == 25) {
                  Alert.alert('Sorry!', 'You can save max 25 Polygons.');
                  return;
                } else {
                  savePolygons([...savedPolygons, currentCoordinates]);
                }
              }}
              isValid={true}
              title={'Save Polygon'}
              style={{width: '40%', marginTop: 20, maxWidth: 150}}
            />
          </View>
        </>
      ) : (
        <CustomButton
          onPress={() => setEditable(true)}
          isValid={true}
          title={'Edit'}
          style={{
            maxWidth: 150,
            width: '40%',
            marginTop: 20,
            backgroundColor: '#757575',
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginHorizontal: '5%',
  },
});

export default PolygonControls;
