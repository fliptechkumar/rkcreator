import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Colors } from '../config/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

const SAMPLE_NOTIFICATIONS = [
  {
    id: '1',
    icon: 'cash-outline',
    title: 'Payment Successful',
    message: 'Your installment payment of ₹2,000 has been received.',
    time: '10:30 AM',
    date: 'Today',
    read: false,
  },
  {
    id: '2',
    icon: 'star-outline',
    title: 'New Scheme Available',
    message: 'A new Gold Savings Scheme has been launched. Join now!',
    time: '09:00 AM',
    date: 'Today',
    read: false,
  },
  {
    id: '3',
    icon: 'alert-circle-outline',
    title: 'Payment Due Reminder',
    message: 'Your monthly installment is due on 15th May 2026.',
    time: '08:00 AM',
    date: 'Yesterday',
    read: true,
  },
  {
    id: '4',
    icon: 'checkmark-circle-outline',
    title: 'KYC Verified',
    message: 'Your KYC verification has been completed successfully.',
    time: '03:15 PM',
    date: '12 May 2026',
    read: true,
  },
];

export default function NotificationScreen({ navigation }: Props) {
  const unreadCount = SAMPLE_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      <ImageBackground source={require('../assets/bg.jpeg')} style={styles.backgroundImage} resizeMode="cover" >
        {/* <View style={styles.whiteOverlay} /> */}
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {SAMPLE_NOTIFICATIONS.map((item, index) => {
              const isNewGroup =
                index === 0 ||
                SAMPLE_NOTIFICATIONS[index - 1].date !== item.date;

              return (
                <View key={item.id}>
                  {isNewGroup && (
                    <Text style={styles.dateLabel}>{item.date}</Text>
                  )}
                  <View style={[styles.card, !item.read && styles.cardUnread]}>
                    <View style={[styles.iconBox, !item.read && styles.iconBoxUnread]}>
                      <Ionicons
                        name={item.icon as any}
                        size={22}
                        color={item.read ? '#999' : Colors.primary}
                      />
                    </View>
                    <View style={styles.cardBody}>
                      <View style={styles.cardTop}>
                        <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}>
                          {item.title}
                        </Text>
                        <Text style={styles.cardTime}>{item.time}</Text>
                      </View>
                      <Text style={styles.cardMessage}>{item.message}</Text>
                    </View>
                    {!item.read && <View style={styles.dot} />}
                  </View>
                </View>
              );
            })}
          </View>
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.primary,
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
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  badge: {
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  backgroundImage: {
    flex: 1,
  },
  whiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 15,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    marginTop: 12,
    marginBottom: 6,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardUnread: {
    backgroundColor: '#F0FAF8',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconBoxUnread: {
    backgroundColor: '#E0F5F1',
  },
  cardBody: {
    flex: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    flex: 1,
  },
  cardTitleUnread: {
    color: '#222',
  },
  cardTime: {
    fontSize: 11,
    color: '#aaa',
    marginLeft: 8,
  },
  cardMessage: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: 8,
    alignSelf: 'center',
  },
  bottomSpacer: {
    height: 30,
  },
});
