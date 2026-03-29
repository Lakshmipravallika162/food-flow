import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEnhancedAuth } from '../context/EnhancedAuthContext';
import { DataManagerNew } from '../utils/DataManagerNew';
import LocationService from '../services/LocationService'; // Disabled - Maps API hidden
import { CardStyles } from '../styles/CardStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FoodDonationForm = ({ navigation }) => {
  const { user } = useEnhancedAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    foodType: 'veg', // 'veg' or 'non-veg'
    quantity: '',
    expiryTime: '',
    address: '',
    phoneNumber: user?.phoneNumber || '', // Add phone number field
    restaurantName: user?.organizationName || user?.name || '', // Add restaurant name field
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const stored = await AsyncStorage.getItem('restaurants');
      if (stored) {
        setRestaurants(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant permission to access your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData(prev => ({
          ...prev,
          image: result.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const getCurrentLocation = async () => {
    // Location services disabled - Maps API hidden
    Alert.alert(
      'Location Services Disabled',
      'Automatic location detection has been temporarily disabled. Please enter your address manually in the field below.',
      [{ text: 'OK' }]
    );
  };

  const selectRestaurant = (restaurant) => {
    setFormData(prev => ({
      ...prev,
      address: restaurant.address,
      phoneNumber: restaurant.phone,
      restaurantName: restaurant.name,
    }));
    setShowRestaurantModal(false);
  };

  const handleManualEntry = () => {
    // Keep current values for manual editing
    setShowRestaurantModal(false);
  };

  const validateForm = () => {
    const { title, description, quantity, expiryTime, address, phoneNumber, restaurantName } = formData;
    
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a food title');
      return false;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    
    if (!quantity.trim() || isNaN(quantity) || parseInt(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity (number of servings)');
      return false;
    }
    
    if (!expiryTime.trim()) {
      Alert.alert('Error', 'Please enter expiry time (e.g., "2 hours", "6 hours")');
      return false;
    }
    
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter pickup address');
      return false;
    }
    
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    
    if (!restaurantName.trim()) {
      Alert.alert('Error', 'Please enter restaurant name');
      return false;
    }
    
    // Validate phone number format (basic validation)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      Alert.alert('Error', 'Please enter a valid phone number (10-15 digits)');
      return false;
    }
    
    return true;
  };

  const calculateExpiryDateTime = (expiryTimeStr) => {
    const now = new Date();
    const timeMatch = expiryTimeStr.match(/(\d+)\s*(hour|hours|h|hr)/i);
    
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      return new Date(now.getTime() + hours * 60 * 60 * 1000);
    }
    
    // Default to 4 hours if format not recognized
    return new Date(now.getTime() + 4 * 60 * 60 * 1000);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const expiryDateTime = calculateExpiryDateTime(formData.expiryTime);
      
      // Check if user is defined before accessing user properties
      if (!user) {
        Alert.alert('Error', 'User not found. Please login again.');
        return;
      }
      
      const postData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        foodType: formData.foodType,
        quantity: parseInt(formData.quantity),
        expiryTime: expiryDateTime.toISOString(),
        address: formData.address.trim(),
        phoneNumber: formData.phoneNumber.trim(), // Include phone number
        donorId: user.id,
        donorName: formData.restaurantName.trim(), // Use restaurant name
        donorEmail: user.email,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };
      
      const result = await DataManagerNew.saveFoodPost(postData);
      
      if (result.success) {
        Alert.alert(
          'Success!',
          'Your food donation has been posted successfully. NGOs in your area will be notified.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setFormData({
                  title: '',
                  description: '',
                  foodType: 'veg',
                  quantity: '',
                  expiryTime: '',
                  address: '',
                  phoneNumber: user?.phoneNumber || '',
                  restaurantName: user?.organizationName || user?.name || '',
                  image: null,
                });
                // Navigate to home screen
                navigation.navigate('Home');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to save food donation');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save food donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRestaurantItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.restaurantItem}
      onPress={() => selectRestaurant(item)}
    >
      <View style={styles.restaurantItemContent}>
        <Text style={styles.restaurantItemName}>{item.name}</Text>
        <Text style={styles.restaurantItemAddress} numberOfLines={1}>{item.address}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Donate Food</Text>
          <Text style={styles.subtitle}>Help reduce food waste and feed those in need</Text>
        </View>

        {/* Show error if user is not defined */}
        {!user && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>User not found. Please login again.</Text>
          </View>
        )}

        {/* Form */}
        <View style={[styles.form, !user && styles.formDisabled]}>
          {/* Restaurant Card */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Restaurant Information</Text>
            <View style={CardStyles.interactiveCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="business-outline" size={20} color="#ff6b35" />
                <Text style={styles.cardTitle}>Restaurant Details</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardText}>
                  <Text style={styles.cardLabel}>Name: </Text>
                  {user?.organizationName || user?.name || 'Not available'}
                </Text>
                <Text style={styles.cardText}>
                  <Text style={styles.cardLabel}>Email: </Text>
                  {user?.email || 'Not available'}
                </Text>
              </View>
            </View>
          </View>

          {/* Restaurant Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Restaurant Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter restaurant name"
              value={formData.restaurantName}
              onChangeText={(value) => handleInputChange('restaurantName', value)}
            />
          </View>

          {/* Mobile Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit mobile number"
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange('phoneNumber', value)}
              keyboardType="phone-pad"
            />
          </View>

          {/* Food Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Food Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Fresh Biryani, Mixed Vegetables"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the food items, freshness, and any special instructions"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Food Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Food Type *</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioOption,
                  formData.foodType === 'veg' && styles.radioOptionSelected,
                ]}
                onPress={() => handleInputChange('foodType', 'veg')}
              >
                <View style={[styles.radioCircle, formData.foodType === 'veg' && styles.radioCircleSelected]}>
                  <View style={styles.vegIndicator} />
                </View>
                <Text style={styles.radioText}>Vegetarian</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.radioOption,
                  formData.foodType === 'non-veg' && styles.radioOptionSelected,
                ]}
                onPress={() => handleInputChange('foodType', 'non-veg')}
              >
                <View style={[styles.radioCircle, formData.foodType === 'non-veg' && styles.radioCircleSelected]}>
                  <View style={styles.nonVegIndicator} />
                </View>
                <Text style={styles.radioText}>Non-Vegetarian</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quantity */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantity (Number of Servings) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 50"
              value={formData.quantity}
              onChangeText={(value) => handleInputChange('quantity', value)}
              keyboardType="numeric"
            />
          </View>

          {/* Expiry Time */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expiry Time *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2 hours, 4 hours, 6 hours"
              value={formData.expiryTime}
              onChangeText={(value) => handleInputChange('expiryTime', value)}
            />
            <Text style={styles.helper}>How long will this food stay fresh?</Text>
          </View>

          {/* Restaurant Name Card (as per specification) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Selected Restaurant</Text>
            <View style={CardStyles.primaryCard}>
              <View style={styles.restaurantNameCard}>
                <Ionicons name="restaurant" size={20} color="#4caf50" />
                <Text style={styles.restaurantNameText}>{formData.restaurantName}</Text>
              </View>
            </View>
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pickup Address *</Text>
            <View style={styles.addressContainer}>
              <TextInput
                style={[styles.input, styles.addressInput]}
                placeholder="Enter pickup address"
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                multiline
              />
              <TouchableOpacity
                style={[styles.locationButton, styles.locationButtonEnabled]}
                onPress={() => setShowRestaurantModal(true)}
              >
                <Ionicons 
                  name="list" 
                  size={20} 
                  color="#4caf50" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Image Upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Food Image (Optional)</Text>
            {formData.image ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: formData.image }} style={styles.selectedImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setFormData(prev => ({ ...prev, image: null }))}
                >
                  <Ionicons name="close-circle" size={24} color="#f44336" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
                <Ionicons name="camera-outline" size={32} color="#7f8c8d" />
                <Text style={styles.imageUploadText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Posting...' : 'Post Donation'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Restaurant Selection Modal */}
        <Modal
          visible={showRestaurantModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowRestaurantModal(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Restaurant</Text>
              <TouchableOpacity onPress={handleManualEntry}>
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={20} color="#7f8c8d" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search restaurants..."
                  onChangeText={(text) => {
                    // Simple filter implementation
                    // In a real app, you might want to implement proper search
                  }}
                />
              </View>
            </View>

            <FlatList
              data={restaurants}
              renderItem={renderRestaurantItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.restaurantList}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="restaurant" size={60} color="#ccc" />
                  <Text style={styles.emptyText}>No restaurants available</Text>
                  <Text style={styles.emptySubtext}>Please enter address manually</Text>
                </View>
              }
              ListHeaderComponent={
                <View style={styles.manualEntryOption}>
                  <TouchableOpacity 
                    style={styles.manualEntryButton}
                    onPress={handleManualEntry}
                  >
                    <Ionicons name="create" size={20} color="#ff6b35" />
                    <Text style={styles.manualEntryText}>Enter Address Manually</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </SafeAreaView>
        </Modal>

        {/* Footer */}
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
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 22,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    ...CardStyles.minimalCard,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helper: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 20,
  },
  radioOption: {
    ...CardStyles.minimalCard,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
  },
  radioOptionSelected: {
    borderColor: '#ff6b35',
    backgroundColor: '#fff5f2',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#ff6b35',
  },
  vegIndicator: {
    width: 8,
    height: 8,
    backgroundColor: '#4caf50',
    borderRadius: 4,
  },
  nonVegIndicator: {
    width: 8,
    height: 8,
    backgroundColor: '#f44336',
    borderRadius: 4,
  },
  radioText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressInput: {
    flex: 1,
    marginRight: 10,
    minHeight: 52,
  },
  locationButton: {
    ...CardStyles.minimalCard,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButtonDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.5,
  },
  locationButtonEnabled: {
    backgroundColor: '#e8f5e8',
  },
  imageUploadButton: {
    ...CardStyles.minimalCard,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    ...CardStyles.primaryCard,
    margin: 20,
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  formDisabled: {
    opacity: 0.5,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  // New styles for restaurant card
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
  },
  cardContent: {
    paddingLeft: 30,
  },
  cardText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 5,
  },
  cardLabel: {
    fontWeight: 'bold',
    color: '#7f8c8d',
  },
  // Restaurant selection styles
  restaurantNameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  restaurantNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  doneButton: {
    fontSize: 16,
    color: '#ff6b35',
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  manualEntryOption: {
    marginBottom: 10,
  },
  manualEntryButton: {
    ...CardStyles.interactiveCard,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  manualEntryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b35',
    marginLeft: 10,
  },
});

export default FoodDonationForm;