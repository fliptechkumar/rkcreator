import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../config/env';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import BottomTabNavigator from './BottomTabNavigator';
import NewSchemesScreen from '../screens/NewSchemesScreen';
import SchemeDetailsScreen from '../screens/SchemeDetailsScreen';
import VideoShoppingScreen from '../screens/VideoShoppingScreen';
import AboutUsScreen from '../screens/AboutUsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsConditionsScreen from '../screens/TermsConditionsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import InvoiceScreen from '../screens/InvoiceScreen';
import PayDueScreen from '../screens/PayDueScreen';
import PayDueDetailsScreen from '../screens/PayDueDetailsScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import KycVerificationScreen from '../screens/KycVerificationScreen';
import NotificationScreen from '../screens/NotificationScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Main'>('Login');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const stored = await AsyncStorage.getItem('userDetails');
        if (stored) {
          const user = JSON.parse(stored);
          setInitialRoute('Main');
          if (user?.id) {
            try {
              const response = await fetch(`${API_ENDPOINTS.USERDETAILS}?id=${user.id}`, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'Internal': 'Nezlan',
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
              });
              const responseData = await response.json();
              if (responseData?.success && responseData?.user) {
                await AsyncStorage.setItem('userDetails', JSON.stringify(responseData.user));
              }
            } catch {
              // silently ignore — use cached data
            }
          }
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  if (isLoading) {
    return null; // Or a splash screen component
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{headerShown: false}} />
        <Stack.Screen name="KycVerification" component={KycVerificationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={BottomTabNavigator} options={{headerShown: false}} />
        <Stack.Screen name="NewSchemes" component={NewSchemesScreen} options={{headerShown: false}} />
        <Stack.Screen name="SchemeDetails" component={SchemeDetailsScreen} options={{headerShown: false}} />
        <Stack.Screen name="VideoShopping" component={VideoShoppingScreen} options={{headerShown: false}} />
        <Stack.Screen name="AboutUs" component={AboutUsScreen} options={{headerShown: false}} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{headerShown: false}} />
        <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} options={{headerShown: false}} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{headerShown: false}} />
        <Stack.Screen name="Invoice" component={InvoiceScreen} options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="PayDue" component={PayDueScreen} options={{headerShown: false}} />
        <Stack.Screen name="Transaction" component={TransactionHistoryScreen} options={{headerShown: false}} />
       
        <Stack.Screen name="PayDueDetails" component={PayDueDetailsScreen} options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="Notifications" component={NotificationScreen} options={{ headerShown: false }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
