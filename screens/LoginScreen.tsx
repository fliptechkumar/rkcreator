import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { API_ENDPOINTS } from '../config/env';
//asycnc storage
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

type CountryOption = {
  id: number;
  name: string;
};

type StateOption = {
  id: number;
  name: string;
};

export default function LoginScreen({ navigation }: Props) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [tempOtp, setTempOtp] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [countryId, setCountryId] = useState<number | null>(null);
  const [stateId, setStateId] = useState<number | null>(null);
  const [showCountryList, setShowCountryList] = useState(false);
  const [showStateList, setShowStateList] = useState(false);

  const otpInputs = useRef<Array<TextInput | null>>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  useEffect(() => {
    if (isRegisterMode) {
      loadCountries();
    }
  }, [isRegisterMode]);

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
    const name = String(item?.name ?? item?.country_name ?? item?.state_name ?? item?.label ?? '').trim();

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

  const handleSelectCountry = (id: number) => {
    setCountryId(id);
    setStateId(null);
    setStates([]);
    setShowCountryList(false);
    setShowStateList(false);
    loadStates(id);
  };

  const handleSelectState = (id: number) => {
    setStateId(id);
    setShowStateList(false);
  };

  const resetRegistrationForm = () => {
    setCustomerName('');
    setEmail('');
    setAddress('');
    setCity('');
    setPostcode('');
    setCountryId(null);
    setStateId(null);
    setStates([]);
    setShowCountryList(false);
    setShowStateList(false);
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
        setIsRegisterMode(false);
        resetRegistrationForm();
        alert(responseData.message || 'Registration successful. Please login with OTP.');
        return;
      }

      setLoading(false);
      setErrorMessage(responseData?.message || 'Registration failed');
    } catch (error: any) {
      setLoading(false);
      setErrorMessage(error?.message || 'Registration failed');
    }
  };

  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      return;
    }

    setErrorMessage('');
    setLoading(true);
    await SignIn();
  };
  const SignIn = async () => {
    //trim mobile no
    try {
      // Try with fetch to have more control
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
       headers: {
        'Accept': 'application/json',
        'Internal': 'Nezlan',
        'Content-Type': 'application/json',
      },
      credentials: 'include',  
      body: JSON.stringify({
        mobile_no: phoneNumber
      }),
      
      });
      
      
      const responseData = await response.json();
     
      if (responseData && responseData.success) {
       
      // Handle successful response
      console.log('Sign-in successful:', responseData);
      setLoading(false);
      setOtpSent(true);
      setTimer(60);
      setCanResend(false);
      setTempOtp(responseData.otp || '');
      // Auto-focus first OTP input
      otpInputs.current[0]?.focus();
      } else {
        // Handle error response
        setLoading(false);
        const errorMsg = responseData.message || 'Failed to send OTP';
         setErrorMessage(errorMsg);
      }
    } catch (error: any) {
      // Handle error
      setLoading(false);
      console.error('Sign-in error:', error.message);
      console.error('Full error:', error);
      alert(`Error: ${error.message || 'Failed to send OTP'}`);
    }
  }

  

  const handleResendOtp = () => {
    if (!canResend) return;
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setTimer(30);
    setCanResend(false);
    handleSendOtp();
  };

  const handleOtpChange = async(index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    // Clear error when user starts typing
    if (otpError) {
      setOtpError('');
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (index === 5 && value) {
      handleVerifyOtp(newOtp);
    }
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpArray = otp) => {
    const otpString = otpArray.join('');
    if (otpString.length !== 6) {
      return;
    }

    setLoading(true);
    // Simulate API call with timeout
      try {
      // Try with fetch to have more control
      const response = await fetch(API_ENDPOINTS.VERIFY_OTP, {
        method: 'POST',
       headers: {
        'Accept': 'application/json',
        'Internal': 'Nezlan',
        'Content-Type': 'application/json',
      },
      credentials: 'include',  
      body: JSON.stringify({
        mobile_no: phoneNumber,
        verify_otp: otpString
      }),
      
      });
      
      
      const responseData = await response.json();
      //console.log('OTP Verification Response:', responseData);
     
      if (responseData && responseData.success) {
        GetUserDetails(responseData.user.id);
      //  await AsyncStorage.setItem('userToken', responseData.token);
        // navigation.replace('Main');
      } else {
        // Handle error response
        setLoading(false);
        const errorMsg = responseData.message || 'Invalid OTP. Please try again';
        setOtpError(errorMsg);
      }
    } catch (error: any) {
      // Handle error
      setLoading(false);
      console.error('Sign-in error:', error.message);
      console.error('Full error:', error);
      alert(`Error: ${error.message || 'Failed to send OTP'}`);
    }

  };

  const GetUserDetails = async (userId: string) => {
   // console.log('Fetching user details for user ID:', userId);
    try {
      const response = await fetch(`${API_ENDPOINTS.USERDETAILS}?id=${userId}`, {
        method: 'GET',
       headers: {
        'Accept': 'application/json',
        'Internal': 'Nezlan',
        'Content-Type': 'application/json',
      },
      credentials: 'include',  
    
      });
      
      
      const responseData = await response.json();
      console.log('User Details Response:', responseData);
     
      if (responseData && responseData.success) {
        setLoading(false);
        // Store user details in AsyncStorage
        await AsyncStorage.setItem('userDetails', JSON.stringify(responseData.user));
         navigation.replace('Main');
      } else {
        // Handle error response
        setLoading(false);
        const errorMsg = responseData.message || 'Failed to retrieve user details';
         setErrorMessage(errorMsg);
      }
    } catch (error: any) {
      // Handle error
      setLoading(false)
  }
  };
    

  const handleChangeNumber = () => {
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    setPhoneNumber('');
    setTimer(30);
    setCanResend(false);
    setOtpError('');
  };

  const openRegisterMode = () => {
     navigation.navigate('Register');
    // navigation.replace('KycVerification', { customerId: 42 });
    setErrorMessage('');
    setOtpError('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#2BC0AC" />
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
          >
            {/* Header */}
            <View style={styles.header}>
              <Image source={{ uri: 'https://jewel.rkcreators.com/uploads/store/300x3002.png' }} style={{width:150,height:60}} resizeMode='contain' /> 
            </View>

            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
          {!otpSent ? (
            // Phone Number Screen
            <>
              <View style={styles.welcomeSection}>
                <Text style={styles.title}>Welcome Back!</Text>
                <Text style={styles.subtitle}>Enter your phone number to continue</Text>
              </View>

              <View style={styles.inputSection}>
                {isRegisterMode ? (
                  <>
                    <Text style={styles.label}>Customer Name</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter customer name"
                      placeholderTextColor="#999"
                      value={customerName}
                      onChangeText={setCustomerName}
                      editable={!loading}
                    />
                  </>
                ) : null}

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
                    onSubmitEditing={handleSendOtp}
                  />
                </View>

                {isRegisterMode ? (
                  <>
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
                        setShowCountryList((prev) => !prev);
                        setShowStateList(false);
                      }}
                      disabled={loading}
                    >
                      <Text style={styles.selectorText}>{selectedCountryName}</Text>
                      <Ionicons name={showCountryList ? 'chevron-up' : 'chevron-down'} size={18} color="#666" />
                    </TouchableOpacity>

                    {showCountryList ? (
                      <View style={styles.optionList}>
                        {countries.length ? (
                          countries.map((item) => (
                            <TouchableOpacity
                              key={item.id}
                              style={styles.optionItem}
                              onPress={() => handleSelectCountry(item.id)}
                            >
                              <Text style={styles.optionText}>{item.name}</Text>
                            </TouchableOpacity>
                          ))
                        ) : (
                          <Text style={styles.optionEmptyText}>No countries available</Text>
                        )}
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
                  </>
                ) : null}

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
                  (phoneNumber.length !== 10 || loading) && styles.buttonDisabled,
                ]}
                onPress={handleSendOtp}
                disabled={
                  (phoneNumber.length !== 10) || loading
                }
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Send OTP</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>

              <>
                <View style={styles.securityNote}>
                  <Ionicons name="shield-checkmark" size={20} color="#2BC0AC" />
                  <Text style={styles.securityText}>
                    We'll send you a 6-digit OTP for verification
                  </Text>
                </View>
                <TouchableOpacity style={styles.switchModeButton} onPress={openRegisterMode}>
                  <Text style={styles.switchModeText}>New user? Register now</Text>
                </TouchableOpacity>
              </>
            </>
          ) : (
            // OTP Verification Screen
            <>
              <View style={styles.welcomeSection}>
                <View style={styles.otpIconContainer}>
                  <Ionicons name="mail-unread" size={50} color="#2BC0AC" />
                </View>
                <Text style={styles.title}>Verify OTP</Text>
                <Text style={styles.subtitle}>
                  We've sent a 6-digit code to{'\n'}
                  <Text style={styles.phoneNumberText}>+91 {phoneNumber}</Text>
                </Text>
                <TouchableOpacity onPress={handleChangeNumber}>
                  <Text style={styles.changeNumberText}>Change Number</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.otpSection}>
                <Text style={styles.label}>Enter OTP</Text>
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        otpInputs.current[index] = ref;
                      }}
                      style={[
                        styles.otpInput,
                        digit && styles.otpInputFilled,
                        otpError && styles.otpInputError,
                      ]}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(index, value)}
                      onKeyPress={({ nativeEvent }) =>
                        handleOtpKeyPress(index, nativeEvent.key)
                      }
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      editable={!loading}
                      returnKeyType={index === 5 ? 'done' : 'next'}
                    />
                  ))}
                </View>
                {/* {tempOtp ? (
                  <Text style={{ textAlign: 'center', color: '#666', marginBottom: 8 }}>
                    (For testing purposes, your OTP is: {tempOtp})
                  </Text>
                ) : null} */}

                {otpError ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={18} color="#E94560" />
                    <Text style={styles.errorText}>{otpError}</Text>
                  </View>
                ) : null}

                <View style={styles.timerContainer}>
                  {!canResend ? (
                    <Text style={styles.timerText}>
                      Resend OTP in{' '}
                      <Text style={styles.timerCountText}>{timer}s</Text>
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleResendOtp}>
                      <Text style={styles.resendText}>Resend OTP</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (otp.join('').length !== 6 || loading) && styles.buttonDisabled,
                ]}
                onPress={() => handleVerifyOtp()}
                disabled={otp.join('').length !== 6 || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Verify & Continue</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our{' '}
                    <Text style={styles.footerLink}>Terms & Conditions</Text>
                {' and '}
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    // flex:1
    // backgroundColor: '#2BC0AC',
    paddingTop: 100,
    // paddingBottom: 20,
  },
  logoContainer: {
    width: 150,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F8F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2BC0AC',
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  otpIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F8F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  phoneNumberText: {
    fontWeight: '700',
    color: '#2BC0AC',
  },
  changeNumberText: {
    fontSize: 14,
    color: '#2BC0AC',
    fontWeight: '600',
    marginTop: 12,
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
  otpSection: {
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 50,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
  },
  otpInputFilled: {
    borderColor: '#2BC0AC',
    backgroundColor: '#E8F8F5',
  },
  otpInputError: {
    borderColor: '#E94560',
    backgroundColor: '#FFE8EC',
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
  timerContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  timerText: {
    fontSize: 14,
    color: '#666',
  },
  timerCountText: {
    fontWeight: '700',
    color: '#2BC0AC',
  },
  resendText: {
    fontSize: 15,
    color: '#2BC0AC',
    fontWeight: '600',
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
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  securityText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  switchModeButton: {
    marginTop: 14,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 14,
    color: '#2BC0AC',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#2BC0AC',
    fontWeight: '600',
  },
});
