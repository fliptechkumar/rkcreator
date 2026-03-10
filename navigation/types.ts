export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  KycVerification: { customerId?: string };
  Main: undefined;
  NewSchemes: undefined;
  VideoShopping: undefined;
  AboutUs: undefined;
  PrivacyPolicy: undefined;
  TermsConditions: undefined;
  EditProfile: undefined;
  Invoice: { html?: string; url?: string } | undefined;
  PayDue: undefined;
  Transaction: { customer_id?: string; customer_scheme_id?: string } | undefined;
  PayDueDetails: { customer_id: string; customer_scheme_id: string };
};

export type TabParamList = {
  Home: undefined;
  MySavings: undefined;
  Scan: undefined;
  TransactionHistory: { customer_id?: string; customer_scheme_id?: string } | undefined;
  Profile: undefined;
};
