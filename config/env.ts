// Environment Configuration
export const ENV = {
  API_BASE_URL: 'https://jewel.rkcreators.com/nezlan_api', //'https://djjewellery.nezlan.in/nezlan_api', //'https://mrschains.nezlan.in/nezlan_api' , //'https://jewel.rkcreators.com/nezlan_api', // 'https://mrschains.nezlan.in/nezlan_api',
  PAYMENT_URL: 'https://jewel.rkcreators.com/' , //'https://djjewellery.nezlan.in/', //'https://mrschains.nezlan.in/',       //'https://jewel.rkcreators.com/',
  RAZORPAY_KEY_ID: 'rzp_test_SFHGcfzQqiClGg',  //"rzp_live_SgUshqrEdNXF0M", // "rzp_live_ScA1021QMJkQ8C"
  RAZORPAY_IMAGE: 'https://jewel.rkcreators.com/uploads/site/300x3001.png',
  RAZORPAY_BUSINESS_NAME: 'Nezlan Jewel',
};

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: `${ENV.API_BASE_URL}/login_api/loginCustomer`,
  VERIFY_OTP: `${ENV.API_BASE_URL}/login_api/verifyOTP`,
  GET_COUNTRY: `${ENV.API_BASE_URL}/Register_api/getCountry`,
  GET_STATE: `${ENV.API_BASE_URL}/Register_api/getState`,
  USERDETAILS: `${ENV.API_BASE_URL}/Customer_api/userDetails`,
  HOMEDETAILS: `${ENV.API_BASE_URL}/Home_api/index`,
  TRANSACTIONHISTORY: `${ENV.API_BASE_URL}/Customer_api/transHistory`,
  MYSAVINGS: `${ENV.API_BASE_URL}/Customer_api/custSavings`,
  EDITPROFILE: `${ENV.API_BASE_URL}/Customer_api/editProfile`,
  INVOICE : `${ENV.API_BASE_URL}/Customer_api/trans_invoice`,
  ABOUT: `${ENV.API_BASE_URL}/Home_api/aboutUs`,
  PRIVACY_POLICY: `${ENV.API_BASE_URL}/Home_api/privacyPolicy`,
  TERMS_CONDITIONS: `${ENV.API_BASE_URL}/Home_api/termsAndConditions`,
  PAY_DUE: `${ENV.API_BASE_URL}/Customer_api/paydue_group`,
  PAY_DUE_DETAILS: `${ENV.API_BASE_URL}/Customer_api/paydue_details`,
  PAY_DUE_SHOWMORE: `${ENV.API_BASE_URL}/Customer_api/paydue_lists`,
  NEWSCHEMES: `${ENV.API_BASE_URL}/Customer_api/newSchemes`,
  SCHEME_TERMS: `${ENV.API_BASE_URL}/Scheme_api/schemeTerms`,
  CREATE_ORDER: `${ENV.API_BASE_URL}/Customer_api/create_order`,
  VERIFY_PAYMENT: `${ENV.PAYMENT_URL}/Payment_verify/RazorePayVerify`,
  REGISTER_CUSTOMER: `${ENV.API_BASE_URL}/Register_api/addCustomer`,
  KYC_VERIFICATION: `${ENV.API_BASE_URL}/Register_api/verifyKyc`,

};
//https://jewel.rkcreators.com/nezlan_api/Customer_api/create_order?amount=1000&receipt_id=order_rcptid_125