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
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEnhancedAuth } from '../context/EnhancedAuthContext';
import { CardStyles } from '../styles/CardStyles';

const { width } = Dimensions.get('window');

const EnhancedAdminPanelScreen = ({ navigation }) => {
  const { getAllUsers, deactivateUser } = useEnhancedAuth();
  const [users, setUsers] = useState({ admins: [], restaurants: [], ngos: [] });
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, selectedFilter]);

  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const filterUsers = () => {
    let allUsers = [];
    
    if (selectedFilter === 'all' || selectedFilter === 'admin') {
      allUsers = [...allUsers, ...users.admins.map(user => ({ ...user, type: 'admin' }))];
    }
    
    if (selectedFilter === 'all' || selectedFilter === 'restaurant') {
      allUsers = [...allUsers, ...users.restaurants.map(user => ({ ...user, type: 'restaurant' }))];
    }
    
    if (selectedFilter === 'all' || selectedFilter === 'ngo') {
      allUsers = [...allUsers, ...users.ngos.map(user => ({ ...user, type: 'ngo' }))];
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      allUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query) ||
        (user.organizationName && user.organizationName.toLowerCase().includes(query))
      );
    }

    setFilteredUsers(allUsers);
  };

  const handleDeactivateUser = (user) => {
    Alert.alert(
      'Deactivate User',
      `Are you sure you want to deactivate ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deactivateUser(user.id, user.type);
              if (result.success) {
                Alert.alert('Success', 'User deactivated successfully');
                loadUsers(); // Refresh the user list
              } else {
                Alert.alert('Error', result.error);
              }
            } catch (error) {
              console.error('Error deactivating user:', error);
              Alert.alert('Error', 'Failed to deactivate user');
            }
          },
        },
      ]
    );
  };

  const getUserTypeLabel = (type) => {
    switch (type) {
      case 'admin': return 'Admin';
      case 'restaurant': return 'Restaurant';
      case 'ngo': return 'NGO';
      default: return 'Unknown';
    }
  };

  const getUserTypeColor = (type) => {
    switch (type) {
      case 'admin': return '#9c27b0';
      case 'restaurant': return '#ff6b35';
      case 'ngo': return '#4caf50';
      default: return '#7f8c8d';
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={[styles.userTypeBadge, { backgroundColor: getUserTypeColor(item.type) }]}>
          <Text style={styles.userTypeText}>{getUserTypeLabel(item.type)}</Text>
        </View>
        <TouchableOpacity onPress={() => {
          setSelectedUser(item);
          setShowUserDetails(true);
        }}>
          <Ionicons name="eye-outline" size={24} color="#7f8c8d" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
      
      {item.organizationName ? (
        <Text style={styles.userOrg}>{item.organizationName}</Text>
      ) : null}
      
      <Text style={styles.userPhone}>{item.phone}</Text>
      
      <View style={styles.userActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => {
            setSelectedUser(item);
            setShowUserDetails(true);
          }}
        >
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
        
        {item.type !== 'admin' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.deactivateButton]}
            onPress={() => handleDeactivateUser(item)}
          >
            <Text style={styles.actionButtonText}>Deactivate</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderUserDetails = () => (
    <Modal
      visible={showUserDetails}
      animationType="slide"
      onRequestClose={() => setShowUserDetails(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>User Details</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowUserDetails(false)}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {selectedUser && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>User Type</Text>
              <View style={[styles.badge, { backgroundColor: getUserTypeColor(selectedUser.type) }]}>
                <Text style={styles.badgeText}>{getUserTypeLabel(selectedUser.type)}</Text>
              </View>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>{selectedUser.name}</Text>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{selectedUser.email}</Text>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{selectedUser.phone}</Text>
            </View>
            
            {selectedUser.organizationName && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Organization</Text>
                <Text style={styles.detailValue}>{selectedUser.organizationName}</Text>
              </View>
            )}
            
            {selectedUser.address && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>{selectedUser.address}</Text>
              </View>
            )}
            
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Account Status</Text>
              <View style={[styles.badge, selectedUser.isActive ? styles.activeBadge : styles.inactiveBadge]}>
                <Text style={styles.badgeText}>
                  {selectedUser.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Member Since</Text>
              <Text style={styles.detailValue}>
                {new Date(selectedUser.createdAt).toLocaleDateString()}
              </Text>
            </View>
            
            {selectedUser.lastLogin && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Last Login</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedUser.lastLogin).toLocaleDateString()}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Manage users and system settings</Text>
      </View>

      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.filterButtons}>
          {['all', 'admin', 'restaurant', 'ngo'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.activeFilterButton,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter && styles.activeFilterButtonText,
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderLeftColor: '#9c27b0' }]}>
          <Text style={styles.statNumber}>{users.admins.length}</Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
        
        <View style={[styles.statCard, { borderLeftColor: '#ff6b35' }]}>
          <Text style={styles.statNumber}>{users.restaurants.length}</Text>
          <Text style={styles.statLabel}>Restaurants</Text>
        </View>
        
        <View style={[styles.statCard, { borderLeftColor: '#4caf50' }]}>
          <Text style={styles.statNumber}>{users.ngos.length}</Text>
          <Text style={styles.statLabel}>NGOs</Text>
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        style={styles.userList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="person-outline" size={60} color="#7f8c8d" />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />

      {renderUserDetails()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  },
  filterContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    ...CardStyles.minimalCard,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#3498db',
  },
  filterButtonText: {
    color: '#7f8c8d',
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statCard: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 5,
  },
  userList: {
    flex: 1,
    padding: 15,
  },
  userCard: {
    ...CardStyles.card,
    padding: 20,
    marginBottom: 15,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  userTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  userTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#3498db',
    marginBottom: 5,
  },
  userOrg: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  userPhone: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  viewButton: {
    backgroundColor: '#3498db',
  },
  deactivateButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#3498db',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeBadge: {
    backgroundColor: '#27ae60',
  },
  inactiveBadge: {
    backgroundColor: '#e74c3c',
  },
});

export default EnhancedAdminPanelScreen;