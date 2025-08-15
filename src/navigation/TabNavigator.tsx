import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeStackNavigator from './HomeStackNavigator';
import ActiveMedsScreen from '../screens/ActiveMedsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import SettingsScreen from '../screens/SettingsScreen';


const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarShowLabel: true,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: false, // Let individual screens handle headers
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStackNavigator}
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Active Meds"
          component={ActiveMedsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="medkit-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}