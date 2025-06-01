import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async() => {
        if(!email || !password){
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            return;
        }
        
        setIsLoading(true);
        try{
            const res = await axios.post('http://192.168.0.110:8080/auth/login',{
                email,
                password
            });
            const token = res.data.token;
            
            await AsyncStorage.setItem('jwtToken', token);
            console.log(token);
            Alert.alert("Bienvenue!", "Connexion réussie");
            navigation.navigate("mes plaintes");

        } catch(error){
            console.error(error);
            Alert.alert("Erreur", "Email ou mot de passe invalide");
        } finally {
            setIsLoading(false);
        }
    } 
    
    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.scrollView}>
                <View style={styles.logoContainer}>
                    <Text style={styles.appName}>un Maroc Meilleur</Text>
                    <Text style={styles.slogan}>Vos plaintes, notre priorité</Text>
                </View>
                
                <View style={styles.formContainer}>
                    <Text style={styles.title}>CONNEXION</Text>
                    
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
                        <Text style={styles.inputLabel}>Mot de passe</Text>
                        <TextInput
                            placeholder="Entrez votre mot de passe"
                            style={styles.input}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>
                    
                    <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={styles.forgotPasswordText}>Mot de passe oublié?</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.button, isLoading && styles.buttonDisabled]} 
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>
                            {isLoading ? "Connexion en cours..." : "Se connecter"}
                        </Text>
                    </TouchableOpacity>
                    
                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>Pas encore de compte? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                            <Text style={styles.registerLink}>S'inscrire</Text>
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
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4A6572',
    },
    slogan: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
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
        marginBottom: 20,
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
        padding: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: '#4A6572',
        fontSize: 14,
    },
    button: {
        backgroundColor: '#4A6572',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
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
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    registerText: {
        color: '#666',
        fontSize: 15,
    },
    registerLink: {
        color: '#4A6572',
        fontWeight: 'bold',
        fontSize: 15,
    },
});