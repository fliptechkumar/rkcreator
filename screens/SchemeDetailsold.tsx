import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Colors } from '../config/colors';
import { ENV, API_ENDPOINTS } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';

type Props = NativeStackScreenProps<RootStackParamList, 'SchemeDetails'>;

interface UserInfo {
  name: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  pan: string;
  aadhaar: string;
  gstin: string;
}

const STEPS = [
  { icon: 'phone-portrait-outline' as const, label: "Click 'Join Now' On\nDigigold Scheme" },
  { icon: 'scale-outline' as const, label: 'Enter Amount/Weight\nyou wish to start with' },
  { icon: 'card-outline' as const, label: 'Make Payment Using\nAny Mode' },
];

const FAQS = [
  { q: 'What is DigiGold?', a: 'DigiGold is a digital gold savings scheme that allows you to save in gold through a convenient mobile app, providing tiered benefits.' },
  { q: 'What is the minimum investment amount?', a: 'You can start with the minimum monthly installment amount specified in the scheme details.' },
  { q: 'How long is the scheme period?', a: 'The scheme period is defined by the duration mentioned in the scheme. Please refer to the scheme card for exact duration.' },
  { q: 'What are the benefits offered?', a: 'Benefits include bonus gold weight, flexible payment options, and the ability to redeem savings for attractive gold jewellery.' },
  { q: 'How can users redeem their saved gold weight?', a: 'Customers can redeem their saved gold weight at the store upon completion of the scheme.' },
  { q: 'Is there a lock-in period?', a: 'Yes, the scheme must be completed for the full duration to avail all benefits.' },
  { q: 'Can users purchase gold jewelry with their saved gold weight at any store?', a: 'Gold can be redeemed at the designated stores associated with this scheme.' },
];

