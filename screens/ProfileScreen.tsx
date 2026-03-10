import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TabParamList, RootStackParamList } from '../navigation/types';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  iconFamily: 'ionicons' | 'material';
  onPress: () => void;
}

export default function ProfileScreen({ navigation }: Props) {
  const [userProfile, setUserProfile] = useState({
    name: 'Kumaravel Thangaraj',
    email: 'kumaran2489@example.com',
    phone: '+91 9994996019',
    memberSince: 'January 2025',
    membershipId: 'NEG2025001',
    totalSavings: 125000,
    activeSchemes: 2,
  });

  useFocusEffect(
    useCallback(() => {
      const loadUserProfile = async () => {
        try {
          const userDetails = await AsyncStorage.getItem('userDetails');
          //console.log('Loaded user details for profile:', userDetails);
          if (userDetails) {
            const user = JSON.parse(userDetails);
            setUserProfile({
              name: user.customer_name || 'User',
              email: user.email || '',
              phone: user.mobile ? `+91 ${user.mobile}` : '',
              memberSince: user.customer_created_date || 'January 2025',
              membershipId: user.customer_code || 'NEG2025001',
              totalSavings: parseFloat(user.total_savings || '0'),
              activeSchemes: user.active_schemes || 0,
            });
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      };

      loadUserProfile();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => ConfirmLogout() },
      ]
    );
  };

  const ConfirmLogout = async () => {
    try {
      await AsyncStorage.removeItem('userDetails');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  const menuItems: MenuItem[] = [
    {
      id: '1',
      title: 'Edit Profile',
      icon: 'person-outline',
      iconFamily: 'ionicons',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      id: '2',
      title: 'My Schemes',
      icon: 'card-outline',
      iconFamily: 'ionicons',
      onPress: () => navigation.navigate('MySavings'),
    },
    // {
    //   id: '3',
    //   title: 'Payment Methods',
    //   icon: 'wallet-outline',
    //   iconFamily: 'ionicons',
    //   onPress: () => console.log('Payment Methods'),
    // },
    {
      id: '4',
      title: 'Notifications',
      icon: 'notifications-outline',
      iconFamily: 'ionicons',
      onPress: () => console.log('Notifications'),
    },
    // {
    //   id: '5',
    //   title: 'Help & Support',
    //   icon: 'help-circle-outline',
    //   iconFamily: 'ionicons',
    //   onPress: () => console.log('Help & Support'),
    // },
    {
      id: '6',
      title: 'Terms & Conditions',
      icon: 'document-text-outline',
      iconFamily: 'ionicons',
      onPress: () => navigation.navigate('TermsConditions'),
    },
    {
      id: '7',
      title: 'Privacy Policy',
      icon: 'shield-checkmark-outline',
      iconFamily: 'ionicons',
      onPress: () => navigation.navigate('PrivacyPolicy'),
    },
    {
      id: '8',
      title: 'About Us',
      icon: 'information-circle-outline',
      iconFamily: 'ionicons',
      onPress: () => navigation.navigate('AboutUs'),
    },
  ];

  const renderIcon = (item: MenuItem) => {
    if (item.iconFamily === 'ionicons') {
      return <Ionicons name={item.icon as any} size={22} color="#666" />;
    } else {
      return <MaterialIcons name={item.icon as any} size={22} color="#666" />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#2BC0AC" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userProfile.name.charAt(0)}</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{userProfile.name}</Text>
          {userProfile.email !== '' &&
          <Text style={styles.userEmail}>{userProfile.email}</Text>
          }
          <Text style={styles.userPhone}>{userProfile.phone}</Text>
          
          {/* <View style={styles.membershipBadge}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.membershipText}>Gold Member</Text>
          </View> */}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₹{userProfile.totalSavings.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>Total Savings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userProfile.activeSchemes}</Text>
            <Text style={styles.statLabel}>Active Schemes</Text>
          </View>
        </View>

        {/* Membership Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer ID</Text>
            <Text style={styles.infoValue}>{userProfile.membershipId}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>{userProfile.memberSince}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                {renderIcon(item)}
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={22} color="#F44336" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2BC0AC',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 15,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2BC0AC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2BC0AC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  membershipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 12,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2BC0AC',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
  menuSection: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 5,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  menuItemLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
  bottomSpacer: {
    height: 20,
  },
});
