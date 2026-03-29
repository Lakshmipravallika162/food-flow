import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEnhancedAuth } from '../context/EnhancedAuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hashPassword } from '../utils/PasswordUtils';

const { width } = Dimensions.get('window');

const UserDashboardScreen = ({ navigation }) => {
  const { loginUser } = useEnhancedAuth();

  // Create default admin user on component mount if it doesn't exist
  useEffect(() => {
    const createDefaultAdmin = async () => {
      try {
        // Check if admin user already exists
        const adminUsers = await AsyncStorage.getItem('users_admin');
        let users = adminUsers ? JSON.parse(adminUsers) : [];
        
        const adminExists = users.find(user => user.email === 'User');
        
        if (!adminExists) {
          // Hash the password
          const hashedPassword = await hashPassword('User');
          
          // Create new admin user
          const newAdmin = {
            id: Date.now().toString(),
            email: 'User',
            password: hashedPassword,
            name: 'System Administrator',
            role: 'admin',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true,
          };
          
          // Add to users array
          users.push(newAdmin);
          
          // Save to storage
          await AsyncStorage.setItem('users_admin', JSON.stringify(users));
        }
      } catch (error) {
        console.error('Error creating default admin user:', error);
      }
    };
    
    createDefaultAdmin();
  }, []);

  const handleCardPress = async (cardType) => {
    switch (cardType) {
      case 'needFood':
        navigation.navigate('EnhancedLogin', { selectedRole: 'ngo' });
        break;
      case 'haveFood':
        navigation.navigate('EnhancedLogin', { selectedRole: 'restaurant' });
        break;
      case 'admin':
        // Handle admin login with predefined credentials
        try {
          // Navigate to admin login screen where credentials will be validated
          navigation.navigate('AdminLogin');
        } catch (error) {
          console.error('Error navigating to admin login:', error);
          Alert.alert('Error', 'Could not navigate to admin panel. Please try again.');
        }
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>FoodFlow Dashboard</Text>
          <Text style={styles.subtitle}>Connecting Hearts, Sharing Meals</Text>
        </View>

        <View style={styles.mainCardsContainer}>
          {/* I NEED FOOD Card */}
          <TouchableOpacity
            style={[styles.mainCard, styles.needFoodCard]}
            onPress={() => handleCardPress('needFood')}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              <Ionicons name="search" size={50} color="#fff" />
              <Text style={styles.cardTitle}>I NEED FOOD</Text>
              <Text style={styles.cardSubtitle}>NGOs & Organizations</Text>
              <Text style={styles.cardDescription}>
                Find available food donations from restaurants near you
              </Text>
            </View>
          </TouchableOpacity>

          {/* I HAVE FOOD Card */}
          <TouchableOpacity
            style={[styles.mainCard, styles.haveFoodCard]}
            onPress={() => handleCardPress('haveFood')}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              <Ionicons name="restaurant" size={50} color="#fff" />
              <Text style={styles.cardTitle}>I HAVE FOOD</Text>
              <Text style={styles.cardSubtitle}>Restaurants & Businesses</Text>
              <Text style={styles.cardDescription}>
                Donate surplus food and help reduce waste
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ADMIN PANEL Card */}
        <TouchableOpacity
          style={[styles.adminCard, styles.adminPanelCard]}
          onPress={() => handleCardPress('admin')}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <Ionicons name="shield" size={30} color="#fff" />
            <Text style={styles.adminCardTitle}>ADMIN PANEL</Text>
            <Text style={styles.adminCardSubtitle}>System Administration</Text>
            <Text style={styles.adminCardDescription}>
              Secure access for authorized personnel
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ in 🏛️ Hyderabad</Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  mainCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 15, // Add a little distance between cards
  },
  mainCard: {
    flex: 1, // Allow cards to grow equally
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginVertical: 10,
    // Ensure consistent height for both cards
    minHeight: 250,
    justifyContent: 'center',
  },
  needFoodCard: {
    backgroundColor: '#4caf50',
  },
  haveFoodCard: {
    backgroundColor: '#ff6b35',
  },
  cardContent: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    marginBottom: 5,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 15,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 20,
  },
  adminCard: {
    borderRadius: 15,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    marginVertical: 10,
    alignSelf: 'center',
    width: '100%',
  },
  adminPanelCard: {
    backgroundColor: '#9c27b0',
  },
  adminCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  adminCardSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 10,
  },
  adminCardDescription: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 5,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default UserDashboardScreen;