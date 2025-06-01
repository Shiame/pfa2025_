import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { LanguageProvider } from './contexts/LanguageContext';

// Ignore specific warnings that are common in development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'AsyncStorage has been extracted from react-native',
  'Setting a timer for a long period of time',
]);

export default function App() {
  return (
    <LanguageProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </LanguageProvider>
  );
}