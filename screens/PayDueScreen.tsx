import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useFocusEffect } from '@react-navigation/native';
import { API_ENDPOINTS } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from "react-native-razorpay";
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'PayDue'>;

interface PayDueItem {
  customer_scheme_id: string;
  store_id: string;
  group_code: string;
  group_id: string;
  scheme_id: string;
  customer_id: string;
  group_name: string;
  scheme_name: string;
  total_paid_amount: string;
  total_gold_weight: string;
  bonus_type: string;
  duration_type: string;
  scheme_type: string;
  due_group?: Array<{
    due_group_name: string;
    due_amount: string;
    duration_type?: string;
    payed_amount?: string;
    installment?: string;
    installment_count?: string;
    month?: string;
    payed_month?: string;
    paying_month?: string;
    p_id?: string;
    customer_id?: string;
    scheme_id?: string;
  }>;
}

type DueGroupItem = {
  due_group_name: string;
  due_amount: string;
  duration_type?: string;
  payed_amount?: string;
  installment?: string;
  installment_count?: string;
  month?: string;
  payed_month?: string;
};

interface PayDueShowMoreItem {
  payed_month?: string;
  payment_status?: string;
  payed_amount?: string;
  created_date?: string;
  installment?: string;
  balance_installments?: string;
}

export default function PayDueScreen({ navigation }: Props) {
  const [payDueData, setPayDueData] = React.useState<PayDueItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [expandedCards, setExpandedCards] = React.useState<Record<string, boolean>>({});
  const [showMoreData, setShowMoreData] = React.useState<Record<string, PayDueShowMoreItem[]>>({});
  const [showMoreLoading, setShowMoreLoading] = React.useState<Record<string, boolean>>({});
  const [showMoreFetched, setShowMoreFetched] = React.useState<Record<string, boolean>>({});
  const [payNowLoading, setPayNowLoading] = React.useState(false);
  const [details, setDetails] = React.useState<PayDueItem | null>(null);
  const GETPAYDUE = async (userId: string) => {
    try {
      console.log('Fetching pay due for user ID:', userId);
      const response = await fetch(`${API_ENDPOINTS.PAY_DUE}?customer_id=${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Internal': 'Nezlan',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const responseData = await response.json();
      //console.log('Pay Due Response:', responseData.data[1]);
      if (responseData && responseData.success && responseData?.data) {
        setPayDueData(responseData.data);
        setExpandedCards({});
        setShowMoreData({});
        setShowMoreLoading({});
        setShowMoreFetched({});
      }
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.error('Error fetching pay due:', error.message);
      alert(`Error: ${error.message || 'Failed to fetch pay due'}`);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log('Pay Due Screen is focused');
      GetuserDetails();
    }, [])
  );

  const GetuserDetails = async () => {
    try {
      const userDetailsString = await AsyncStorage.getItem('userDetails');
      if (userDetailsString) {
        const userDetails = JSON.parse(userDetailsString);
        console.log('User Details from AsyncStorage:', userDetails.id);
        if (userDetails && userDetails.id) {
          GETPAYDUE(userDetails.id);
        } else {
          console.warn('User ID not found in userDetails');
        }
      } else {
        console.warn('No userDetails found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error retrieving userDetails from AsyncStorage:', error);
    }
  };

  const getCardKey = (item: PayDueItem) => `${item.customer_id}-${item.customer_scheme_id}`;

  const getDueAmount = (dueItem: DueGroupItem) => {
    const rawAmount = dueItem?.due_amount ?? dueItem?.payed_amount ?? '0';
    return Number(rawAmount || 0);
  };

  const formatMonthToMmYy = (monthValue?: string) => {
    if (!monthValue) {
      return '-';
    }

    const raw = monthValue.trim();
    if (!raw) {
      return '-';
    }

    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      return `${month}/${year}`;
    }

    const slashPattern = raw.match(/^(\d{1,2})\/(\d{2}|\d{4})$/);
    if (slashPattern) {
      const month = String(Number(slashPattern[1])).padStart(2, '0');
      const year = slashPattern[2].length === 4 ? slashPattern[2].slice(-2) : slashPattern[2];
      return `${month}/${year}`;
    }

    const dashPattern = raw.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
    if (dashPattern) {
      const month = String(Number(dashPattern[2])).padStart(2, '0');
      const year = dashPattern[1].slice(-2);
      return `${month}/${year}`;
    }

    return raw;
  };

  const fetchShowMore = async (item: PayDueItem) => {
    const cardKey = getCardKey(item);
   // setShowMoreLoading((prev) => ({ ...prev, [cardKey]: true }));
    console.log('Fetching show more for card:', item);

    try {
      const response = await fetch(
        `${API_ENDPOINTS.PAY_DUE_SHOWMORE}?customer_id=${item.customer_id}&customer_scheme_id=${item.customer_scheme_id}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Internal': 'Nezlan',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      const responseData = await response.json();
      console.log('Pay Due Show More Response:', responseData);
      if (responseData && responseData.success && Array.isArray(responseData.data)) {
        setShowMoreData((prev) => ({ ...prev, [cardKey]: responseData.data }));
        setShowMoreFetched((prev) => ({ ...prev, [cardKey]: true }));
      } else {
        setShowMoreData((prev) => ({ ...prev, [cardKey]: [] }));
        setShowMoreFetched((prev) => ({ ...prev, [cardKey]: true }));
      }
    } catch (error: any) {
      console.error('Error fetching pay due show more:', error.message);
      setShowMoreData((prev) => ({ ...prev, [cardKey]: [] }));
      setShowMoreFetched((prev) => ({ ...prev, [cardKey]: false }));
      alert(`Error: ${error.message || 'Failed to fetch pay due list'}`);
    } finally {
      setShowMoreLoading((prev) => ({ ...prev, [cardKey]: false }));
    }
  };

  const handleShowMore = async (item: PayDueItem) => {
    const cardKey = getCardKey(item);
    const isExpanded = !!expandedCards[cardKey];

    if (isExpanded) {
      setExpandedCards((prev) => ({ ...prev, [cardKey]: false }));
      return;
    }

    setExpandedCards((prev) => ({ ...prev, [cardKey]: true }));

    if (!showMoreFetched[cardKey]) {
      await fetchShowMore(item);
    }
  };

    const handlePayNow = async (dueItem: PayDueItem) => {
      console.log('Initiating payment for due item:', dueItem);
    if (!dueItem || payNowLoading) {
      return;
    }

    const amountNumber = Math.round(
      Number(dueItem.payed_amount || dueItem.scheme_amount || 0),
    );
    if (!amountNumber || amountNumber <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Payment Failed',
        text2: 'Invalid payment amount.',
        visibilityTime: 3000,
      });
      return;
    }
    setDetails(dueItem);

    const amount = amountNumber*100
    const receiptId = `order_rcptid_${Date.now()}`;
    setPayNowLoading(true);

    try {
      const createOrderUrl = `${API_ENDPOINTS.CREATE_ORDER}?amount=${amount}&receipt_id=${encodeURIComponent(receiptId)}&customer_id=${encodeURIComponent(dueItem.customer_id)}&customer_scheme_id=${encodeURIComponent(dueItem.scheme_id)}&scheme_group_id=`;
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
        Toast.show({
          type: 'error',
          text1: 'Payment Failed',
          text2: createOrderData?.message || 'Failed to create Razorpay order.',
          visibilityTime: 3000,
        });
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
        Toast.show({
          type: 'error',
          text1: 'Payment Failed',
          text2: 'Invalid order response from server.',
          visibilityTime: 3000,
        });
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
          contact: userContact,
          name: userName,
        },
        theme: { color: "#2BC0AC" },
      };
      RazorpayCheckout.open(options)
        .then((data) => {
          console.log("Razorpay Payment Success:", dueItem);
          // handle success
          verifyPayment(data, dueItem);
        })
        .catch((error) => {
          // handle failure
          console.log("Razorpay Payment Error:", JSON.stringify(error));
          Toast.show({
            type: 'error',
            text1: 'Payment Failed',
            text2: error?.description || 'Payment was cancelled or failed.',
            visibilityTime: 3000,
          });
        });
    } catch (error: any) {
      const errorDescription =
        error?.description || error?.message || "Payment cancelled or failed.";
      console.error(
        "Error during create order / Razorpay flow:",
        errorDescription,
      );
      Toast.show({
        type: 'error',
        text1: 'Payment Failed',
        text2: errorDescription,
        visibilityTime: 3000,
      });
    } finally {
      setPayNowLoading(false);
    }
  };

  const verifyPayment = async (data: any, dueItem: PayDueItem) => {
    // console.log('Verifying payment with data:', data);
    // console.log('order_id:', data.razorpay_order_id);
    console.log({
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_order_id: data.razorpay_order_id,
          razorpay_signature: data.razorpay_signature,
          amount: dueItem?.payed_amount,
          customer_id: dueItem?.customer_id,
          scheme_group_id: null,
          chit_payment_id: dueItem?.p_id,
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
          amount: dueItem?.payed_amount,
          customer_id: dueItem?.customer_id,
          scheme_group_id: null,
          chit_payment_id: dueItem?.p_id,
          type: "installment",
        }),
      });

      const responseData = await response.json();
      console.log("Payment Verification Response:", responseData);
      if (responseData?.success) {
  //refresh the pay due data after successful payment
       // alert("Payment successful and verified!");
        Toast.show({
          type: 'success',
          text1: 'Payment Successful',
          text2: 'Your payment has been verified.',
          visibilityTime: 2500,
        });
        GetuserDetails();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Payment Failed',
          text2: responseData?.message || 'Payment verification failed.',
          visibilityTime: 3000,
        });
      }
    } catch (error: any) {
      console.error("Error verifying payment:", error.message);
      Toast.show({
        type: 'error',
        text1: 'Payment Failed',
        text2: error?.message || 'An error occurred while verifying payment.',
        visibilityTime: 3000,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#2BC0AC" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay Due</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#2BC0AC" />
            </View>
          ) : payDueData && payDueData.length > 0 ? (
            payDueData.map((item: PayDueItem) => {
              const cardKey = getCardKey(item);
              const isExpanded = !!expandedCards[cardKey];
              const listData = showMoreData[cardKey] || [];
              const isShowMoreLoading = !!showMoreLoading[cardKey];

              return (
                <View
                  key={cardKey}
                  style={styles.card}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('PayDueDetails', {
                      customer_id: item.customer_id,
                      customer_scheme_id: item.customer_scheme_id,
                    })}
                  >
                    <View style={styles.cardHeader}>
                      <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                        <Ionicons
                          name="wallet-outline"
                          size={20}
                          color="#2BC0AC"
                        />
                      </View>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{item.scheme_name}</Text>
                        <Text style={styles.cardDescription}>{item.group_name}</Text>
                      </View>
                      <View style={styles.amountContainer}>
                        <Text style={[styles.amount, { color: '#E94560' }]}>
                          ₹{Number(item.total_paid_amount).toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailsSection}>
                      <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Gold Weight</Text>
                          <Text style={styles.detailValue}>{Number(item.total_gold_weight).toFixed(3)}g</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Scheme Type</Text>
                          <Text style={styles.detailValue}>{item.scheme_type}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                  {item?.due_group && item.due_group.length > 0 && (
                    <View style={styles.dueGroupsContainer}>
                      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',marginHorizontal: 10}}>
                        <Text style={styles.dueGroupsTitle}>Pending Due</Text>
                        <Text style={{fontSize: 16, color: '#333'}}> {item.due_group.length} </Text>
                      </View>

                      {item.due_group.map((dueItem, index) => {
                        const dueAmount = getDueAmount(dueItem);
                        const dueLabel =
                          dueItem?.due_group_name ||
                          dueItem?.duration_type ||
                          `Group ${index + 1}`;
                        const dueText = dueItem?.due_group_name || 'Due';
                        const monthText = dueItem?.paying_month;

                        return (
                          <View key={`${cardKey}-due-${index}`} style={styles.dueGroupCard}>
                            {/* <View style={styles.dueGroupTitleRow}>
                              <Text style={styles.dueGroupName}>{dueLabel}</Text>
                              <Text style={styles.dueGroupTag}>Due</Text>
                            </View> */}
                            <View style={styles.dueTableHeaderRow}>
                              <Text style={[styles.dueTableHeaderText, styles.dueColAmount]}>Amount</Text>
                              <Text style={[styles.dueTableHeaderText, styles.dueColDue]}>Due</Text>
                              <Text style={[styles.dueTableHeaderText, styles.dueColMonth]}>Month</Text>
                            </View>
                            <View style={styles.dueTableValueRow}>
                              <Text style={[styles.dueGroupAmount, styles.dueColAmount]}>₹{dueAmount.toFixed(2)}</Text>
                              <Text style={[styles.dueTableValueText, styles.dueColDue]}>{dueLabel}</Text>
                              <Text style={[styles.dueTableValueText, styles.dueColMonth]}>{monthText}</Text>
                            </View>

                            <TouchableOpacity
                              style={styles.payButton}
                              activeOpacity={0.85}
                              onPress={() =>
                               handlePayNow(dueItem)
                              }
                            >
                              <View style={styles.payButtonContent}>
                                <Text style={styles.payButtonText}>Pay Now</Text>
                                <Ionicons name="arrow-forward" size={14} color="#fff" />
                              </View>
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  )}



                  

                  {/* <TouchableOpacity
                    style={styles.showMoreButton}
                    activeOpacity={0.8}
                    onPress={() => handleShowMore(item)}
                    disabled={isShowMoreLoading}
                  >
                    <Text style={styles.showMoreButtonText}>{isExpanded ? 'Hide' : 'Show More'}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                      size={16}
                      color="#2BC0AC"
                    />
                  </TouchableOpacity> */}

                  {isExpanded ? (
                    <View style={styles.showMoreContainer}>
                      {isShowMoreLoading ? (
                        <ActivityIndicator size="small" color="#2BC0AC" />
                      ) : listData.length > 0 ? (
                        listData.map((detail, index) => (
                          <View
                            key={`${cardKey}-${detail.payed_month || detail.created_date || index}`}
                            style={styles.showMoreRow}
                          >
                            <Text style={styles.showMoreMonth}>{detail.payed_month || 'N/A'}</Text>
                            {detail.created_date ? <Text style={styles.showMoreDate}>{detail.created_date}</Text> : null}
                            <View style={styles.showMoreMetaRow}>
                              <Text style={styles.showMoreStatus}>{detail.payment_status || 'Paid'}</Text>
                              <Text style={styles.showMoreInstallments}>
                                Inst: {detail.installment || 'N/A'} | Balance: {detail.balance_installments || 'N/A'}
                              </Text>
                            </View>
                            <Text style={styles.showMoreAmount}>
                              ₹{Number(detail.payed_amount || 0).toFixed(2)}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.showMoreEmpty}>No additional payment details found.</Text>
                      )}
                    </View>
                  ) : null}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#2BC0AC" />
              <Text style={styles.emptyText}>No pending dues</Text>
              <Text style={styles.emptySubText}>All payments are up to date</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2BC0AC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2BC0AC',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 15,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  detailsSection: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  dueGroupsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 8,
    paddingTop: 12,
    gap: 10,
  },
  dueGroupsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2BC0AC',
    marginBottom: 2,
  },
  dueGroupCard: {
    backgroundColor: '#F8FAFA',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EAF2F2',
  },
  dueGroupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dueTableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 6,
    gap: 8,
    backgroundColor: '#EAF7F5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  dueTableValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#EEF3F3',
  },
  dueGroupName: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  dueGroupTag: {
    fontSize: 10,
    color: '#2BC0AC',
    backgroundColor: '#EAF7F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    fontWeight: '700',
  },
  dueTableHeaderText: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
  },
  dueTableValueText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  dueColAmount: {
    flex: 1.15,
    fontSize: 13,
  },
  dueColDue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
  },
  dueColMonth: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
  },
  dueGroupAmount: {
    fontSize: 16,
    color: '#E94560',
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
    paddingBottom: 4,
  },
  showMoreButtonText: {
    color: '#2BC0AC',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
  },
  showMoreContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  },
  showMoreRow: {
    backgroundColor: '#F8FAFA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  showMoreMonth: {
    color: '#333',
    fontSize: 13,
    fontWeight: '600',
  },
  showMoreDate: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  showMoreStatus: {
    color: '#2BC0AC',
    fontSize: 12,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  showMoreMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  showMoreInstallments: {
    color: '#666',
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
  },
  showMoreAmount: {
    color: '#E94560',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  showMoreEmpty: {
    color: '#777',
    fontSize: 12,
    paddingVertical: 6,
  },
  payButton: {
    backgroundColor: '#2BC0AC',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  bottomSpacer: {
    height: 60,
  },
});
