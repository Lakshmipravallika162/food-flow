import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RoleSelectionScreen = ({ navigation }) => {
  const handleRoleSelection = (role) => {
    navigation.navigate('Login', { selectedRole: role });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>FoodFlow</Text>
          <Text style={styles.subtitle}>Connecting Hearts, Sharing Meals</Text>
          <View style={styles.iconContainer}>
            <Ionicons name="restaurant" size={60} color="#ff6b35" />
            <Ionicons name="heart" size={40} color="#ff6b35" style={styles.heartIcon} />
          </View>
        </View>

        {/* Role Selection Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.roleButton, styles.needFoodButton]}
            onPress={() => handleRoleSelection('recipient')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="search" size={50} color="#fff" />
              <Text style={styles.buttonTitle}>I NEED FOOD</Text>
              <Text style={styles.buttonSubtitle}>NGOs & Organizations</Text>
              <Text style={styles.buttonDescription}>
                Find available food donations from restaurants near you
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleButton, styles.haveFoodButton]}
            onPress={() => handleRoleSelection('donor')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="restaurant" size={50} color="#fff" />
              <Text style={styles.buttonTitle}>I HAVE FOOD</Text>
              <Text style={styles.buttonSubtitle}>Restaurants & Businesses</Text>
              <Text style={styles.buttonDescription}>
                Donate surplus food and help reduce waste
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ in 🏛️ Hyderabad</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    marginLeft: -10,
    marginTop: -20,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  roleButton: {
    borderRadius: 20,
    padding: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginVertical: 10,
  },
  needFoodButton: {
    backgroundColor: '#4caf50',
  },
  haveFoodButton: {
    backgroundColor: '#ff6b35',
  },
  buttonContent: {
    alignItems: 'center',
  },
  buttonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    marginBottom: 5,
  },
  buttonSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 10,
  },
  buttonDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default RoleSelectionScreen;