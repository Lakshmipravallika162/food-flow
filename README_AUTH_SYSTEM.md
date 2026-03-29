# FoodFlow Enhanced Authentication System

## Overview

This document provides instructions for using the enhanced authentication system that provides distinct credentials for three different panels:
- Admin Panel
- Restaurant Panel
- NGO Panel

Each panel has completely separate credentials, ensuring that users from one panel cannot access another panel.

## Setup Instructions

### 1. Install Dependencies

Make sure you have all required dependencies installed:

```bash
npm install
```

### 2. Update App.js

The authentication system is already integrated into the app. The [App.js](file:///Users/alla.tharunchowdary/Desktop/Food Flow/FoodFlow/App.js) file has been updated to use the enhanced authentication system.

### 3. Run the Application

Start the application:

```bash
npm start
```

## User Registration

### Admin Registration
Admin users must be registered directly in the system by another admin. There is no public registration for admin accounts for security reasons.

### Restaurant Registration
1. Open the app
2. Select "I HAVE FOOD" on the role selection screen
3. Click "Sign up"
4. Fill in restaurant details
5. Create a strong password
6. Submit the form

### NGO Registration
1. Open the app
2. Select "I NEED FOOD" on the role selection screen
3. Click "Sign up"
4. Fill in NGO details (organization name is required)
5. Create a strong password
6. Submit the form

## User Login

### Admin Login
1. Open the app
2. Select "ADMIN PANEL" on the role selection screen
3. Enter admin credentials
4. Click "Login to Admin Panel"

### Restaurant Login
1. Open the app
2. Select "I HAVE FOOD" on the role selection screen
3. Enter restaurant credentials
4. Click "Login"

### NGO Login
1. Open the app
2. Select "I NEED FOOD" on the role selection screen
3. Enter NGO credentials
4. Click "Login"

## Security Features

### Credential Isolation
- Admin credentials only work for the admin panel
- Restaurant credentials only work for the restaurant panel
- NGO credentials only work for the NGO panel
- No credential crossover between panels

### Password Security
- All passwords are hashed before storage
- Strong password requirements enforced
- Password strength validation during registration

### Account Management
- Admins can view and deactivate user accounts
- Users can update their profile information
- Password change functionality available

## Role-Based Access Control

### Admin Panel Access
- User management
- System settings
- Platform analytics
- Full system oversight

### Restaurant Panel Access
- Food donation posting
- Donation history management
- Claim management for their donations
- Restaurant profile settings

### NGO Panel Access
- Food listing browsing
- Food claim submission
- Claim history
- NGO profile management

## Testing the System

### Running Tests
To run the authentication system tests:

```bash
npm test
```

### Manual Testing
1. Register users for each role
2. Verify credential isolation by attempting to use credentials from one role to access another role
3. Test password strength requirements
4. Verify proper error handling for invalid credentials

## API Documentation

### Authentication Context
The authentication system is implemented in `EnhancedAuthContext.js` and provides the following functions:

- `registerUser(userData, role)` - Register new user
- `loginUser(email, password, role)` - Authenticate user
- `logout()` - End user session
- `getUsersByRole(role)` - Retrieve users for specific role
- `getAllUsers()` - Retrieve all users (admin only)
- `updateUser(userId, role, updateData)` - Update user information
- `deactivateUser(userId, role)` - Deactivate user account
- `changePassword(userId, role, oldPassword, newPassword)` - Change user password
- `hasPermission(requiredPanel)` - Check if user has permission for panel

### User Roles
Defined in `EnhancedAuthContext.js`:
- `USER_ROLES.ADMIN` - System administrators
- `USER_ROLES.RESTAURANT` - Food donating establishments
- `USER_ROLES.NGO` - Food recipient organizations

## Troubleshooting

### Login Issues
- Verify correct role selection
- Check email and password spelling
- Ensure account is active

### Registration Issues
- Check for duplicate email addresses within the same role
- Verify password meets strength requirements
- Ensure all required fields are filled

### Access Issues
- Confirm user has appropriate role for requested resources
- Check that user account is active
- Verify session is still valid

## Future Enhancements

### Planned Features
1. Two-Factor Authentication for admin accounts
2. Password reset functionality via email
3. Audit logging for authentication events
4. Rate limiting to prevent brute force attacks

### Security Improvements
1. Enhanced password hashing with bcrypt
2. Session timeout functionality
3. IP address tracking for suspicious activity
4. Enhanced encryption for sensitive data

## Support

For issues with the authentication system, please contact the development team or refer to the documentation in the [docs](file:///Users/alla.tharunchowdary/Desktop/Food Flow/FoodFlow/docs) folder.