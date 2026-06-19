import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabIcon from './TabIcon';

import HomeScreen from '../screens/HomeScreen';
import VenueDetailScreen from '../screens/VenueDetailScreen';
import MapScreen from '../screens/MapScreen';
import AddReelScreen from '../screens/AddReelScreen';
import ListsScreen from '../screens/ListsScreen';
import ListDetailScreen from '../screens/ListDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const ExploreStack = createNativeStackNavigator();
function ExploreStackScreen() {
  return (
    <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
      <ExploreStack.Screen name="Home" component={HomeScreen} />
      <ExploreStack.Screen name="VenueDetail" component={VenueDetailScreen} />
    </ExploreStack.Navigator>
  );
}

const MapStack = createNativeStackNavigator();
function MapStackScreen() {
  return (
    <MapStack.Navigator screenOptions={{ headerShown: false }}>
      <MapStack.Screen name="Map" component={MapScreen} />
    </MapStack.Navigator>
  );
}

const AddStack = createNativeStackNavigator();
function AddStackScreen() {
  return (
    <AddStack.Navigator screenOptions={{ headerShown: false }}>
      <AddStack.Screen name="AddReel" component={AddReelScreen} />
    </AddStack.Navigator>
  );
}

const ListsStack = createNativeStackNavigator();
function ListsStackScreen() {
  return (
    <ListsStack.Navigator screenOptions={{ headerShown: false }}>
      <ListsStack.Screen name="Lists" component={ListsScreen} />
      <ListsStack.Screen name="ListDetail" component={ListDetailScreen} />
    </ListsStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator();
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0a0a0a',
        tabBarInactiveTintColor: '#b9b9b9',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="Kesfet"
        component={ExploreStackScreen}
        options={{
          tabBarLabel: 'Keşfet',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="compass" color={color} size={size - 2} />
          ),
        }}
      />

      <Tab.Screen
        name="Harita"
        component={MapStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="map-pin" color={color} size={size - 2} />
          ),
        }}
      />

      <Tab.Screen
        name="Ekle"
        component={AddStackScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <View style={styles.addButton}>
              <TabIcon name="plus" color="#ffffff" size={20} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Listeler"
        component={ListsStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="bookmark" color={color} size={size - 2} />
          ),
        }}
      />

      <Tab.Screen
        name="Profil"
        component={ProfileStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="user" color={color} size={size - 2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f2f2f2',
    height: Platform.OS === 'web' ? 60 : 52,
    paddingBottom: Platform.OS === 'web' ? 6 : 2,
    paddingTop: 4,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginTop: -2,
  },
  tabBarItem: {
    paddingTop: 2,
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});
