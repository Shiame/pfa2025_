import React, { useState, useEffect } from 'react';
import { Alert, View, TextInput, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { jwtDecode } from "jwt-decode";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NLP_BASE_URL, BASE_URL } from '../config';
import { useLanguage } from '../contexts/LanguageContext';

// Predefined categories with translations
const CATEGORIES = [
  { id: 1, fr: 'Déchets', ar: 'النفايات', icon: 'delete', color: '#E67E22' },
  { id: 2, fr: 'Agression', ar: 'اعتداء', icon: 'warning', color: '#E74C3C' },
  { id: 3, fr: 'Corruption', ar: 'فساد', icon: 'gavel', color: '#8E44AD' },
  { id: 4, fr: 'Voirie', ar: 'الطرق', icon: 'road', color: '#3498DB' },
  { id: 5, fr: 'Autres', ar: 'أخرى', icon: 'more-horiz', color: '#95A5A6' },
];



export default function AddPlainte({ navigation }) {
  const { t, currentLanguage, isRTL } = useLanguage();
  const [description, setDescription] = useState('');
  const [localisation, setLocalisation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  
  // Category states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [aiSuggestedCategory, setAiSuggestedCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isNlpLoading, setIsNlpLoading] = useState(false);
  const [categorySource, setCategorySource] = useState(null); // 'manual' or 'ai'

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('error'), 
        t('galleryPermissionDenied')
      );
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
      Alert.alert(
        t('error'), 
        t('cameraPermissionDenied')
      );
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
        Alert.alert(
          t('error'), 
          t('locationPermissionDenied')
        );
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
      Alert.alert(
        t('error'), 
        t('locationError')
      );
      console.error(error);
    } finally {
      setIsLocationLoading(false);
    }
  };

  const suggestCategorie = async (text) => {
    if (!text || text.trim().length < 10) {
      setAiSuggestedCategory(null);
      return;
    }
    
    try {
      setIsNlpLoading(true);
      const res = await fetch(`${NLP_BASE_URL}/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text })
      });
      
      if (!res.ok) throw new Error("NLP error");
      
      const { categorie: suggestedCategoryName } = await res.json();
      
      // Find the category object that matches the AI suggestion
      const matchedCategory = CATEGORIES.find(cat => 
        cat.fr.toLowerCase() === suggestedCategoryName.toLowerCase() ||
        cat.ar === suggestedCategoryName ||
        cat.id === suggestedCategoryName.toLowerCase()
      );
      
      if (matchedCategory) {
        setAiSuggestedCategory(matchedCategory);
        // If no manual selection has been made, use AI suggestion
        if (!selectedCategory || categorySource === 'ai') {
          setSelectedCategory(matchedCategory);
          setCategorySource('ai');
        }
      } else {
        // If AI suggests a category not in our predefined list, create a temporary one
        setAiSuggestedCategory({
          id: 'ai_suggested',
          fr: suggestedCategoryName,
          ar: suggestedCategoryName,
          icon: 'smart-toy',
          color: '#F4A261'
        });
      }
      
    } catch (err) {
      console.warn("Suggestion NLP échouée :", err);
      setAiSuggestedCategory(null);
    } finally {
      setIsNlpLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (description && description.trim().length >= 10) {
        suggestCategorie(description);
      } else {
        setAiSuggestedCategory(null);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [description]);

  const handleCategorySelection = (category, source = 'manual') => {
    setSelectedCategory(category);
    setCategorySource(source);
    setShowCategoryModal(false);
  };

  const handleUseAISuggestion = () => {
    if (aiSuggestedCategory) {
      handleCategorySelection(aiSuggestedCategory, 'ai');
    }
  };

  const getCategoryDisplayName = (category) => {
    if (!category) return '';
    return currentLanguage === 'ar' ? category.ar : category.fr;
  };

  const submitPlainte = async () => {
    if (!description) {
      Alert.alert(
        t('error'), 
        t('descriptionRequired')
      );
      return;
    }
    if (!localisation) {
      Alert.alert(
        t('error'), 
        t('locationRequired')
      );
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
        utilisateurEmail: decoded.sub,
        // Add category information
        categorie: selectedCategory ? { id: selectedCategory.id } : null

      };
  
      await axios.post(`${BASE_URL}/plaintes`, plainte, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      Alert.alert(
        t('success'), 
        t('complaintSubmitted'),
        [{ 
          text: t('ok'), 
          onPress: () => {
            resetForm();
            navigation.navigate("Mes Plaintes");
          }
        }]
      );
    } catch (err) {
      console.error(err);
      Alert.alert(
        t('error'), 
        t('submissionError')
      );
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
    setSelectedCategory(null);
    setAiSuggestedCategory(null);
    setCategorySource(null);
  };

  const CategoryModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showCategoryModal}
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.modalGradient}>
            <View style={[styles.modalHeader, isRTL && styles.modalHeaderRTL]}>
              <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>
                {currentLanguage === 'ar' ? 'اختر الفئة' : 'Choisir une catégorie'}
              </Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.categoriesList}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    selectedCategory?.id === category.id && styles.selectedCategoryItem
                  ]}
                  onPress={() => handleCategorySelection(category, 'manual')}
                >
                  <LinearGradient
                    colors={selectedCategory?.id === category.id 
                      ? ['rgba(196, 30, 58, 0.1)', 'rgba(0, 98, 51, 0.1)']
                      : ['transparent', 'transparent']
                    }
                    style={styles.categoryItemGradient}
                  >
                    <View style={[styles.categoryItemContent, isRTL && styles.categoryItemContentRTL]}>
                      <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                        <MaterialIcons name={category.icon} size={20} color="#fff" />
                      </View>
                      <Text style={[styles.categoryName, isRTL && styles.textRTL]}>
                        {getCategoryDisplayName(category)}
                      </Text>
                      {selectedCategory?.id === category.id && (
                        <MaterialIcons name="check-circle" size={20} color="#C41E3A" />
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient colors={['#f8f9fa', '#e9ecef']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={['#C41E3A', '#8B1538']} style={styles.headerGradient}>
          <View style={[styles.headerContent, isRTL && styles.headerContentRTL]}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <MaterialIcons 
                name={isRTL ? "arrow-forward" : "arrow-back"} 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
            <View style={[styles.headerTextContainer, isRTL && styles.headerTextContainerRTL]}>
              <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>
                {t('reportProblem')}
              </Text>
            </View>
            <View style={styles.headerIcon}>
              <MaterialIcons name="report-problem" size={24} color="#fff" />
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Description Card */}
        <View style={styles.card}>
          <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.cardGradient}>
            <View style={[styles.cardHeader, isRTL && styles.cardHeaderRTL]}>
              <View style={[styles.cardHeaderLeft, isRTL && styles.cardHeaderLeftRTL]}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="comment-alt" size={18} color="#C41E3A" />
                </View>
                <View>
                  <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>
                    {t('description')}
                  </Text>
                </View>
              </View>
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredText}>{t('required')}</Text>
              </View>
            </View>
            <TextInput
              style={[
                styles.textArea,
                isRTL && styles.textAreaRTL
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder={t('description')}
              multiline={true}
              numberOfLines={4}
              placeholderTextColor="#999"
              textAlignVertical="top"
              textAlign={isRTL ? 'right' : 'left'}
            />
          </LinearGradient>
        </View>

        {/* Category Selection Card */}
        <View style={styles.card}>
          <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.cardGradient}>
            <View style={[styles.cardHeader, isRTL && styles.cardHeaderRTL]}>
              <View style={[styles.cardHeaderLeft, isRTL && styles.cardHeaderLeftRTL]}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="list-alt" size={18} color="#3498DB" />
                </View>
                <View>
                  <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>
                    {t('category')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Manual Category Selection */}
            <TouchableOpacity 
              style={styles.categorySelector}
              onPress={() => setShowCategoryModal(true)}
            >
              <LinearGradient
                colors={['rgba(52, 152, 219, 0.1)', 'rgba(52, 152, 219, 0.05)']}
                style={styles.categorySelectorGradient}
              >
                <View style={[styles.categorySelectorContent, isRTL && styles.categorySelectorContentRTL]}>
                  {selectedCategory ? (
                    <>
                      <View style={[styles.categoryIcon, { backgroundColor: selectedCategory.color }]}>
                        <MaterialIcons name={selectedCategory.icon} size={16} color="#fff" />
                      </View>
                      <Text style={[styles.selectedCategoryText, isRTL && styles.textRTL]}>
                        {getCategoryDisplayName(selectedCategory)}
                      </Text>
                      {categorySource === 'manual' && (
                        <View style={styles.manualBadge}>
                          <Text style={styles.manualBadgeText}>
                            {currentLanguage === 'ar' ? 'يدوي' : 'Manuel'}
                          </Text>
                        </View>
                      )}
                      {categorySource === 'ai' && (
                        <View style={styles.aiBadge}>
                          <MaterialIcons name="smart-toy" size={12} color="#fff" />
                          <Text style={styles.aiBadgeText}>IA</Text>
                        </View>
                      )}
                    </>
                  ) : (
                    <Text style={[styles.placeholderText, isRTL && styles.textRTL]}>
                      {currentLanguage === 'ar' ? 'اختر فئة' : 'Sélectionner une catégorie'}
                    </Text>
                  )}
                  <MaterialIcons 
                    name={isRTL ? "keyboard-arrow-left" : "keyboard-arrow-right"} 
                    size={20} 
                    color="#3498DB" 
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* AI Suggestion Section */}
            {(isNlpLoading || aiSuggestedCategory) && (
              <View style={styles.aiSuggestionSection}>
                <View style={[styles.aiSuggestionHeader, isRTL && styles.aiSuggestionHeaderRTL]}>
                  <MaterialIcons name="smart-toy" size={18} color="#F4A261" />
                  <Text style={[styles.aiSuggestionTitle, isRTL && styles.textRTL]}>
                    {currentLanguage === 'ar' ? 'اقتراح الذكاء الاصطناعي' : 'Suggestion IA'}
                  </Text>
                  {isNlpLoading && <ActivityIndicator size="small" color="#F4A261" />}
                </View>

                {isNlpLoading && (
                  <LinearGradient
                    colors={['rgba(244, 162, 97, 0.1)', 'rgba(244, 162, 97, 0.05)']}
                    style={styles.aiLoadingContainer}
                  >
                    <Text style={[styles.aiLoadingText, isRTL && styles.textRTL]}>
                      {t('aiAnalyzing')}
                    </Text>
                  </LinearGradient>
                )}

                {aiSuggestedCategory && !isNlpLoading && (
                  <TouchableOpacity 
                    style={styles.aiSuggestion}
                    onPress={handleUseAISuggestion}
                  >
                    <LinearGradient
                      colors={['rgba(244, 162, 97, 0.2)', 'rgba(244, 162, 97, 0.1)']}
                      style={styles.aiSuggestionGradient}
                    >
                      <View style={[styles.aiSuggestionContent, isRTL && styles.aiSuggestionContentRTL]}>
                        <View style={[styles.categoryIcon, { backgroundColor: aiSuggestedCategory.color }]}>
                          <MaterialIcons name={aiSuggestedCategory.icon} size={16} color="#fff" />
                        </View>
                        <Text style={[styles.aiSuggestionText, isRTL && styles.textRTL]}>
                          {getCategoryDisplayName(aiSuggestedCategory)}
                        </Text>
                        <TouchableOpacity 
                          style={styles.useAiButton}
                          onPress={handleUseAISuggestion}
                        >
                          <Text style={styles.useAiButtonText}>
                            {currentLanguage === 'ar' ? 'استخدم' : 'Utiliser'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Location Card */}
        <View style={styles.card}>
          <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.cardGradient}>
            <View style={[styles.cardHeader, isRTL && styles.cardHeaderRTL]}>
              <View style={[styles.cardHeaderLeft, isRTL && styles.cardHeaderLeftRTL]}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="map-marker-alt" size={18} color="#006233" />
                </View>
                <View>
                  <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>
                    {t('location')}
                  </Text>
                </View>
              </View>
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredText}>{t('required')}</Text>
              </View>
            </View>
            <TextInput
              style={[
                styles.input,
                isRTL && styles.inputRTL
              ]}
              value={localisation}
              onChangeText={setLocalisation}
              placeholder={t('location')}
              placeholderTextColor="#999"
              textAlign={isRTL ? 'right' : 'left'}
            />
            <TouchableOpacity 
              style={styles.locationButton} 
              onPress={getUserLocation}
              disabled={isLocationLoading}
            >
              <LinearGradient colors={['#006233', '#4A6741']} style={styles.locationButtonGradient}>
                {isLocationLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="location" size={18} color="#fff" />
                    <Text style={[styles.locationButtonText, isRTL && styles.textRTL]}>
                      {t('useCurrentLocation')}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Photo Card */}
        <View style={styles.card}>
          <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.cardGradient}>
            <View style={[styles.cardHeader, isRTL && styles.cardHeaderRTL]}>
              <View style={[styles.cardHeaderLeft, isRTL && styles.cardHeaderLeftRTL]}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="camera" size={18} color="#8E44AD" />
                </View>
                <View>
                  <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>
                    {t('photo')} ({t('optional')})
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={[styles.imageButtonsContainer, isRTL && styles.imageButtonsContainerRTL]}>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <LinearGradient colors={['#8E44AD', '#6C3483']} style={styles.imageButtonGradient}>
                  <FontAwesome5 name="images" size={16} color="#fff" />
                  <Text style={[styles.imageButtonText, isRTL && styles.textRTL]}>
                    {t('gallery')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                <LinearGradient colors={['#8E44AD', '#6C3483']} style={styles.imageButtonGradient}>
                  <FontAwesome5 name="camera" size={16} color="#fff" />
                  <Text style={[styles.imageButtonText, isRTL && styles.textRTL]}>
                    {t('camera')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {image && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setImage(null)}
                >
                  <LinearGradient colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']} style={styles.removeImageGradient}>
                    <MaterialIcons name="close" size={18} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity 
            style={[
              styles.submitButton, 
              (!description || !localisation || isLoading) && styles.disabledButton
            ]} 
            onPress={submitPlainte}
            disabled={isLoading || !description || !localisation}
          >
            <LinearGradient 
              colors={(!description || !localisation || isLoading) 
                ? ['#cccccc', '#aaaaaa'] 
                : ['#F4A261', '#E76F51']
              } 
              style={styles.submitButtonGradient}
            >
              {isLoading ? (
                <View style={[styles.submitLoadingContainer, isRTL && styles.submitLoadingContainerRTL]}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={[styles.submitButtonText, isRTL && styles.textRTL]}>
                    {t('sending')}
                  </Text>
                </View>
              ) : (
                <View style={[styles.submitButtonContent, isRTL && styles.submitButtonContentRTL]}>
                  <MaterialIcons name="send" size={22} color="#fff" />
                  <Text style={[styles.submitButtonText, isRTL && styles.textRTL]}>
                    {t('sendComplaint')}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Category Selection Modal */}
      <CategoryModal />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContentRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    padding: 5,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTextContainerRTL: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerIcon: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardHeaderLeftRTL: {
    flexDirection: 'row-reverse',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(196, 30, 58, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  requiredBadge: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  requiredText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#2C3E50',
  },
  inputRTL: {
    textAlign: 'right',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#FAFAFA',
    color: '#2C3E50',
  },
  textAreaRTL: {
    textAlign: 'right',
  },
  
  // Category Selection Styles
  categorySelector: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  categorySelectorGradient: {
    padding: 15,
  },
  categorySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categorySelectorContentRTL: {
    flexDirection: 'row-reverse',
  },
  categoryIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedCategoryText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  placeholderText: {
    flex: 1,
    fontSize: 16,
    color: '#999',
  },
  manualBadge: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  manualBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  aiBadge: {
    backgroundColor: '#F4A261',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  aiBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },

  // AI Suggestion Styles
  aiSuggestionSection: {
    marginTop: 10,
  },
  aiSuggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiSuggestionHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  aiSuggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F4A261',
    marginLeft: 8,
    flex: 1,
  },
  aiLoadingContainer: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  aiLoadingText: {
    color: '#D68910',
    fontSize: 14,
    fontStyle: 'italic',
  },
  aiSuggestion: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F4A261',
  },
  aiSuggestionGradient: {
    padding: 12,
  },
  aiSuggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiSuggestionContentRTL: {
    flexDirection: 'row-reverse',
  },
  aiSuggestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    marginLeft: 10,
  },
  useAiButton: {
    backgroundColor: '#F4A261',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  useAiButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalGradient: {
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  categoriesList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  categoryItem: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  selectedCategoryItem: {
    borderColor: '#C41E3A',
    borderWidth: 2,
  },
  categoryItemGradient: {
    padding: 15,
  },
  categoryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryItemContentRTL: {
    flexDirection: 'row-reverse',
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    marginLeft: 12,
  },

  // Location and Image styles (keep existing ones)
  locationButton: {
    marginTop: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  locationButtonGradient: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  imageButtonsContainerRTL: {
    flexDirection: 'row-reverse',
  },
  imageButton: {
    flex: 0.48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageButtonGradient: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginTop: 5,
    fontSize: 12,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  removeImageGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  submitButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonContentRTL: {
    flexDirection: 'row-reverse',
  },
  submitLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitLoadingContainerRTL: {
    flexDirection: 'row-reverse',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  // RTL Text Alignment
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});