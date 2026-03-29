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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useEnhancedAuth } from '../context/EnhancedAuthContext';
import { DataManagerNew } from '../utils/DataManagerNew';
import { CardStyles } from '../styles/CardStyles';

const ClaimManagementScreen = ({ navigation }) => {
  const { user, userRole } = useEnhancedAuth();
  const [claims, setClaims] = useState([]);
  const [foodPosts, setFoodPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadClaimsData();
  }, []);

  const loadClaimsData = async () => {
    setLoading(true);
    try {
      let claimsData = [];
      const allPosts = await DataManagerNew.getFoodPosts();
      
      // Check if user is defined before accessing user.id
      if (user && user.id) {
        if (userRole === 'ngo') {
          claimsData = await DataManagerNew.getClaimsByRecipient(user.id);
        } else {
          claimsData = await DataManagerNew.getClaimsByDonor(user.id);
        }
      }
      
      setClaims(claimsData);
      setFoodPosts(allPosts);
    } catch (error) {
      console.error('Error loading claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClaimsData();
    setRefreshing(false);
  };

  const updateClaimStatus = async (claimId, newStatus) => {
    try {
      // In a real app, this would update the claim in the database
      const updatedClaims = claims.map(claim =>
        claim.id === claimId ? { ...claim, status: newStatus } : claim
      );
      setClaims(updatedClaims);
      
      // Update AsyncStorage
      const allClaims = await DataManagerNew.getClaims();
      const updatedAllClaims = allClaims.map(claim =>
        claim.id === claimId ? { ...claim, status: newStatus } : claim
      );
      
      await AsyncStorage.setItem('claims', JSON.stringify(updatedAllClaims));
      
      Alert.alert('Success', `Claim marked as ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update claim status');
    }
  };

  const handleMarkPickedUp = (claimId) => {
    Alert.alert(
      'Mark as Picked Up',
      'Confirm that the food has been picked up?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => updateClaimStatus(claimId, 'picked_up'),
        },
      ]
    );
  };

  const handleCancelClaim = (claimId) => {
    Alert.alert(
      'Cancel Claim',
      'Are you sure you want to cancel this claim?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => updateClaimStatus(claimId, 'cancelled'),
        },
      ]
    );
  };

  const getPostDetails = (postId) => {
    return foodPosts.find(post => post.id === postId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'claimed':
        return '#ff9800';
      case 'picked_up':
        return '#4caf50';
      case 'cancelled':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'claimed':
        return 'Claimed';
      case 'picked_up':
        return 'Picked Up';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const renderClaimItem = ({ item }) => {
    const postDetails = getPostDetails(item.postId);
    
    if (!postDetails) {
      return null; // Post might have been deleted
    }

    return (
      <View style={CardStyles.interactiveCard}>
        <View style={styles.claimHeader}>
          <View style={styles.claimTitleContainer}>
            <Text style={styles.foodTitle}>{postDetails.title}</Text>
            <Text style={styles.claimDate}>
              Claimed on {new Date(item.claimedAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <Text style={styles.foodDescription} numberOfLines={2}>
          {postDetails.description}
        </Text>

        <View style={styles.claimDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="leaf-outline" size={16} color="#4caf50" />
            <Text style={styles.detailText}>{postDetails.foodType?.toUpperCase()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={16} color="#ff9800" />
            <Text style={styles.detailText}>{postDetails.quantity} servings</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#f44336" />
            <Text style={styles.detailText}>
              {DataManagerNew.getTimeRemaining(postDetails.expiryTime)}
            </Text>
          </View>
        </View>

        {userRole === 'restaurant' && (
          <View style={styles.claimInfo}>
            <Text style={styles.claimedByText}>
              Claimed by: {item.recipientInfo?.organizationName || item.recipientInfo?.name}
            </Text>
            <Text style={styles.claimedByEmail}>
              Contact: {item.recipientInfo?.email}
            </Text>
          </View>
        )}

        {userRole === 'ngo' && (
          <View style={styles.donorInfo}>
            <Text style={styles.donorText}>
              Restaurant: {postDetails.donorName}
            </Text>
            <View style={styles.addressContainer}>
              <Ionicons name="location-outline" size={16} color="#2196f3" />
              <Text style={styles.addressText} numberOfLines={2}>
                {postDetails.address}
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {item.status === 'claimed' && (
          <View style={styles.actionButtons}>
            {userRole === 'restaurant' ? (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleMarkPickedUp(item.id)}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Mark Picked Up</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleCancelClaim(item.id)}
              >
                <Ionicons name="close-circle-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Cancel Claim</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name={userRole === 'restaurant' ? "list-outline" : "checkmark-circle-outline"} 
        size={80} 
        color="#ccc" 
      />
      <Text style={styles.emptyTitle}>
        {userRole === 'restaurant' ? 'No Claims Yet' : 'No Claimed Items'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {userRole === 'restaurant' 
          ? 'When NGOs claim your donations, they will appear here'
          : 'Items you claim will be shown here for tracking'
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {userRole === 'restaurant' ? 'Food Claims' : 'My Claims'}
        </Text>
        <Text style={styles.subtitle}>
          {userRole === 'restaurant' 
            ? 'Track who has claimed your donations'
            : 'Track your claimed food items'
          }
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{claims.length}</Text>
          <Text style={styles.statLabel}>Total Claims</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {claims.filter(claim => claim.status === 'claimed').length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {claims.filter(claim => claim.status === 'picked_up').length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Claims List */}
      <FlatList
        data={claims.reverse()} // Show newest first
        renderItem={renderClaimItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContainer,
          claims.length === 0 && styles.emptyListContainer,
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
  },
  statCard: {
    ...CardStyles.compactCard,
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  // claimCard removed - using CardStyles.interactiveCard
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  claimTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  foodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  claimDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  foodDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 12,
  },
  claimDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
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
  },
  claimInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  claimedByText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  claimedByEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  donorInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  donorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
  },
  addressText: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 5,
    flex: 1,
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
});

export default ClaimManagementScreen;