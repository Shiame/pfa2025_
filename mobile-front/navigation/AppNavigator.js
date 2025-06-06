import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Import contexts
import { useLanguage } from '../contexts/LanguageContext';

// Import screens
import AddPlainte from '../screens/AddPlainte';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MesPlaintesScreen from '../screens/MesPlaintesScreen';
import DetailPlainte from '../screens/DetailPlainte';
import ProfileScreen from '../screens/ProfileScreen';
import SplashScreen from '../screens/SplashScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for authenticated users
function MainTabNavigator() {
  const { t, currentLanguage, isRTL } = useLanguage();

  // Fonction pour obtenir les labels traduits
  const getTabLabel = (routeName) => {
    switch (routeName) {
      case 'Mes Plaintes':
        return currentLanguage === 'ar' ? 'شكاويي' : 'Mes Plaintes';
      case 'Nouvelle Plainte':
        return currentLanguage === 'ar' ? 'شكوى جديدة' : 'Nouvelle Plainte';
      case 'Profil':
        return currentLanguage === 'ar' ? 'الملف الشخصي' : 'Profil';
      default:
        return routeName;
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let IconComponent = MaterialIcons;

          if (route.name === 'Mes Plaintes') {
            iconName = 'list-alt';
            IconComponent = FontAwesome5;
          } else if (route.name === 'Nouvelle Plainte') {
            iconName = 'add-circle';
          } else if (route.name === 'Profil') {
            iconName = 'user-circle';
            IconComponent = FontAwesome5;
          }

          return <IconComponent name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4A6572',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          textAlign: isRTL ? 'right' : 'center', // Support RTL
        },
        // Utiliser la fonction de traduction pour les labels
        tabBarLabel: getTabLabel(route.name),
      })}
    >
      <Tab.Screen 
        name="Mes Plaintes" 
        component={MesPlaintesScreen}
        options={{
          headerShown: false // cache le header natif
        }}
      />
      <Tab.Screen 
        name="Nouvelle Plainte" 
        component={AddPlainte}
        options={{
          headerShown: false // cache le header natif
        }}
      />
      <Tab.Screen 
        name="Profil" 
        component={ProfileScreen}
        options={{
          headerShown: false // cache le header natif
        }}
      />
    </Tab.Navigator>
  );
}

// Auth Stack for non-authenticated users
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false // On cache le header natif partout pour uniformiser
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
      />
    </Stack.Navigator>
  );
}

// Loading component
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4A6572" />
    </View>
  );
}

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Show splash screen for 2 seconds
      setTimeout(() => setShowSplash(false), 2000);
      
      const token = await AsyncStorage.getItem('jwtToken');
      if (token) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Authenticated user screens
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabNavigator}
            />
            <Stack.Screen 
              name="Details de Plainte" 
              component={DetailPlainte}
              options={{
                headerShown: false // cache le header natif ici aussi
              }}
            />
          </>
        ) : (
          // Non-authenticated user screens
          <Stack.Screen 
            name="Auth" 
            component={AuthStack}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});