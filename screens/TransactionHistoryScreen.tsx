import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TabParamList } from '../navigation/types';
import type { RootStackParamList } from '../navigation/types';
import { useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { API_ENDPOINTS } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props =
  | BottomTabScreenProps<TabParamList, 'TransactionHistory'>
  | NativeStackScreenProps<RootStackParamList, 'Transaction'>;

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  title: string;
  description: string;
  amount: number;
  date: string;
  time: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function TransactionHistoryScreen({ navigation }: Props) {
  const route = useRoute();
  const isTransactionRoute = route.name === 'Transaction';
  const { customer_id, customer_scheme_id } = (route.params || {}) as { customer_id?: string; customer_scheme_id?: string };
  const [transactionData, setTransactionData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [customerId, setCustomerId] = React.useState<string>('');

  const GETTRANSACTION = async (userId: string, schemeId?: string) => {
    //trim mobile no
    try {
      // Try with fetch to have more control
      let url = `${API_ENDPOINTS.TRANSACTIONHISTORY}?id=${userId}`;
      if (schemeId) url += `&customer_scheme_id=${schemeId}`;
      const response = await fetch(url, {
        method: 'GET',
       headers: {
        'Accept': 'application/json',
        'Internal': 'Nezlan',
        'Content-Type': 'application/json',
      },
      credentials: 'include',  
     
      });
      
      const responseData = await response.json();
      console.log('Transaction History Response:', responseData);
      if (responseData && responseData.success) {
       
      // Handle successful response
      console.log('Sign-in successful:', responseData.data);
      setTransactionData(responseData.data);
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
      GetuserDetails();
    }, [customer_id, customer_scheme_id])
  );
  const GetuserDetails = async () => {
    try {
      if (customer_id) {
        GETTRANSACTION(customer_id, customer_scheme_id);
        setCustomerId(customer_id);
      } else {
        const userDetailsString = await AsyncStorage.getItem('userDetails');
        if (userDetailsString) {
          const userDetails = JSON.parse(userDetailsString);
          console.log('User Details from AsyncStorage:', userDetails.id);
          if (userDetails && userDetails.id) {
            GETTRANSACTION(userDetails.id);
            setCustomerId(userDetails.id);
          } else {
            console.warn('User ID not found in userDetails');
          }
        } else {
          console.warn('No userDetails found in AsyncStorage');
        }
      }
    }
    catch (error) {
      console.error('Error retrieving userDetails from AsyncStorage:', error);
    }
  }
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'credit',
      title: 'Gold Scheme Payment',
      description: 'Monthly installment',
      amount: 5000,
      date: '28 Dec 2025',
      time: '10:30 AM',
      status: 'completed',
    },
    {
      id: '2',
      type: 'debit',
      title: 'Jewellery Purchase',
      description: 'Gold necklace - 22KT',
      amount: 45000,
      date: '25 Dec 2025',
      time: '02:15 PM',
      status: 'completed',
    },
    {
      id: '3',
      type: 'credit',
      title: 'Scheme Deposit',
      description: 'Wedding scheme',
      amount: 10000,
      date: '20 Dec 2025',
      time: '11:45 AM',
      status: 'completed',
    },
    {
      id: '4',
      type: 'debit',
      title: 'Silver Coins',
      description: '100g Silver coins',
      amount: 8100,
      date: '15 Dec 2025',
      time: '04:20 PM',
      status: 'completed',
    },
    {
      id: '5',
      type: 'credit',
      title: 'Monthly Savings',
      description: 'Recurring deposit',
      amount: 3000,
      date: '10 Dec 2025',
      time: '09:00 AM',
      status: 'pending',
    },
    {
      id: '6',
      type: 'debit',
      title: 'Gold Earrings',
      description: 'Traditional design',
      amount: 25000,
      date: '05 Dec 2025',
      time: '03:30 PM',
      status: 'completed',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'failed': return '#F44336';
      default: return '#999';
    }
  };

  const getInvoice = async (transactionId: string) => {
    // Implement invoice retrieval logic here
    console.log('Get invoice for transaction ID:', `${API_ENDPOINTS.INVOICE}?cust_id=${customerId}&id=${transactionId}`);
   // const invoiceUrl = `${API_ENDPOINTS.INVOICE}?cust_id=${customerId}&id=${transactionId}`;
   // console.log('Invoice URL:', invoiceUrl);
    // You can use Linking API to open the invoice URL in a browser
    // Linking.openURL(invoiceUrl);
     try {
      // Try with fetch to have more control
      const response = await fetch(`${API_ENDPOINTS.INVOICE}?id=${transactionId}&cust_id=${customerId}`, {
        method: 'GET',
       headers: {
        'Accept': 'application/json',
        'Internal': 'Nezlan',
        'Content-Type': 'application/json',
      },
      credentials: 'include',  
     
      });
      const responseData = await response.text();
      console.log('Invoice Response Data:', responseData);
      if (responseData) {
        navigation.getParent()?.navigate('Invoice' as any, { html: responseData });
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#2BC0AC" />
      
      {/* Header */}
      <View style={styles.header}>
        {isTransactionRoute ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRight} />
        )}
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {transactionData && transactionData.map((transaction: any) => (
            <View key={transaction.id} style={styles.card}>
              <View style={styles.cardHeader}>
               
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{transaction.scheme_name}</Text>
                  <Text style={styles.cardDescription}>{transaction.group_name}</Text>
                  <Text style={styles.metaText}>Receipt No: {transaction.receipet_no || '-'}</Text>
                  <Text style={styles.metaText}>Payment Type: {transaction.payment_type || '-'}</Text>
                </View>
                <View style={styles.amountContainer}>
                  <Text style={[
                    styles.amount,
                    { color:  '#4CAF50' }
                  ]}>
                    { '+'}₹{transaction.payed_amount}
                  </Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <View style={styles.dateTimeContainer}>
                     <Ionicons name="calendar-outline" size={14} color="#999" />
                     <Text style={styles.dateText}>{transaction.payment_date}</Text>
                     <Ionicons name="time-outline" size={14} color="#999" style={styles.timeIcon} />
                     <Text style={styles.timeText}>{transaction.payment_time}</Text>
                </View>
                <View style={{ alignItems: 'center'}}>
                   <TouchableOpacity onPress={() => getInvoice(transaction.id)} style={[styles.statusBadge, { backgroundColor: '#E3F2FD', flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 10 }]}> 
                     <Ionicons name="print-outline" size={15} color="#1976D2" />
                     <Text style={[styles.statusText, { color: '#1976D2', marginLeft: 4 }]}>Print</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
  },
  metaText: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
    marginRight: 12,
  },
  timeIcon: {
    marginLeft: 0,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  statusBadge: {
    //paddingHorizontal: 10,
   // paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
});
