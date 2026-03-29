import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEnhancedAuth } from '../context/EnhancedAuthContext';
import { DataManagerNew } from '../utils/DataManagerNew';
import AnimatedCounter from '../components/AnimatedCounter';
import { CardStyles } from '../styles/CardStyles';

const { width } = Dimensions.get('window');

const DonorHomeScreen = ({ navigation }) => {
  const { user } = useEnhancedAuth();
  const [foodPosts, setFoodPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFoodPosts();
  }, []);

  const loadFoodPosts = async () => {
    setLoading(true);
    try {
      const posts = await DataManagerNew.getFoodPostsByDonor(user?.id);
      setFoodPosts(posts);
    } catch (error) {
      console.error('Error loading food posts:', error);
      Alert.alert('Error', 'Failed to load food posts');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFoodPosts();
    setRefreshing(false);
  };

  const handleDeletePost = (postId) => {
    Alert.alert(
      'Delete Donation',
      'Are you sure you want to delete this food donation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DataManagerNew.deleteFoodPost(postId);
              await loadFoodPosts();
              Alert.alert('Success', 'Donation deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete donation');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return '#4caf50';
      case 'claimed':
        return '#ff9800';
      case 'picked_up':
        return '#2196f3';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'claimed':
        return 'Claimed';
      case 'picked_up':
        return 'Picked Up';
      default:
        return status;
    }
  };

  const renderFoodPost = ({ item }) => (
    <View style={CardStyles.interactiveCard}>
      <View style={styles.postHeader}>
        <View style={styles.postTitleContainer}>
          <Text style={styles.foodTitle}>{item.title}</Text>
          <Text style={styles.postDate}>
            Posted on {DataManagerNew.formatDate(item.createdAt)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <Text style={styles.foodDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.postDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="leaf-outline" size={16} color="#4caf50" />
          <Text style={styles.detailText}>{item.foodType?.toUpperCase()}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={16} color="#ff9800" />
          <Text style={styles.detailText}>{item.quantity} servings</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color="#f44336" />
          <Text style={styles.detailText}>
            {DataManagerNew.getTimeRemaining(item.expiryTime)}
          </Text>
        </View>
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Donate Food', { editPost: item })}
        >
          <Ionicons name="pencil-outline" size={20} color="#2196f3" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeletePost(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#f44336" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant-outline" size={64} color="#bdc3c7" />
      <Text style={styles.emptyStateTitle}>No Donations Yet</Text>
      <Text style={styles.emptyStateDescription}>
        You haven't posted any food donations yet. Start by donating surplus food to help reduce waste!
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={() => navigation.navigate('Donate Food')}
      >
        <Text style={styles.emptyStateButtonText}>Donate Food</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={24} color="#ff6b35" />
          </View>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.userName}>{user?.name || user?.email}</Text>
          </View>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('Donate Food')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Impact Card without Stats - aligned with food post style */}
      <View style={[CardStyles.interactiveCard, styles.impactCard]}>
        <View style={styles.impactHeader}>
          <Ionicons name="heart" size={24} color="#ff6b35" />
          <Text style={styles.impactTitle}>Food Flow Impact</Text>
        </View>
        <Text style={styles.impactDescription}>
          You've helped reduce food waste and feed those in need. Keep up the great work!
        </Text>
      </View>

      {/* Food Posts List */}
      <View style={styles.postsContainer}>
        <View style={styles.postsHeader}>
          <Text style={styles.postsTitle}>My Donations</Text>
        </View>
        
        <FlatList
          data={foodPosts}
          renderItem={renderFoodPost}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={foodPosts.length === 0 ? styles.emptyContainer : null}
          style={styles.postsList}
        />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingActionButton}
        onPress={() => navigation.navigate('Donate Food')}
      >
        <Ionicons name="add" size={30} color="#000" />
      </TouchableOpacity>
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
    backgroundColor: '#ff6b35',
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeTextContainer: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingActionButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    opacity: 0.9,
  },
  impactCard: {
    marginHorizontal: 16,
    marginVertical: 24, // As per project specification for visual separation
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  impactDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  postsContainer: {
    flex: 1,
    marginTop: 12, // Move the My Donations section downward for clearer differentiation
  },
  postsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  postsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  postsList: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  foodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  postDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  foodDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
    lineHeight: 20,
  },
  postDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyStateButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default DonorHomeScreen;