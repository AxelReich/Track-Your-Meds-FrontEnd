import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PartialMedication } from '../services/api';

interface StageData {
  name: string;
  medications: PartialMedication[];
}

interface SymptomFormProps {
  symptomName: string;
  onSave: (stages: StageData[]) => void;
  onCancel: () => void;
}

export default function SymptomForm({ symptomName, onSave, onCancel }: SymptomFormProps) {
  const [stages, setStages] = useState<StageData[]>([
    { name: 'Early', medications: [] },
    { name: 'Mild', medications: [] },
    { name: 'Severe', medications: [] }
  ]);

  const [expandedStage, setExpandedStage] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const addMedicationToStage = (stageIndex: number) => {
    const newMedication: PartialMedication = {
      name: '',
      intervalHours: 8,
      totalDays: 5,
      quantityMg: 400,
      stageId: 0, // Will be set when symptom is created
    };

    const updatedStages = [...stages];
    updatedStages[stageIndex].medications.push(newMedication);
    setStages(updatedStages);
    
    // Clear validation errors when adding new medication
    setValidationErrors({});
  };

  const updateMedication = (stageIndex: number, medIndex: number, field: keyof PartialMedication, value: any) => {
    const updatedStages = [...stages];
    
    // Ensure numeric values are positive
    if (field === 'quantityMg' || field === 'intervalHours' || field === 'totalDays') {
      const numValue = parseInt(value) || 0;
      if (numValue < 0) {
        value = 0; // Prevent negative values
      }
    }
    
    updatedStages[stageIndex].medications[medIndex] = {
      ...updatedStages[stageIndex].medications[medIndex],
      [field]: value
    };
    setStages(updatedStages);
    
    // Clear validation error for this field when user types
    const errorKey = `${stageIndex}-${medIndex}-${field}`;
    if (validationErrors[errorKey]) {
      const newErrors = { ...validationErrors };
      delete newErrors[errorKey];
      setValidationErrors(newErrors);
    }
  };

  const removeMedication = (stageIndex: number, medIndex: number) => {
    Alert.alert(
      'Remove Medication',
      'Are you sure you want to remove this medication?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedStages = [...stages];
            updatedStages[stageIndex].medications.splice(medIndex, 1);
            setStages(updatedStages);
            
            // Clear validation errors for removed medication
            const newErrors = { ...validationErrors };
            Object.keys(newErrors).forEach(key => {
              if (key.startsWith(`${stageIndex}-${medIndex}-`)) {
                delete newErrors[key];
              }
            });
            setValidationErrors(newErrors);
          }
        }
      ]
    );
  };

  const toggleStage = (stageIndex: number) => {
    setExpandedStage(expandedStage === stageIndex ? null : stageIndex);
  };

  const getValidationError = (stageIndex: number, medIndex: number, field: string): string => {
    const errorKey = `${stageIndex}-${medIndex}-${field}`;
    return validationErrors[errorKey] || '';
  };

  const validateMedication = (medication: PartialMedication, stageIndex: number, medIndex: number): boolean => {
    const errors: {[key: string]: string} = {};
    let isValid = true;

    // Check name
    if (!medication.name || !medication.name.trim()) {
      errors[`${stageIndex}-${medIndex}-name`] = 'Must have a name';
      isValid = false;
    }

    // Check dosage
    if (!medication.quantityMg || medication.quantityMg <= 0) {
      errors[`${stageIndex}-${medIndex}-quantityMg`] = 'Must be greater than 0';
      isValid = false;
    }

    // Check interval
    if (!medication.intervalHours || medication.intervalHours <= 0) {
      errors[`${stageIndex}-${medIndex}-intervalHours`] = 'Must be greater than 0';
      isValid = false;
    }

    // Check duration
    if (!medication.totalDays || medication.totalDays <= 0) {
      errors[`${stageIndex}-${medIndex}-totalDays`] = 'Must be greater than 0';
      isValid = false;
    }

    // Update validation errors
    setValidationErrors(prev => ({ ...prev, ...errors }));
    return isValid;
  };

  const handleSave = () => {
    // Clear previous validation errors
    setValidationErrors({});
    
    let allValid = true;

    // Validate all medications
    for (const stage of stages) {
      for (const [medIndex, medication] of stage.medications.entries()) {
        const stageIndex = stages.indexOf(stage);
        if (!validateMedication(medication, stageIndex, medIndex)) {
          allValid = false;
        }
      }
    }

    // Ensure at least one stage has medications
    const stagesWithMedications = stages.filter(stage => stage.medications.length > 0);
    if (stagesWithMedications.length === 0) {
      Alert.alert('Error', 'Please add at least one medication to any stage');
      return;
    }

    if (!allValid) {
      return; // Don't proceed if validation failed
    }

    onSave(stages);
  };

  const hasAnyMedications = stages.some(stage => stage.medications.length > 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configure {symptomName}</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, !hasAnyMedications && styles.saveButtonDisabled]}
          disabled={!hasAnyMedications}
        >
          <Text style={[styles.saveButtonText, !hasAnyMedications && styles.saveButtonTextDisabled]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Section */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.infoText}>
              Configure medications for Early, Mild, and Severe stages of your symptom
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.infoText}>
              You can add multiple medications per stage with different dosages
            </Text>
          </View>
        </View>

        {/* Stages */}
        {stages.map((stage, stageIndex) => (
          <View key={stage.name} style={styles.stageContainer}>
            <TouchableOpacity 
              style={styles.stageHeader} 
              onPress={() => toggleStage(stageIndex)}
            >
              <View style={styles.stageHeaderContent}>
                <Text style={styles.stageName}>{stage.name}</Text>
                <Text style={styles.medicationCount}>
                  {stage.medications.length} medication{stage.medications.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <Ionicons 
                name={expandedStage === stageIndex ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>

            {expandedStage === stageIndex && (
              <View style={styles.stageContent}>
                {/* Add Medication Button */}
                <TouchableOpacity 
                  style={styles.addMedicationButton}
                  onPress={() => addMedicationToStage(stageIndex)}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
                  <Text style={styles.addMedicationText}>Add Medication</Text>
                </TouchableOpacity>

                {/* Medications List */}
                {stage.medications.map((medication, medIndex) => (
                  <View key={medIndex} style={styles.medicationCard}>
                    <View style={styles.medicationHeader}>
                      <Text style={styles.medicationTitle}>Medication {medIndex + 1}</Text>
                      <TouchableOpacity 
                        onPress={() => removeMedication(stageIndex, medIndex)}
                        style={styles.removeButton}
                      >
                        <Ionicons name="trash-outline" size={18} color="#ff3b30" />
                      </TouchableOpacity>
                    </View>

                    {/* Medication Name */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Medication Name *</Text>
                      <TextInput
                        style={[
                          styles.input,
                          getValidationError(stageIndex, medIndex, 'name') && styles.inputError
                        ]}
                        value={medication.name}
                        onChangeText={(value) => updateMedication(stageIndex, medIndex, 'name', value)}
                        placeholder="e.g., Ibuprofen, Paracetamol"
                        placeholderTextColor="#999"
                      />
                      {getValidationError(stageIndex, medIndex, 'name') && (
                        <Text style={styles.errorText}>{getValidationError(stageIndex, medIndex, 'name')}</Text>
                      )}
                    </View>

                    {/* Dosage Fields */}
                    <View style={styles.dosageRow}>
                      <View style={[styles.inputContainer, styles.halfWidth]}>
                        <Text style={styles.label}>Dosage (mg) *</Text>
                        <TextInput
                          style={[
                            styles.input,
                            getValidationError(stageIndex, medIndex, 'quantityMg') && styles.inputError
                          ]}
                          value={medication.quantityMg?.toString() || ''}
                          onChangeText={(value) => updateMedication(stageIndex, medIndex, 'quantityMg', parseInt(value) || 0)}
                          placeholder="400"
                          placeholderTextColor="#999"
                          keyboardType="numeric"
                        />
                        {getValidationError(stageIndex, medIndex, 'quantityMg') && (
                          <Text style={styles.errorText}>{getValidationError(stageIndex, medIndex, 'quantityMg')}</Text>
                        )}
                      </View>
                      <View style={[styles.inputContainer, styles.halfWidth]}>
                        <Text style={styles.label}>Interval (hours) *</Text>
                        <TextInput
                          style={[
                            styles.input,
                            getValidationError(stageIndex, medIndex, 'intervalHours') && styles.inputError
                          ]}
                          value={medication.intervalHours?.toString() || ''}
                          onChangeText={(value) => updateMedication(stageIndex, medIndex, 'intervalHours', parseInt(value) || 0)}
                          placeholder="8"
                          placeholderTextColor="#999"
                          keyboardType="numeric"
                        />
                        {getValidationError(stageIndex, medIndex, 'intervalHours') && (
                          <Text style={styles.errorText}>{getValidationError(stageIndex, medIndex, 'intervalHours')}</Text>
                        )}
                      </View>
                    </View>

                    {/* Duration */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Duration (days) *</Text>
                      <TextInput
                        style={[
                          styles.input,
                          getValidationError(stageIndex, medIndex, 'totalDays') && styles.inputError
                        ]}
                        value={medication.totalDays?.toString() || ''}
                        onChangeText={(value) => updateMedication(stageIndex, medIndex, 'totalDays', parseInt(value) || 0)}
                        placeholder="5"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                      />
                      {getValidationError(stageIndex, medIndex, 'totalDays') && (
                        <Text style={styles.errorText}>{getValidationError(stageIndex, medIndex, 'totalDays')}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
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
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
  },
  saveButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  saveButtonTextDisabled: {
    color: '#999999',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
  stageContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  stageHeaderContent: {
    flex: 1,
  },
  stageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  medicationCount: {
    fontSize: 14,
    color: '#666666',
  },
  stageContent: {
    padding: 16,
  },
  addMedicationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginBottom: 16,
  },
  addMedicationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  medicationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  removeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333333',
  },
  inputError: {
    borderColor: '#ff3b30',
    borderWidth: 2,
  },
  dosageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  helperText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ff3b30',
    marginTop: 4,
  },
});
