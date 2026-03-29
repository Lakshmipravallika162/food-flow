import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEnhancedAuth } from '../context/EnhancedAuthContext';
import { CardStyles } from '../styles/CardStyles';

const ProfileScreen = ({ navigation }) => {
  const { user, userRole, logout } = useEnhancedAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    organizationName: user?.organizationName || '',
    address: user?.address || '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      // In a real app, this would update the user profile via API
      // For now, we'll just update the local data
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const getRoleInfo = () => {
    if (userRole === 'restaurant') {
      return {
        title: 'Restaurant Profile',
        color: '#ff6b35',
        icon: 'restaurant',
        description: 'Help reduce food waste by donating surplus food',
      };
    } else if (userRole === 'ngo') {
      return {
        title: 'NGO Profile',
        color: '#4caf50',
        icon: 'heart',
        description: 'Connect with restaurants to get food donations',
      };
    } else {
      return {
        title: 'Admin Profile',
        color: '#9c27b0',
        icon: 'shield',
        description: 'Manage the FoodFlow platform',
      };
    }
  };

  const roleInfo = getRoleInfo();

  const renderProfileItem = (icon, label, value, field) => (
    <View style={styles.profileItem}>
      <View style={styles.profileItemHeader}>
        <Ionicons name={icon} size={20} color={roleInfo.color} />
        <Text style={styles.profileLabel}>{label}</Text>
      </View>
      {isEditing ? (
        <TextInput
          style={styles.profileInput}
          value={formData[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          multiline={field === 'address'}
        />
      ) : (
        <Text style={styles.profileValue}>{value || 'Not provided'}</Text>
      )}
    </View>
  );

  const renderActionButton = (icon, title, subtitle, onPress, style = {}) => (
    <TouchableOpacity style={[styles.actionButton, style]} onPress={onPress}>
      <View style={styles.actionButtonContent}>
        <Ionicons name={icon} size={24} color={style.color || '#2c3e50'} />
        <View style={styles.actionButtonText}>
          <Text style={[styles.actionButtonTitle, { color: style.color || '#2c3e50' }]}>
            {title}
          </Text>
          <Text style={styles.actionButtonSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: roleInfo.color }]}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name={roleInfo.icon} size={40} color="#fff" />
            </View>
            <View style={styles.profileHeaderText}>
              <Text style={styles.profileName}>{user?.name || user?.email}</Text>
              <Text style={styles.profileRole}>{roleInfo.title}</Text>
              <Text style={styles.profileDescription}>{roleInfo.description}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
          >
            <Ionicons 
              name={isEditing ? "checkmark" : "pencil"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.editButtonText}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Information */}
        <View style={styles.cardContainer}>
          <View style={[CardStyles.primaryCard, styles.section, styles.cardSized]}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
          
          {renderProfileItem('person-outline', 'Name', formData.name, 'name')}
          {renderProfileItem('mail-outline', 'Email', formData.email, 'email')}
          {renderProfileItem('call-outline', 'Phone', formData.phone, 'phone')}
          
          {(userRole === 'ngo' || userRole === 'restaurant') && (
            renderProfileItem(
              userRole === 'ngo' ? 'business-outline' : 'storefront-outline',
              userRole === 'ngo' ? 'Organization' : 'Restaurant',
              formData.organizationName,
              'organizationName'
            )
          )}
          
          {renderProfileItem('location-outline', 'Address', formData.address, 'address')}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.cardContainer}>
          <View style={[CardStyles.primaryCard, styles.section, styles.cardSized]}>
            <Text style={styles.sectionTitle}>Actions</Text>
          
          {renderActionButton(
            'notifications-outline',
            'Notifications',
            'Manage your notification preferences',
            () => Alert.alert('Coming Soon', 'Notification settings will be available soon'),
            { color: '#ff9800' }
          )}
          
          {renderActionButton(
            'help-circle-outline',
            'Help & Support',
            'Get help or contact support',
            () => Alert.alert('Help', 'For support, please email us at support@foodflow.app'),
            { color: '#4caf50' }
          )}
          
          {renderActionButton(
            'information-circle-outline',
            'About FoodFlow',
            'Learn more about our mission',
            () => Alert.alert(
              'About FoodFlow',
              'FoodFlow connects restaurants with NGOs to reduce food waste and help feed those in need. Together, we can make a difference!'
            ),
            { color: '#9c27b0' }
          )}
          </View>
        </View>

        {/* Logout */}
        <View style={styles.cardContainer}>
          <View style={[CardStyles.primaryCard, styles.section, styles.cardSized]}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#f44336" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ in 🏛️ Hyderabad</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
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
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingTop: 40,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  profileHeaderText: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  profileRole: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 5,
  },
  profileDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cardSized: {
    width: '85%',
    maxWidth: 360,
    alignSelf: 'center',
    marginHorizontal: 8,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderRadius: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  profileItem: {
    marginBottom: 20,
  },
  profileItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  profileValue: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 22,
  },
  profileInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#f8f9fa',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  actionButtonText: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionButtonSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#f44336',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 10,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f44336',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  versionText: {
    fontSize: 14,
    color: '#bdc3c7',
  },
});

export default ProfileScreen;