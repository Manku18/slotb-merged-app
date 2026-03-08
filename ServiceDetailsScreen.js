import React from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// 1. We import these tools to handle the "Safe Area" (Notch & Nav Bar)
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// This is the main screen content
const ServiceDetailsContent = () => {
  // 2. This hook gets the exact safe area measurements of the specific phone
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { 
      // Add padding to the top for the Status Bar (Notch)
      paddingTop: insets.top 
    }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>House Cleaning</Text>
        <TouchableOpacity style={styles.iconButton}>
           <Ionicons name="heart-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* --- SCROLLABLE CONTENT --- */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Placeholder Image */}
        <View style={styles.imageContainer}>
          <Ionicons name="image-outline" size={60} color="#ccc" />
        </View>

        {/* Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Cleaning</Text>
          </View>
          
          <Text style={styles.title}>Full House Cleaning</Text>
          <Text style={styles.price}>$45.00 <Text style={styles.perHr}>/ hr</Text></Text>
          
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            Professional house cleaning service including dusting, vacuuming, mopping, and bathroom sanitation. We ensure your home sparkles!
          </Text>

          {/* Reviewer Row */}
          <View style={styles.userRow}>
             <View style={styles.avatar}>
                <Text style={{fontSize: 18}}>👤</Text>
             </View>
             <View>
                <Text style={styles.userName}>Alex Morgan</Text>
                <Text style={styles.userRole}>Service Provider</Text>
             </View>
          </View>
        </View>
      </ScrollView>

      {/* --- FOOTER (THE FIX IS HERE) --- */}
      <View style={[
        styles.footer, 
        { 
          // 3. We add the system's bottom inset (nav bar height) 
          // PLUS 20px of our own padding so it looks nice.
          paddingBottom: Platform.OS === 'android' ? insets.bottom + 20 : insets.bottom + 10
        }
      ]}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Book Now</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

// 4. We export this Wrapper to ensure SafeAreaProvider is always present
// If you already have SafeAreaProvider in App.js, you can just use ServiceDetailsContent directly.
export default function ServiceDetailsScreen() {
  return (
    <SafeAreaProvider>
      <ServiceDetailsContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  iconButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    padding: 20,
  },
  badge: {
    backgroundColor: '#eefffa',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
  },
  badgeText: {
    color: '#00b894',
    fontWeight: '600',
    fontSize: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2d3436',
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0984e3',
    marginBottom: 20,
  },
  perHr: {
    fontSize: 14,
    color: '#636e72',
    fontWeight: '400',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2d3436',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#636e72',
    marginBottom: 25,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#dfe6e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  userName: {
    fontWeight: '700',
    fontSize: 15,
    color: '#2d3436',
  },
  userRole: {
    color: '#b2bec3',
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
    // Shadow for elevation
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 10,
  },
  button: {
    backgroundColor: '#0984e3',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});