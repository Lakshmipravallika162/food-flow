import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  Picker,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CardStyles } from '../styles/CardStyles';

const { width } = Dimensions.get('window');

const AdminPanelScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [refreshing, setRefreshing] = useState(false);
  const [bulkData, setBulkData] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    cuisine: '',
    description: '',
    website: '',
    operatingHours: '',
    capacity: '',
    rating: '4.0',
    verified: false,
    featured: false,
  });

  useEffect(() => {
    loadRestaurants();
    initializeSampleData();
  }, []);

  useEffect(() => {
    filterAndSortRestaurants();
  }, [restaurants, searchQuery, selectedFilter, sortBy]);

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

  const saveRestaurants = async (updatedRestaurants) => {
    try {
      await AsyncStorage.setItem('restaurants', JSON.stringify(updatedRestaurants));
      setRestaurants(updatedRestaurants);
    } catch (error) {
      console.error('Error saving restaurants:', error);
      Alert.alert('Error', 'Failed to save restaurant data');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Restaurant name is required');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Validation Error', 'Valid email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Validation Error', 'Phone number is required');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Validation Error', 'Address is required');
      return false;
    }
    return true;
  };

  const handleSaveRestaurant = async () => {
    if (!validateForm()) return;

    try {
      const newRestaurant = {
        id: editingRestaurant ? editingRestaurant.id : Date.now().toString(),
        ...formData,
        createdAt: editingRestaurant ? editingRestaurant.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
      };

      let updatedRestaurants;
      if (editingRestaurant) {
        updatedRestaurants = restaurants.map(restaurant =>
          restaurant.id === editingRestaurant.id ? newRestaurant : restaurant
        );
        Alert.alert('Success', 'Restaurant updated successfully!');
      } else {
        updatedRestaurants = [...restaurants, newRestaurant];
        Alert.alert('Success', 'Restaurant added successfully!');
      }

      await saveRestaurants(updatedRestaurants);
      resetForm();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving restaurant:', error);
      Alert.alert('Error', 'Failed to save restaurant');
    }
  };

  const handleEditRestaurant = (restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      email: restaurant.email,
      phone: restaurant.phone,
      address: restaurant.address,
      cuisine: restaurant.cuisine || '',
      description: restaurant.description || '',
    });
    setShowAddModal(true);
  };

  const handleDeleteRestaurant = (restaurant) => {
    Alert.alert(
      'Delete Restaurant',
      `Are you sure you want to delete "${restaurant.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedRestaurants = restaurants.filter(r => r.id !== restaurant.id);
            await saveRestaurants(updatedRestaurants);
            Alert.alert('Success', 'Restaurant deleted successfully!');
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      cuisine: '',
      description: '',
      website: '',
      operatingHours: '',
      capacity: '',
      rating: '4.0',
      verified: false,
      featured: false,
    });
    setEditingRestaurant(null);
  };

  const initializeSampleData = async () => {
    try {
      const existing = await AsyncStorage.getItem('restaurants');
      if (!existing || JSON.parse(existing).length === 0) {
        const hyderabadRestaurants = [
          {
            id: '1',
            name: 'Paradise Biryani',
            email: 'contact@paradisebiryani.com',
            phone: '+91 40 2763 3888',
            address: 'Madhapur / Secunderabad, Hyderabad, Telangana',
            cuisine: 'Hyderabadi, Biryani',
            description: 'World-famous Paradise Biryani serving authentic Hyderabadi biryani since 1953. Known for its aromatic basmati rice and tender meat.',
            website: 'https://paradisebiryani.com',
            operatingHours: '11:00 AM - 11:00 PM',
            capacity: '200',
            rating: '4.6',
            verified: true,
            featured: true,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Shah Ghouse Café',
            email: 'info@shahghouse.com',
            phone: '+91 40 2355 2957',
            address: 'Tolichowki / Gachibowli, Hyderabad, Telangana',
            cuisine: 'Hyderabadi, Mughlai',
            description: 'Legendary Shah Ghouse serving authentic Hyderabadi and Mughlai cuisine. Famous for their biryani, haleem, and kebabs.',
            website: 'https://shahghouse.com',
            operatingHours: '10:00 AM - 11:30 PM',
            capacity: '150',
            rating: '4.5',
            verified: true,
            featured: true,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Bawarchi',
            email: 'contact@bawarchihyderabad.com',
            phone: '+91 40 2761 2912',
            address: 'Nallakunta, Hyderabad, Telangana',
            cuisine: 'Biryani, North Indian',
            description: 'Popular Bawarchi restaurant known for its flavorful biryanis and North Indian delicacies. A favorite among locals and tourists.',
            website: 'https://bawarchi.com',
            operatingHours: '11:30 AM - 11:00 PM',
            capacity: '120',
            rating: '4.4',
            verified: true,
            featured: false,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '4',
            name: 'ITC Kakatiya - Dakshin',
            email: 'dakshin@itchotels.in',
            phone: '+91 40 2340 0132',
            address: 'Begumpet, Hyderabad, Telangana',
            cuisine: 'South Indian, Fine Dining',
            description: 'Premium South Indian fine dining restaurant at ITC Kakatiya. Authentic regional cuisines from Tamil Nadu, Kerala, Karnataka, and Andhra Pradesh.',
            website: 'https://itchotels.com/dakshin',
            operatingHours: '7:00 PM - 11:30 PM',
            capacity: '80',
            rating: '4.8',
            verified: true,
            featured: true,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '5',
            name: 'Feast (Sheraton Hyderabad)',
            email: 'feast@sheratonhyderabad.com',
            phone: '+91 40 4949 4949',
            address: 'Gachibowli, Hyderabad, Telangana',
            cuisine: 'Multi-cuisine, Buffet',
            description: 'Lavish multi-cuisine buffet restaurant at Sheraton Hyderabad. Features live cooking stations and international cuisines.',
            website: 'https://sheratonhyderabad.com/feast',
            operatingHours: '6:30 AM - 11:00 PM',
            capacity: '180',
            rating: '4.7',
            verified: true,
            featured: true,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '6',
            name: 'Adaa - Taj Falaknuma Palace',
            email: 'adaa@tajhotels.com',
            phone: '+91 40 6629 8585',
            address: 'Falaknuma, Hyderabad, Telangana',
            cuisine: 'Hyderabadi, Luxury Dining',
            description: 'Opulent Hyderabadi cuisine at the magnificent Taj Falaknuma Palace. Royal dining experience with authentic Nizami flavors.',
            website: 'https://tajhotels.com/falaknuma-palace/adaa',
            operatingHours: '7:30 PM - 11:30 PM',
            capacity: '60',
            rating: '4.9',
            verified: true,
            featured: true,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '7',
            name: 'Café Bahar',
            email: 'info@cafebahar.com',
            phone: '+91 40 2323 1121',
            address: 'Basheer Bagh, Hyderabad, Telangana',
            cuisine: 'Biryani, Casual Dining',
            description: 'Historic Café Bahar serving delicious biryani and Hyderabadi specialties since 1973. Known for its consistent taste and quality.',
            website: 'https://cafebahar.com',
            operatingHours: '11:00 AM - 11:00 PM',
            capacity: '100',
            rating: '4.3',
            verified: true,
            featured: false,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '8',
            name: 'Pista House',
            email: 'contact@pistahouse.in',
            phone: '+91 40 2452 4872',
            address: 'Multiple Locations (Charminar, Gachibowli), Hyderabad, Telangana',
            cuisine: 'Hyderabadi, Haleem, Bakery',
            description: 'Famous Pista House known for its award-winning haleem, biryanis, and bakery items. Multiple locations across Hyderabad.',
            website: 'https://pistahouse.in',
            operatingHours: '10:00 AM - 11:00 PM',
            capacity: '120',
            rating: '4.4',
            verified: true,
            featured: false,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '9',
            name: 'Hotel Shadab',
            email: 'info@hotelshadab.com',
            phone: '+91 40 2452 4872',
            address: 'Charminar, Hyderabad, Telangana',
            cuisine: 'Hyderabadi, Mughlai',
            description: 'Traditional Hotel Shadab near Charminar serving authentic Hyderabadi and Mughlai cuisine. Famous for its biryani and kebabs.',
            website: 'https://hotelshadab.com',
            operatingHours: '11:00 AM - 11:30 PM',
            capacity: '90',
            rating: '4.2',
            verified: true,
            featured: false,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '10',
            name: 'Meridian Restaurant',
            email: 'contact@meridianrestaurant.com',
            phone: '+91 40 2335 4455',
            address: 'Panjagutta, Hyderabad, Telangana',
            cuisine: 'Multi-cuisine, North Indian',
            description: 'Popular Meridian Restaurant offering multi-cuisine and North Indian dishes. Known for its consistent quality and reasonable prices.',
            website: 'https://meridianrestaurant.com',
            operatingHours: '11:00 AM - 11:00 PM',
            capacity: '110',
            rating: '4.1',
            verified: false,
            featured: false,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '11',
            name: 'Mehfil',
            email: 'info@mehfilhyderabad.com',
            phone: '+91 40 6661 7333',
            address: 'Jubilee Hills, Hyderabad',
            cuisine: 'Hyderabadi, Non-Veg',
            description: 'Popular restaurant in Jubilee Hills serving authentic Hyderabadi non-vegetarian cuisine.',
            website: '',
            operatingHours: '11:00 AM - 11:00 PM',
            capacity: '100',
            rating: '4.5',
            verified: true,
            featured: false,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '12',
            name: 'Paradise',
            email: 'contact@paradisehyderabad.com',
            phone: '+91 40 2753 1122',
            address: 'Secunderabad, Hyderabad',
            cuisine: 'Hyderabadi, Non-Veg',
            description: 'Famous Paradise restaurant in Secunderabad serving authentic Hyderabadi biryani and non-vegetarian dishes.',
            website: '',
            operatingHours: '11:00 AM - 11:00 PM',
            capacity: '150',
            rating: '4.6',
            verified: true,
            featured: true,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '13',
            name: 'Bawarchi',
            email: 'contact@bawarchihyderabad.com',
            phone: '+91 40 2752 9999',
            address: 'RTC X Roads, Hyderabad',
            cuisine: 'Hyderabadi, Non-Veg',
            description: 'Well-known Bawarchi restaurant at RTC X Roads serving delicious Hyderabadi non-vegetarian cuisine.',
            website: '',
            operatingHours: '11:00 AM - 11:00 PM',
            capacity: '120',
            rating: '4.4',
            verified: true,
            featured: false,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '14',
            name: 'Chutneys',
            email: 'info@chutneyshyderabad.com',
            phone: '+91 40 2353 2222',
            address: 'Begumpet, Hyderabad',
            cuisine: 'South Indian, Veg',
            description: 'Popular Chutneys restaurant in Begumpet serving authentic South Indian vegetarian cuisine.',
            website: '',
            operatingHours: '8:00 AM - 10:00 PM',
            capacity: '80',
            rating: '4.3',
            verified: true,
            featured: false,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '15',
            name: 'Ohri’s',
            email: 'contact@ohrishyderabad.com',
            phone: '+91 40 2340 1111',
            address: 'Hyderabad',
            cuisine: 'Multi-cuisine, Non-Veg',
            description: 'Well-established Ohri\'s restaurant with multiple locations across Hyderabad serving non-vegetarian cuisine.',
            website: '',
            operatingHours: '11:00 AM - 11:00 PM',
            capacity: '200',
            rating: '4.5',
            verified: true,
            featured: true,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '16',
            name: 'Pakka Local',
            email: 'info@pakkalocal.com',
            phone: '+91 96140 30405',
            address: 'Banjara Hills, Hyderabad',
            cuisine: 'Indian, Veg/Non-Veg',
            description: 'Local favorite Pakka Local in Banjara Hills serving both vegetarian and non-vegetarian Indian dishes.',
            website: '',
            operatingHours: '11:00 AM - 11:00 PM',
            capacity: '60',
            rating: '4.2',
            verified: false,
            featured: false,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '17',
            name: 'Gabru Di Chaap',
            email: 'contact@gabrudichaap.com',
            phone: '+91 89778 67672',
            address: 'Punjagutta, Hyderabad',
            cuisine: 'North Indian, Veg',
            description: 'Popular Gabru Di Chaap restaurant in Punjagutta specializing in vegetarian North Indian dishes.',
            website: '',
            operatingHours: '11:00 AM - 11:00 PM',
            capacity: '50',
            rating: '4.1',
            verified: false,
            featured: false,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '18',
            name: 'Parampara – Flavours Of India',
            email: 'info@paramparahyderabad.com',
            phone: '+91 80749 32383',
            address: 'Banjara Hills, Hyderabad',
            cuisine: 'Indian, Veg',
            description: 'Parampara restaurant in Banjara Hills offering authentic vegetarian Indian flavors.',
            website: '',
            operatingHours: '11:00 AM - 10:00 PM',
            capacity: '70',
            rating: '4.3',
            verified: false,
            featured: false,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        await saveRestaurants(hyderabadRestaurants);
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  };

  const filterAndSortRestaurants = () => {
    let filtered = restaurants.filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           restaurant.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (selectedFilter === 'all') return matchesSearch;
      if (selectedFilter === 'verified') return matchesSearch && restaurant.verified;
      if (selectedFilter === 'featured') return matchesSearch && restaurant.featured;
      if (selectedFilter === 'active') return matchesSearch && restaurant.status === 'active';
      
      return matchesSearch;
    });

    // Sort restaurants
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return parseFloat(b.rating) - parseFloat(a.rating);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'updated':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        default:
          return 0;
      }
    });

    setFilteredRestaurants(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRestaurants();
    setRefreshing(false);
  };

  const handleBulkImport = async () => {
    if (!bulkData.trim()) {
      Alert.alert('Error', 'Please enter restaurant data');
      return;
    }

    try {
      const lines = bulkData.trim().split('\n');
      const newRestaurants = [];
      
      for (let line of lines) {
        const [name, email, phone, address, cuisine] = line.split(',').map(item => item.trim());
        if (name && email && phone && address) {
          newRestaurants.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name,
            email,
            phone,
            address,
            cuisine: cuisine || 'General',
            description: '',
            website: '',
            operatingHours: '9:00 AM - 9:00 PM',
            capacity: '50',
            rating: '4.0',
            verified: false,
            featured: false,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      if (newRestaurants.length > 0) {
        const updatedRestaurants = [...restaurants, ...newRestaurants];
        await saveRestaurants(updatedRestaurants);
        setBulkData('');
        setShowBulkImportModal(false);
        Alert.alert('Success', `${newRestaurants.length} restaurants imported successfully!`);
      } else {
        Alert.alert('Error', 'No valid restaurant data found. Please check the format.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to import restaurants. Please check the data format.');
    }
  };

  const toggleRestaurantStatus = async (restaurant) => {
    const updatedRestaurants = restaurants.map(r => 
      r.id === restaurant.id 
        ? { ...r, status: r.status === 'active' ? 'inactive' : 'active', updatedAt: new Date().toISOString() }
        : r
    );
    await saveRestaurants(updatedRestaurants);
  };

  const toggleVerification = async (restaurant) => {
    const updatedRestaurants = restaurants.map(r => 
      r.id === restaurant.id 
        ? { ...r, verified: !r.verified, updatedAt: new Date().toISOString() }
        : r
    );
    await saveRestaurants(updatedRestaurants);
  };

  const toggleFeatured = async (restaurant) => {
    const updatedRestaurants = restaurants.map(r => 
      r.id === restaurant.id 
        ? { ...r, featured: !r.featured, updatedAt: new Date().toISOString() }
        : r
    );
    await saveRestaurants(updatedRestaurants);
  };

  const exportData = async () => {
    try {
      const exportText = restaurants.map(r => 
        `${r.name},${r.email},${r.phone},${r.address},${r.cuisine}`
      ).join('\n');
      
      Alert.alert(
        'Export Data',
        'Restaurant data (CSV format):\n\n' + exportText.substring(0, 200) + '...',
        [
          { text: 'Copy to Clipboard', onPress: () => {
            // In a real app, you'd use Clipboard API
            Alert.alert('Success', 'Data copied to clipboard');
          }},
          { text: 'OK' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleCloseModal = () => {
    resetForm();
    setShowAddModal(false);
  };

  const renderRestaurantItem = ({ item }) => (
    <View style={[CardStyles.interactiveCard, styles.restaurantCard]}>
      <View style={styles.restaurantHeader}>
        <View style={styles.restaurantInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.restaurantName}>{item.name}</Text>
            <View style={styles.badges}>
              {item.verified && (
                <View style={[styles.badge, styles.verifiedBadge]}>
                  <Ionicons name="checkmark-circle" size={12} color="#fff" />
                  <Text style={styles.badgeText}>Verified</Text>
                </View>
              )}
              {item.featured && (
                <View style={[styles.badge, styles.featuredBadge]}>
                  <Ionicons name="star" size={12} color="#fff" />
                  <Text style={styles.badgeText}>Featured</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.restaurantCuisine}>{item.cuisine || 'General'}</Text>
          <Text style={styles.restaurantEmail}>{item.email}</Text>
          <View style={styles.ratingRow}>
            <View style={styles.rating}>
              <Ionicons name="star" size={14} color="#ffc107" />
              <Text style={styles.ratingText}>{item.rating || '4.0'}</Text>
            </View>
            {item.capacity && (
              <Text style={styles.capacityText}>Capacity: {item.capacity}</Text>
            )}
          </View>
        </View>
        <View style={styles.restaurantActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditRestaurant(item)}
          >
            <Ionicons name="pencil" size={18} color="#4caf50" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteRestaurant(item)}
          >
            <Ionicons name="trash" size={18} color="#f44336" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.restaurantDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="call" size={16} color="#666" />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.detailText}>{item.address}</Text>
        </View>
        {item.website && (
          <View style={styles.detailRow}>
            <Ionicons name="globe" size={16} color="#666" />
            <Text style={styles.detailText}>{item.website}</Text>
          </View>
        )}
        {item.operatingHours && (
          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.detailText}>{item.operatingHours}</Text>
          </View>
        )}
      </View>
      <View style={styles.restaurantFooter}>
        <Text style={styles.dateText}>
          Added: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#4caf50' : '#f44336' }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Restaurants Added</Text>
      <Text style={styles.emptySubtitle}>
        Start by adding restaurant partners to the system
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.emptyButtonText}>Add First Restaurant</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#4caf50" />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Panel</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{restaurants.length}</Text>
          <Text style={styles.statLabel}>Total Restaurants</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {restaurants.filter(r => r.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {new Set(restaurants.map(r => r.cuisine)).size}
          </Text>
          <Text style={styles.statLabel}>Cuisines</Text>
        </View>
      </View>

      {/* Restaurant List */}
      <FlatList
        data={restaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Add/Edit Restaurant Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseModal}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingRestaurant ? 'Edit Restaurant' : 'Add Restaurant'}
            </Text>
            <TouchableOpacity onPress={handleSaveRestaurant}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Restaurant Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Enter restaurant name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="restaurant@example.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                placeholder="Enter full address"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cuisine Type</Text>
              <TextInput
                style={styles.input}
                value={formData.cuisine}
                onChangeText={(value) => handleInputChange('cuisine', value)}
                placeholder="e.g., Italian, Chinese, Indian"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Brief description about the restaurant"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Website</Text>
              <TextInput
                style={styles.input}
                value={formData.website}
                onChangeText={(value) => handleInputChange('website', value)}
                placeholder="https://restaurant-website.com"
                placeholderTextColor="#999"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Operating Hours</Text>
              <TextInput
                style={styles.input}
                value={formData.operatingHours}
                onChangeText={(value) => handleInputChange('operatingHours', value)}
                placeholder="9:00 AM - 10:00 PM"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Capacity</Text>
                <TextInput
                  style={styles.input}
                  value={formData.capacity}
                  onChangeText={(value) => handleInputChange('capacity', value)}
                  placeholder="100"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>Rating</Text>
                <TextInput
                  style={styles.input}
                  value={formData.rating}
                  onChangeText={(value) => handleInputChange('rating', value)}
                  placeholder="4.0"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>Verified Restaurant</Text>
                <Switch
                  value={formData.verified}
                  onValueChange={(value) => handleInputChange('verified', value)}
                  trackColor={{ false: '#e0e0e0', true: '#4caf50' }}
                  thumbColor={formData.verified ? '#fff' : '#f4f3f4'}
                />
              </View>
              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>Featured Restaurant</Text>
                <Switch
                  value={formData.featured}
                  onValueChange={(value) => handleInputChange('featured', value)}
                  trackColor={{ false: '#e0e0e0', true: '#ff6b35' }}
                  thumbColor={formData.featured ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        visible={showBulkImportModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowBulkImportModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Bulk Import</Text>
            <TouchableOpacity onPress={handleBulkImport}>
              <Text style={styles.saveButton}>Import</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CSV Data Format:</Text>
              <Text style={styles.formatExample}>
                Name, Email, Phone, Address, Cuisine{"\n"}
                Example: Green Valley, contact@green.com, +91 9876543210, 123 Street, Indian
              </Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Restaurant Data *</Text>
              <TextInput
                style={[styles.input, styles.bulkTextArea]}
                value={bulkData}
                onChangeText={setBulkData}
                placeholder="Paste your restaurant data here...\nEach line should contain: Name, Email, Phone, Address, Cuisine"
                placeholderTextColor="#999"
                multiline
                numberOfLines={10}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ in 🏛️ Hyderabad</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    backgroundColor: '#4caf50',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButton: {
    backgroundColor: '#2196f3',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulkImportButton: {
    backgroundColor: '#ff9800',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: '#4caf50',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
  },
  sortText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  restaurantCard: {
    marginBottom: 15,
    padding: 15,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  restaurantInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  verifiedBadge: {
    backgroundColor: '#4caf50',
  },
  featuredBadge: {
    backgroundColor: '#ff6b35',
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '500',
    marginBottom: 3,
  },
  restaurantEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  capacityText: {
    fontSize: 12,
    color: '#666',
  },
  restaurantActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#e8f5e8',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#ffebee',
  },
  restaurantDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  restaurantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  emptyButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  saveButton: {
    fontSize: 16,
    color: '#4caf50',
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  bulkTextArea: {
    height: 200,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  switchRow: {
    marginTop: 10,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  formatExample: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
});

export default AdminPanelScreen;