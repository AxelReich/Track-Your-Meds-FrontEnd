import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { apiService, PartialMedication } from '../services/api';
import { HomeStackParamList } from '../navigation/HomeStackNavigator';

type AddMedicationScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'AddMedication'>;
type AddMedicationScreenRouteProp = RouteProp<HomeStackParamList, 'AddMedication'>;

interface AddMedicationScreenProps {
  navigation: AddMedicationScreenNavigationProp;
  route: AddMedicationScreenRouteProp;
}

const AddMedicationScreen: React.FC<AddMedicationScreenProps> = ({ navigation, route }) => {
  const { stageId, stageName, symptomId, symptomName } = route.params;
  
  const [name, setName] = useState('');
  const [intervalHours, setIntervalHours] = useState('8');
  const [totalDays, setTotalDays] = useState('5');
  const [quantityMg, setQuantityMg] = useState('400');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a medication name');
      return;
    }

    if (!intervalHours || !totalDays || !quantityMg) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const medicationData: PartialMedication = {
        name: name.trim(),
        intervalHours: parseInt(intervalHours),
        totalDays: parseInt(totalDays),
        quantityMg: parseInt(quantityMg),
        treatmentId: symptomId, // This is the symptom ID
        stageId: stageId,
        stage: null,
        intakes: null,
      };

      console.log('Creating medication with data:', medicationData);
      const newMedication = await apiService.createMedication(medicationData);
      
      console.log('Medication created successfully:', newMedication);
      Alert.alert(
        'Success', 
        'Medication added successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating medication:', error);
      Alert.alert('Error', `Failed to create medication: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Add Medication</Text>
        <Text style={styles.subtitle}>
          Adding medication to {stageName} stage for {symptomName}
        </Text>

        {/* Medication Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Medication Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Ibuprofen, Paracetamol, Aspirin"
            placeholderTextColor="#999"
          />
        </View>

        {/* Dosage Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Dosage (mg) *</Text>
          <TextInput
            style={styles.input}
            value={quantityMg}
            onChangeText={setQuantityMg}
            placeholder="400"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* Interval Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Interval (hours) *</Text>
          <TextInput
            style={styles.input}
            value={intervalHours}
            onChangeText={setIntervalHours}
            placeholder="8"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* Duration Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Duration (days) *</Text>
          <TextInput
            style={styles.input}
            value={totalDays}
            onChangeText={setTotalDays}
            placeholder="5"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ Medication Details</Text>
          <Text style={styles.infoText}>
            • Dosage: {quantityMg}mg{'\n'}
            • Every {intervalHours} hours{'\n'}
            • For {totalDays} days{'\n'}
            • Stage: {stageName}{'\n'}
            • Symptom: {symptomName}
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Add Medication</Text>
          )}
        </TouchableOpacity>

        {/* Debug Section */}
        {__DEV__ && (
          <View style={styles.debugSection}>
            <Text style={styles.debugTitle}>🔧 Debug Info</Text>
            <Text style={styles.debugText}>Stage ID: {stageId}</Text>
            <Text style={styles.debugText}>Symptom ID: {symptomId}</Text>
            <Text style={styles.debugText}>Stage Name: {stageName}</Text>
            <Text style={styles.debugText}>Symptom Name: {symptomName}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  infoBox: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1b5e20',
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  debugSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
  },
  debugText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
});

export default AddMedicationScreen;
