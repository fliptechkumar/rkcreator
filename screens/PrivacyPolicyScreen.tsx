import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { API_ENDPOINTS } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

export default function PrivacyPolicyScreen({ navigation }: Props) {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [customerId, setCustomerId] = React.useState<string>('');
  const [privacyContent, setPrivacyContent] = React.useState<any>(null);

  React.useEffect(() => {
    GetPrivacyPolicy();
  }, []);

  const GetPrivacyPolicy = async () => {
    try {
      const userDetailsString = await AsyncStorage.getItem('userDetails');
      let userId = '';
      if (userDetailsString) {
        const userDetails = JSON.parse(userDetailsString);
        userId = userDetails.id;
        setCustomerId(userDetails.id);
        console.log('User ID from AsyncStorage:', userDetails.id);
      } else {
        console.log('No user details found in AsyncStorage');
      }

      const response = await fetch(`${API_ENDPOINTS.PRIVACY_POLICY}?id=${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Internal': 'Nezlan',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const responseData = await response.json();
      console.log('Privacy Policy Response Data:', responseData);
      if (responseData && responseData.data) {
        setPrivacyContent(responseData.data);
      }
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.error('Error fetching privacy policy:', error.message);
      console.error('Full error:', error);
      alert(`Error: ${error.message || 'Failed to fetch privacy policy'}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#2BC0AC" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2BC0AC" />
        </View>
      ) : (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Introduction */}
          <View style={styles.introSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={40} color="#2BC0AC" />
            </View>
            <Text style={styles.introTitle}>Your Privacy Matters</Text>
            <Text style={styles.introText}>
              {privacyContent?.title || 'At Nezlan Jewellery, we are committed to protecting your privacy and ensuring the security of your personal information.'}
            </Text>
            <Text style={styles.lastUpdated}>Last Updated: January 1, 2026</Text>
          </View>

          {/* Policy Content */}
          <View style={styles.section}>
            <Text style={styles.sectionContent}>{privacyContent?.desc}</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Ionicons name="information-circle-outline" size={24} color="#2BC0AC" />
            <Text style={styles.footerText}>
              By using our services, you acknowledge that you have read and understood 
              this Privacy Policy.
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2BC0AC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2BC0AC',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  introSection: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F8F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'left',
  },
  footer: {
    backgroundColor: '#E8F8F5',
    padding: 20,
    marginTop: 10,
    marginHorizontal: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 30,
  },
});
