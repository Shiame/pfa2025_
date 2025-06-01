import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox, Alert, Platform } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { LanguageProvider } from './contexts/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Ajoute cette import :
import { BASE_URL } from './config';

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();
  // Optionnel, pour debug et afficher le token :
  const [expoToken, setExpoToken] = useState('');

  useEffect(() => {
    // 1. Demander la permission et récupérer le token
    registerForPushNotificationsAsync().then(async token => {
      if (token) {
        setExpoToken(token); 
        console.log('Expo Push Token:', token);
        // Récupérer le userId stocké
        const userId = await AsyncStorage.getItem('userId');
        console.log('User ID:', userId);
        if (userId) {
        fetch(`${BASE_URL}/utilisateurs/save-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, expoPushToken: token })
          })
            .then(res => {
              if (res.status === 200 || res.status === 204) {
                console.log('Expo token saved successfully!');
                return null;
              }
              // Sinon essaie de lire le message d'erreur
              return res.json();
            })
            .then(data => {
              if (data) {
                console.log('Backend response:', data);
              }
            })
            .catch(err => {
              console.error('Save token fetch error:', err);
            });

        }
      }
    });

    // 2. Recevoir les notifications en foreground (app ouverte)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      Alert.alert('Notification', notification.request.content.body);
    });

    // 3. (Optionnel) Gérer le click sur la notif
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <LanguageProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </LanguageProvider>
  );
}

// Fonction utilitaire pour obtenir le token
async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Permission refusée pour notifications !');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('Notifications push seulement sur un vrai appareil physique !');
    return;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  return token;
}
