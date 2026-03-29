import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEnhancedAuth } from '../context/EnhancedAuthContext';
import StatisticsService from '../services/StatisticsService';
import AnimatedCounter from '../components/AnimatedCounter';
import { CardStyles } from '../styles/CardStyles';

const { width } = Dimensions.get('window');

const StatisticsScreen = ({ navigation }) => {
  const { user, userRole } = useEnhancedAuth();
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalMealsServed: 0,
    activeDonors: 0,
    peopleHelped: 0,
    todaysDonations: 0,
    completedClaims: 0,
  });
  const [loading, setLoading] = useState(true);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    loadStatistics();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation for the hero section
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadStatistics = async () => {
    try {
      const statisticsData = await StatisticsService.getOverallStatistics();
      setStats(statisticsData);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    if (userRole === 'restaurant') {
      navigation.navigate('Donate Food');
    } else {
      navigation.navigate('Browse');
    }
  };

  const StatCard = ({ title, value, icon, color, gradient }) => (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={gradient}
        style={styles.statCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statCardContent}>
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Ionicons name={icon} size={24} color="#fff" />
          </View>
          <View style={styles.statInfo}>
            <AnimatedCounter 
              value={value} 
              style={styles.statValue}
              duration={1200}
            />
            <Text style={styles.statTitle}>{title}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const MessageCard = ({ message, emoji }) => (
    <Animated.View
      style={[
        CardStyles.compactCard,
        styles.messageCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.messageEmoji}>{emoji}</Text>
      <Text style={styles.messageText}>{message}</Text>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="stats-chart" size={50} color="#4caf50" />
          <Text style={styles.loadingText}>Loading Impact Statistics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#4caf50', '#2e7d32']}
            style={styles.headerGradient}
          >
            <Text style={styles.headerTitle}>FoodFlow Impact</Text>
            <Text style={styles.headerSubtitle}>Making a Difference Together</Text>
          </LinearGradient>
        </View>

        {/* Hero Message */}
        <Animated.View
          style={[
            CardStyles.orangeFrameCard,
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: pulseAnim }
              ],
            },
          ]}
        >
          <Text style={styles.heroTitle}>Food Donation 100% Free</Text>
          <Text style={styles.heroMessage}>Your Donation Feeds Hope</Text>
          <Text style={styles.heroSubMessage}>Distributed to Poor People by NGOs</Text>
        </Animated.View>

        {/* Statistics Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Our Impact</Text>
          
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Donations"
              value={stats.totalDonations}
              icon="gift"
              color="#ff6b35"
              gradient={['#ff6b35', '#f7931e']}
            />
            
            <StatCard
              title="Meals Served"
              value={stats.totalMealsServed}
              icon="restaurant"
              color="#4caf50"
              gradient={['#4caf50', '#2e7d32']}
            />
            
            <StatCard
              title="Active Donors"
              value={stats.activeDonors}
              icon="people"
              color="#2196f3"
              gradient={['#2196f3', '#1976d2']}
            />
            
            <StatCard
              title="People Helped"
              value={stats.peopleHelped}
              icon="heart"
              color="#e91e63"
              gradient={['#e91e63', '#c2185b']}
            />
            
            <StatCard
              title="Today's Donations"
              value={stats.todaysDonations}
              icon="today"
              color="#ff9800"
              gradient={['#ff9800', '#f57c00']}
            />
            
            <StatCard
              title="Completed Claims"
              value={stats.completedClaims}
              icon="checkmark-circle"
              color="#9c27b0"
              gradient={['#9c27b0', '#7b1fa2']}
            />
          </View>
        </View>

        {/* Inspiring Messages */}
        <View style={styles.messagesSection}>
          <Text style={styles.sectionTitle}>Together We Can</Text>
          
          <MessageCard
            message="Every donation counts and makes a real difference in someone's life"
            emoji="🍽️"
          />
          
          <MessageCard
            message="Join thousands of donors who are feeding hope to communities"
            emoji="💝"
          />
          
          <MessageCard
            message="Zero waste, maximum impact - sustainable food distribution"
            emoji="🌱"
          />
        </View>

        {/* Call to Action */}
        <Animated.View
          style={[
            styles.ctaSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4caf50', '#2e7d32']}
              style={styles.buttonGradient}
            >
              <Ionicons name="rocket" size={24} color="#fff" />
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Additional Info */}
        <View style={styles.infoSection}>
          <View style={CardStyles.primaryCard}>
            <Ionicons name="shield-checkmark" size={32} color="#4caf50" />
            <Text style={styles.infoTitle}>100% Free Service</Text>
            <Text style={styles.infoText}>
              No hidden fees, no charges. Food donation is completely free for everyone.
            </Text>
          </View>
          
          <View style={CardStyles.primaryCard}>
            <Ionicons name="globe" size={32} color="#2196f3" />
            <Text style={styles.infoTitle}>Community Driven</Text>
            <Text style={styles.infoText}>
              Connect restaurants, NGOs, and communities to fight food waste together.
            </Text>
          </View>
          
          <View style={CardStyles.primaryCard}>
            <Ionicons name="time" size={32} color="#ff9800" />
            <Text style={styles.infoTitle}>Real-time Impact</Text>
            <Text style={styles.infoText}>
              Track your contributions and see the immediate impact on communities.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ in 🏛️ Hyderabad</Text>
          <Text style={styles.footerSubtext}>Building a world without hunger</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e8f5e8',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroMessage: {
    fontSize: 20,
    color: '#4caf50',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubMessage: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statCardGradient: {
    borderRadius: 16,
    padding: 16,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#e8f5e8',
  },
  messagesSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  messageText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
  },
  ctaSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  getStartedButton: {
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  // infoCard removed - using CardStyles.primaryCard
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
});

export default StatisticsScreen;