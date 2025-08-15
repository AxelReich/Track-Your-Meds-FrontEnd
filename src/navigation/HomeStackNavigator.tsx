import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import AddSymptomScreen from '../screens/AddSymptomScreen';

// Define the parameter types for each screen
export type HomeStackParamList = {
  Home: undefined;
  AddSymptom: undefined;
};

const Stack = createStackNavigator<HomeStackParamList>();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Hide headers since we're handling them in screens
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
      />
      <Stack.Screen 
        name="AddSymptom" 
        component={AddSymptomScreen}
      />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
