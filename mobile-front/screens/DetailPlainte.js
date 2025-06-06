import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableOpacity, Dimensions, Alert, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../config';
import { useLanguage } from '../contexts/LanguageContext';

const { width, height } = Dimensions.get('window');

export default function DetailPlainteScreen({ route, navigation }) {
  const { t, currentLanguage, isRTL } = useLanguage();
  const { plainteId } = route.params;
  const [plainte, setPlainte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchPlainte();
  }, []);

  useEffect(() => {
    if (plainte) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [plainte]);

  const fetchPlainte = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const res = await axios.get(`${BASE_URL}/plaintes/${plainteId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      let data = res.data;
      if (data.plainte) {
        setPlainte(data.plainte);
      } else if (data) {
        setPlainte(data);
      } else {
        setPlainte(null);
      }
    } catch (error) {
      setPlainte(null);
      console.error('Error fetching plainte:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePlainte = async () => {
    try {
      setDeleting(true);
      const token = await AsyncStorage.getItem('jwtToken');
      
      await axios.delete(`${BASE_URL}/plaintes/${plainteId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      Alert.alert(
        currentLanguage === 'ar' ? '✅ تم الحذف' : '✅ Suppression réussie',
        currentLanguage === 'ar' ? 'تم حذف الشكوى بنجاح' : 'La plainte a été supprimée avec succès',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Mes Plaintes')
          }
        ]
      );

    } catch (error) {
      console.error('Error deleting plainte:', error);
      
      let errorMessage = currentLanguage === 'ar' 
        ? 'فشل في حذف الشكوى. حاول مرة أخرى.' 
        : 'Impossible de supprimer la plainte. Veuillez réessayer.';
      
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = currentLanguage === 'ar' 
            ? 'ليس لديك صلاحية لحذف هذه الشكوى'
            : 'Vous n\'avez pas l\'autorisation de supprimer cette plainte';
        } else if (error.response.status === 404) {
          errorMessage = currentLanguage === 'ar' 
            ? 'الشكوى غير موجودة'
            : 'Cette plainte n\'existe plus';
        }
      }

      Alert.alert(
        currentLanguage === 'ar' ? '❌ خطأ' : '❌ Erreur',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      currentLanguage === 'ar' ? '⚠️ تأكيد الحذف' : '⚠️ Confirmer la suppression',
      currentLanguage === 'ar' 
        ? 'هل أنت متأكد من أنك تريد حذف هذه الشكوى؟ لا يمكن التراجع عن هذا الإجراء.'
        : 'Êtes-vous sûr de vouloir supprimer cette plainte ? Cette action ne peut pas être annulée.',
      [
        {
          text: currentLanguage === 'ar' ? 'إلغاء' : 'Annuler',
          style: 'cancel',
        },
        {
          text: currentLanguage === 'ar' ? '🗑️ حذف' : '🗑️ Supprimer',
          style: 'destructive',
          onPress: deletePlainte,
        },
      ],
      { cancelable: true }
    );
  };

  const getStatusConfig = (statut) => {
    switch (statut?.trim().toUpperCase()) {
      case "SOUMISE":
        return {
          color: '#FF8C00',
          gradient: ['#FF8C00', '#FFA500'],
          icon: 'schedule',
          text: t('submitted') || 'Soumise',
          bgColor: 'rgba(255, 140, 0, 0.1)',
          iconLib: 'MaterialIcons'
        };
      case "EN_COURS":
        return {
          color: '#2196F3',
          gradient: ['#2196F3', '#1976D2'],
          icon: 'sync',
          text: t('inProgress') || 'En cours',
          bgColor: 'rgba(33, 150, 243, 0.1)',
          iconLib: 'MaterialIcons'
        };
      case "RESOLUE":
        return {
          color: '#4CAF50',
          gradient: ['#4CAF50', '#388E3C'],
          icon: 'check-circle',
          text: t('resolved') || 'Résolue',
          bgColor: 'rgba(76, 175, 80, 0.1)',
          iconLib: 'MaterialIcons'
        };
      default:
        return {
          color: '#9E9E9E',
          gradient: ['#9E9E9E', '#757575'],
          icon: 'help',
          text: statut,
          bgColor: 'rgba(158, 158, 158, 0.1)',
          iconLib: 'MaterialIcons'
        };
    }
  };

  const InfoCard = ({ icon, iconLib = "MaterialIcons", title, value, color = "#667085", gradient, specialRender = null, onPress = null }) => (
    <TouchableOpacity 
      style={styles.infoCard} 
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
    >
      <LinearGradient
        colors={gradient || ['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.9)']}
        style={styles.infoCardGradient}
      >
        <View style={[styles.infoCardContent, isRTL && styles.infoCardContentRTL]}>
          <View style={[styles.iconWrapper, { backgroundColor: color + '15' }]}>
            {iconLib === "MaterialIcons" ? (
              <MaterialIcons name={icon} size={22} color={color} />
            ) : iconLib === "FontAwesome5" ? (
              <FontAwesome5 name={icon} size={18} color={color} />
            ) : (
              <Ionicons name={icon} size={20} color={color} />
            )}
          </View>
          <View style={[styles.infoContent, isRTL && styles.infoContentRTL]}>
            <Text style={[styles.infoTitle, isRTL && styles.textRTL]}>{title}</Text>
            {specialRender ? specialRender() : (
              <Text style={[styles.infoValue, isRTL && styles.textRTL]}>{value}</Text>
            )}
          </View>
          {onPress && (
            <MaterialIcons 
              name={isRTL ? "chevron-left" : "chevron-right"} 
              size={20} 
              color="#CBD5E1" 
            />
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const StatusBadge = ({ status }) => {
    const config = getStatusConfig(status);
    return (
      <View style={[styles.statusBadgeContainer, { backgroundColor: config.bgColor }]}>
        <LinearGradient
          colors={config.gradient}
          style={styles.statusBadge}
        >
          <MaterialIcons name={config.icon} size={14} color="#fff" />
          <Text style={[styles.statusBadgeText, isRTL && styles.textRTL]}>
            {config.text}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  const ActionButton = ({ icon, iconLib = "MaterialIcons", title, onPress, gradient, style = {} }) => (
    <TouchableOpacity 
      style={[styles.actionButton, style]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient colors={gradient} style={styles.actionButtonGradient}>
        {iconLib === "MaterialIcons" ? (
          <MaterialIcons name={icon} size={20} color="#fff" />
        ) : (
          <FontAwesome5 name={icon} size={18} color="#fff" />
        )}
        <Text style={[styles.actionButtonText, isRTL && styles.textRTL]}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.centeredContainer}>
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={['#C41E3A', '#8B1538']}
            style={styles.loadingSpinner}
          >
            <ActivityIndicator size="large" color="#fff" />
          </LinearGradient>
          <Text style={[styles.loadingText, isRTL && styles.textRTL]}>
            {t('loading') || 'Chargement...'}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  if (!plainte) {
    return (
      <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.centeredContainer}>
        <View style={styles.errorContainer}>
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            style={styles.errorIcon}
          >
            <MaterialIcons name="error-outline" size={40} color="#fff" />
          </LinearGradient>
          <Text style={[styles.errorText, isRTL && styles.textRTL]}>
            {currentLanguage === 'ar' 
              ? 'تعذر تحميل تفاصيل الشكوى'
              : 'Impossible de charger la plainte'
            }
          </Text>
          <ActionButton
            icon="refresh"
            title={t('retry') || 'Réessayer'}
            gradient={['#C41E3A', '#8B1538']}
            onPress={() => {
              setLoading(true);
              fetchPlainte();
            }}
          />
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <LinearGradient colors={['#C41E3A', '#8B1538', '#6B1329']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <View style={styles.backButtonInner}>
              <MaterialIcons 
                name={isRTL ? "arrow-forward" : "arrow-back"} 
                size={22} 
                color="#fff" 
              />
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>
              {t('complaintDetails') || 'Détails de la plainte'}
            </Text>
            <Text style={[styles.headerSubtitle, isRTL && styles.textRTL]}>
              #{plainteId}
            </Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerAction}>
              <MaterialIcons name="share" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Hero Image Section */}
          {plainte.imgUrl && (
            <View style={styles.heroImageContainer}>
              <Image source={{ uri: plainte.imgUrl }} style={styles.heroImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.heroImageOverlay}
              >
                <View style={styles.heroImageBadge}>
                  <MaterialIcons name="image" size={16} color="#fff" />
                  <Text style={styles.heroImageBadgeText}>Photo de la plainte</Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Description Card */}
          <View style={styles.descriptionCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.9)']}
              style={styles.descriptionGradient}
            >
              <View style={styles.descriptionHeader}>
                <MaterialIcons name="description" size={24} color="#C41E3A" />
                <Text style={[styles.descriptionTitle, isRTL && styles.textRTL]}>
                  {currentLanguage === 'ar' ? 'وصف الشكوى' : 'Description'}
                </Text>
              </View>
              <Text style={[styles.descriptionText, isRTL && styles.textRTL]}>
                {plainte.description}
              </Text>
            </LinearGradient>
          </View>

          {/* Status Card */}
          <View style={styles.statusCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.9)']}
              style={styles.statusGradient}
            >
              <View style={styles.statusHeader}>
                <MaterialIcons name="track-changes" size={24} color="#C41E3A" />
                <Text style={[styles.statusTitle, isRTL && styles.textRTL]}>
                  {currentLanguage === 'ar' ? 'حالة الشكوى' : 'Statut de la plainte'}
                </Text>
              </View>
              <StatusBadge status={plainte.statut} />
            </LinearGradient>
          </View>

          {/* Information Cards */}
          <View style={styles.infoSection}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {currentLanguage === 'ar' ? 'معلومات إضافية' : 'Informations détaillées'}
            </Text>

            <InfoCard
              icon="event"
              title={t('date') || 'Date de soumission'}
              value={
                plainte.dateSoumission
                  ? new Date(plainte.dateSoumission).toLocaleDateString(
                      currentLanguage === 'ar' ? 'ar-MA' : 'fr-FR',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }
                    )
                  : "N/A"
              }
              color="#2563EB"
            />

            {plainte.categorie && (
              <InfoCard
                icon="category"
                title={t('category') || 'Catégorie'}
                value={plainte.categorie.nom}
                color="#7C3AED"
              />
            )}

            <InfoCard
              icon="location-on"
              title={t('location') || 'Localisation'}
              value={plainte.localisation || "Non spécifiée"}
              color="#059669"
              onPress={() => {
                if (plainte.latitude && plainte.longitude) {
                  Alert.alert(
                    'Coordonnées GPS',
                    `Latitude: ${plainte.latitude?.toFixed(6)}\nLongitude: ${plainte.longitude?.toFixed(6)}`,
                    [{ text: 'OK' }]
                  );
                }
              }}
            />

            {plainte.latitude != null && plainte.longitude != null && (
              <InfoCard
                icon="my-location"
                title={currentLanguage === 'ar' ? 'الإحداثيات' : 'Coordonnées GPS'}
                color="#DC2626"
                specialRender={() => (
                  <View style={styles.coordinatesContainer}>
                    <Text style={[styles.coordinateText, isRTL && styles.textRTL]}>
                      📍 {plainte.latitude?.toFixed(6)}, {plainte.longitude?.toFixed(6)}
                    </Text>
                  </View>
                )}
                onPress={() => {
                  Alert.alert(
                    'Ouvrir dans Maps',
                    'Voulez-vous ouvrir cette localisation dans l\'application Maps ?',
                    [
                      { text: 'Annuler', style: 'cancel' },
                      { text: 'Ouvrir', onPress: () => {
                        // Ici vous pouvez implémenter l'ouverture de Maps
                        console.log('Opening maps with coordinates:', plainte.latitude, plainte.longitude);
                      }}
                    ]
                  );
                }}
              />
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <View style={styles.actionButtonsRow}>
              <ActionButton
                icon="list"
                title={t('myComplaints') || 'Mes plaintes'}
                gradient={['#2563EB', '#1D4ED8']}
                style={{ flex: 1, marginRight: 10 }}
                onPress={() => navigation.navigate('Mes Plaintes')}
              />
              
              <ActionButton
                icon="add-circle-outline"
                title={t('newComplaint') || 'Nouvelle'}
                gradient={['#059669', '#047857']}
                style={{ flex: 1, marginLeft: 10 }}
                onPress={() => navigation.navigate('Nouvelle Plainte')}
              />
            </View>

            {/* Delete Button */}
            <View style={styles.deleteSection}>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={confirmDelete}
                disabled={deleting}
                activeOpacity={0.8}
              >
                <LinearGradient 
                  colors={deleting ? ['#9CA3AF', '#6B7280'] : ['#EF4444', '#DC2626']}
                  style={styles.deleteButtonGradient}
                >
                  <View style={styles.deleteButtonContent}>
                    {deleting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <MaterialIcons name="delete-forever" size={22} color="#fff" />
                    )}
                    <Text style={[styles.deleteButtonText, isRTL && styles.textRTL]}>
                      {deleting 
                        ? (currentLanguage === 'ar' ? 'جاري الحذف...' : 'Suppression...')
                        : (currentLanguage === 'ar' ? 'حذف الشكوى نهائياً' : 'Supprimer définitivement')
                      }
                    </Text>
                  </View>
                  <View style={styles.deleteButtonIcon}>
                    <MaterialIcons name="warning" size={16} color="rgba(255,255,255,0.7)" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroImageContainer: {
    marginTop: 20,
    marginBottom: 25,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  heroImage: {
    width: '100%',
    height: 280,
  },
  heroImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  heroImageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  heroImageBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  descriptionCard: {
    marginBottom: 20,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  descriptionGradient: {
    padding: 24,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    fontWeight: '400',
  },
  statusCard: {
    marginBottom: 25,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusGradient: {
    padding: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 12,
  },
  statusBadgeContainer: {
    borderRadius: 12,
    padding: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  infoCardGradient: {
    padding: 20,
  },
  infoCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCardContentRTL: {
    flexDirection: 'row-reverse',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoContentRTL: {
    alignItems: 'flex-end',
  },
  infoTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  coordinatesContainer: {
    marginTop: 4,
  },
  coordinateText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  actionSection: {
    marginBottom: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  actionButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  deleteSection: {
    marginTop: 10,
  },
  deleteButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  deleteButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  deleteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  deleteButtonIcon: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -8,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});