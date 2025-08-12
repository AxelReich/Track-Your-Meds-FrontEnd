import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ActiveMedsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Active Medications</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 30 },
});
