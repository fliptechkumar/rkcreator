import React, { useEffect, useState } from 'react';
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
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { API_ENDPOINTS } from '../config/env';
import Toast from 'react-native-toast-message';

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
  const insets = useSafeAreaInsets();
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
  const [stateSearch, setStateSearch] = useState('');
  const [showCountryList, setShowCountryList] = useState(false);
  const [showStateList, setShowStateList] = useState(false);

  useEffect(() => {
    setCountryId(49);
    loadCountries();
    loadStates(49); // Load states for India by default
  }, []);

  const extractOptions = (responseData: any): Array<any> => {
    if (Array.isArray(responseData)) {
      return responseData;
    }

    if (Array.isArray(responseData?.data)) {
      return responseData.data;
    }

    // if (Array.isArray(responseData?.countries)) {
    //   return responseData.countries;
    // }

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
    const name = String(item?.state).trim();

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
      console.log('State fetch response:', responseData);
      const rawOptions = extractOptions(responseData);
      const mapped = rawOptions
        .map(normalizeOption)
        .filter((item): item is StateOption => item !== null);
      console.log('Mapped states:', mapped);
      setStates(mapped);
    } catch (error) {
      console.error('State fetch error:', error);
    }
  };

  const selectedCountryName = countries.find((item) => item.id === countryId)?.name || 'Select Country';
  const selectedStateName = states.find((item) => item.id === stateId)?.name || 'Select State';
  const normalizedCountrySearch = countrySearch.trim().toLowerCase();
  const normalizedStateSearch = stateSearch.trim().toLowerCase();
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
  const filteredStates = [...states].filter((item) => item.name.toLowerCase().includes(normalizedStateSearch));

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
    setStateSearch('');
    setShowStateList(false);
  };

  const extractRegisteredCustomerId = (responseData: any): string | undefined => {
    const possibleIds = [
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

    if (!stateId) {
      setErrorMessage('Please select state');
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
          // country_id: countryId,
          state_id: stateId,
          postcode: Number(postcode),
        }),
      });

      const responseData = await response.json();

      if (responseData?.success) {
        setLoading(false);
        const registeredCustomerId = extractRegisteredCustomerId(responseData);
        console.log(responseData);
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: 'Please complete KYC verification.',
        });
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
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#2BC0AC" />
      <SafeAreaView style={styles.topSafeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Register</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.contentContainer}
          keyboardVerticalOffset={0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
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

             

            
              {/* <Text style={styles.label}>Country</Text>
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
              ) : null} */}

              <Text style={styles.label}>State</Text>
              <TouchableOpacity
                style={styles.selectorInput}
                onPress={() => {
                   setShowStateList((prev) => {
                    const next = !prev;
                    if (next) {
                      setStateSearch('');
                    }
                    return next;
                  });
                  // if (!countryId) {
                  //   return;
                  // }

                  // setShowStateList((prev) => !prev);
                  // setShowCountryList(false);
                }}
                disabled={loading}
              >
                <Text style={styles.selectorText}>{selectedStateName}</Text>
                <Ionicons name={showStateList ? 'chevron-up' : 'chevron-down'} size={18} color="#666" />
              </TouchableOpacity>

              {showStateList ? (
                <View style={styles.optionList}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search state"
                    placeholderTextColor="#999"
                    value={stateSearch}
                    onChangeText={setStateSearch}
                    editable={!loading}
                  />
                  <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator>
                    {filteredStates.length ? (
                      filteredStates.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.optionItem}
                          onPress={() => handleSelectState(item.id)}
                        >
                          <Text style={styles.optionText}>{item.name}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.optionEmptyText}>No states found</Text>
                    )}
                  </ScrollView>
                </View>
              ) : null}

                <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter city"
                placeholderTextColor="#999"
                value={city}
                onChangeText={setCity}
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
            </ScrollView>
          </TouchableWithoutFeedback>
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
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bottomSafeArea: {
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
    height: 70,
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