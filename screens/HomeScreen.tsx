import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TabParamList, RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import GoldImage from '../assets/gold.png';
import SilverImage from '../assets/silver.png';
import { API_ENDPOINTS } from '../config/env';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RenderHtml from 'react-native-render-html';


type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: Props) {
  const [activeSlide, setActiveSlide] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const [homeData, setHomeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getBannerImageUri = (url?: string) => {
    if (!url) return '';

    try {
      const filePathMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)\//i);
      if (filePathMatch?.[1]) {
        return `https://drive.google.com/uc?export=view&id=${filePathMatch[1]}`;
      }

      const openIdMatch = url.match(/[?&]id=([^&]+)/i);
      if (/drive\.google\.com/i.test(url) && openIdMatch?.[1]) {
        return `https://drive.google.com/uc?export=view&id=${openIdMatch[1]}`;
      }
    } catch (error) {
      console.warn('Invalid banner url:', url, error);
    }

    return url;
  };

 useFocusEffect(
    useCallback(() => {
     // console.log('Home Screen is focused');
      GetuserDetails()
    }, [])
  );
  const GetuserDetails = async () => {
    try {
      const userDetailsString = await AsyncStorage.getItem('userDetails');
      if (userDetailsString) {
        const userDetails = JSON.parse(userDetailsString);
        // console.log('User Details from AsyncStorage:', userDetails.id);
        if (userDetails && userDetails.id) {
          GETHOME(userDetails.id);
        } else {
          console.warn('User ID not found in userDetails');
        }
      } else {
        console.warn('No userDetails found in AsyncStorage');
      }
    }
    catch (error) {
      console.error('Error retrieving userDetails from AsyncStorage:', error);
    }
  }


   const GETHOME = async (userId: string) => {
      //trim mobile no
      try {
        // Try with fetch to have more control
        console.log(`${API_ENDPOINTS.HOMEDETAILS}?customer_id=${userId}`)
        
        const response = await fetch(`${API_ENDPOINTS.HOMEDETAILS}?customer_id=${userId}`, {
          method: 'GET',
         headers: {
          'Accept': 'application/json',
          'Internal': 'Nezlan',
          'Content-Type': 'application/json',
        },
        credentials: 'include',  
       
        });
        
        const responseData = await response.json();
        if (responseData && responseData.success) {
         
        // Handle successful response
         console.log('Sign-in successful:', responseData.data);
        setHomeData(responseData.data);
        } else {
          // Handle error response
          setLoading(false);
        }
      } catch (error: any) {
        // Handle error
        setLoading(false);
        // console.error('Sign-in error:', error.message);
        // console.error('Full error:', error);
        alert(`Error: ${error.message || 'Failed to send OTP'}`);
      }
    }
  

  const banners = [
    {
      id: 1,
      title: 'Wedding',
      subtitle: 'Perfect jewellery collection',
      image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=200&fit=crop',
      backgroundColor: '#E8E4F3',
    },
    {
      id: 2,
      title: 'Bridal',
      subtitle: 'Exclusive designs for you',
      image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=400&h=200&fit=crop',
      backgroundColor: '#FFE8E8',
    },
    {
      id: 3,
      title: 'Festival',
      subtitle: 'Special occasion collection',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=200&fit=crop',
      backgroundColor: '#FFF9E6',
    },
  ];

  // Auto-scroll banner
  useEffect(() => {
    const timer = setInterval(() => {
      const nextSlide = (activeSlide + 1) % banners.length;
      pagerRef.current?.setPage(nextSlide);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(timer);
  }, [activeSlide]);

  const features = [
    { title: 'Pay Due', icon: '📊', onPress: () => navigation.navigate('PayDue') },
    { title: 'My savings', icon: '💰', onPress: () => navigation.navigate('MySavings') },
    { title: 'New schemes', icon: '📱', onPress: () => navigation.navigate('NewSchemes') },
    { title: 'Transaction\nHistory', icon: '📂', onPress: () => navigation.navigate('TransactionHistory') },
    { title: 'Video\nshopping', icon: '▶️', onPress: () =>console.log('Video pressed') },
    { title: 'Offers', icon: '🏷️', onPress: () => {console.log('Offers pressed')} },
  ];
//navigation.navigate('VideoShopping')
  return (
    <SafeAreaView style={styles.safeArea} edges={['top','left','right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#2BC0AC" />
      
      {/* Header */}
      <View style={styles.header}>
        {/* <Text style={styles.logo}>Nezlan</Text> */}
        <Image source={{ uri: 'https://jewel.rkcreators.com/uploads/store/300x3002.png' }} style={{width:100,height:40}} resizeMode='contain' />
        <TouchableOpacity style={styles.notificationBtn}>
          {/* <Text style={styles.bellIcon}>🔔</Text> */}
          {/* <Ionicons name="notifications-outline" size={28} color="#fff" /> */}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Rate Cards */}
        <View style={styles.rateContainer}>
          <View style={styles.rateCard}>
            <View style={styles.rateIcon}>
              {/* <Text style={styles.goldIcon}>🪙</Text> */}
              <Image source={GoldImage} style={styles.rateImage} />
            </View>
            <View style={styles.rateInfo}>
              <Text style={styles.rateTitle}>Gold Rate</Text>
              <Text style={styles.rateValue}>₹{homeData?.price_rates?.gold_rate ? Number(homeData.price_rates.gold_rate).toFixed(2) : '0.00'}</Text>
              <Text style={styles.rateSubtitle}>22KT Per gram</Text>
            </View>
          </View>

          <View style={styles.rateCard}>
            <View style={styles.rateIcon}>
              {/* <Text style={styles.silverIcon}>⚪</Text> */}
              <Image source={SilverImage} style={styles.rateImage} />
            </View>
            <View style={styles.rateInfo}>
              <Text style={styles.rateTitle}>Silver Rate</Text>
              <Text style={styles.rateValue}>₹{homeData?.price_rates?.silver_rate ? Number(homeData.price_rates.silver_rate).toFixed(2) : '0.00'}</Text>
              <Text style={styles.rateSubtitle}>Per gram</Text>
            </View>
          </View>
        </View>

        {/* Banner Carousel */}
        <View style={styles.bannerContainer}>
          {homeData?.banners && homeData.banners.length > 0 && (
          <PagerView
            ref={pagerRef}
            style={styles.pagerView}
            initialPage={0}
            onPageSelected={(e) => setActiveSlide(e.nativeEvent.position)}
          >
            {homeData?.banners && homeData.banners.map((banner: any,index: number) => (
              <View key={index+1} style={{height: 200, width: '100%',paddingHorizontal:10,marginTop:15,borderRadius: 12}}>
                <Image 
                  source={{ uri: getBannerImageUri(banner?.url) }}
                  style={{height:130, width: '100%', borderRadius: 12,shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  zIndex: 3,}}
                  resizeMode="contain"
                  // height={200}
                />
              </View>
            ))}
          </PagerView>
          )}
          
          {/* Carousel Dots */}
          {homeData?.banners && (
          <View style={styles.pagination}>
            {homeData?.banners?.map((_banner: any, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => pagerRef.current?.setPage(index)}
              >
                <View
                  style={[
                    styles.dot,
                    index === activeSlide && styles.activeDot
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
          )}
          
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeTitle}>{homeData?.title}</Text>
            <View style={styles.welcomeDescriptionPreview}>
              <RenderHtml
                contentWidth={width - 20}
                source={{ html: homeData?.desc || '' }}
                baseStyle={styles.welcomeDescription}
                defaultTextProps={{ numberOfLines: 3, ellipsizeMode: 'tail' }}
                  tagsStyles={{
              p: {
                marginBottom: 12,
                textAlign: 'justify',
              },
              h1: {
                fontSize: 22,
                fontWeight: '700',
                color: '#333',
                marginBottom: 12,
              },
              h2: {
                fontSize: 20,
                fontWeight: '600',
                color: '#333',
                marginBottom: 12,
              },
              h3: {
                fontSize: 18,
                fontWeight: '500',
                color: '#333',
                marginBottom: 12,
              },
              b:{
                fontWeight: '700',
                //color: '#333',
              }
            }}
              />
            </View>
            {Boolean(homeData?.desc) && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => navigation.navigate('AboutUs')}
                activeOpacity={0.8}
              >
                <Text style={styles.showMoreText}>Show more</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.featureCard}
              activeOpacity={0.7}
              onPress={feature.onPress}
            >
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
            </TouchableOpacity>
          ))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2BC0AC',
  },
  logo: {
    fontSize: 38,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'System',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    fontSize: 28,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  rateContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 15,
    gap: 10,
  },
  rateCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  goldIcon: {
    fontSize: 24,
  },
  silverIcon: {
    fontSize: 24,
  },
  rateInfo: {
    flex: 1,
  },
  rateTitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 2,
  },
  rateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2BC0AC',
    marginBottom: 2,
  },
  rateSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  bannerContainer: {
   // marginTop: 20,
  },
  pagerView: {
    width: width,
    height: 170,
  },
  bannerPage: {
    paddingHorizontal: 15,
  },
  banner: {
    //borderRadius: 12,
   // overflow: 'hidden',
    height: '100%',
    width: '100%',
    backgroundColor: '#E0E0E0',
  },
  bannerContent: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: 34,
    fontWeight: '600',
    color: '#B8A4D4',
    fontStyle: 'italic',
  },
  bannerSubtitle: {
    fontSize: 15,
    color: '#999',
    marginTop: 4,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
  },
  activeDot: {
    backgroundColor: '#666',
  },
  welcomeTextContainer: {
    marginTop: 15,
    paddingHorizontal: 10,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E94560',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 15,
   // color: '#666',
   // textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  welcomeDescriptionPreview: {
    //maxHeight: 60,
    overflow: 'hidden',
  },
  showMoreButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginRight: 10,
  },
  showMoreText: {
    fontSize: 13,
    color: '#2BC0AC',
    fontWeight: '600',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    paddingHorizontal: 10,
    marginTop: 15,
    // padding: 10,
    gap: 10,
  },
  featureCard: {
    width: '30%',
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 30,
  },
  rateImage: {
    width: 30,
    height: 30,
  },
});
