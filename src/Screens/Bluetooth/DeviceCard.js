import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const getIcon = name => {
  if (!name) return '📡';

  const n = name.toLowerCase();

  if (n.includes('buds')) return '🎧';
  if (n.includes('boat')) return '🎧';
  if (n.includes('watch')) return '⌚';
  if (n.includes('band')) return '⌚';
  if (n.includes('speaker')) return '🔊';
  if (n.includes('keyboard')) return '⌨️';
  if (n.includes('mouse')) return '🖱️';
  if (n.includes('phone')) return '📱';

  return '📶';
};

const getSignal = rssi => {
  if (rssi >= -45)
    return {
      text: 'Excellent',
      width: '100%',
      color: '#22C55E',
    };

  if (rssi >= -60)
    return {
      text: 'Good',
      width: '75%',
      color: '#4ADE80',
    };

  if (rssi >= -75)
    return {
      text: 'Fair',
      width: '55%',
      color: '#FACC15',
    };

  return {
    text: 'Weak',
    width: '30%',
    color: '#EF4444',
  };
};

export default function DeviceCard({device, onConnect}) {
  const signal = getSignal(device.rssi);
  const name = device.name || 'Unknown Device';
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getIcon(name)}</Text>
        </View>

        <View style={{flex: 1}}>
          <Text style={styles.name}>{device.name || 'Unknown Device'}</Text>

          <Text style={styles.mac}>{device.id}</Text>
        </View>

        <View
          style={[
            styles.status,
            {
              backgroundColor: device.connected ? '#16A34A' : '#334155',
            },
          ]}>
          <Text style={styles.statusText}>
            {device.connected ? 'Connected' : 'Nearby'}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>RSSI</Text>

        <Text style={styles.value}>{device.rssi} dBm</Text>
      </View>

      <View style={styles.bar}>
        <View
          style={[
            styles.progress,
            {
              width: signal.width,
              backgroundColor: signal.color,
            },
          ]}
        />
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.signal}>{signal.text}</Text>

        <Text style={styles.lastSeen}>{device.lastSeen || ''}</Text>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>BLE</Text>
        </View>

        {device.isConnectable && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Connectable</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: device.connected ? '#DC2626' : '#2563EB',
            },
          ]}
          onPress={() => onConnect(device)}>
          <Text style={styles.buttonText}>
            {device.connected ? 'Disconnect' : 'Connect'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  icon: {
    fontSize: 28,
  },

  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  mac: {
    color: '#94A3B8',
    marginTop: 3,
    fontSize: 13,
  },

  status: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  label: {
    color: '#94A3B8',
    fontSize: 13,
  },

  value: {
    color: '#fff',
    fontWeight: '700',
  },

  bar: {
    marginTop: 10,
    height: 10,
    borderRadius: 20,
    backgroundColor: '#334155',
    overflow: 'hidden',
  },

  progress: {
    height: 10,
    borderRadius: 20,
  },

  signal: {
    color: '#22C55E',
    fontWeight: '700',
  },

  lastSeen: {
    color: '#94A3B8',
    fontSize: 12,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
  },

  badge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
  },

  badgeText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '700',
  },

  button: {
    marginLeft: 'auto',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
