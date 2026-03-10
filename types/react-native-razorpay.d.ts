declare module 'react-native-razorpay' {
  interface RazorpayOptions {
    description?: string;
    image?: string;
    currency: string;
    key: string;
    amount: string;
    name: string;
    order_id: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    notes?: Record<string, string>;
    theme?: {
      color?: string;
    };
  }

  interface RazorpaySuccessResponse {
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
    [key: string]: any;
  }

  interface RazorpayStatic {
    open(options: RazorpayOptions): Promise<RazorpaySuccessResponse>;
  }

  const RazorpayCheckout: RazorpayStatic;
  export default RazorpayCheckout;
}
