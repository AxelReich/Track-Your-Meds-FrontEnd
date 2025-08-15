import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import type { Symptom } from '../services/api';

interface SymptomCardProps {
  symptom: Symptom;
  onToggleActive: (symptomId: number, value: boolean) => void;
}

export default function SymptomCard({ symptom, onToggleActive }: SymptomCardProps) {
  const handleToggle = (value: boolean) => {
    onToggleActive(symptom.id, value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.symptomName} numberOfLines={2} ellipsizeMode="tail">
            {symptom.name}
          </Text>
        </View>
        <View style={styles.toggleContainer}>
          <Text style={styles.activeLabel}>Active</Text>
          <Switch
            value={symptom.isActive}
            onValueChange={handleToggle}
            trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
            thumbColor={symptom.isActive ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#e0e0e0"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 80, // Fixed minimum height
    maxHeight: 100, // Maximum height to prevent cards from being too tall
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 16,
  },
  symptomName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    lineHeight: 22,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0, // Prevent toggle from shrinking
  },
  activeLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
});
