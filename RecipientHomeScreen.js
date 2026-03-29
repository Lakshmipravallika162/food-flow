import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEnhancedAuth } from '../context/EnhancedAuthContext';
import { DataManagerNew } from '../utils/DataManagerNew';
// import LocationService from '../services/LocationService'; // Disabled - Maps API hidden
import { CardStyles } from '../styles/CardStyles';
import AnimatedCounter from '../components/AnimatedCounter';

const RecipientHomeScreen = ({ navigation }) => {
  const { user } = useEnhancedAuth();
  const [availablePosts, setAvailablePosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, veg, non-veg
  const [userLocation, setUserLocation] = useState(null);
  const [sortByDistance, setSortByDistance] = useState(false);

  useEffect(() => {
    loadAvailablePosts();
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      // Location services disabled - Maps API hidden
      // const location = await LocationService.getCurrentLocation();
      // if (location) {
      //   setUserLocation(location);
      // }
    } catch (error) {
      console.log('Could not get user location:', error);
      // Location is optional, so we don't show errors to user
    }
  };

  const loadAvailablePosts = async () => {
    setLoading(true);
    try {
      // Initialize sample data if this is the first time
      await DataManagerNew.initializeSampleData();
      const posts = await DataManagerNew.getAvailableFoodPosts();
      setAvailablePosts(posts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAvailablePosts();
    setRefreshing(false);
  };

  const filterPosts = () => {
    let filtered = [...availablePosts];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        post =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.donorName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply food type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(post => post.foodType === selectedFilter);
    }

    // Calculate distances if user location is available (disabled)
    // For demonstration purposes, we'll add a mock distance based on post ID
    // In a real implementation, this would use actual location data
    filtered = filtered.map(post => {
      // Mock distance calculation - in a real app this would use actual coordinates
      // We're using a simple algorithm based on post ID to simulate varying distances
      const mockDistance = (parseInt(post.id) || Math.floor(Math.random() * 100)) % 50;
      return { ...post, distance: mockDistance };
    });

    // Sort by distance if enabled
    if (sortByDistance) {
      filtered.sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    setFilteredPosts(filtered);
  };

  // Call filterPosts whenever dependencies change
  useEffect(() => {
    filterPosts();
  }, [availablePosts, searchQuery, selectedFilter, sortByDistance]);

  const handleClaimFood = (post) => {
    Alert.alert(
      'Claim Food',
      `Do you want to claim "${post.title}" from ${post.donorName || 'Restaurant'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Claim',
          onPress: async () => {
            try {
              // Check if user is defined before accessing user properties
              if (!user) {
                Alert.alert('Error', 'User not found. Please login again.');
                return;
              }
              
              const result = await DataManagerNew.claimFood(post.id, user.id, {
                name: user.name,
                email: user.email,
                organizationName: user.organizationName,
              });

              if (result.success) {
                Alert.alert('Success', 'Food claimed successfully! The restaurant will be notified.');
                await loadAvailablePosts();
                
                // Add notification to donor (functionality not implemented)
                // await DataManager.addNotification(post.donorId, {
                //   type: 'claim',
                //   title: 'Food Claimed',
                //   message: `Your food donation "${post.title}" has been claimed by ${user.organizationName || user.name}`,
                //   postId: post.id,
                // });
              } else {
                Alert.alert('Error', result.error || 'Failed to claim food');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to claim food. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleNavigateToFood = (post) => {
    // Maps functionality disabled
    Alert.alert(
      'Navigation Unavailable', 
      'Map navigation has been temporarily disabled. Please use the address information to find the location manually.\n\nAddress: ' + (post.address || 'Address not provided')
    );
  };

  const renderPostItem = ({ item }) => (
    <View style={CardStyles.interactiveCard}>
      <View style={styles.postHeader}>
        <View style={styles.postTitleContainer}>
          <Text style={styles.postTitle}>{item.title}</Text>
          <Text style={styles.donorName}>{item.donorName || 'Restaurant'}</Text>
        </View>
        <View style={[styles.foodTypeBadge, { backgroundColor: item.foodType === 'veg' ? '#4caf50' : '#ff6b35' }]}>
          <Text style={styles.foodTypeText}>{item.foodType?.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.postDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.postDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={16} color="#ff9800" />
          <Text style={styles.detailText}>{item.quantity} servings</Text>
        </View>
        {/* Show mock distance when sorting by distance is enabled */}
        {sortByDistance && item.distance !== undefined && (
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={16} color="#4caf50" />
            <Text style={styles.detailText}>{item.distance} km away</Text>
          </View>
        )}
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={16} color="#2196f3" />
          <Text style={styles.detailText} numberOfLines={1}>
            {item.address || 'Address not provided'}
          </Text>
        </View>
      </View>

      <View style={styles.postFooter}>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color="#f44336" />
          <Text style={styles.timeText}>
            {DataManagerNew.getTimeRemaining(item.expiryTime)}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          {item.latitude && item.longitude && (
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => handleNavigateToFood(item)}
            >
              <Ionicons name="navigate-outline" size={16} color="#2196f3" />
              <Text style={styles.navigateButtonText}>Navigate</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.claimButton}
            onPress={() => handleClaimFood(item)}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
            <Text style={styles.claimButtonText}>Claim</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFilterButton = (filter, label) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Food Available</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || selectedFilter !== 'all'
          ? 'Try adjusting your search or filters'
          : 'Check back later for new food donations in your area'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Find Food Near You</Text>
          <Text style={styles.userName}>{user?.organizationName || user?.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => {/* Navigate to notifications */}}
        >
          <Ionicons name="notifications-outline" size={24} color="#4caf50" />
        </TouchableOpacity>
      </View>

      {/* Impact Card without Stats */}
      <View style={[CardStyles.interactiveCard, styles.impactCard]}>
        <View style={styles.impactHeader}>
          <Ionicons name="heart" size={24} color="#4caf50" />
          <Text style={styles.impactTitle}>Your Food Impact</Text>
        </View>
        <Text style={styles.impactDescription}>
          You've received meals and helped your organization grow. Keep supporting your community!
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#7f8c8d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search food, restaurant..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle-outline" size={20} color="#7f8c8d" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterButtonsRow}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('veg', 'Vegetarian')}
          {renderFilterButton('non-veg', 'Non-Veg')}
        </View>
        {/* Distance sorting toggle - now enabled for demonstration */}
        <TouchableOpacity
          style={[
            styles.locationToggle,
            sortByDistance && styles.locationToggleActive,
          ]}
          onPress={() => setSortByDistance(!sortByDistance)}
        >
          <Ionicons 
            name={sortByDistance ? "location" : "location-outline"} 
            size={16} 
            color={sortByDistance ? "#fff" : "#4caf50"} 
          />
          <Text style={[
            styles.locationToggleText,
            sortByDistance && styles.locationToggleTextActive,
          ]}>
            Sort by Distance
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredPosts.length} food donation{filteredPosts.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      {/* Posts List */}
      <FlatList
        data={filteredPosts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContainer,
          filteredPosts.length === 0 && styles.emptyListContainer,
        ]}
      />

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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  greeting: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  notificationButton: {
    padding: 5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 10,
  },
  filterButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  locationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4caf50',
    gap: 6,
  },
  locationToggleActive: {
    backgroundColor: '#4caf50',
  },
  locationToggleText: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '500',
  },
  locationToggleTextActive: {
    color: '#fff',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  statsText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  postCard: {
    ...CardStyles.interactiveCard,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  postTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  donorName: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  foodTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  foodTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  postDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 12,
  },
  postDetails: {
    gap: 10,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timeText: {
    fontSize: 14,
    color: '#f44336',
    fontWeight: '500',
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2196f3',
    gap: 4,
  },
  navigateButtonText: {
    color: '#2196f3',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  impactCard: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  impactDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default RecipientHomeScreen;