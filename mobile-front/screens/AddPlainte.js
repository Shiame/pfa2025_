import React, { useState, useEffect } from 'react';
import { Alert, View, TextInput, Button, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform, ToastAndroid } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { jwtDecode } from "jwt-decode";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { NLP_BASE_URL, BASE_URL } from '../config'

export default function AddPlainte() {
  const [description, setDescription] = useState('');
  const [localisation, setLocalisation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [categorie, setCategorie] = useState('');
  const [isNlpLoading, setIsNlpLoading] = useState(false);


  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Autorisation d\'accès à la galerie requise.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3]
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Autorisation d\'accès à la caméra requise.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3]
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImageToCloudinary = async (uri) => {
    const data = new FormData();
    data.append('file', {
      uri: uri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    data.append('upload_preset', 'pfa_upload'); 
    data.append('cloud_name', 'dqlcaqjmg'); 

    
  
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dqlcaqjmg/image/upload', {
        method: 'POST',
        body: data,
      });
    
      const result = await res.json();
      console.log('Cloudinary tags:', result.tags);
      return result.secure_url; 
    } catch (err) {
      console.error("Erreur d'upload Cloudinary", err);
      return null;
    }
  };
  
  const getUserLocation = async () => {
    try {
      setIsLocationLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erreur', 'Accès à la localisation refusé');
        setIsLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setLatitude(latitude);
      setLongitude(longitude);

      const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (reverse.length > 0) {
        const { streetNumber, street, district, city } = reverse[0];
        const formatted = `${streetNumber || ''} ${street || ''}, ${district || ''}, ${city || ''}`.trim();
        setLocalisation(formatted);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'obtenir la localisation');
      console.error(error);
    } finally {
      setIsLocationLoading(false);
    }
  };

  const suggestCategorie = async (text) => {
    if (!text || text.trim().length < 10) return;
    
    try {
      setIsNlpLoading(true);
      const res = await fetch(`${NLP_BASE_URL}/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text })
      });
      
      if (!res.ok) throw new Error("NLP error");
      
      const { categorie: suggestedCategory } = await res.json();
      
      setCategorie(suggestedCategory);
      
    } catch (err) {
      console.warn("Suggestion NLP échouée :", err);
    } finally {
      setIsNlpLoading(false);
    }
  };

  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (description && description.trim().length >= 0) {
        suggestCategorie(description);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [description]);

  const submitPlainte = async () => {
    if (!description) {
      Alert.alert('Erreur', 'Veuillez ajouter une description');
      return;
    }
    if (!localisation) {
      Alert.alert('Erreur', 'Veuillez préciser la localisation');
      return;
    }
    

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('jwtToken');
      const decoded = jwtDecode(token);
      let uploadedImageUrl = image;
      
      if (image) {
        uploadedImageUrl = await uploadImageToCloudinary(image);
      }
  
      const plainte = {
        description,
        latitude,
        longitude,
        localisation,
        imgUrl: uploadedImageUrl,
        utilisateurEmail: decoded.sub 
      };
      console.log("Payload plainte à envoyer →", {
        description, localisation,
        latitude, longitude,
        imgUrl: uploadedImageUrl,
        utilisateurEmail: decoded.sub
      });
      
      
  
      await axios.post(`${BASE_URL}/plaintes`, plainte, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      Alert.alert(
        "Succès", 
        "Votre plainte a été enregistrée avec succès!",
        [{ text: "OK", onPress: resetForm }]
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible d'envoyer la plainte. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setDescription('');
    setLatitude('');
    setLongitude('');
    setImage(null);
    setLocalisation('');
    setCategorie('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Signaler un problème</Text>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FontAwesome5 name="comment-alt" size={18} color="#4A6572" />
          <Text style={styles.cardTitle}>Description</Text>
        </View>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          placeholder="Décrivez le problème en détail..."
          multiline={true}
          numberOfLines={4}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FontAwesome5 name="list-alt" size={18} color="#4A6572" />
          <Text style={styles.cardTitle}>Catégorie</Text>
          {isNlpLoading && (
            <View style={styles.nlpLoadingIndicator}>
              <ActivityIndicator size="small" color="#F9AA33" />
            </View>
          )}
        </View>
        
        {isNlpLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#F9AA33" />
            <Text style={styles.loadingText}>Analyse en cours...</Text>
          </View>
        )}

        {categorie ? (
          <View style={styles.categorieSelection}>
            <View style={styles.categorieChip}>
              <MaterialIcons name="category" size={16} color="#fff" />
              <Text style={styles.categorieChipText}>{categorie}</Text>
            </View>
            <Text style={styles.categorieInfo}>Catégorie suggérée par IA</Text>
          </View>
        ) : (
          <View style={styles.waitingForNlp}>
            <Text style={styles.waitingText}>
              {description && description.length >= 0 
                ? "Analyse de votre description en cours..."
                : "Écrivez une description détaillée pour que l'IA suggère une catégorie"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FontAwesome5 name="map-marker-alt" size={18} color="#4A6572" />
          <Text style={styles.cardTitle}>Localisation</Text>
        </View>
        <TextInput
          style={styles.input}
          value={localisation}
          onChangeText={setLocalisation}
          placeholder="Adresse du problème"
        />
        <TouchableOpacity 
          style={styles.locationButton} 
          onPress={getUserLocation}
          disabled={isLocationLoading}>
          {isLocationLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="location" size={18} color="#fff" />
              <Text style={styles.buttonText}>Utiliser ma position actuelle</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FontAwesome5 name="image" size={18} color="#4A6572" />
          <Text style={styles.cardTitle}>Photo</Text>
        </View>
        <View style={styles.imageButtonsContainer}>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <FontAwesome5 name="images" size={18} color="#fff" />
            <Text style={styles.buttonText}>Galerie</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
            <FontAwesome5 name="camera" size={18} color="#fff" />
            <Text style={styles.buttonText}>Caméra</Text>
          </TouchableOpacity>
        </View>

        {image && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => setImage(null)}>
              <MaterialIcons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={[
          styles.submitButton, 
          (!description || !localisation) && styles.disabledButton
        ]} 
        onPress={submitPlainte}
        disabled={isLoading || !description || !localisation}>
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <MaterialIcons name="send" size={22} color="#fff" />
            <Text style={styles.submitButtonText}>Envoyer la plainte</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#344955',
    textAlign: 'center',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#344955',
    flex: 1,
  },
  nlpLoadingIndicator: {
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  locationButton: {
    backgroundColor: '#4A6572',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: '#4A6572',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.48,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginTop: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#F9AA33',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  categorieChip: {
    backgroundColor: '#F9AA33',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categorieChipText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  categorieSelection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  categorieInfo: {
    color: '#666',
    fontStyle: 'italic',
    fontSize: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
  },
  waitingForNlp: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  waitingText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  }
});