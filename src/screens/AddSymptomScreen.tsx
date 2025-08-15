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
import { apiService, type PartialSymptom, type PartialStage, type PartialMedication } from '../services/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../navigation/HomeStackNavigator';
import SymptomForm from '../components/SymptomForm';

type AddSymptomScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'AddSymptom'>;

interface AddSymptomScreenProps {
  navigation: AddSymptomScreenNavigationProp;
}

interface StageData {
  name: string;
  medications: PartialMedication[];
}

export default function AddSymptomScreen({ navigation }: AddSymptomScreenProps) {
  const [symptomName, setSymptomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSymptomForm, setShowSymptomForm] = useState(false);

  const handleNext = () => {
    if (!symptomName.trim()) {
      Alert.alert('Error', 'Please enter a symptom name');
      return;
    }
    setShowSymptomForm(true);
  };

  const handleSave = async (stages: StageData[]) => {
    setIsLoading(true);
    try {
      // Filter out stages with no medications and format exactly as your API expects
      const apiStages = stages
        .filter(stage => stage.medications.length > 0) // Only include stages with medications
        .map(stage => ({
          name: stage.name,
          medication: stage.medications.map(med => ({
            name: med.name,
            quantityMg: med.quantityMg || 0,
            intervalHours: med.intervalHours || 8,
            totalDays: med.totalDays || 5
          }))
        }));

      // Ensure we have at least one stage with medications
      if (apiStages.length === 0) {
        Alert.alert('Error', 'Please add at least one medication to any stage');
        setIsLoading(false);
        return;
      }

      const symptomData = {
        name: symptomName.trim(),
        isActive: true,
        stages: apiStages,
      };

      console.log('Creating symptom with data:', symptomData);
      
      const newSymptom = await apiService.createSymptom(symptomData);
      
      console.log('Symptom created successfully:', newSymptom);
      Alert.alert(
        'Success', 
        'Symptom added successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating symptom:', error);
      Alert.alert('Error', `Failed to create symptom: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (symptomName.trim() || showSymptomForm) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleBackToName = () => {
    setShowSymptomForm(false);
  };

  if (showSymptomForm) {
    return (
      <SymptomForm
        symptomName={symptomName}
        onSave={handleSave}
        onCancel={handleBackToName}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Symptom</Text>
        <TouchableOpacity 
          onPress={handleNext} 
          style={[styles.nextButton, !symptomName.trim() && styles.nextButtonDisabled]}
          disabled={!symptomName.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={[styles.nextButtonText, !symptomName.trim() && styles.nextButtonTextDisabled]}>
              Next
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Symptom Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Symptom Name *</Text>
          <TextInput
            style={styles.input}
            value={symptomName}
            onChangeText={setSymptomName}
            placeholder="e.g., Headache, Fever, Nausea"
            placeholderTextColor="#999"
            autoFocus={true}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <Text style={styles.helperText}>
            Enter a descriptive name for your symptom
          </Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.infoText}>
              This symptom will be created as active by default
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.infoText}>
              You'll configure stages and medications in the next step
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  nextButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
  },
  nextButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  nextButtonTextDisabled: {
    color: '#999999',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
  },
});
