import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import { apiService, type Symptom } from '../services/api';
import SymptomCard from '../components/SymptomCard';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function HomeScreen() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [filteredSymptoms, setFilteredSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSymptoms();
  }, []);

  useEffect(() => {
    filterSymptoms();
  }, [searchQuery, symptoms]);

  const fetchSymptoms = async () => {
    try {
      setLoading(true);
      setError(null);
      const symptomsData = await apiService.getSymptoms();
      console.log('Fetched symptoms:', symptomsData);
      setSymptoms(symptomsData);
    } catch (err) {
      console.error('Error fetching symptoms:', err);
      setError('Failed to load symptoms. Please try again.');
      Alert.alert('Error', 'Failed to load symptoms. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterSymptoms = () => {
    if (!searchQuery.trim()) {
      setFilteredSymptoms(symptoms);
    } else {
      const filtered = symptoms.filter(symptom =>
        symptom.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSymptoms(filtered);
    }
    console.log('Filtered symptoms:', filteredSymptoms.length, 'from total:', symptoms.length);
  };

  const handleToggleActive = async (symptomId: number, value: boolean) => {
    try {
      // Find the symptom to update
      const symptomToUpdate = symptoms.find(s => s.id === symptomId);
      if (!symptomToUpdate) return;

      // Optimistically update local state first for immediate UI feedback
      const updatedSymptoms = symptoms.map(symptom =>
        symptom.id === symptomId
          ? { ...symptom, isActive: value }
          : symptom
      );
      
      setSymptoms(updatedSymptoms);

      // Update the symptom via API
      await apiService.updateSymptom(symptomId, {
        ...symptomToUpdate,
        isActive: value,
      });

      console.log(`Successfully updated symptom ${symptomId} to active: ${value}`);
      
    } catch (err) {
      console.error('Error updating symptom:', err);
      
      // Revert the local state change if API call failed
      const revertedSymptoms = symptoms.map(symptom =>
        symptom.id === symptomId
          ? { ...symptom, isActive: !value }
          : symptom
      );
      
      setSymptoms(revertedSymptoms);
      Alert.alert('Error', 'Failed to update symptom. Please try again.');
    }
  };

  const handleAddSymptom = () => {
    // TODO: Navigate to AddSymptomScreen or show add symptom modal
    Alert.alert('Add Symptom', 'Add symptom functionality coming soon!');
  };

  const renderSymptomCard = ({ item }: { item: Symptom }) => (
    <SymptomCard
      symptom={item}
      onToggleActive={handleToggleActive}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading symptoms...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={fetchSymptoms}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>Manage your symptoms</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search symptoms..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Ionicons 
              name="close-circle" 
              size={20} 
              color="#666" 
              style={styles.clearIcon}
              onPress={() => setSearchQuery('')}
            />
          )}
        </View>
      </View>
      
      {filteredSymptoms.length === 0 ? (
        <View style={styles.emptyContainer}>
          {searchQuery.length > 0 ? (
            <>
              <Text style={styles.emptyText}>No symptoms found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search terms</Text>
            </>
          ) : (
            <>
              <Text style={styles.emptyText}>No symptoms found</Text>
              <Text style={styles.emptySubtext}>Add some symptoms to get started</Text>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredSymptoms}
          renderItem={renderSymptomCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddSymptom}>
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Debug Button - Remove this later */}
      <TouchableOpacity style={styles.debugButton} onPress={() => {
        console.log('Current symptoms state:', symptoms);
        console.log('Current filtered symptoms:', filteredSymptoms);
        Alert.alert('Debug Info', `Total symptoms: ${symptoms.length}\nFiltered: ${filteredSymptoms.length}`);
      }}>
        <Text style={styles.debugButtonText}>Debug</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 4,
  },
  clearIcon: {
    marginLeft: 8,
  },
  listContainer: {
    paddingVertical: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  debugButton: {
    position: 'absolute',
    top: 100, // Adjust as needed
    right: 30,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  debugButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
