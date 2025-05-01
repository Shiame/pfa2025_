import React, { useState } from 'react';
import { Alert, View, TextInput, Button, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import { jwtDecode } from "jwt-decode";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function AddPlainte() {
  const [description, setDescription] = useState('');
  const [localisation, setLocalisation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [image, setImage] = useState(null);
  const [categorie, setCategorie] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

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

  const submitPlainte = async () => {
    // Validation
    if (!categorie) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return;
    }
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
        localisation,
        latitude,
        longitude,
        categorie,
        imgUrl: uploadedImageUrl || "https://via.placeholder.com/150",
        utilisateurEmail: decoded.sub 
      };

     

  
      await axios.post('http://192.168.0.110:8080/plaintes', plainte, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Image URL Cloudinary :", uploadedImageUrl);
  
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

  const getCategorieIcon = (cat) => {
    switch(cat) {
      case 'DECHETS': return 'trash';
      case 'AGRESSION': return 'exclamation-triangle';
      case 'CORRUPTION': return 'money-bill';
      case 'VOIRIE': return 'road';
      case 'AUTRES': return 'question';
      default: return 'tag';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Signaler un problème</Text>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FontAwesome5 name="list-alt" size={18} color="#4A6572" />
          <Text style={styles.cardTitle}>Catégorie</Text>
        </View>
        <View style={styles.pickerContainer}>
          <Picker 
            selectedValue={categorie}
            onValueChange={(itemValue) => setCategorie(itemValue)}
            style={styles.picker}>
              <Picker.Item label="-- Sélectionner une catégorie --" value="" />
              <Picker.Item label="Déchets" value="DECHETS" />
              <Picker.Item label="Agression" value="AGRESSION" />
              <Picker.Item label="Corruption" value="CORRUPTION" />
              <Picker.Item label="Voirie" value="VOIRIE" />
              <Picker.Item label="Autres" value="AUTRES" />
          </Picker>
        </View>
        {categorie && (
          <View style={styles.categorieChip}>
            <FontAwesome5 name={getCategorieIcon(categorie)} size={14} color="#fff" />
            <Text style={styles.categorieChipText}>
              {categorie.charAt(0) + categorie.slice(1).toLowerCase()}
            </Text>
          </View>
        )}
      </View>

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
        style={[styles.submitButton, (!categorie || !description || !localisation) && styles.disabledButton]} 
        onPress={submitPlainte}
        disabled={isLoading || !categorie || !description || !localisation}>
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
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
  },
  picker: {
    height: 50,
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
  }
});