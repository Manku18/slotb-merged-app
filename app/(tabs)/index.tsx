import { PricingSection } from '@/components/PricingSection';
import { GlassCard } from '@/components/ui/GlassCard';
import { SlotBShadows } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ComingSoonModal } from '@/components/ui/ComingSoonModal'; // Added Import
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Vibration,
  Linking,
  ImageBackground
} from 'react-native';
import { BlurView } from 'expo-blur';

// ... (Existing Constants remain same)



const { width, height } = Dimensions.get('window');

const ADS_DATA = [
  { id: '1', title: 'New Feature Alert', subtitle: 'Detailed Analytics Now Live', icon: 'stats-chart' },
  { id: '2', title: 'Boost Your Shop', subtitle: 'Get Featured for 24h', icon: 'rocket' },
  { id: '3', title: 'Partner Program', subtitle: 'Earn Rewards', icon: 'gift' },
];

const GALLERY_DATA = [
  { id: '1', title: 'Fade Master', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&q=80' },
  { id: '2', title: 'Beard Trim', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&q=80' },
  { id: '3', title: 'Classic Cut', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&q=80' },
];

const INSIGHTS_DATA = [
  { id: '1', title: 'Maximizing Earnings', desc: 'Tips to increase daily revenue.' },
  { id: '2', title: 'Customer Retention', desc: 'How to keep them coming back.' },
  { id: '3', title: 'Seasonal Trends', desc: 'Summer styles are in demand.' },
];

const ESSENTIALS_DATA = [
  { id: '1', name: 'Pro Trimmer', price: '₹1,499', img: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200&q=80', description: 'Professional grade trimmer.' },
  { id: '2', name: 'Shaving Kit', price: '₹999', img: 'https://images.unsplash.com/photo-1512413914633-b5043f4041ea?w=400&q=80', description: 'Complete grooming set.' },
  { id: '3', name: 'Hair Dryer', price: '₹2,499', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80', description: 'High power hair dryer.' }
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, authKey, login, notifications, notificationsBreakdown, settings, setStats, setEarnings, setTokens, setPartners, setNotifications, setMaintenance, maintenance, showPlans, setShowPlans } = useAppStore();
  const { colors } = useTheme();

  const [isShopOpen, setShopOpen] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSmartMode, setSmartMode] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', icon: '', gradient: ['#4F46E5', '#818CF8'] });


  // Dynamic State initialization
  const [adsData, setAdsData] = useState<any[]>(ADS_DATA);
  const [galleryData, setGalleryData] = useState<any[]>(GALLERY_DATA);
  const [essentialsData, setEssentialsData] = useState<any[]>(ESSENTIALS_DATA);

  const [galleryActiveSlide, setGalleryActiveSlide] = useState(0);

  const { scrollTo } = useLocalSearchParams<{ scrollTo: string }>();
  const mainScrollRef = React.useRef<ScrollView>(null);
  const adsScrollRef = React.useRef<ScrollView>(null);
  const galleryScrollRef = React.useRef<ScrollView>(null);

  // Vibration Ref
  const prevTokenIds = React.useRef<string[]>([]);

  // Handle Deep Link Scroll
  React.useEffect(() => {
    if (scrollTo === 'pricing' && mainScrollRef.current) {
      setTimeout(() => {
        mainScrollRef.current?.scrollToEnd({ animated: true });
      }, 500);
    }
  }, [scrollTo]);

  // Fetch Live Data
  React.useEffect(() => {
    async function loadData() {
      if (!user?.id) return;

      try {
        const { apiService } = require('@/services/api');
        const data = await apiService.getDashboard();

        // Safely update stats with fallback
        if (data?.stats) setStats(data.stats);
        if (data?.earnings) setEarnings(data.earnings);
        if (data?.tokens) setTokens(data.tokens);
        if (data?.partners) setPartners(data.partners || []);
        if (data?.notificationsCount !== undefined) {
          setNotifications(data.notificationsCount, data.notificationsBreakdown || { bookings: 0, alerts: 0 });
        }

        // Handle Maintenance Mode
        if (data?.maintenance_mode !== undefined) {
          setMaintenance({
            isActive: data.maintenance_mode === 1,
            until: data.maintenance_until || '',
            description: data.maintenance_description || 'System maintenance in progress.'
          });
        }
        if (data?.show_plans_section !== undefined) {
          setShowPlans(data.show_plans_section === 1);
        }

        // Vibrate on New Booking
        if (data?.tokens && Array.isArray(data.tokens)) {
          const currentIds = data.tokens.map((t: any) => t.id).filter(Boolean);
          const hasNew = currentIds.some((id: string) => !prevTokenIds.current.includes(id));
          // Only vibrate if we had previous data (avoid vibrate on init) OR if it's a live update
          // AND if setting is ON.
          if (prevTokenIds.current.length > 0 && hasNew && settings?.vibrateOnBooking) {
            try {
              // Distinctive vibration pattern for new booking
              Vibration.vibrate([0, 200, 100, 200]); // Double pulse
            } catch (e) {
              console.log('Vibration not available:', e);
            }
          }
          prevTokenIds.current = currentIds;
        }

        // NEW: Dynamic Ads & Gallery with validation
        if (data?.app_carousel && Array.isArray(data.app_carousel) && data.app_carousel.length > 0) {
          try {
            setAdsData(data.app_carousel.map((item: any) => ({
              id: item.id?.toString() || Math.random().toString(),
              title: item.title || 'New Feature',
              subtitle: item.subtitle || '',
              icon: 'star',
              image_url: item.image_url,
              bgImage: item.image_url,
              link: item.link || item.button_link, // Support both
              button_text: item.button_text || 'EXPLORE NOW',
              media_type: item.media_type || 'image',
              isDynamic: true
            })));
          } catch (e) {
            // Keep default ads
          }
        }

        if (data?.app_styles && Array.isArray(data.app_styles) && data.app_styles.length > 0) {
          try {
            setGalleryData(data.app_styles.map((item: any) => ({
              id: item.id?.toString() || Math.random().toString(),
              title: item.name || 'Style',
              image: item.image_url || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&q=80'
            })));
          } catch (e) {
            // Keep default gallery
          }
        }

        if (data?.app_essentials && Array.isArray(data.app_essentials) && data.app_essentials.length > 0) {
          try {
            setEssentialsData(data.app_essentials.map((item: any) => ({
              id: item.id?.toString() || Math.random().toString(),
              name: item.name,
              price: item.price,
              img: item.image_url,
              description: item.description,
              link: item.link
            })));
          } catch (e) {
            // Keep default
          }
        }

        if (data?.shop && user) {
          try {
            const updatedUser = {
              ...user,
              shopName: data.shop.name || user.shopName,
              email: data.shop.email || user.email,
              phone: data.shop.phone || user.phone,
              upiId: data.shop.upi_id || user.upiId,
              paymentQr: data.shop.payment_qr || user.paymentQr,
              qrCode: data.shop.qr_code || user.qrCode,
              image: data.shop.profileImage || user.image,
              avatar: data.shop.profileImage || user.avatar,
              subscription_end_date: data.shop.subscription_end_date,
              current_plan_id: data.shop.current_plan_id,
              is_subscription_active: data.shop.is_subscription_active
            };
            if (authKey) login(updatedUser, authKey);
          } catch (e) {
            // Keep existing user data
          }
        }
      } catch (e: any) {
        console.error("Dashboard Load Failed:", e?.message || e);
        // Don't crash - just skip this update
      } finally {
        setRefreshing(false);
      }
    }

    // Wrap in try-catch to prevent any uncaught errors
    try {
      loadData();
    } catch (e) {
      console.error("LoadData initialization failed:", e);
      setRefreshing(false);
    }

    const interval = setInterval(() => {
      try {
        loadData();
      } catch (e) {
        console.error("Interval loadData failed:", e);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [user?.id, refreshing]);

  // Auto-scroll for Ads
  React.useEffect(() => {
    const interval = setInterval(() => {
      let nextSlide = activeSlide + 1;
      if (nextSlide >= adsData.length) nextSlide = 0;
      if (adsScrollRef.current) {
        adsScrollRef.current.scrollTo({ x: nextSlide * width, animated: true });
        setActiveSlide(nextSlide);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [activeSlide, adsData]);

  // Auto-scroll for Gallery
  React.useEffect(() => {
    const interval = setInterval(() => {
      let nextSlide = galleryActiveSlide + 1;
      if (nextSlide >= galleryData.length) nextSlide = 0;
      if (galleryScrollRef.current) {
        galleryScrollRef.current.scrollTo({ x: nextSlide * width, animated: true });
        setGalleryActiveSlide(nextSlide);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [galleryActiveSlide, galleryData]);

  // Effect to fetch initial status
  React.useEffect(() => {
    if (user?.id) {
      const { apiService } = require('@/services/api');
      apiService.getShopStatus(user.id).then(setShopOpen);
    }
  }, [user?.id]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Avatar / Shop Logo */}
          <TouchableOpacity style={styles.avatarContainer} onPress={() => router.push('/profile')}>
            <Image
              source={{ uri: user?.avatar || user?.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (user?.name || 'Partner') }}
              style={styles.avatarImage}
            />
            <View style={styles.onlineBadge} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={[styles.shopName, { color: colors.textPrimary }]}>{user?.shopName || 'My Salon'}</Text>
            <Text style={[styles.dateText, { color: colors.textTertiary }]}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/notifications')} style={[styles.headerActionButton, { backgroundColor: colors.surface }]}>
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
            {(notifications > 0) && (
              <View style={[styles.headerBadge, { backgroundColor: '#FF3B30', borderColor: colors.background, borderWidth: 2, top: 8, right: 8, width: 12, height: 12, borderRadius: 6 }]} />
            )}
          </TouchableOpacity>
        </View>
      </View >

      <ScrollView
        ref={mainScrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent]} // Removed fixed minHeight to let content dictate height
      >
        {/* Ads Carousel */}
        <View style={styles.sectionNoMargin}>
          <ScrollView
            ref={adsScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.heroCarouselContainer}
            onScroll={(event) => {
              const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
              if (slide !== activeSlide) {
                setActiveSlide(slide);
              }
            }}
            scrollEventThrottle={16}
          >
            {adsData.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={item.link ? 0.7 : 1}
                onPress={() => item.link && Linking.openURL(item.link)}
              >
                <GlassCard style={[styles.heroCard, { backgroundColor: 'transparent', overflow: 'hidden' }]} variant="default">
                  {item.media_type === 'video' ? (
                    <View style={styles.heroBackground}>
                      {(() => {
                        const { Video, ResizeMode } = require('expo-av');
                        return (
                          <Video
                            source={{ uri: item.image_url || item.bgImage }}
                            style={StyleSheet.absoluteFill}
                            resizeMode={ResizeMode.COVER}
                            isLooping
                            shouldPlay
                            isMuted={true}
                          />
                        );
                      })()}
                      <View style={styles.heroContentOverlay}>
                        <Text style={[styles.heroTitle, { color: '#FFF' }]}>{item.title}</Text>
                        <Text style={[styles.heroSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>{item.subtitle || ''}</Text>
                        <TouchableOpacity
                          style={[styles.heroButton, { backgroundColor: '#FFF', marginTop: 10 }]}
                          onPress={() => (item.button_link || item.link) && Linking.openURL(item.button_link || item.link)}
                        >
                          <Text style={[styles.adButtonText, { color: '#000' }]}>{item.button_text || 'EXPLORE NOW'}</Text>
                          <Ionicons name="arrow-forward" size={12} color="#000" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (item.image_url || item.bgImage) ? (
                    <ImageBackground source={{ uri: item.image_url || item.bgImage }} style={styles.heroBackground} resizeMode="cover">
                      <View style={styles.heroContentOverlay}>
                        <Text style={[styles.heroTitle, { color: '#FFF' }]}>{item.title}</Text>
                        <Text style={[styles.heroSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>{item.subtitle || ''}</Text>
                        <TouchableOpacity
                          style={[styles.heroButton, { backgroundColor: '#FFF', marginTop: 10 }]}
                          onPress={() => (item.button_link || item.link) && Linking.openURL(item.button_link || item.link)}
                        >
                          <Text style={[styles.adButtonText, { color: '#000' }]}>{item.button_text || 'EXPLORE NOW'}</Text>
                          <Ionicons name="arrow-forward" size={12} color="#000" />
                        </TouchableOpacity>
                      </View>
                    </ImageBackground>
                  ) : (
                    <View style={styles.heroContent}>
                      <View style={[styles.adIconContainer, { backgroundColor: colors.background }]}>
                        <Ionicons name={item.icon || "star" as any} size={32} color={colors.primary} />
                      </View>
                      <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                      <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                      <TouchableOpacity
                        style={[styles.heroButton, { backgroundColor: colors.primary }]}
                        onPress={() => item.link && Linking.openURL(item.link)}
                      >
                        <Text style={[styles.adButtonText, { color: colors.surface }]}>EXPLORE NOW</Text>
                        <Ionicons name="arrow-forward" size={12} color={colors.surface} />
                      </TouchableOpacity>
                    </View>
                  )}
                </GlassCard>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.paginationContainer}>
            {adsData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  { backgroundColor: index === activeSlide ? colors.primary : colors.textTertiary }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Status Section (Red Glow Logic) */}
        <View style={styles.section}>
          <GlassCard
            style={[
              styles.statusCard,
              !isShopOpen && {
                backgroundColor: '#DC2626',
                shadowColor: '#DC2626',
                shadowOpacity: 0.6,
                shadowRadius: 20
              }
            ]}
            variant={isShopOpen ? "mustard" : "default"}
          >
            <View style={styles.statusMainRow}>
              <View style={styles.statusInfo}>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: (isShopOpen && user?.is_subscription_active) ? colors.success : '#D1D5DB' }
                ]} />
                <View>
                  <Text style={[
                    styles.statusTitle,
                    { color: (isShopOpen && user?.is_subscription_active) ? colors.textPrimary : (user?.is_subscription_active ? '#FFFFFF' : colors.textTertiary) }
                  ]}>
                    LIVE AVAILABILITY
                  </Text>
                  <Text style={[
                    styles.statusValue,
                    { color: isShopOpen ? colors.textPrimary : '#FFFFFF' }
                  ]}>
                    {isShopOpen ? 'OPEN NOW' : 'CLOSED'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSmartMode(!isSmartMode)}
                    style={[
                      styles.smartBadge,
                      !isShopOpen && { backgroundColor: 'rgba(0,0,0,0.05)' }
                    ]}
                  >
                    <Ionicons name="sparkles" size={10} color={isShopOpen ? colors.primary : '#9CA3AF'} />
                    <Text style={[
                      styles.smartText,
                      { color: isShopOpen ? colors.primary : '#9CA3AF' }
                    ]}>
                      Smart {isSmartMode ? 'ON' : 'OFF'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShopOpen(!isShopOpen)}
                style={styles.switchTouchArea}
              >
                <View style={styles.switchContainer}>
                  <Switch
                    trackColor={{ false: '#D1D5DB', true: colors.primary }}
                    thumbColor={isShopOpen ? colors.surface : '#9CA3AF'}
                    ios_backgroundColor="#D1D5DB"
                    onValueChange={async (value) => {
                      setShopOpen(value);
                      if (user?.id) {
                        try {
                          const { apiService } = require('@/services/api');
                          await apiService.toggleShopStatus(user.id, value);
                        } catch (e) {
                          setShopOpen(!value);
                          alert("Failed to update status");
                        }
                      }
                    }}
                    value={isShopOpen}
                  />
                </View>
              </TouchableOpacity>
            </View>

          </GlassCard>
        </View>



        {/* Quick Actions */}
        < View style={styles.section} >
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>QUICK ACTIONS</Text>
          <View style={styles.actionsGrid}>
            {[
              { label: 'Ranking', icon: 'trophy-outline', route: '/ranking' as const },
              { label: 'Profile', icon: 'person-outline', route: '/profile' as const },
              { label: 'Payment QR', icon: 'qr-code-outline', route: '/payment-qr' as const }, // Renamed from Booking QR
              { label: 'Shop QR', icon: 'wallet-outline', route: '/shop-qr' as const }
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionButton, { backgroundColor: colors.surface }]}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.background }]}>
                  <Ionicons name={action.icon as any} size={24} color={colors.primary} />
                </View>
                <Text style={[styles.actionText, { color: colors.textSecondary }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View >

        {/* Trending Styles (reduced height to 25vh) */}
        < View style={[styles.section, { height: height * 0.25 }]} >
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>TRENDING STYLES</Text>
          <ScrollView
            ref={galleryScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryCarouselContainer}
            onScroll={(event) => {
              const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
              setGalleryActiveSlide(slide);
            }}
            scrollEventThrottle={16}
          >
            {galleryData.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                onPress={() => item.link && Linking.openURL(item.link)}
              >
                <View style={[styles.galleryLargeCard, { width: width - 40, height: height * 0.20 }]}>
                  <Image source={{ uri: item.image }} style={styles.galleryLargeImage} />
                  <View style={styles.galleryLargeOverlay}>
                    <Text style={styles.galleryLargeTitle}>{item.title}</Text>
                    <TouchableOpacity
                      style={styles.galleryLearnButton}
                      onPress={() => {
                        setModalConfig({
                          title: 'Master Class',
                          message: `Learn how to master the ${item.title} style. Course module coming soon!`,
                          icon: 'school',
                          gradient: ['#06b6d4', '#3b82f6'] // Cyan to Blue
                        });
                        setComingSoon(true);
                      }}
                    >
                      <Text style={styles.galleryLearnText}>Learn More</Text>
                      <Ionicons name="arrow-forward" size={14} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Pagination Dots for Gallery */}
          <View style={[styles.paginationContainer, { marginTop: 10, marginBottom: 0 }]}>
            {galleryData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  { backgroundColor: index === galleryActiveSlide ? colors.primary : colors.textTertiary }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Shop Essentials Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>SHOP ESSENTIALS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
            {essentialsData.map((prod) => (
              <TouchableOpacity
                key={prod.id}
                activeOpacity={0.9}
                style={[styles.productCard, { backgroundColor: colors.surface }]}
                onPress={() => {
                  if (prod.link) {
                    Linking.openURL(prod.link);
                  } else {
                    setModalConfig({
                      title: prod.name,
                      message: prod.description || 'Get premium salon equipment at best prices. Launching soon!',
                      icon: 'cart',
                      gradient: ['#F59E0B', '#D97706'] // Amber
                    });
                    setComingSoon(true);
                  }
                }}
              >
                <Image source={{ uri: prod.img }} style={styles.productImage} />
                <View style={styles.productContent}>
                  <Text style={[styles.productName, { color: colors.textPrimary }]}>{prod.name}</Text>
                  <Text style={styles.productPrice}>{prod.price}</Text>
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>{prod.link ? 'Buy Now' : 'Coming Soon'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Partner Insights (Increased height to 50vh) */}
        {/* Partner Pricing / Upgrade Section - Only shown if not active */}
        {showPlans && !user?.is_subscription_active && <PricingSection />}

      </ScrollView >
      <ComingSoonModal
        visible={comingSoon}
        onClose={() => setComingSoon(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        icon={modalConfig.icon as any}
        gradient={modalConfig.gradient as any}
      />
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 29,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E2E8F0',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E', // Green for online
    borderWidth: 2,
    borderColor: '#FFF',
  },
  headerContent: {
    justifyContent: 'center',
    flex: 1,
  },
  shopName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 5, // Shifted up (was 10)
  },
  section: {
    marginBottom: 14,
  },
  sectionNoMargin: {
    marginBottom: 1,
  },
  sectionLast: {
    marginBottom: 0,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.7,
  },
  heroCarouselContainer: {
    paddingHorizontal: 0,
  },
  heroCard: {
    // Match width/height logic but with fixes
    width: width - 40,
    height: height * 0.38,
    borderRadius: 24,
    justifyContent: 'center',
    padding: 0,
    marginHorizontal: 20,
    backgroundColor: 'transparent',

    // No border for borderless look
    borderWidth: 0,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    overflow: 'hidden',
  },
  heroContent: {
    alignItems: 'flex-start',
    width: '100%',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 40,
    color: '#000000', // Force black since card is white
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 24,
    opacity: 0.8,
    color: '#333333', // Force dark grey
  },
  heroButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  heroBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  heroContentOverlay: {
    padding: 24,
    alignItems: 'flex-start',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)', // Slight dark overlay for readability
    height: '100%',
    justifyContent: 'center',
  },
  adButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  adIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20, // Shifted down (from -40)
    marginBottom: 30,
    gap: 4,
    zIndex: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  lockContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.2)',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  lockIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E11D48',
    letterSpacing: 1,
    marginBottom: 2,
  },
  lockMessage: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 14,
  },
  lockBuyButton: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 10,
  },
  lockBuyButtonText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  statusCard: {
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 30, // Consistent with Hero
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  statusMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  statusTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 0,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 0,
    letterSpacing: -0.5,
  },
  smartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  smartText: {
    fontSize: 11,
    fontWeight: '600',
  },
  switchTouchArea: {
    padding: 6,
  },
  switchContainer: {
    transform: [{ scale: 1.1 }],
    padding: 4,
    borderRadius: 10,
    // Removed duplicate dark background/shadow
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - 40 - 16) / 2, // 20 padding * 2 = 40, 16 gap
    borderRadius: 24,
    padding: 15,
    alignItems: 'center',
    ...SlotBShadows.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Gallery Carousel (30vh)
  galleryCarouselContainer: {
    paddingHorizontal: 0,
  },
  galleryLargeCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
    ...SlotBShadows.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  galleryLargeImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  galleryLargeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(73, 72, 72, 0.3)', // Ensure text readability
  },
  galleryLargeTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    width: '70%',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  galleryLearnButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)', // Glass effect
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    elevation: 0,
  },
  galleryLearnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },

  // Insights (40vh)
  insightsCard: {
    flex: 1,
    padding: 24,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  insightsList: {
    flex: 1,
  },
  insightItem: {
    paddingVertical: 16,
  },
  insightItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  insightItemDesc: {
    fontSize: 14,
    opacity: 0.8,
  },
  readMoreBtn: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  readMoreText: {
    fontWeight: '700',
    fontSize: 14,
  },

  // NEW STYLES for Grow Skills & Shop
  skillsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  skillCard: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  skillIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  skillTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  skillSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
  },
  productCard: {
    width: 140,
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: '#F3F4F6',
  },
  productContent: {
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    color: '#9CA3AF', // Greyed out
    textDecorationLine: 'line-through',
    marginBottom: 6,
  },
  comingSoonBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },
});
