import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { API_ENDPOINTS, ENV } from "../config/env";
import RazorpayCheckout from "react-native-razorpay";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "PayDueDetails">;

interface PayDueDetail {
  id: string;
  warehouse_name: string;
  scheme_name: string;
  customer_name: string;
  total_gold_weight: string;
  total_paid_amount: string;
  created_date: string;
  group_name: string;
  payed_month: string;
  payment_status: string;
  p_id: string;
  payed_amount: string;
  duration_type: string;
  total_installment: string;
  chit_date: string;
  group_code: string;
  scheme_amount: string;
  mobile: string;
  address: string;
  bonus: string;
  installment_count: string;
  del_payment_count: string;
}

export default function PayDueDetailsScreen({ navigation, route }: Props) {
  const { customer_id, customer_scheme_id } = route.params;
  const [details, setDetails] = React.useState<PayDueDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [payNowLoading, setPayNowLoading] = React.useState(false);

  useEffect(() => {
    fetchPayDueDetails();
  }, []);

  const fetchPayDueDetails = async () => {
    console.log(
      `${API_ENDPOINTS.PAY_DUE_DETAILS}?customer_id=${customer_id}&customer_scheme_id=${customer_scheme_id}`,
    );
    try {
      const response = await fetch(
        `${API_ENDPOINTS.PAY_DUE_DETAILS}?customer_id=${customer_id}&customer_scheme_id=${customer_scheme_id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Internal: "Nezlan",
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      const responseData = await response.json();
      console.log("Pay Due Details Response:", responseData);
      if (
        responseData &&
        responseData.success &&
        responseData.data &&
        responseData.data[0]
      ) {
        setDetails(responseData.data[0]);
      }
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.error("Error fetching pay due details:", error.message);
      alert(`Error: ${error.message || "Failed to fetch details"}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "failed":
        return "#F44336";
      default:
        return "#999";
    }
  };

  const handlePayNow = async () => {
    if (!details || payNowLoading) {
      return;
    }

    const amountNumber = Math.round(
      Number(details.payed_amount || details.scheme_amount || 0),
    );
    if (!amountNumber || amountNumber <= 0) {
      alert("Invalid payment amount.");
      return;
    }

    const amount = amountNumber*100
    const receiptId = `order_rcptid_${Date.now()}`;
    setPayNowLoading(true);

    try {
      const createOrderUrl = `${API_ENDPOINTS.CREATE_ORDER}?amount=${amount}&receipt_id=${encodeURIComponent(receiptId)}&customer_id=${encodeURIComponent(customer_id)}&customer_scheme_id=${encodeURIComponent(details?.p_id)}&scheme_group_id=`;
      console.log("Creating order with URL:", createOrderUrl);
      const createOrderResponse = await fetch(createOrderUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Internal: "Nezlan",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const createOrderData = await createOrderResponse.json();
      console.log("Create Order Response:", createOrderData);

      if (!createOrderData?.success) {
        alert(createOrderData?.message || "Failed to create Razorpay order.");
        return;
      }

      const orderId =
        (typeof createOrderData?.data === "string"
          ? createOrderData.data
          : "") ||
        createOrderData?.data ||
        "";
      //await openPayment(orderId);
      // alert(`Order created successfully. Order ID: ${orderId}`);

      if (!orderId) {
        alert("Invalid order response from server.");
        return;
      }

      let userDetails = await AsyncStorage.getItem("userDetails");
      let userEmail = "";
      let userContact = "";
      let userName = "";

      if (userDetails) {
        try {
          const user = JSON.parse(userDetails);
          console.log("Parsed user details from storage:", user);
          userEmail = user.email || "";
          userContact = "+91" + user.mobile || "";
          userName = user.customer_name || "";
        } catch (e) {
          console.warn("Failed to parse user details from storage:", e);
        }
      }
     // let paidAmount=amountNumber*100

      var options = {
        description: "Credits towards consultation",
        image: "https://jewel.rkcreators.com/uploads/site/300x3001.png",
        currency: "INR",
        key: "rzp_test_SFHGcfzQqiClGg", // Your Razorpay Key Id
        amount: String(amount), // Amount in paise
        name: "Nezlan Jewel",
        order_id: orderId, //Replace this with an order_id created using Orders API.
        prefill: {
          email: userEmail,
          contact: "+919994996019", //userContact,
          name: userName,
        },
        theme: { color: "#2BC0AC" },
      };
      RazorpayCheckout.open(options)
        .then((data) => {
          console.log("Razorpay Payment Success:", data);
          // handle success
          verifyPayment(data);
        })
        .catch((error) => {
          // handle failure
          console.log("Razorpay Payment Error:", JSON.stringify(error));
          // alert(`Error: ${error.code} | ${error.description}`);
        });
    } catch (error: any) {
      const errorDescription =
        error?.description || error?.message || "Payment cancelled or failed.";
      console.error(
        "Error during create order / Razorpay flow:",
        errorDescription,
      );
      alert(errorDescription);
    } finally {
      setPayNowLoading(false);
    }
  };

  const verifyPayment = async (data: any) => {
    // console.log('Verifying payment with data:', data);
    // console.log('order_id:', data.razorpay_order_id);
    console.log({
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_order_id: data.razorpay_order_id,
          razorpay_signature: data.razorpay_signature,
          amount: details?.scheme_amount,
          customer_id: customer_id,
          scheme_group_id: null,
          chit_payment_id:details?.p_id,
          type: "installment",
        });
    try {
      console.log("url:", API_ENDPOINTS.VERIFY_PAYMENT);
       
      const response = await fetch(API_ENDPOINTS.VERIFY_PAYMENT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Internal: "Nezlan",
          "Content-Type": "application/json",
        },
        //credentials: 'include',
       
        body: JSON.stringify({
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_order_id: data.razorpay_order_id,
          razorpay_signature: data.razorpay_signature,
          amount: details?.scheme_amount,
          customer_id: customer_id,
          scheme_group_id: null,
          chit_payment_id: details?.p_id,
          type: "installment",
        }),
      });

      const responseData = await response.json();
      console.log("Payment Verification Response:", responseData);
      if (responseData?.success) {
       //alert("Payment verified successfully!");
       navigation.navigate("PayDue");
        // Optionally refresh details or navigate
      } else {
        alert(responseData?.message || "Payment verification failed.");
      }
    } catch (error: any) {
      console.error("Error verifying payment:", error.message);
      //alert(`Error verifying payment: ${error.message || 'An error occurred while verifying payment.'}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#2BC0AC" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Details</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2BC0AC" />
        </View>
      ) : details ? (
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Card */}
          <View style={styles.statusCard}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    getStatusColor(details.payment_status) + "20",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(details.payment_status) },
                ]}
              >
                {details.payment_status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.statusAmount}>
              ₹{Number(details.payed_amount).toFixed(2)}
            </Text>
            <Text style={styles.statusLabel}>Amount Paid</Text>
          </View>

          {/* Customer Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <DetailRow label="Name" value={details.customer_name} />
            <DetailRow label="Mobile" value={details.mobile} />
            <DetailRow label="Address" value={details.address || "N/A"} />
          </View>

          {/* Scheme Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scheme Details</Text>
            <DetailRow label="Scheme" value={details.scheme_name} />
            <DetailRow label="Group" value={details.group_name} />
            {/* <DetailRow label="Warehouse" value={details.warehouse_name} /> */}
            <DetailRow label="Group Code" value={details.group_code} />
          </View>

          {/* Payment Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <DetailRow
              label="Total Amount"
              value={`₹${Number(details.total_paid_amount).toFixed(2)}`}
            />
            <DetailRow
              label="Paid Amount"
              value={`₹${Number(details.payed_amount).toFixed(2)}`}
            />
            <DetailRow
              label="Gold Weight"
              value={`${Number(details.total_gold_weight).toFixed(3)}g`}
            />
            <DetailRow
              label="Scheme Amount"
              value={`₹${Number(details.scheme_amount).toFixed(2)}`}
            />
            <DetailRow label="Scheme Type" value={details.bonus} />
          </View>

          {/* Installment Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Installment Details</Text>
            <DetailRow
              label="Total Installments"
              value={details.total_installment}
            />
            <DetailRow
              label="Installment Count"
              value={details.installment_count}
            />
            {/* <DetailRow label="Pending Payments" value={details.del_payment_count} /> */}
            <DetailRow label="Duration Type" value={details.duration_type} />
          </View>

          {/* Date Info Section */}
          {/* <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dates</Text>
            <DetailRow label="Created Date" value={details.created_date} />
            <DetailRow label="Chit Date" value={details.chit_date} />
            <DetailRow label="Last Paid" value={details.payed_month} />
          </View> */}

          {/* Action Button */}
          {/* <TouchableOpacity
            style={[
              styles.payButton,
              payNowLoading && styles.payButtonDisabled,
            ]}
            onPress={handlePayNow}
            disabled={payNowLoading}
          >
            {payNowLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>Pay Now</Text>
            )}
          </TouchableOpacity> */}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No details available</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2BC0AC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  statusCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2BC0AC",
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 13,
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: "#666",
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  payButton: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#2BC0AC",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#2BC0AC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 60,
  },
});
