import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { API_ENDPOINTS } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'AboutUs'>;

export default function AboutUsScreen({ navigation }: Props) {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [customerId, setCustomerId] = React.useState<string>('');
    const [aboutUsContent, setAboutUsContent] = React.useState<any>('');
    React.useEffect(() => {
      GetAboutus();
    }, []);
    const GetAboutus = async () => {
      //trim mobile no
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
        // Try with fetch to have more control
        const response = await fetch(`${API_ENDPOINTS.ABOUT}?id=${userId}`, {
          method: 'GET',
         headers: {
          'Accept': 'application/json',
          'Internal': 'Nezlan',
          'Content-Type': 'application/json',
        },
        credentials: 'include',  
       
        });
        
        const responseData = await response.json();
        console.log('About Us Response Data:', responseData);
        if (responseData && responseData.data) {
          setAboutUsContent(responseData.data);
        }
        setLoading(false);
      } catch (error: any) {
        // Handle error
        setLoading(false);
        console.error('Sign-in error:', error.message);
        console.error('Full error:', error);
        alert(`Error: ${error.message || 'Failed to send OTP'}`);
      }
    }
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
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Company Logo/Banner */}
        {/* <View style={styles.bannerSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="diamond" size={60} color="#2BC0AC" />
          </View>
          <Text style={styles.companyName}>Nezlan Jewellery</Text>
          <Text style={styles.tagline}>Crafting Excellence Since 1990</Text>
        </View> */}

         <View style={styles.section}>
          {/* <View style={styles.sectionIconHeader}>
            <Ionicons name="book-outline" size={24} color="#2BC0AC" />
            <Text style={styles.sectionTitle}>{aboutUsContent?.title}</Text>
          </View> */}
          <Text style={styles.sectionText}>
            {aboutUsContent?.desc}
          </Text>
        
        </View>

        {/* Our Story */}
        {/* <View style={styles.section}>
          <View style={styles.sectionIconHeader}>
            <Ionicons name="book-outline" size={24} color="#2BC0AC" />
            <Text style={styles.sectionTitle}>Our Story</Text>
          </View>
          <Text style={styles.sectionText}>
            Founded in 1990, Nezlan Jewellery has been at the forefront of crafting 
            exquisite gold, silver, and diamond jewellery. With over three decades of 
            experience, we have built a reputation for quality, trust, and exceptional 
            customer service.
          </Text>
          <Text style={styles.sectionText}>
            Our journey began with a simple vision: to make fine jewellery accessible 
            to everyone while maintaining the highest standards of craftsmanship. Today, 
            we serve thousands of satisfied customers across the country.
          </Text>
        </View> */}

        {/* Our Mission */}
        {/* <View style={styles.section}>
          <View style={styles.sectionIconHeader}>
            <Ionicons name="flag-outline" size={24} color="#2BC0AC" />
            <Text style={styles.sectionTitle}>Our Mission</Text>
          </View>
          <Text style={styles.sectionText}>
            To provide our customers with the finest quality jewellery at competitive 
            prices while ensuring complete transparency and trust in every transaction. 
            We are committed to making your special moments even more memorable with 
            our beautiful collections.
          </Text>
        </View> */}

        {/* Our Values */}
        {/* <View style={styles.section}>
          <View style={styles.sectionIconHeader}>
            <Ionicons name="heart-outline" size={24} color="#2BC0AC" />
            <Text style={styles.sectionTitle}>Our Values</Text>
          </View>
          <View style={styles.valuesList}>
            {[
              { icon: 'checkmark-circle', text: 'Quality Craftsmanship' },
              { icon: 'checkmark-circle', text: 'Customer Satisfaction' },
              { icon: 'checkmark-circle', text: 'Trust & Transparency' },
              { icon: 'checkmark-circle', text: 'Innovation & Design' },
              { icon: 'checkmark-circle', text: 'Ethical Practices' },
            ].map((value, index) => (
              <View key={index} style={styles.valueItem}>
                <Ionicons name={value.icon as any} size={20} color="#2BC0AC" />
                <Text style={styles.valueText}>{value.text}</Text>
              </View>
            ))}
          </View>
        </View> */}

        {/* Contact Information */}
        {/* <View style={styles.section}>
          <View style={styles.sectionIconHeader}>
            <Ionicons name="location-outline" size={24} color="#2BC0AC" />
            <Text style={styles.sectionTitle}>Visit Us</Text>
          </View>
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <Ionicons name="location" size={20} color="#666" />
              <Text style={styles.contactText}>
                123 Jewellery Street, Diamond District{'\n'}
                 Coimbatore, Tamil Nadu 641001
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={20} color="#666" />
              <Text style={styles.contactText}>+91 98765 43210</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={20} color="#666" />
              <Text style={styles.contactText}>contact@nezlanjewellery.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="time" size={20} color="#666" />
              <Text style={styles.contactText}>Mon - Sun: 09:00 AM - 8:30 PM</Text>
            </View>
          </View>
        </View> */}

        {/* Social Media */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect With Us</Text>
          <View style={styles.socialContainer}>
            {[
              { icon: 'logo-facebook', color: '#1877F2' },
              { icon: 'logo-instagram', color: '#E4405F' },
              { icon: 'logo-twitter', color: '#1DA1F2' },
              { icon: 'logo-youtube', color: '#FF0000' },
            ].map((social, index) => (
              <TouchableOpacity key={index} style={[styles.socialButton, { backgroundColor: social.color }]}>
                <Ionicons name={social.icon as any} size={24} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
        </View> */}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    backgroundColor: '#FFFFFF',
  },
  bannerSection: {
    backgroundColor: '#fff',
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 15,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F8F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 15,
  },
  sectionIconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'justify',
  },
  valuesList: {
    gap: 12,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  valueText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  contactCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacer: {
    height: 30,
  },
});
