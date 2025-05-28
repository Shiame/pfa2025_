import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { BASE_URL } from '../config';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

export default function RegisterScreen({ navigation }) {
  const { t, currentLanguage, isRTL } = useLanguage();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cin, setCin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!nom || !prenom || !email || !password || !cin) {
      Alert.alert(
        t('error'), 
        t('fillAllFields')
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/auth/register`, {
        nom,
        prenom,
        email,
        password,
        cin,
        role: "CITOYEN"
      });

      const token = res.data.token;
      await AsyncStorage.setItem('jwtToken', token);
      Alert.alert(
        t('success'), 
        t('registrationSuccess'),
        [{ 
          text: t('ok'), 
          onPress: () => navigation.navigate("Login") 
        }]
      );
    } catch (error) {
      console.error(error);
      Alert.alert(
        t('error'), 
        t('accountCreationFailed')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={['#006233', '#4A6741', '#C41E3A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          {/* Language Selector */}
          <View style={styles.languageSelectorContainer}>
            <LanguageSelector style={styles.languageSelector} />
          </View>

          {/* Moroccan Pattern Header */}
          <View style={styles.headerPattern}>
            <View style={styles.geometricPattern}>
              {[...Array(8)].map((_, i) => (
                <View key={i} style={[styles.star, { 
                  transform: [{ rotate: `${i * 45}deg` }],
                  opacity: 0.1
                }]} />
              ))}
            </View>
          </View>

          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <MaterialIcons name="person-add" size={35} color="#006233" />
            </View>
            <Text style={[styles.appName, isRTL && styles.textRTL]}>
              {t('createAccount')}
            </Text>
            <Text style={[styles.slogan, isRTL && styles.textRTL]}>
              {currentLanguage === 'ar' 
                ? 'انضم إلى مجتمع المواطنين'
                : 'Rejoignez la communauté'
              }
            </Text>
          </View>
          
          <View style={styles.formContainer}>
            <View style={[styles.formHeader, isRTL && styles.formHeaderRTL]}>
              <FontAwesome5 name="user-plus" size={22} color="#006233" />
              <Text style={[styles.title, isRTL && styles.textRTL]}>
                {t('register')}
              </Text>
            </View>
            
            <View style={[styles.inputRow, isRTL && styles.inputRowRTL]}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0 }]}>
                <View style={[styles.inputWrapper, isRTL && styles.inputWrapperRTL]}>
                  <MaterialIcons 
                    name="person" 
                    size={18} 
                    color="#4A6741" 
                    style={[styles.inputIcon, isRTL && styles.inputIconRTL]} 
                  />
                  <TextInput 
                    placeholder={t('lastName')} 
                    style={[styles.input, isRTL && styles.inputRTL]} 
                    value={nom} 
                    onChangeText={setNom}
                    placeholderTextColor="#999"
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                </View>
              </View>
              
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <View style={[styles.inputWrapper, isRTL && styles.inputWrapperRTL]}>
                  <MaterialIcons 
                    name="person-outline" 
                    size={18} 
                    color="#4A6741" 
                    style={[styles.inputIcon, isRTL && styles.inputIconRTL]} 
                  />
                  <TextInput 
                    placeholder={t('firstName')} 
                    style={[styles.input, isRTL && styles.inputRTL]} 
                    value={prenom} 
                    onChangeText={setPrenom}
                    placeholderTextColor="#999"
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, isRTL && styles.inputWrapperRTL]}>
                <MaterialIcons 
                  name="email" 
                  size={20} 
                  color="#4A6741" 
                  style={[styles.inputIcon, isRTL && styles.inputIconRTL]} 
                />
                <TextInput 
                  placeholder={t('email')} 
                  style={[styles.input, isRTL && styles.inputRTL]} 
                  value={email} 
                  onChangeText={setEmail} 
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#999"
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, isRTL && styles.inputWrapperRTL]}>
                <MaterialIcons 
                  name="credit-card" 
                  size={20} 
                  color="#4A6741" 
                  style={[styles.inputIcon, isRTL && styles.inputIconRTL]} 
                />
                <TextInput 
                  placeholder={t('cin')} 
                  style={[styles.input, isRTL && styles.inputRTL]} 
                  value={cin} 
                  onChangeText={setCin}
                  keyboardType="default"
                  placeholderTextColor="#999"
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, isRTL && styles.inputWrapperRTL]}>
                <MaterialIcons 
                  name="lock" 
                  size={20} 
                  color="#4A6741" 
                  style={[styles.inputIcon, isRTL && styles.inputIconRTL]} 
                />
                <TextInput 
                  placeholder={t('password')} 
                  style={[styles.input, { flex: 1 }, isRTL && styles.inputRTL]} 
                  value={password} 
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#999"
                  textAlign={isRTL ? 'right' : 'left'}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <MaterialIcons 
                    name={showPassword ? "visibility" : "visibility-off"} 
                    size={20} 
                    color="#4A6741" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Security Info */}
            <View style={styles.securityInfo}>
              <MaterialIcons name="security" size={16} color="#F4A261" />
              <Text style={[styles.securityText, isRTL && styles.textRTL]}>
                {t('dataSecured')}
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.registerButton, isLoading && styles.buttonDisabled]} 
              onPress={handleRegister}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#ccc', '#aaa'] : ['#006233', '#4A6741']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {isLoading ? (
                  <View style={[styles.loadingContainer, isRTL && styles.loadingContainerRTL]}>
                    <MaterialIcons name="hourglass-empty" size={20} color="#fff" />
                    <Text style={[styles.buttonText, isRTL && styles.textRTL]}>
                      {currentLanguage === 'ar' ? 'جاري التسجيل...' : 'Inscription en cours...'}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.buttonContent, isRTL && styles.buttonContentRTL]}>
                    <MaterialIcons name="check-circle" size={20} color="#fff" />
                    <Text style={[styles.buttonText, isRTL && styles.textRTL]}>
                      {t('signUp')}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>
                {currentLanguage === 'ar' ? 'أو' : 'ou'}
              </Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={[styles.loginContainer, isRTL && styles.loginContainerRTL]}>
              <Text style={[styles.loginText, isRTL && styles.textRTL]}>
                {t('alreadyHaveAccount')} 
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={[styles.loginLink, isRTL && styles.textRTL]}>
                  {t('signIn')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms & Conditions */}
          <View style={styles.termsContainer}>
            <Text style={[styles.termsText, isRTL && styles.textRTL]}>
              {t('termsConditions')}
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, isRTL && styles.textRTL]}>
              🇲🇦 {t('officialPlatform')}
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  languageSelectorContainer: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 1000,
  },
  languageSelector: {
    width: 160,
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    overflow: 'hidden',
  },
  geometricPattern: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 15,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  slogan: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 20,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  formHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#2C3E50',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  inputRowRTL: {
    flexDirection: 'row-reverse',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 15,
    paddingVertical: 2,
  },
  inputWrapperRTL: {
    flexDirection: 'row-reverse',
  },
  inputIcon: {
    marginRight: 10,
  },
  inputIconRTL: {
    marginRight: 0,
    marginLeft: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#2C3E50',
  },
  inputRTL: {
    textAlign: 'right',
  },
  eyeButton: {
    padding: 5,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 162, 97, 0.1)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  securityText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#D68910',
    textAlign: 'center',
  },
  registerButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContentRTL: {
    flexDirection: 'row-reverse',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainerRTL: {
    flexDirection: 'row-reverse',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#999',
    fontSize: 14,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  loginContainerRTL: {
    flexDirection: 'row-reverse',
  },
  loginText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  loginLink: {
    color: '#006233',
    fontWeight: 'bold',
    fontSize: 14,
  },
  termsContainer: {
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  termsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  // RTL Text Alignment
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});