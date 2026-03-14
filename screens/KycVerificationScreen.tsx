import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { API_ENDPOINTS } from '../config/env';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'KycVerification'>;

export default function KycVerificationScreen({ navigation, route }: Props) {
  const [taxNumber, setTaxNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [attachment, setAttachment] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const customerId = route.params?.customerId;
  const isDisabled = useMemo(
    () =>
      loading ||
      !taxNumber.trim() ||
      aadhaarNumber.trim().length !== 12 ||
      !customerId,
    [loading, taxNumber, aadhaarNumber, gstin, customerId],
  );

  const pickAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        setAttachment(result.assets[0]);
        setErrorMessage('');
      }
    } catch (error: any) {
      setErrorMessage(error?.message || 'Failed to pick attachment');
    }
  };

  const handleSubmitKyc = async () => {
    if (!customerId) {
      setErrorMessage('Customer id not found. Please register again.');
      return;
    }

    if (!taxNumber.trim()) {
      setErrorMessage('Tax number is required');
      return;
    }

    if (aadhaarNumber.trim().length !== 12) {
      setErrorMessage('Enter valid 12-digit Aadhaar number');
      return;
    }

    // if (!gstin.trim()) {
    //   setErrorMessage('GSTIN is required');
    //   return;
    // }

    if (!attachment) {
      setErrorMessage('Attachment is required');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('id', customerId);
      formData.append('tax_number', taxNumber.trim());
      formData.append('aadhar_number', aadhaarNumber.trim());
      formData.append('adhar_number', aadhaarNumber.trim());
      formData.append('gstin', gstin.trim());
      formData.append('attachment_1', {
        uri: attachment.uri,
        name: attachment.name || `kyc_${Date.now()}`,
        type: attachment.mimeType || 'application/octet-stream',
      } as any);

      const response = await fetch(API_ENDPOINTS.KYC_VERIFICATION, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Internal: 'Nezlan',
        },
        body: formData,
      });

      const responseData = await response.json();

      if (responseData?.success) {
        setLoading(false);
        Toast.show({
          type: 'success',
          text1: 'KYC submitted successfully.',
          text2:' Please wait for admin approval.',
        });
        navigation.replace('Login');
        return;
      }

      setLoading(false);
      setErrorMessage(responseData?.message || 'Failed to submit KYC');
    } catch (error: any) {
      setLoading(false);
      setErrorMessage(error?.message || 'Failed to submit KYC');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#2BC0AC" />

      <SafeAreaView style={styles.topSafeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify KYC</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.contentContainer}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.subtitle}>Complete KYC to continue with your account.</Text>

          <Text style={styles.label}>Tax Number</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter tax number"
            placeholderTextColor="#999"
            value={taxNumber}
            onChangeText={setTaxNumber}
            editable={!loading}
          />

          <Text style={styles.label}>Aadhaar Number</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter 12-digit Aadhaar number"
            placeholderTextColor="#999"
            value={aadhaarNumber}
            onChangeText={(text) => setAadhaarNumber(text.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={12}
            editable={!loading}
          />

          <Text style={styles.label}>GSTIN</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter GSTIN"
            placeholderTextColor="#999"
            value={gstin}
            onChangeText={setGstin}
            autoCapitalize="characters"
            editable={!loading}
          />

          <Text style={styles.label}>Attachment</Text>
          <TouchableOpacity style={styles.attachmentButton} onPress={pickAttachment} disabled={loading}>
            <Ionicons name="attach" size={18} color="#2BC0AC" />
            <Text style={styles.attachmentText} numberOfLines={1}>
              {attachment?.name || 'Upload Aadhaar/PAN/GST document'}
            </Text>
          </TouchableOpacity>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color="#E94560" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

            <TouchableOpacity
              style={[styles.primaryButton, isDisabled && styles.buttonDisabled]}
              onPress={handleSubmitKyc}
              disabled={isDisabled}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Submit KYC</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topSafeArea: {
    backgroundColor: '#2BC0AC',
  },
  bottomSafeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#2BC0AC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
    gap: 8,
  },
  attachmentText: {
    color: '#333',
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 13,
    color: '#E94560',
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#2BC0AC',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  buttonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});
