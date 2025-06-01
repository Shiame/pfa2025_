import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';

export default function RegisterScreen({ navigation }) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cin, setCin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!nom || !prenom || !email || !password || !cin) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('http://10.1.6.172:8080/auth/register', {
        nom,
        prenom,
        email,
        password,
        cin,
        role: "CITOYEN"
      });

      const token = res.data.token;
      await AsyncStorage.setItem('jwtToken', token);
      Alert.alert("Succès", "Compte créé avec succès !");
      navigation.navigate("Login");
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de créer le compte");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>INSCRIPTION</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nom</Text>
            <TextInput 
              placeholder="Entrez votre nom" 
              style={styles.input} 
              value={nom} 
              onChangeText={setNom} 
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Prénom</Text>
            <TextInput 
              placeholder="Entrez votre prénom" 
              style={styles.input} 
              value={prenom} 
              onChangeText={setPrenom} 
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput 
              placeholder="Entrez votre email" 
              style={styles.input} 
              value={email} 
              onChangeText={setEmail} 
              autoCapitalize="none"
              keyboardType="email-address" 
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>CIN</Text>
            <TextInput 
              placeholder="Entrez votre CIN" 
              style={styles.input} 
              value={cin} 
              onChangeText={setCin} 
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mot de passe</Text>
            <TextInput 
              placeholder="Créez un mot de passe sécurisé" 
              style={styles.input} 
              value={password} 
              onChangeText={setPassword}
              secureTextEntry 
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Inscription en cours..." : "S'inscrire"}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Déjà un compte? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#4A6572',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#4A6572',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#a0aec0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
  },
  loginText: {
    color: '#666',
    fontSize: 15,
  },
  loginLink: {
    color: '#4A6572',
    fontWeight: 'bold',
    fontSize: 15,
  },
});