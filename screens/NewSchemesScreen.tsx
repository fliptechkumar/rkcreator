import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { API_ENDPOINTS } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';

type Props = NativeStackScreenProps<RootStackParamList, 'NewSchemes'>;

interface SchemeDetail {
  id: number;
  name: string;
  duration: string;
  monthlyAmount: string;
  benefits: string;
  description: string;
  color: string;
  advanceAmount: string;
  schemeAmount: string;
  goldRate: string;
  groupName: string;
  warehouseName: string;
  schemeDate: string;
}

export default function NewSchemesScreen({ navigation }: Props) {
    const [schemes, setSchemes] = useState<SchemeDetail[]>([]);
    const [selectedScheme, setSelectedScheme] = useState<SchemeDetail | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string>('');
  const [joinLoadingSchemeId, setJoinLoadingSchemeId] = useState<number | null>(null);

    useFocusEffect(
      useCallback(() => {
        console.log('NewSchemes Screen is focused');
        getUserDetails();
      }, [])
    );

    const getUserDetails = async () => {
      try {
        const userDetailsString = await AsyncStorage.getItem('userDetails');
        if (userDetailsString) {
          const userDetails = JSON.parse(userDetailsString);
          console.log('User Details from AsyncStorage:', userDetails.id);
          if (userDetails && userDetails.id) {
            setCustomerId(String(userDetails.id));
            fetchSchemes(userDetails.id);
          } else {
            console.warn('User ID not found in userDetails');
            setCustomerId('');
            fetchSchemes('');
          }
        } else {
          console.warn('No userDetails found in AsyncStorage');
          setCustomerId('');
          fetchSchemes('');
        }
      } catch (error) {
        console.error('Error retrieving userDetails from AsyncStorage:', error);
        setCustomerId('');
        fetchSchemes('');
      }
    };
    
    const getColorForIndex = (index: number) => {
      const colors = ['#FFD700', '#C0C0C0', '#B9F2FF', '#FFB6C1', '#8A2BE2', '#FF7F50'];
      return colors[index % colors.length];
    };


  const fetchSchemes = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_ENDPOINTS.NEWSCHEMES}?id=${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Internal': 'Nezlan',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const data = await response.json();
      console.log('Fetched schemes data:', data);
      
      if (data && data.success && data.data?.length > 0) {
        // Map API data to our scheme format
        const mappedSchemes = data.data.map((item: any, index: number) => ({
          id: item.id,
          name: item.scheme_name || 'Savings Scheme',
          duration: `${item.installment} ${item.installment > 1 ? ' months' : ' month'}`,
          monthlyAmount: `₹${item.monthly_amount?.toLocaleString() || '0'}`,
          benefits: item.benefits || 'Special benefits',
          description: item.description || `${item.group_name} savings plan with ${item.benefits || 'special'} bonus`,
          color: getColorForIndex(index),
          advanceAmount: item.advance_amount,
          schemeAmount: item.scheme_amount,
          goldRate: item.gold_rate,
          groupName: item.group_name,
          warehouseName: item.warehouse_name,
          schemeDate: new Date(item.scheme_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
        }));
        
        setSchemes(mappedSchemes);
      } else {
        setSchemes([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schemes');
      console.error('Error fetching schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyJoinSchemePayment = async (paymentData: any, scheme: SchemeDetail) => {
    try {
      console.log({
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_signature: paymentData.razorpay_signature,
          amount: scheme.monthlyAmount || scheme.schemeAmount,
          customer_id: customerId,
          scheme_group_id: scheme.id,
          chit_payment_id: null,
          type: 'joinScheme',
        });
      const response = await fetch(API_ENDPOINTS.VERIFY_PAYMENT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Internal: 'Nezlan',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_signature: paymentData.razorpay_signature,
          amount: scheme.monthlyAmount || scheme.schemeAmount,
          customer_id: customerId,
          scheme_group_id: scheme.id,
          chit_payment_id: null,
          type: 'joinScheme',
        }),
      });

      const responseData = await response.json();
      console.log('Join Scheme Payment Verification Response:', responseData);

      if (responseData?.success) {
        alert(responseData?.message || 'Joined scheme successfully.');
        setModalVisible(false);
        getUserDetails();
      } else {
        alert(responseData?.message || 'Payment verification failed.');
      }
    } catch (error: any) {
      console.error('Error verifying join scheme payment:', error?.message || error);
      alert(error?.message || 'Error while verifying payment.');
    }
  };

  const handleJoinSchemePayment = async (scheme: SchemeDetail) => {
    console.log('Initiating join scheme payment for scheme:', scheme);
    if (joinLoadingSchemeId) {
      return;
    }

    if (!customerId) {
      alert('User details not found. Please login again.');
      return;
    }

    const amountNumber = Math.round(Number(scheme.monthlyAmount.replace(/[^0-9.-]+/g, '')));
    console.log('Calculated payment amount:', amountNumber);
    if (!amountNumber || amountNumber <= 0) {
      alert('Invalid payment amount for selected scheme.');
      return;
    }

    const amount = amountNumber * 100;
    const receiptId = `order_rcptid_${Date.now()}`;
    setJoinLoadingSchemeId(scheme.id);

    try {
      const createOrderUrl = `${API_ENDPOINTS.CREATE_ORDER}?amount=${amount}&receipt_id=${encodeURIComponent(receiptId)}&customer_id=${encodeURIComponent(customerId)}&customer_scheme_id=&scheme_group_id=${encodeURIComponent(String(scheme.id))}`;
      const createOrderResponse = await fetch(createOrderUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Internal: 'Nezlan',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const createOrderData = await createOrderResponse.json();
      console.log('Create Join Scheme Order Response:', createOrderData);

      if (!createOrderData?.success) {
        alert(createOrderData?.message || 'Failed to create Razorpay order.');
        return;
      }

      const orderId =
        (typeof createOrderData?.data === 'string' ? createOrderData.data : '') ||
        createOrderData?.data ||
        '';

      if (!orderId) {
        alert('Invalid order response from server.');
        return;
      }

      let userEmail = '';
      let userContact = '';
      let userName = '';
      const userDetails = await AsyncStorage.getItem('userDetails');

      if (userDetails) {
        try {
          const user = JSON.parse(userDetails);
          userEmail = user.email || '';
          userContact = user.mobile ? `+91${user.mobile}` : '';
          userName = user.customer_name || '';
        } catch (parseError) {
          console.warn('Failed to parse user details for Razorpay prefill:', parseError);
        }
      }
      console.log('Razorpay prefill details:', { userEmail, userContact, userName,orderId });

      const options = {
        description: 'Join scheme payment',
        image: 'https://jewel.rkcreators.com/uploads/site/300x3001.png',
        currency: 'INR',
        key: 'rzp_test_SFHGcfzQqiClGg',
        amount: amount,
        name: 'Nezlan Jewel',
        order_id: orderId,
        prefill: {
          email: userEmail,
          contact: userContact,
          name: userName,
        },
        theme: { color: '#2BC0AC' },
      };

      RazorpayCheckout.open(options)
        .then((paymentData) => {
          verifyJoinSchemePayment(paymentData, scheme);
        })
        .catch((paymentError) => {
          console.log('Razorpay join payment error:', JSON.stringify(paymentError));
        });
    } catch (error: any) {
      const errorDescription = error?.description || error?.message || 'Payment cancelled or failed.';
      console.error('Error during join scheme payment:', errorDescription);
      alert(errorDescription);
    } finally {
      setJoinLoadingSchemeId(null);
    }
  };


  const renderSchemeCard = (scheme: typeof schemes[0]) => (
    <View key={scheme.id} style={styles.schemeCard}>
      <View style={[styles.schemeHeader, { backgroundColor: scheme.color + '20' }]}>
        <View style={styles.schemeHeaderContent}>
          <Text style={styles.schemeName}>{scheme.name}</Text>
          <View style={styles.durationBadge}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.durationText}>{scheme.duration}</Text>
          </View>
        </View>
        <View style={[styles.iconContainer, { backgroundColor: scheme.color }]}>
          <Ionicons name="star" size={24} color="#fff" />
        </View>
      </View>

      <View style={styles.schemeBody}>
        <Text style={styles.schemeDescription}>{scheme.description}</Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Monthly Amount</Text>
              <Text style={styles.detailValue}>{scheme.monthlyAmount}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Benefits</Text>
              <Text style={styles.detailValue}>{scheme.benefits}</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => {
              setSelectedScheme(scheme);
              setModalVisible(true);
            }}
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.joinButton, joinLoadingSchemeId === scheme.id && styles.joinButtonDisabled]}
            onPress={() => handleJoinSchemePayment(scheme)}
            disabled={joinLoadingSchemeId === scheme.id}
          >
            {joinLoadingSchemeId === scheme.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.joinButtonText}>Join Now</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>New Schemes</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Join Our Savings Schemes</Text>
          <Text style={styles.introText}>
            Choose from our flexible savings plans designed to help you achieve
            your jewellery dreams with attractive benefits and rewards.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2BC0AC" />
            <Text style={styles.loadingText}>Loading schemes...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#E94560" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchSchemes(customerId)}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : schemes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color="#999" />
            <Text style={styles.emptyText}>No schemes available</Text>
          </View>
        ) : (
          <View style={styles.schemesContainer}>
            {schemes.map(scheme => renderSchemeCard(scheme))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scheme Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedScheme && (
                <>
                  <View style={[styles.modalSchemeHeader, { backgroundColor: selectedScheme.color + '20' }]}>
                    <View style={[styles.modalIconContainer, { backgroundColor: selectedScheme.color }]}>
                      <Ionicons name="star" size={32} color="#fff" />
                    </View>
                    <Text style={styles.modalSchemeName}>{selectedScheme.name}</Text>
                    <Text style={styles.modalSchemeGroup}>{selectedScheme.groupName}</Text>
                  </View>

                  <View style={styles.modalDetailsSection}>
                    <View style={styles.modalDetailRow}>
                      <View style={styles.modalDetailItem}>
                        <Ionicons name="time-outline" size={20} color="#2BC0AC" />
                        <Text style={styles.modalDetailLabel}>Duration</Text>
                        <Text style={styles.modalDetailValue}>{selectedScheme.duration}</Text>
                      </View>
                      <View style={styles.modalDetailItem}>
                        <Ionicons name="cash-outline" size={20} color="#2BC0AC" />
                        <Text style={styles.modalDetailLabel}>Monthly Installment</Text>
                        <Text style={styles.modalDetailValue}>{selectedScheme.monthlyAmount}</Text>
                      </View>
                    </View>

                    <View style={styles.modalDetailRow}>
                      <View style={styles.modalDetailItem}>
                        <Ionicons name="gift-outline" size={20} color="#2BC0AC" />
                        <Text style={styles.modalDetailLabel}>Bonus Type</Text>
                        <Text style={styles.modalDetailValue}>{selectedScheme.benefits}</Text>
                      </View>
                      {/* <View style={styles.modalDetailItem}>
                        <Ionicons name="trending-up-outline" size={20} color="#2BC0AC" />
                        <Text style={styles.modalDetailLabel}>Gold Rate</Text>
                        <Text style={styles.modalDetailValue}>₹{selectedScheme.goldRate}</Text>
                      </View> */}
                    </View>

                    {/* <View style={styles.modalDetailFullWidth}>
                      <Ionicons name="wallet-outline" size={20} color="#2BC0AC" />
                      <Text style={styles.modalDetailLabel}>Scheme Amount Options</Text>
                      <Text style={styles.modalDetailValue}>₹{selectedScheme.schemeAmount}</Text>
                    </View> */}

                    {/* <View style={styles.modalDetailFullWidth}>
                      <Ionicons name="location-outline" size={20} color="#2BC0AC" />
                      <Text style={styles.modalDetailLabel}>Branch</Text>
                      <Text style={styles.modalDetailValue}>{selectedScheme.warehouseName}</Text>
                    </View> */}

                    {/* <View style={styles.modalDetailFullWidth}>
                      <Ionicons name="calendar-outline" size={20} color="#2BC0AC" />
                      <Text style={styles.modalDetailLabel}>Scheme Date</Text>
                      <Text style={styles.modalDetailValue}>{selectedScheme.schemeDate}</Text>
                    </View> */}


                    {selectedScheme.description && (
                      <View style={styles.modalDetailFullWidth}>
                        <Ionicons name="information-circle-outline" size={20} color="#2BC0AC" />
                        <Text style={styles.modalDetailLabel}>Description</Text>
                        <Text style={styles.modalDetailDescription}>{selectedScheme.description}</Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.modalJoinButton,
                      joinLoadingSchemeId === selectedScheme.id && styles.joinButtonDisabled,
                    ]}
                    onPress={() => handleJoinSchemePayment(selectedScheme)}
                    disabled={joinLoadingSchemeId === selectedScheme.id}
                  >
                    {joinLoadingSchemeId === selectedScheme.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.modalJoinButtonText}>Join This Scheme</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  introSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 15,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  schemesContainer: {
    paddingHorizontal: 15,
    gap: 15,
  },
  schemeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  schemeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  schemeHeaderContent: {
    flex: 1,
  },
  schemeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  schemeBody: {
    padding: 16,
    paddingTop: 0,
  },
  schemeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2BC0AC',
  },
  detailDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  joinButton: {
    flex: 1,
    backgroundColor: '#2BC0AC',
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  joinButtonDisabled: {
    opacity: 0.7,
  },
  bottomSpacer: {
    height: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2BC0AC',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    paddingHorizontal: 20,
  },
  modalSchemeHeader: {
    alignItems: 'center',
    padding: 24,
    marginTop: 16,
    borderRadius: 16,
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalSchemeName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSchemeGroup: {
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
  },
  modalDetailsSection: {
    marginTop: 20,
  },
  modalDetailRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  modalDetailItem: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
  },
  modalDetailFullWidth: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalDetailLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    marginBottom: 4,
  },
  modalDetailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  modalDetailDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 4,
  },
  modalJoinButton: {
    backgroundColor: '#2BC0AC',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  modalJoinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
