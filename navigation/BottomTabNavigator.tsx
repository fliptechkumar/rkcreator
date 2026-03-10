import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons,FontAwesome6 } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import MySavingsScreen from '../screens/MySavingsScreen';
import ScanScreen from '../screens/ScanScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import type { TabParamList } from './types';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator<TabParamList>();

export default function BottomTabNavigator() {
   const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2BC0AC',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
           height: 60 + insets.bottom,
             paddingBottom: insets.bottom,
          // height: Platform.OS === 'ios' ? 85 : 65,
          // paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      
      <Tab.Screen 
        name="MySavings" 
        component={MySavingsScreen}
        options={{
          tabBarLabel: 'My Savings',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6 
              name="sack-dollar" 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      
      {/* <Tab.Screen 
        name="Scan" 
        component={ScanScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.centerIconContainer}>
              <View style={styles.centerIcon}>
                <FontAwesome6 name="hand-holding-dollar" size={28} color="#fff" />
              </View>
            </View>
          ),
        }}
      /> */}
      
      <Tab.Screen 
        name="TransactionHistory" 
        component={TransactionHistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'document-text' : 'document-text-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  centerIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  centerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2BC0AC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
});
