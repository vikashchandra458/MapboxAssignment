import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';

import {BleManager, State} from 'react-native-ble-plx';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';

import Header from './Header';
import StatusCard from './StatusCard';
import ActionButton from './ActionButton';
import DeviceCard from './DeviceCard';
import EmptyState from './EmptyState';
import NfcCard from './NfcCard';

const manager = new BleManager();

const BluetoothNFCReader = () => {
  const [devices, setDevices] = useState([]);
  const [nfcData, setNfcData] = useState('');
  const [bleState, setBleState] = useState('Unknown');
  const [nfcAvailable, setNfcAvailable] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [readingNfc, setReadingNfc] = useState(false);
  const connectedDeviceRef = useRef(null);
  const connectionIntervalRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    NfcManager.start();

    NfcManager.isSupported().then(setNfcAvailable);

    const subscription = manager.onStateChange(state => {
      setBleState(state);
    }, true);

    checkConnectedDevices();

    return () => {
      subscription.remove();

      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      stopConnectionMonitor();
      manager.destroy();
    };
  }, []);
  const requestBluetoothPermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    if (Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      return (
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };
  const scanBluetooth = useCallback(async () => {
    const permission = await requestBluetoothPermission();

    if (!permission) {
      Alert.alert('Permission', 'Bluetooth permission denied');
      return;
    }

    const bluetoothState = await manager.state();

    if (bluetoothState !== State.PoweredOn) {
      Alert.alert('Bluetooth', 'Please turn on Bluetooth');
      return;
    }

    manager.stopDeviceScan();

    setDevices([]);
    setIsScanning(true);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log('BLE Scan Error:', error);
        setIsScanning(false);
        return;
      }

      if (!device?.name && !device?.localName) {
        return;
      }
      if (!isMounted.current) return;
      setDevices(previousDevices => {
        const updatedDevice = {
          ...device,
          name: device.name || device.localName,
          lastSeen: new Date().toLocaleTimeString(),
        };

        const index = previousDevices.findIndex(
          item => item.id === updatedDevice.id,
        );

        let nextDevices;

        if (index >= 0) {
          nextDevices = [...previousDevices];
          nextDevices[index] = {
            ...nextDevices[index],
            ...updatedDevice,
          };
        } else {
          nextDevices = [...previousDevices, updatedDevice];
        }

        nextDevices.sort((a, b) => (b.rssi ?? -999) - (a.rssi ?? -999));

        return nextDevices;
      });
    });

    scanTimeoutRef.current = setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
    }, 8000);
  }, []);
  const readNfc = async () => {
    if (readingNfc) {
      return;
    }

    setReadingNfc(true);

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);

      const tag = await NfcManager.getTag();

      setNfcData(JSON.stringify(tag, null, 2));
    } finally {
      setReadingNfc(false);
      NfcManager.cancelTechnologyRequest();
    }
  };

  const checkConnectedDevices = async () => {
    try {
      const connectedDevices = await manager.connectedDevices([
        '66666666-6666-6666-6666-666666666666',
      ]);

      const activeDevices = [];

      for (const device of connectedDevices) {
        const isConnected = await manager.isDeviceConnected(device.id);

        console.log(device.name, isConnected);

        if (isConnected) {
          activeDevices.push({
            ...device,
            connected: true,
            name: device.name || device.localName,
          });
        }
      }
      if (!isMounted.current) return;
      setDevices(activeDevices);
    } catch (e) {
      console.log(e);
    }
  };
  const startConnectionMonitor = () => {
    stopConnectionMonitor();

    connectionIntervalRef.current = setInterval(async () => {
      try {
        if (!connectedDeviceRef.current) {
          return;
        }

        const device = connectedDeviceRef.current;

        const connected = await manager.isDeviceConnected(device.id);

        console.log(
          `[${new Date().toLocaleTimeString()}] ${device.name} Connected:`,
          connected,
        );

        if (!connected && isMounted.current) {
          connectedDeviceRef.current = null;
          setDevices(prev =>
            prev.map(d =>
              d.id === device.id
                ? {
                    ...d,
                    connected: false,
                  }
                : d,
            ),
          );

          stopConnectionMonitor();
        }
      } catch (e) {
        console.log('Connection Monitor Error:', e);
        stopConnectionMonitor();
      }
    }, 5000);
  };
  const stopConnectionMonitor = () => {
    if (connectionIntervalRef.current) {
      clearInterval(connectionIntervalRef.current);
      connectionIntervalRef.current = null;
    }
  };
  const connectToDevice = useCallback(async device => {
    try {
      manager.stopDeviceScan();
      setIsScanning(false);

      let connectedDevice = await manager.connectToDevice(device.id, {
        timeout: 10000,
      });

      connectedDevice =
        await connectedDevice.discoverAllServicesAndCharacteristics();
      connectedDeviceRef.current = connectedDevice;

      startConnectionMonitor();
      const isConnected = await connectedDevice.isConnected();

      console.log('BLE Connected:', isConnected);

      const services = await connectedDevice.services();

      console.log(
        'Services:',
        services.map(s => s.uuid),
      );

      connectedDevice.onDisconnected((error, disconnectedDevice) => {
        if (!manager || !isMounted.current) return;
        console.log('Disconnected Device:', disconnectedDevice?.id);
        setDevices(prev => {
          console.log(
            'Current Devices:',
            prev.map(x => ({
              id: x.id,
              connected: x.connected,
            })),
          );

          return prev.map(d => {
            console.log(
              'Compare:',
              d.id,
              disconnectedDevice?.id,
              d.id === disconnectedDevice?.id,
            );

            return d.id === disconnectedDevice?.id
              ? {
                  ...d,
                  connected: false,
                }
              : d;
          });
        });
      });

      setDevices(prev =>
        prev.map(d =>
          d.id === device.id
            ? {
                ...d,
                connected: true,
              }
            : d,
        ),
      );
    } catch (error) {
      console.log('Connection Error:', error);

      Alert.alert('Connection Failed', error?.message || 'Unable to connect.');
    }
  }, []);
  const disconnectDevice = useCallback(async device => {
    try {
      stopConnectionMonitor();

      connectedDeviceRef.current = null;

      const connected = await manager.isDeviceConnected(device.id);

      if (connected) {
        await manager.cancelDeviceConnection(device.id);
      }

      setDevices(prev =>
        prev.map(d =>
          d.id === device.id
            ? {
                ...d,
                connected: false,
              }
            : d,
        ),
      );

      console.log('Disconnected');
    } catch (error) {
      console.log('Disconnect Error:', error);
    }
  }, []);
  const onConnect = useCallback(
    async device => {
      const connected = await manager.isDeviceConnected(device.id);

      if (connected) {
        disconnectDevice(device);
      } else {
        connectToDevice(device);
      }
    },
    [connectToDevice, disconnectDevice],
  );
  const clearData = () => {
    manager.stopDeviceScan();
    setDevices([]);
    setNfcData('');
    setIsScanning(false);
  };
  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <View style={styles.statusRow}>
        <StatusCard
          title="Bluetooth"
          value={bleState}
          color={bleState === State.PoweredOn ? '#22C55E' : '#EF4444'}
        />

        <StatusCard
          title="NFC"
          value={nfcAvailable ? 'Available' : 'Unavailable'}
          color={nfcAvailable ? '#3B82F6' : '#EF4444'}
        />
      </View>

      <ActionButton
        title={isScanning ? 'Scanning...' : 'Scan Bluetooth'}
        icon="📡"
        onPress={scanBluetooth}
      />

      <ActionButton
        title={readingNfc ? 'Waiting for Tag...' : 'Read NFC Tag'}
        onPress={readNfc}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {isScanning && (
          <ActivityIndicator
            size="large"
            color="#3B82F6"
            style={{marginVertical: 20}}
          />
        )}
        {devices.length === 0 ? (
          <EmptyState />
        ) : (
          devices.map(device => (
            <DeviceCard key={device.id} device={device} onConnect={onConnect} />
          ))
        )}

        <NfcCard data={nfcData} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default BluetoothNFCReader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
});
