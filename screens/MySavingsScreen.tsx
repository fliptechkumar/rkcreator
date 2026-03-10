import React ,{ useCallback }from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import { useFocusEffect } from '@react-navigation/native';
import { API_ENDPOINTS } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GoldImage from '../assets/gold.png';
import SilverImage from '../assets/silver.png';


type Props = BottomTabScreenProps<TabParamList, 'MySavings'>;

interface SavingsScheme {
  id: string;
  name: string;
  type: 'gold' | 'silver' | 'diamond';
  monthlyDeposit: number;
  totalDeposited: number;
  targetAmount: number;
  monthsCompleted: number;
  totalMonths: number;
  maturityDate: string;
  status: 'active' | 'completed' | 'paused';
}

export default function MySavingsScreen({ navigation }: Props) {
  const totalSavings = 125000;
  const activeSchemes = 3;
  const monthlyContribution = 15000;

  const [savingsData, setSavingsData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [customerId, setCustomerId] = React.useState<string>('');

  const GETSAVINGS = async (userId: string) => {
    //trim mobile no
    try {
      // Try with fetch to have more control
      const response = await fetch(`${API_ENDPOINTS.MYSAVINGS}?id=${userId}`, {
        method: 'GET',
       headers: {
        'Accept': 'application/json',
        'Internal': 'Nezlan',
        'Content-Type': 'application/json',
      },
      credentials: 'include',  
     
      });
      
      const responseData = await response.json();
      console.log('My Savings Response:', responseData);
      if (responseData && responseData.success) {
       
      // Handle successful response
      console.log('Sign-in successful:', responseData.data);
      setSavingsData(responseData.data);
      } else {
        // Handle error response
        setLoading(false);
      }
    } catch (error: any) {
      // Handle error
      setLoading(false);
      console.error('Sign-in error:', error.message);
      console.error('Full error:', error);
      alert(`Error: ${error.message || 'Failed to send OTP'}`);
    }
  }

  useFocusEffect(
    useCallback(() => {
      console.log('Transaction History Screen is focused');
      GetuserDetails()
    }, [])
  );
  const GetuserDetails = async () => {
    try {
      const userDetailsString = await AsyncStorage.getItem('userDetails');
      if (userDetailsString) {
        const userDetails = JSON.parse(userDetailsString);
        console.log('User Details from AsyncStorage:', userDetails.id);
        setCustomerId(userDetails.id);
        if (userDetails && userDetails.id) {
          GETSAVINGS(userDetails.id);
        } else {
          console.warn('User ID not found in userDetails');
        }
      } else {
        console.warn('No userDetails found in AsyncStorage');
      }
    }
    catch (error) {
      console.error('Error retrieving userDetails from AsyncStorage:', error);
    }
  }

  const schemes: SavingsScheme[] = [
    {
      id: '1',
      name: 'Wedding Gold Scheme',
      type: 'gold',
      monthlyDeposit: 5000,
      totalDeposited: 50000,
      targetAmount: 120000,
      monthsCompleted: 10,
      totalMonths: 24,
      maturityDate: '15 Feb 2026',
      status: 'active',
    },
    {
      id: '2',
      name: 'Diamond Jewellery Plan',
      type: 'diamond',
      monthlyDeposit: 8000,
      totalDeposited: 48000,
      targetAmount: 96000,
      monthsCompleted: 6,
      totalMonths: 12,
      maturityDate: '30 Jun 2026',
      status: 'active',
    },
    {
      id: '3',
      name: 'Silver Coins Savings',
      type: 'silver',
      monthlyDeposit: 2000,
      totalDeposited: 24000,
      targetAmount: 24000,
      monthsCompleted: 12,
      totalMonths: 12,
      maturityDate: '01 Jan 2026',
      status: 'completed',
    },
    {
      id: '4',
      name: 'Festival Gold Plan',
      type: 'gold',
      monthlyDeposit: 3000,
      totalDeposited: 9000,
      targetAmount: 36000,
      monthsCompleted: 3,
      totalMonths: 12,
      maturityDate: '20 Dec 2026',
      status: 'active',
    },
  ];

  const getSchemeIcon = (type: string) => {
    switch (type) {
      case 'gold': return <Image source={GoldImage} style={{width:24, height:24}} />;
      case 'silver': return <Image source={SilverImage} style={{width:24, height:24}} />;
      case 'diamond': return '💎';
      default: return '💰';
    }
  };

  const getSchemeColor = (type: string) => {
    switch (type) {
      case 'gold': return '#FFD700';
      case 'silver': return '#C0C0C0';
      case 'diamond': return '#B9F2FF';
      default: return '#2BC0AC';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'paused': return '#FF9800';
      default: return '#999';
    }
  };

  const calculateProgress = (scheme: any) => {
    return (scheme.total_paid_amount / scheme.overall_amount) * 100;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#2BC0AC" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Savings</Text>
        {/* <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={28} color="#fff" />
        </TouchableOpacity> */}
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <MaterialIcons name="account-balance-wallet" size={20} color="#2BC0AC" />
            </View>
            <Text style={styles.summaryValue}>₹{savingsData?.scheme_savings_details?.total_savings ? Number(savingsData?.scheme_savings_details?.total_savings).toFixed(0) : '0.00'}</Text>
            <Text style={styles.summaryLabel}>Total Savings</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="albums-outline" size={20} color="#FF9800" />
            </View>
            <Text style={styles.summaryValue}>{savingsData?.scheme_savings_details?.active_schemes ?? '0'}</Text>
            <Text style={styles.summaryLabel}>Active Schemes</Text>
          </View>

          {/* <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.summaryValue}>₹{savingsData?.scheme_savings_details?.monthly?Number(savingsData?.scheme_savings_details?.monthly).toFixed(0) : '0.00'}</Text>
            <Text style={styles.summaryLabel}>Monthly</Text>
          </View> */}
        </View>

        {/* Schemes Section */}
        <View style={styles.schemesSection}>
          <Text style={styles.sectionTitle}>My Schemes</Text>

          {savingsData && savingsData.myScheme_details ? savingsData.myScheme_details.map((scheme: any) => {
            const progress = calculateProgress(scheme);
            return (
              <TouchableOpacity
                key={scheme.id}
                style={styles.schemeCard}
                activeOpacity={0.7}
              >
                <View style={styles.schemeHeader}>
                  <View style={styles.schemeLeft}>
                    <View style={[
                      styles.schemeIconContainer,
                      { backgroundColor: getSchemeColor(scheme.chit_type) + '30' }
                    ]}>
                      <Text style={styles.schemeEmoji}>{getSchemeIcon(scheme.chit_type)}</Text>
                    </View>
                    <View style={styles.schemeInfo}>
                      <Text style={styles.schemeName}>{scheme.group_name}</Text>
                      <Text style={styles.schemeType}>{scheme.chit_type.charAt(0).toUpperCase() + scheme.chit_type.slice(1)} Scheme</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(scheme.chit_status) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(scheme.chit_status) }
                    ]}>
                      {scheme.chit_status.charAt(0).toUpperCase() + scheme.chit_status.slice(1)}
                    </Text>
                    <Text style={[
                      styles.statusText,
                      { color: "#000" }
                    ]}>
                      {scheme.scheme_type}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressPercentage}>{progress.toFixed(0)}%</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar,
                        { 
                          width: `${progress}%`,
                          backgroundColor: getSchemeColor('gold')
                        }
                      ]} 
                    />
                  </View>
                  <View style={styles.amountRow}>
                    <Text style={styles.depositedAmount}>
                      ₹{scheme?.scheme_amount ? Number(scheme?.scheme_amount).toLocaleString('en-IN') : '0'}
                    </Text>
                    <Text style={styles.targetAmount}>
                      of ₹{scheme?.overall_amount ? Number(scheme?.overall_amount).toLocaleString('en-IN') : '0'}
                    </Text>
                  </View>
                </View>

                {/* Scheme Details */}
                <View style={styles.schemeDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {scheme.no_of_installment}/{scheme.total_installment} months
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      ₹{scheme?.total_paid_amount ? Number(scheme?.total_paid_amount).toLocaleString('en-IN') : '0'} /month
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      Joining : {scheme.customer_joining_date}
                    </Text>
                  </View>
                   <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      Maturity: {scheme.maturity_date}
                    </Text>
                  </View>

                </View>

                {/* Action Buttons */}
                {/* {scheme.status === 'active' && ( */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => {
                        navigation.getParent()?.navigate('PayDueDetails' as any, {
                          customer_id: customerId,
                          customer_scheme_id: scheme.id
                        });
                      }}
                    >
                      <Text style={styles.actionButtonText}>View Plan</Text>
                    </TouchableOpacity>
                  
                      <TouchableOpacity
                        onPress={() => {
                          const parentNavigation = navigation.getParent<NavigationProp<RootStackParamList>>();
                          parentNavigation?.navigate('Transaction', {
                            customer_id: customerId,
                            customer_scheme_id: scheme.id
                          });
                        }}
                        style={[styles.actionButton, styles.actionButtonOutline]}
                      >
                        <Text style={styles.actionButtonTextOutline}>Transaction History</Text>
                    </TouchableOpacity>
                  </View>
                {/* )} */}
              </TouchableOpacity>
            );
          }) : <Text style={{textAlign: 'center'}}>No schemes found.</Text>}
        </View>

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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  addButton: {
    padding: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 20,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryIconContainer: {
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  schemesSection: {
    paddingHorizontal: 15,
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  schemeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  schemeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  schemeLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  schemeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  schemeEmoji: {
    fontSize: 24,
  },
  schemeInfo: {
    flex: 1,
  },
  schemeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  schemeType: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: '#666',
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  depositedAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2BC0AC',
  },
  targetAmount: {
    fontSize: 13,
    color: '#999',
  },
  schemeDetails: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2BC0AC',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2BC0AC',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  actionButtonTextOutline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2BC0AC',
  },
  bottomSpacer: {
    height: 20,
  },
});
