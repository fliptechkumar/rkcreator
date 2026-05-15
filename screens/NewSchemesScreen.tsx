import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { API_ENDPOINTS, ENV } from '../config/env';
import { Colors } from '../config/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';

type Props = NativeStackScreenProps<RootStackParamList, 'NewSchemes'>;

type ThemeColor =
  | { type: 'solid'; value: string }
  | { type: 'gradient'; gradient: { l1: string; l2: string } };

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
  themeColor: ThemeColor | null;
  bannerImage: string | null;
  schemeImage: string | null;
}

export default function NewSchemesScreen({ navigation }: Props) {
    const [schemes, setSchemes] = useState<SchemeDetail[]>([]);
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
      //console.log('Fetched schemes data:', JSON.stringify(data.data[0].scheme_terms));
      
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
          themeColor: item.banner?.theme_color ?? null,
          bannerImage: item.banner?.images ?? null,
          schemeImage: item.banner?.scheme_image ?? null,
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
        image: ENV.RAZORPAY_IMAGE,
        currency: 'INR',
        key: ENV.RAZORPAY_KEY_ID,
        amount: String(amount),
        name: ENV.RAZORPAY_BUSINESS_NAME,
        order_id: orderId,
        prefill: {
          email: userEmail,
          contact: userContact,
          name: userName,
        },
        theme: { color: 'Colors.primary' },
      };

      //  var options = {
      //   description: "Payment for New Scheme - " + scheme.name,
      //   image: "https://djjewellery.nezlan.in/uploads/store/DJJewellery_logo.png",
      //   currency: "INR",
      //   key: "rzp_live_SgUshqrEdNXF0M", //"rzp_live_ScA1021QMJkQ8C", // Your Razorpay Key Id
      //   amount: String(amount), // Amount in paise
      //   name: "Dhiya Jewels",
      //   order_id: orderId, //Replace this with an order_id created using Orders API.
      //   prefill: {
      //     email: userEmail,
      //     contact: userContact,
      //     name: userName,
      //   },
      //   theme: { color: "Colors.primary" },
      // };

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


  const renderCardBanner = (scheme: typeof schemes[0], children: React.ReactNode) => {
    const tc = scheme.themeColor;
    if (tc?.type === 'gradient') {
      return (
        <LinearGradient
          colors={[tc.gradient.l1, tc.gradient.l2] as const}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.cardGradient}
        >
          {children}
        </LinearGradient>
      );
    }
    const bg = tc?.type === 'solid' ? tc.value : '#B83020';
    return <View style={[styles.cardGradient, { backgroundColor: bg }]}>{children}</View>;
  };

  const renderSchemeCard = (scheme: typeof schemes[0], index: number) => (
    <View key={`${scheme.id}-${index}`} style={styles.schemeCard}>
      {renderCardBanner(scheme,
        <>
          {/* Logo badge */}
          <View style={styles.logoBadge}>
            {scheme.schemeImage ? (
              <Image
                source={{ uri: scheme.schemeImage }}
                style={styles.logoBadgeImage}
                resizeMode="contain"
              />
            ) : (
              <>
                <Ionicons name="diamond" size={10} color="#fff" />
                <Text style={styles.logoBadgeText}>{scheme.groupName || 'DIGI GOLD'}</Text>
              </>
            )}
          </View>

          <View style={styles.cardMainContent}>
            <View style={styles.cardTextSection}>
              <Text style={styles.cardTitle}>{scheme.name}</Text>
              <Text style={styles.cardSubtitle}>
                {`Easy | Flexible | Convenient.\nStart with just ${scheme.monthlyAmount} | ${scheme.benefits}`}
              </Text>
            </View>

            {/* Banner image */}
            {scheme.bannerImage ? (
              <Image
                source={{ uri: scheme.bannerImage }}
                style={styles.bannerImage}
                resizeMode="contain"
              />
            ) : (
              <View />
              // <View style={styles.goldCoinBadge}>
              //   <Text style={styles.goldCoinKarat}>22K</Text>
              //   <Text style={styles.goldCoinText}>GOLD</Text>
              // </View>
            )}
          </View>
        </>
      )}

      {/* Bottom buttons */}
      <View style={styles.cardButtons}>
        {/* <TouchableOpacity
          style={styles.knowMoreButton}
          onPress={() => navigation.navigate('SchemeDetails', {
            id: scheme.id,
            name: scheme.name,
            duration: scheme.duration,
            monthlyAmount: scheme.monthlyAmount,
            benefits: scheme.benefits,
            description: scheme.description,
            color: scheme.color,
            groupName: scheme.groupName,
            bannerImage: scheme.bannerImage,
            schemeImage: scheme.schemeImage,
            customerId,
          })}
        >
          <Text style={styles.knowMoreText}>Know More</Text>
        </TouchableOpacity> */}
        <View style={styles.buttonsDivider} />
        <TouchableOpacity
          style={[styles.joinNowButton, joinLoadingSchemeId === scheme.id && styles.joinButtonDisabled]}
         // onPress={() => handleJoinSchemePayment(scheme)}
           onPress={() => navigation.navigate('SchemeDetails', {
            id: scheme.id,
            name: scheme.name,
            duration: scheme.duration,
            monthlyAmount: scheme.monthlyAmount,
            benefits: scheme.benefits,
            description: scheme.description,
            color: scheme.color,
            groupName: scheme.groupName,
            bannerImage: scheme.bannerImage,
            schemeImage: scheme.schemeImage,
            customerId,
          })}
          disabled={joinLoadingSchemeId === scheme.id}
        >
          {joinLoadingSchemeId === scheme.id ? (
            <ActivityIndicator size="small" color="#C05020" />
          ) : (
            <Text style={styles.joinNowText}>Join Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

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

      <ImageBackground source={require("../assets/bg.jpeg")} style={styles.backgroundImage} resizeMode="cover" >
        {/* <View style={styles.whiteOverlay} /> */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Join Our Savings Schemes</Text>
          {/* <Text style={styles.introText}>
            Choose from our flexible savings plans designed to help you achieve
            your jewellery dreams with attractive benefits and rewards.
          </Text> */}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
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
            {schemes.map((scheme, index) => renderSchemeCard(scheme, index))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
      </ImageBackground>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.primary,
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
  backgroundImage: {
    flex: 1,
  },
  whiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  introSection: {
   // backgroundColor: '#fff',
    padding: 10,
    //marginBottom: 10,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: "#000000"
    //marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  schemesContainer: {
    paddingHorizontal: 15,
    gap: 8,
  },
  schemeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    padding: 16,
    paddingBottom: 20,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: 'rgba(0,0,0,0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
    gap: 4,
  },
  logoBadgeImage: {
    width: 60,
    height: 20,
  },
  logoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  cardMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTextSection: {
    flex: 1,
    paddingRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  bannerImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  goldCoinBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#D4A017',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F0C040',
    shadowColor: '#D4A017',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  goldCoinKarat: {
    fontSize: 18,
    fontWeight: '900',
    color: '#7B4000',
    letterSpacing: 1,
  },
  goldCoinText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7B4000',
    letterSpacing: 2,
  },
  cardButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  knowMoreButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  knowMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  buttonsDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  joinNowButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  joinNowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C05020',
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
    backgroundColor: 'Colors.primary',
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
    backgroundColor: 'Colors.primary',
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
