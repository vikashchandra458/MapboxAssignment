import React, {useEffect, useState} from 'react';
import {
  View,
  Button,
  StyleSheet,
  FlatList,
  PermissionsAndroid,
  Alert,
  Platform,
  Modal,
  Text,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import CustomButton from '../Components/CustomButton';
const Dashboard = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [input, setInput] = useState('');
  const [location, setLocation] = useState(null);

  const buttons = [
    {name: 'Polygon Draw', screen: 'PolygonDraw'},
    {name: 'Live Location', screen: 'LiveLocation'},
    {name: 'Compass', screen: 'Compass'},
    {name: 'Compass Heading', screen: 'CompassComponent'},
  ];

  // Log button data for debugging
  console.log('Buttons array:', buttons);

  // Render each button with FlatList
  const renderButton = ({item}) => (
    <View style={styles.buttonWrapper}>
      <CustomButton
        onPress={() => {
          if (item.name == 'Live Location') {
            setModalVisible(true);
            getCurrentLocation();
          } else {
            navigation.navigate(item.screen);
          }
        }}
        isValid={true}
        title={item.name}
        style={{width: '100%'}}
      />
      {/* <Button
        title={item.name}
        onPress={() => {
          if (item.name == 'Live Location') {
            setModalVisible(true);
            getCurrentLocation();
          } else {
            navigation.navigate(item.screen);
          }
        }}
      /> */}
    </View>
  );

  // Request location permission for Android
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

  // Get current location
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
          autoUpdatedCount: 0,
          updatedCount: 0,
        }));
        setModalVisible(true);
      },
      error => {
        console.log('Error getting current location:', error.message);
        Alert.alert('Error', 'Failed to get current location.');
        setModalVisible(true);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
    setModalVisible(true);
  };

  // Handle modal submit
  const handleSubmit = number => {
    setModalVisible(false);
    setInput('');
    navigation.navigate('LiveLocation', {
      propslocation: location,
      desiredAccuracy: number || input || '0',
    });
  };
  console.log(typeof input, input);
  return (
    <View style={styles.container}>
      <FlatList
        data={buttons}
        renderItem={renderButton}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2} // This will display 2 buttons per row
        contentContainerStyle={styles.buttonContainer}
      />

      {/* Modal for location accuracy input */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false} // Set to false for testing, change as needed
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <CustomButton
              onPress={() => {
                handleSubmit(0);
              }}
              isValid={true}
              title={'Go Live'}
              style={{width: '100%'}}
            />
            <Text
              style={[
                styles.modalTitle,
                {textAlign: 'center', width: '100%', marginVertical: 20},
              ]}>
              Or
            </Text>
            <Text style={styles.modalTitle}>Please Enter Desired Accuracy</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={input != 0 ? String(input) : ''}
              onChangeText={number => setInput(Number(number))}
              placeholder="Enter 2 digit"
              placeholderTextColor={'#757575'}
            />
            <View style={styles.modalButtons}>
              <CustomButton
                onPress={() => setModalVisible(false)}
                isValid={true}
                title={'Cancel'}
                textStyle={{color: '#8D00FF'}}
                style={{
                  width: '45%',
                  backgroundColor: 'white',
                  borderWidth: 1,
                  borderColor: '#8D00FF',
                }}
              />
              <CustomButton
                onPress={() => {
                  handleSubmit(input);
                }}
                isValid={input}
                title={'Submit'}
                style={{width: '45%'}}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  buttonContainer: {
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    flex: 1,
    marginVertical: 5,
    marginHorizontal: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Light transparency for modal background
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: 'black', // Make sure the text is readable
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: 'black',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default Dashboard;
