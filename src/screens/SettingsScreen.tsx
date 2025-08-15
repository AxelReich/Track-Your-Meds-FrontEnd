import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings</Text>
      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>TrackYourMeds v1.0.0</Text>
        <Text style={styles.versionSubtext}>Built with ❤️ for better health</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 30 },
  versionContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  versionSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});