export default function SchemeDetailsScreen({ navigation, route }: Props) {
  const scheme = route.params;
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [kycVisible, setKycVisible] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [pan, setPan] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [gstin, setGstin] = useState('');
  const [kycSaving, setKycSaving] = useState(false);

  const handleJoinNow = async () => {
    if (!scheme.customerId) {
      alert('User details not found. Please login again.');
      return;
    }
    try {
      const stored = await AsyncStorage.getItem('userDetails');
      if (stored) {
        const u = JSON.parse(stored);
        setUserInfo({
          name: u.customer_name || '',
          mobile: u.mobile || '',
          email: u.email || '',
          address: u.address || '',
          city: u.city || '',
          state: u.state || '',
          postcode: u.postcode || '',
          pan: u.tax_number || '',
          aadhaar: u.aadhar_number || '',
          gstin: u.gstin || '',
        });
        setPan(u.tax_number || '');
        setAadhaar(u.aadhar_number || '');
        setGstin(u.gstin || '');
      }
    } catch {}
    setKycVisible(true);
  };

  const handleSaveKyc = async () => {
    if (!pan.trim()) { alert('PAN number is required.'); return; }
    if (aadhaar.trim().length !== 12) { alert('Enter a valid 12-digit Aadhaar number.'); return; }
    setKycSaving(true);
    try {
      const formData = new FormData();
      formData.append('id', scheme.customerId);
      formData.append('tax_number', pan.trim());
      formData.append('aadhar_number', aadhaar.trim());
      formData.append('adhar_number', aadhaar.trim());
      formData.append('gstin', gstin.trim());
      const response = await fetch(API_ENDPOINTS.KYC_VERIFICATION, {
        method: 'POST',
        headers: { Accept: 'application/json', Internal: 'Nezlan' },
        body: formData,
      });
      const data = await response.json();
      if (data?.success) {
        const stored = await AsyncStorage.getItem('userDetails');
        if (stored) {
          const u = JSON.parse(stored);
          await AsyncStorage.setItem('userDetails', JSON.stringify({
            ...u, tax_number: pan.trim(), aadhar_number: aadhaar.trim(), gstin: gstin.trim(),
          }));
        }
        alert('KYC details saved successfully.');
      } else {
        alert(data?.message || 'Failed to save KYC details.');
      }
    } catch (err: any) {
      alert(err?.message || 'Something went wrong.');
    } finally {
      setKycSaving(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (payLoading) return;

    const amountNumber = Math.round(Number(scheme.monthlyAmount.replace(/[^0-9.-]+/g, '')));
    if (!amountNumber || amountNumber <= 0) {
      alert('Invalid payment amount for selected scheme.');
      return;
    }

    const amount = amountNumber * 100;
    const receiptId = `order_rcptid_${Date.now()}`;
    setPayLoading(true);

    try {
      const createOrderUrl = `${API_ENDPOINTS.CREATE_ORDER}?amount=${amount}&receipt_id=${encodeURIComponent(receiptId)}&customer_id=${encodeURIComponent(scheme.customerId)}&customer_scheme_id=&scheme_group_id=${encodeURIComponent(String(scheme.id))}`;
      const createOrderResponse = await fetch(createOrderUrl, {
        method: 'GET',
        headers: { Accept: 'application/json', Internal: 'Nezlan', 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const createOrderData = await createOrderResponse.json();
      if (!createOrderData?.success) {
        alert(createOrderData?.message || 'Failed to create Razorpay order.');
        return;
      }

      const orderId =
        (typeof createOrderData?.data === 'string' ? createOrderData.data : '') ||
        createOrderData?.data || '';
      if (!orderId) {
        alert('Invalid order response from server.');
        return;
      }

      const options = {
        description: 'Join scheme payment',
        image: ENV.RAZORPAY_IMAGE,
        currency: 'INR',
        key: ENV.RAZORPAY_KEY_ID,
        amount: String(amount),
        name: ENV.RAZORPAY_BUSINESS_NAME,
        order_id: orderId,
        prefill: {
          email: userInfo?.email || '',
          contact: userInfo?.mobile ? `+91${userInfo.mobile}` : '',
          name: userInfo?.name || '',
        },
        theme: { color: Colors.primary },
      };

      setKycVisible(false);

      RazorpayCheckout.open(options)
        .then(() => {
          navigation.goBack();
        })
        .catch((err: any) => {
          if (err?.code !== 2) {
            alert('Payment failed. Please try again.');
          }
        });
    } catch (err: any) {
      alert(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top','bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Join {scheme.name}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {scheme.bannerImage ? (
          <Image source={{ uri: scheme.bannerImage }} style={styles.bannerImage} resizeMode="cover" />
        ) : (
          <View style={[styles.bannerPlaceholder, { backgroundColor: Colors.primary + '20' }]}>
            <Ionicons name="diamond-outline" size={48} color={Colors.primary} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={[styles.schemeName, { color: Colors.primary }]}>{scheme.name.toUpperCase()}</Text>
          <Text style={styles.descriptionText}>{scheme.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Process to Join</Text>
          <View style={styles.stepsRow}>
            {STEPS.map((step, i) => (
              <View key={i} style={styles.stepItem}>
                <Text style={styles.stepNum}>Steps {i + 1}</Text>
                <View style={styles.stepCircle}>
                  <Ionicons name={step.icon} size={28} color={Colors.primary} />
                </View>
                <Text style={styles.stepLabel}>{step.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Refunds:</Text>
          <Text style={styles.refundText}>
            The paid amount will not be refunded under any circumstances. This means that if the
            customer changes their mind after enrolling in the scheme and decides not to redeem the
            gold, they will not be able to get a refund of the amount paid.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAQs</Text>
          {FAQS.map((faq, i) => (
            <TouchableOpacity
              key={i}
              style={styles.faqItem}
              onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
              activeOpacity={0.7}
            >
              <View style={styles.faqRow}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Ionicons
                  name={expandedFaq === i ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#555"
                />
              </View>
              {expandedFaq === i && <Text style={styles.faqAnswer}>{faq.a}</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.joinButton} onPress={handleJoinNow}>
          <Text style={styles.joinButtonText}>Join Now</Text>
        </TouchableOpacity>
      </View>

      {/* KYC Confirmation Modal */}
      <Modal
        visible={kycVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setKycVisible(false)}
      >
        <SafeAreaView style={styles.kycSafeArea} edges={['top']}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

          <View style={styles.kycHeader}>
            <TouchableOpacity style={styles.backButton} onPress={() => setKycVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.kycHeaderTitle}>Confirm Your KYC Details</Text>
              <Text style={styles.kycHeaderSubtitle}>To Join {scheme.name} scheme</Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          <ScrollView style={styles.kycBody} showsVerticalScrollIndicator={false}>
            {/* Basic Details */}
            <View style={styles.kycCard}>
              <Text style={styles.kycCardTitle}>Basic Details</Text>

              <View style={styles.kycField}>
                <Text style={styles.kycLabel}>Name</Text>
                <Text style={styles.kycValue}>{userInfo?.name || '--'}</Text>
              </View>
              <View style={styles.kycDivider} />

              <View style={styles.kycField}>
                <Text style={styles.kycLabel}>Mobile Number</Text>
                <Text style={styles.kycValue}>{userInfo?.mobile || '--'}</Text>
              </View>
              <View style={styles.kycDivider} />

              <View style={[styles.kycField, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }]}>
                <View>
                  <Text style={styles.kycLabel}>Email</Text>
                  <Text style={styles.kycValue}>{userInfo?.email || '--'}</Text>
                </View>
              </View>
            </View>

            {/* Address */}
            <View style={styles.kycCard}>
              <View style={styles.kycCardHeader}>
                <Text style={styles.kycCardTitle}>Address</Text>
                <TouchableOpacity onPress={() => { setKycVisible(false); navigation.navigate('EditProfile' as any); }}>
                  <Ionicons name="pencil-outline" size={18} color="#555" />
                </TouchableOpacity>
              </View>

              <View style={styles.kycField}>
                <Text style={styles.kycLabel}>Address</Text>
                <Text style={styles.kycValue}>{userInfo?.address || '--'}</Text>
              </View>
              <View style={styles.kycDivider} />

              <View style={styles.kycField}>
                <Text style={styles.kycLabel}>PIN Code</Text>
                <Text style={styles.kycValue}>{userInfo?.postcode || '--'}</Text>
              </View>
              <View style={styles.kycDivider} />

              <View style={styles.kycField}>
                <Text style={styles.kycLabel}>City</Text>
                <Text style={styles.kycValue}>{userInfo?.city || '--'}</Text>
              </View>
              <View style={styles.kycDivider} />

              <View style={styles.kycField}>
                <Text style={styles.kycLabel}>State</Text>
                <Text style={styles.kycValue}>{userInfo?.state || '--'}</Text>
              </View>
            </View>

            {/* KYC Details */}
            <View style={styles.kycCard}>
              <Text style={styles.kycCardTitle}>KYC Details</Text>

              <Text style={styles.kycLabel}>PAN Number <Text style={{ color: '#E94560' }}>*</Text></Text>
              <TextInput
                style={styles.kycInput}
                value={pan}
                onChangeText={setPan}
                placeholder="Enter PAN number"
                placeholderTextColor="#bbb"
                autoCapitalize="characters"
              />

              <Text style={styles.kycLabel}>Aadhaar Number <Text style={{ color: '#E94560' }}>*</Text></Text>
              <TextInput
                style={styles.kycInput}
                value={aadhaar}
                onChangeText={(t) => setAadhaar(t.replace(/[^0-9]/g, ''))}
                placeholder="Enter 12-digit Aadhaar number"
                placeholderTextColor="#bbb"
                keyboardType="number-pad"
                maxLength={12}
              />

              <Text style={styles.kycLabel}>GSTIN</Text>
              <TextInput
                style={styles.kycInput}
                value={gstin}
                onChangeText={setGstin}
                placeholder="Enter GSTIN (optional)"
                placeholderTextColor="#bbb"
                autoCapitalize="characters"
              />

              <TouchableOpacity
                style={[styles.kycSaveButton, kycSaving && { opacity: 0.7 }]}
                onPress={handleSaveKyc}
                disabled={kycSaving}
              >
                {kycSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.kycSaveButtonText}>Save KYC Details</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>

          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.joinButton, payLoading && { opacity: 0.7 }]}
              onPress={handleConfirmPayment}
              disabled={payLoading}
            >
              {payLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.joinButtonText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.primary,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#fff', flex: 1, textAlign: 'center' },
  headerRight: { width: 40 },
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  bannerImage: { width: '100%', height: 200, backgroundColor: '#eee' },
  bannerPlaceholder: {
    width: '100%', height: 200,
    justifyContent: 'center', alignItems: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 10 },
  schemeName: { fontSize: 13, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 },
  descriptionText: { fontSize: 13, color: '#555', lineHeight: 20 },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  stepItem: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  stepNum: { fontSize: 11, color: Colors.primary, fontWeight: '600', marginBottom: 6 },
  stepCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  stepLabel: { fontSize: 11, color: '#555', textAlign: 'center', lineHeight: 16 },
  refundText: { fontSize: 13, color: '#555', lineHeight: 20 },
  faqItem: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingVertical: 12 },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 13, color: '#333', flex: 1, paddingRight: 8, lineHeight: 18 },
  faqAnswer: { fontSize: 12, color: '#666', marginTop: 8, lineHeight: 18 },
  bottomSpacer: { height: 20 },
  bottomBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#E5E5E5',
  },
  joinButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10, paddingVertical: 14, alignItems: 'center',
  },
  joinButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // KYC Modal
  kycSafeArea: { flex: 1, backgroundColor: Colors.primary },
  kycHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.primary,
  },
  kycHeaderTitle: { fontSize: 16, fontWeight: '700', color: '#fff', textAlign: 'center' },
  kycHeaderSubtitle: { fontSize: 12, color: '#fff', opacity: 0.85, textAlign: 'center', marginTop: 2 },
  kycBody: { flex: 1, backgroundColor: '#F5F5F5' },
  kycCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  kycCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kycCardTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 12 },
  kycField: { paddingVertical: 8 },
  kycLabel: { fontSize: 11, color: '#999', marginBottom: 6, marginTop: 4 },
  kycInput: {
    fontSize: 14,
    color: '#222',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  kycSaveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  kycSaveButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  kycValue: { fontSize: 14, color: '#222', fontWeight: '500' },
  kycDivider: { height: 1, backgroundColor: '#F0F0F0' },
});
