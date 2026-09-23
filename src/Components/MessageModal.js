import React from 'react';
import {View, Modal, Text, StyleSheet, FlatList} from 'react-native';
import CustomButton from './CustomButton';
import AreaDisplay from '../Screens/DashboardComponents/AreaDisplay';
import {useAvailableDimensions} from './AvailableDimensions';

const MessageModal = ({
  visible,
  setModalVisible,
  handleSubmit,
  coordinates,
  area,
}) => {
  const {landscape} = useAvailableDimensions();
  // Render each coordinate in the list
  const renderCoordinate = ({item, index}) => (
    <View
      style={[styles.coordinateItem, landscape && {width: '50%'}]}
      key={index}>
      <Text style={styles.coordinateLabel}>Coordinate {index + 1}:</Text>
      <Text style={styles.coordinateText}>Latitude: {item[1].toFixed(6)}</Text>
      <Text style={styles.coordinateText}>Longitude: {item[0].toFixed(6)}</Text>
    </View>
  );

  const numColumns = landscape ? 2 : 1;
  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={() => setModalVisible(false)}>
      {/* Close modal on request */}
      <View style={styles.container}>
        <View style={[styles.modalView, {maxHeight: '90%'}]}>
          <View style={styles.textContainer}>
            {area && (
              <AreaDisplay
                area={area}
                style={{
                  backgroundColor: 'rgba(128, 0, 0, 0.5)',
                  borderRadius: 5,
                  padding: 10,
                }}
              />
            )}

            {/* Coordinates List */}
            <FlatList
              data={coordinates}
              renderItem={renderCoordinate}
              keyExtractor={(item, index) => index.toString()}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
              style={styles.coordinatesList}
              numColumns={numColumns}
              showsHorizontalScrollIndicator={false}
              key={`numColumns-${numColumns}`}
              ListEmptyComponent={
                <Text style={styles.noCoordinatesText}>
                  No coordinates available.
                </Text>
              }
            />

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <CustomButton
                onPress={handleSubmit} // Action to delete coordinates
                isValid={true}
                title={'Delete'}
                style={styles.deleteButton}
              />
              <CustomButton
                onPress={() => {
                  setModalVisible(false); // Close modal on button press
                }}
                isValid={true}
                title={'Close'}
                style={styles.closeButton}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(128, 128, 128, 0.8)',
  },
  modalView: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    paddingVertical: 50,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  textContainer: {
    width: '85%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  coordinatesList: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  coordinateItem: {
    flexDirection: 'column',
    paddingVertical: 8,
  },
  coordinateLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  coordinateText: {
    fontSize: 14,
    color: '#333',
  },
  noCoordinatesText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  buttonContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
  },
  deleteButton: {
    width: '40%',
    backgroundColor: '#757575',
  },
  closeButton: {
    width: '40%',
  },
});

export default MessageModal;
