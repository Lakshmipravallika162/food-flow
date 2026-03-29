import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { EnhancedAuthProvider } from './context/EnhancedAuthContext';
import EnhancedNavigation from './components/EnhancedNavigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <EnhancedAuthProvider>
        <EnhancedNavigation />
        <StatusBar style="auto" />
      </EnhancedAuthProvider>
    </SafeAreaProvider>
  );
}