import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'VideoShopping'>;

const { width } = Dimensions.get('window');

export default function VideoShoppingScreen({ navigation }: Props) {
  const [isLive, setIsLive] = useState(true);
  const [viewers, setViewers] = useState(1234);

  const liveVideos = [
    {
      id: 1,
      title: 'Gold Jewellery Collection - Live Show',
      thumbnail: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=300&fit=crop',
      host: 'Jewellery Expert',
      viewers: 1234,
      isLive: true,
      category: 'Gold',
    },
    {
      id: 2,
      title: 'Diamond Rings Showcase',
      thumbnail: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=300&fit=crop',
      host: 'Diamond Specialist',
      viewers: 856,
      isLive: true,
      category: 'Diamond',
    },
  ];

  const upcomingVideos = [
    {
      id: 3,
      title: 'Wedding Collection Preview',
      thumbnail: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=300&fit=crop',
      host: 'Bridal Expert',
      scheduledTime: '5:00 PM Today',
      category: 'Bridal',
    },
    {
      id: 4,
      title: 'Silver Anklets & Bangles',
      thumbnail: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=300&fit=crop',
      host: 'Silver Specialist',
      scheduledTime: '7:00 PM Today',
      category: 'Silver',
    },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: 'Gold Necklace Set',
      price: '₹45,000',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop',
    },
    {
      id: 2,
      name: 'Diamond Ring',
      price: '₹65,000',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop',
    },
    {
      id: 3,
      name: 'Gold Earrings',
      price: '₹25,000',
      image: 'https://images.unsplash.com/photo-1535556116002-6281ff3e9f36?w=200&h=200&fit=crop',
    },
    {
      id: 4,
      name: 'Silver Bracelet',
      price: '₹8,500',
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200&h=200&fit=crop',
    },
  ];

  const renderLiveVideoCard = (video: typeof liveVideos[0]) => (
    <TouchableOpacity key={video.id} style={styles.liveVideoCard}>
      <View style={styles.videoThumbnail}>
        <Image source={{ uri: video.thumbnail }} style={styles.thumbnailImage} />
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <View style={styles.viewersOverlay}>
          <Ionicons name="eye" size={16} color="#fff" />
          <Text style={styles.viewersText}>{video.viewers}</Text>
        </View>
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
        <View style={styles.hostInfo}>
          <Ionicons name="person-circle-outline" size={16} color="#666" />
          <Text style={styles.hostName}>{video.host}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderUpcomingVideoCard = (video: typeof upcomingVideos[0]) => (
    <TouchableOpacity key={video.id} style={styles.upcomingVideoCard}>
      <View style={styles.videoThumbnail}>
        <Image source={{ uri: video.thumbnail }} style={styles.thumbnailImage} />
        <View style={styles.scheduledBadge}>
          <Ionicons name="time-outline" size={14} color="#fff" />
          <Text style={styles.scheduledText}>{video.scheduledTime}</Text>
        </View>
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
        <View style={styles.hostInfo}>
          <Ionicons name="person-circle-outline" size={16} color="#666" />
          <Text style={styles.hostName}>{video.host}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderProductCard = (product: typeof featuredProducts[0]) => (
    <View key={product.id} style={styles.productCard}>
      <Image source={{ uri: product.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productPrice}>{product.price}</Text>
        <TouchableOpacity style={styles.addToCartButton}>
          <Ionicons name="cart-outline" size={16} color="#2BC0AC" />
          <Text style={styles.addToCartText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Video Shopping</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerIcon}>
            <Ionicons name="videocam" size={24} color="#2BC0AC" />
          </View>
          <View style={styles.infoBannerContent}>
            <Text style={styles.infoBannerTitle}>Shop Live with Experts</Text>
            <Text style={styles.infoBannerText}>
              Watch live demonstrations and buy your favorite jewellery
            </Text>
          </View>
        </View>

        {/* Live Now Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.livePulse} />
              <Text style={styles.sectionTitle}>Live Now</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {liveVideos.map(video => renderLiveVideoCard(video))}
          </ScrollView>
        </View>

        {/* Upcoming Shows */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Shows</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {upcomingVideos.map(video => renderUpcomingVideoCard(video))}
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productsGrid}>
            {featuredProducts.map(product => renderProductCard(product))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <View style={styles.categoriesContainer}>
            {['Gold', 'Diamond', 'Silver', 'Platinum'].map((category, index) => (
              <TouchableOpacity key={index} style={styles.categoryChip}>
                <Text style={styles.categoryText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  infoBanner: {
    backgroundColor: '#E8F8F5',
    margin: 15,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBannerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  section: {
    marginTop: 10,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  livePulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4757',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2BC0AC',
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingLeft: 15,
  },
  liveVideoCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  upcomingVideoCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoThumbnail: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  liveBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF4757',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  viewersOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewersText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  scheduledBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(43, 192, 172, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scheduledText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hostName: {
    fontSize: 13,
    color: '#666',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    gap: 12,
  },
  productCard: {
    width: (width - 54) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2BC0AC',
    marginBottom: 8,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F8F5',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  addToCartText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2BC0AC',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  bottomSpacer: {
    height: 30,
  },
});
