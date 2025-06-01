import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Dimensions 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { BASE_URL } from '../config';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    const { t, currentLanguage, isRTL } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async() => {
        if(!email || !password){
            Alert.alert(t('error'), t('fillAllFields'));
            return;
        }
        
        setIsLoading(true);
        try{
            const res = await axios.post(`${BASE_URL}/auth/login`,{
                email,
                password
            });
            const token = res.data.token;

            // 👉 EXTRAIRE le userId (adapte cette ligne si nécessaire selon ta réponse backend !)
            // Si ta réponse est { token, user: { id, ... } } :
            const userId = res.data.user ? res.data.user.id : res.data.userId || res.data.id;

            // Stocker userId et token
            if (userId) {
                await AsyncStorage.setItem('userId', userId.toString());
                console.log('UserId saved:', userId);
            } else {
                console.warn('Aucun userId trouvé dans la réponse backend !');
            }
            await AsyncStorage.setItem('jwtToken', token);
            console.log('JWT token saved:', token);

            // (Optionnel mais recommandé) ENVOYER le token Expo Push au backend juste après login
            const expoPushToken = await AsyncStorage.getItem('expoPushToken');
            if (userId && expoPushToken) {
                fetch(`${BASE_URL}/utilisateurs/save-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, expoPushToken })
                });
                console.log('Expo push token envoyé au backend:', expoPushToken);
            } else {
                console.warn('Expo token manquant ou userId absent, envoi au backend non fait.');
            }

            Alert.alert(t('welcome'), t('loginSuccess'));
            navigation.navigate("Mes Plaintes");

        } catch(error){
            console.error(error);
            Alert.alert(t('error'), t('invalidCredentials'));
        } finally {
            setIsLoading(false);
        }
    } 
    
    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <StatusBar style="light" />
            <LinearGradient
                colors={['#C41E3A', '#8B1538', '#006233']}
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
                            {[...Array(12)].map((_, i) => (
                                <View key={i} style={[styles.diamond, { 
                                    transform: [{ rotate: `${i * 30}deg` }],
                                    opacity: 0.1 + (i * 0.05)
                                }]} />
                            ))}
                        </View>
                    </View>

                    {/* Logo Section */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <MaterialIcons name="flag" size={40} color="#C41E3A" />
                        </View>
                        <Text style={[styles.appName, isRTL && styles.textRTL]}>
                            {t('appName')}
                        </Text>
                        <Text style={[styles.slogan, isRTL && styles.textRTL]}>
                            {t('appSlogan')}
                        </Text>
                        <View style={styles.flagColors}>
                            <View style={[styles.flagStripe, { backgroundColor: '#C41E3A' }]} />
                            <View style={[styles.flagStripe, { backgroundColor: '#006233' }]} />
                        </View>
                    </View>
                    
                    {/* Login Form */}
                    <View style={styles.formContainer}>
                        <View style={[styles.formHeader, isRTL && styles.formHeaderRTL]}>
                            <FontAwesome5 name="sign-in-alt" size={24} color="#C41E3A" />
                            <Text style={[styles.title, isRTL && styles.textRTL]}>
                                {t('login')}
                            </Text>
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <View style={[styles.inputWrapper, isRTL && styles.inputWrapperRTL]}>
                                <MaterialIcons 
                                    name="email" 
                                    size={20} 
                                    color="#8B1538" 
                                    style={[styles.inputIcon, isRTL && styles.inputIconRTL]} 
                                />
                                <TextInput
                                    placeholder={t('email')}
                                    style={[
                                        styles.input, 
                                        isRTL && styles.inputRTL
                                    ]}
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
                                    name="lock" 
                                    size={20} 
                                    color="#8B1538" 
                                    style={[styles.inputIcon, isRTL && styles.inputIconRTL]} 
                                />
                                <TextInput
                                    placeholder={t('password')}
                                    style={[
                                        styles.input, 
                                        { flex: 1 }, 
                                        isRTL && styles.inputRTL
                                    ]}
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
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
                                        color="#8B1538" 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <TouchableOpacity 
                            style={[styles.forgotPassword, isRTL && styles.forgotPasswordRTL]}
                        >
                            <Text style={[styles.forgotPasswordText, isRTL && styles.textRTL]}>
                                {t('forgotPassword')}
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.loginButton, isLoading && styles.buttonDisabled]} 
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={isLoading ? ['#ccc', '#aaa'] : ['#C41E3A', '#8B1538']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                {isLoading ? (
                                    <View style={[styles.loadingContainer, isRTL && styles.loadingContainerRTL]}>
                                        <MaterialIcons name="hourglass-empty" size={20} color="#fff" />
                                        <Text style={[styles.buttonText, isRTL && styles.textRTL]}>
                                            {currentLanguage === 'ar' ? 'جاري تسجيل الدخول...' : 'Connexion en cours...'}
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={[styles.buttonContent, isRTL && styles.buttonContentRTL]}>
                                        <MaterialIcons name="login" size={20} color="#fff" />
                                        <Text style={[styles.buttonText, isRTL && styles.textRTL]}>
                                            {t('signIn')}
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
                        
                        <View style={[styles.registerContainer, isRTL && styles.registerContainerRTL]}>
                            <Text style={[styles.registerText, isRTL && styles.textRTL]}>
                                {t('dontHaveAccount')} 
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                                <Text style={[styles.registerLink, isRTL && styles.textRTL]}>
                                    {t('signUp')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, isRTL && styles.textRTL]}>
                            🇲🇦 {t('moroccanCitizenService')}
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
    diamond: {
        position: 'absolute',
        width: 20,
        height: 20,
        backgroundColor: '#fff',
        transform: [{ rotate: '45deg' }],
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 40,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 5,
    },
    slogan: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        marginBottom: 15,
    },
    flagColors: {
        flexDirection: 'row',
        width: 60,
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    flagStripe: {
        flex: 1,
        height: '100%',
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
        marginBottom: 30,
    },
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    formHeaderRTL: {
        flexDirection: 'row-reverse',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#2C3E50',
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E8E8E8',
        borderRadius: 15,
        backgroundColor: '#FAFAFA',
        paddingHorizontal: 15,
        paddingVertical: 5,
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
        padding: 15,
        fontSize: 16,
        color: '#2C3E50',
    },
    inputRTL: {
        textAlign: 'right',
    },
    eyeButton: {
        padding: 5,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 25,
    },
    forgotPasswordRTL: {
        alignSelf: 'flex-start',
    },
    forgotPasswordText: {
        color: '#C41E3A',
        fontSize: 14,
        fontWeight: '500',
    },
    loginButton: {
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 20,
    },
    buttonGradient: {
        paddingVertical: 18,
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
        marginVertical: 20,
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
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    registerContainerRTL: {
        flexDirection: 'row-reverse',
    },
    registerText: {
        color: '#666',
        fontSize: 15,
        textAlign: 'center',
    },
    registerLink: {
        color: '#C41E3A',
        fontWeight: 'bold',
        fontSize: 15,
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