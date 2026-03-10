import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { API_ENDPOINTS } from '../config/env';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

type CountryOption = {
  id: number;
  name: string;
};

type StateOption = {
  id: number;
  name: string;
};

export default function RegisterScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [countryId, setCountryId] = useState<number | null>(null);
  const [stateId, setStateId] = useState<number | null>(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryList, setShowCountryList] = useState(false);
  const [showStateList, setShowStateList] = useState(false);

  useEffect(() => {
    loadCountries();
  }, []);

  const extractOptions = (responseData: any): Array<any> => {
    if (Array.isArray(responseData)) {
      return responseData;
    }

    if (Array.isArray(responseData?.data)) {
      return responseData.data;
    }

    if (Array.isArray(responseData?.countries)) {
      return responseData.countries;
    }

    if (Array.isArray(responseData?.states)) {
      return responseData.states;
    }

    if (Array.isArray(responseData?.result)) {
      return responseData.result;
    }

    return [];
  };

  const normalizeOption = (item: any): { id: number; name: string } | null => {
    const id = Number(item?.id ?? item?.country_id ?? item?.state_id ?? item?.value);
    const name = String(
      item?.name ?? item?.country ?? item?.state ?? item?.country_name ?? item?.state_name ?? item?.label ?? '',
    ).trim();

    if (!Number.isFinite(id) || !name) {
      return null;
    }

    return { id, name };
  };

  const loadCountries = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GET_COUNTRY, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Internal: 'Nezlan',
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();
      const rawOptions = extractOptions(responseData);
      const mapped = rawOptions
        .map(normalizeOption)
        .filter((item): item is CountryOption => item !== null);

      setCountries(mapped);
    } catch (error) {
      console.error('Country fetch error:', error);
    }
  };

  const loadStates = async (selectedCountryId: number) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.GET_STATE}?country_id=${selectedCountryId}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Internal: 'Nezlan',
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();
      const rawOptions = extractOptions(responseData);
      const mapped = rawOptions
        .map(normalizeOption)
        .filter((item): item is StateOption => item !== null);

      setStates(mapped);
    } catch (error) {
      console.error('State fetch error:', error);
    }
  };

  const selectedCountryName = countries.find((item) => item.id === countryId)?.name || 'Select Country';
  const selectedStateName = states.find((item) => item.id === stateId)?.name || 'Select State';
  const normalizedCountrySearch = countrySearch.trim().toLowerCase();
  const filteredCountries = [...countries]
    .sort((a, b) => {
      const aIsIndia = a.name.toLowerCase() === 'india';
      const bIsIndia = b.name.toLowerCase() === 'india';

      if (aIsIndia && !bIsIndia) {
        return -1;
      }

      if (!aIsIndia && bIsIndia) {
        return 1;
      }

      return a.name.localeCompare(b.name);
    })
    .filter((item) => item.name.toLowerCase().includes(normalizedCountrySearch));

  const handleSelectCountry = (id: number) => {
    setCountryId(id);
    setStateId(null);
    setCountrySearch('');
    setStates([]);
    setShowCountryList(false);
    setShowStateList(false);
    loadStates(id);
  };

  const handleSelectState = (id: number) => {
    setStateId(id);
    setShowStateList(false);
  };

  const extractRegisteredCustomerId = (responseData: any): string | undefined => {
    const possibleIds = [
      responseData?.customer_id,
      responseData?.id,
      responseData?.user_id,
      responseData?.data?.id,
      responseData?.data?.customer_id,
      responseData?.data?.user?.id,
      responseData?.user?.id,
    ];

    const matched = possibleIds.find((value) => value !== undefined && value !== null && String(value).trim() !== '');
    return matched !== undefined ? String(matched) : undefined;
  };

  const handleRegisterCustomer = async () => {
    if (!customerName.trim()) {
      setErrorMessage('Customer name is required');
      return;
    }

    if (phoneNumber.length !== 10) {
      setErrorMessage('Enter a valid 10-digit mobile number');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Enter a valid email address');
      return;
    }

    if (!address.trim() || !city.trim()) {
      setErrorMessage('Address and city are required');
      return;
    }

    if (!countryId || !stateId) {
      setErrorMessage('Please select country and state');
      return;
    }

    if (!postcode.trim()) {
      setErrorMessage('Postcode is required');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(API_ENDPOINTS.REGISTER_CUSTOMER, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Internal: 'Nezlan',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          mobile: phoneNumber,
          email: email.trim(),
          address: address.trim(),
          city: city.trim(),
          country_id: countryId,
          state_id: stateId,
          postcode: Number(postcode),
        }),
      });

      const responseData = await response.json();

      if (responseData?.success) {
        setLoading(false);
        const registeredCustomerId = extractRegisteredCustomerId(responseData);
        alert(responseData.message || 'Registration successful. Please complete KYC verification.');
        navigation.replace('KycVerification', { customerId: registeredCustomerId });
        return;
      }

      setLoading(false);
      setErrorMessage(responseData?.message || 'Registration failed');
    } catch (error: any) {
      setLoading(false);
      setErrorMessage(error?.message || 'Registration failed');
    }
  };

  return (
  <SafeAreaView style={styles.safeArea} edges={['top','left','right']}>
       <StatusBar barStyle="dark-content" backgroundColor="#2BC0AC" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <View style={styles.inputSection}>
              <Text style={styles.label}>Customer Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter customer name"
                placeholderTextColor="#999"
                value={customerName}
                onChangeText={setCustomerName}
                editable={!loading}
              />

              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneInputContainer}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Enter 10-digit mobile number"
                  placeholderTextColor="#999"
                  value={phoneNumber}
                  onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!loading}
                  returnKeyType="done"
                />
              </View>

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />

              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder="Enter address"
                placeholderTextColor="#999"
                value={address}
                onChangeText={setAddress}
                multiline
                editable={!loading}
              />

              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter city"
                placeholderTextColor="#999"
                value={city}
                onChangeText={setCity}
                editable={!loading}
              />

              <Text style={styles.label}>Country</Text>
              <TouchableOpacity
                style={styles.selectorInput}
                onPress={() => {
                  setShowCountryList((prev) => {
                    const next = !prev;
                    if (next) {
                      setCountrySearch('');
                    }
                    return next;
                  });
                  setShowStateList(false);
                }}
                disabled={loading}
              >
                <Text style={styles.selectorText}>{selectedCountryName}</Text>
                <Ionicons name={showCountryList ? 'chevron-up' : 'chevron-down'} size={18} color="#666" />
              </TouchableOpacity>

              {showCountryList ? (
                <View style={styles.optionList}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search country"
                    placeholderTextColor="#999"
                    value={countrySearch}
                    onChangeText={setCountrySearch}
                    editable={!loading}
                  />
                  <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator>
                    {filteredCountries.length ? (
                      filteredCountries.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.optionItem}
                          onPress={() => handleSelectCountry(item.id)}
                        >
                          <Text style={styles.optionText}>{item.name}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.optionEmptyText}>No countries found</Text>
                    )}
                  </ScrollView>
                </View>
              ) : null}

              <Text style={styles.label}>State</Text>
              <TouchableOpacity
                style={styles.selectorInput}
                onPress={() => {
                  if (!countryId) {
                    return;
                  }

                  setShowStateList((prev) => !prev);
                  setShowCountryList(false);
                }}
                disabled={loading}
              >
                <Text style={styles.selectorText}>{selectedStateName}</Text>
                <Ionicons name={showStateList ? 'chevron-up' : 'chevron-down'} size={18} color="#666" />
              </TouchableOpacity>

              {showStateList ? (
                <View style={styles.optionList}>
                  <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator>
                    {states.length ? (
                      states.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.optionItem}
                          onPress={() => handleSelectState(item.id)}
                        >
                          <Text style={styles.optionText}>{item.name}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.optionEmptyText}>No states available</Text>
                    )}
                  </ScrollView>
                </View>
              ) : null}

              <Text style={styles.label}>Postcode</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter postcode"
                placeholderTextColor="#999"
                value={postcode}
                onChangeText={(text) => setPostcode(text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                editable={!loading}
              />

              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={18} color="#E94560" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!customerName.trim() ||
                  phoneNumber.length !== 10 ||
                  !email.trim() ||
                  !address.trim() ||
                  !city.trim() ||
                  !countryId ||
                  !stateId ||
                  !postcode.trim() ||
                  loading) && styles.buttonDisabled,
              ]}
              onPress={handleRegisterCustomer}
              disabled={
                !customerName.trim() ||
                phoneNumber.length !== 10 ||
                !email.trim() ||
                !address.trim() ||
                !city.trim() ||
                !countryId ||
                !stateId ||
                !postcode.trim() ||
                loading
              }
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Register</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
            <View style={{ height: 30 }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
   // backgroundColor: '#fff',
  },
  container: {
    flex: 1,
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
  inputSection: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    marginBottom: 14,
  },
  countryCode: {
    backgroundColor: '#2BC0AC',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 18,
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
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectorInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  optionList: {
    maxHeight: 180,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 14,
    overflow: 'hidden',
  },
  searchInput: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    backgroundColor: '#fff',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  optionEmptyText: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#999',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 4,
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
    shadowColor: '#2BC0AC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#B0B0B0',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});