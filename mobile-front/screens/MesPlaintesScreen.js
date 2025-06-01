import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { BASE_URL } from '../config';
import { useLanguage } from '../contexts/LanguageContext';

export default function MesPlaintesScreen({ navigation }) {
  const { t, currentLanguage, isRTL } = useLanguage();
  const [plaintes, setPlaintes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalPlaintes: 0,
    plaintesResolues: 0,
    plaintesEnCours: 0,
    plaintesSoumises: 0
  });

  useEffect(() => {
    fetchPlaintes();
  }, []);

  const fetchPlaintes = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const res = await axios.get(`${BASE_URL}/plaintes/mes-plaintes`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPlaintes(res.data);
      calculateStats(res.data);
    } catch (error) {
      console.error(error);
      setError(t('failedToLoadComplaints'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }; 

  const calculateStats = (plaintesData) => {
    const total = plaintesData.length;
    const resolues = plaintesData.filter(p => p.statut?.trim().toUpperCase() === 'RESOLUE').length;
    const enCours = plaintesData.filter(p => p.statut?.trim().toUpperCase() === 'EN_COURS').length;
    const soumises = plaintesData.filter(p => p.statut?.trim().toUpperCase() === 'SOUMISE').length;
    
    setStats({
      totalPlaintes: total,
      plaintesResolues: resolues,
      plaintesEnCours: enCours,
      plaintesSoumises: soumises
    });
  };

  const getStatusColor = (statut) => {
    switch (statut?.trim().toUpperCase()) {
      case "SOUMISE":
        return '#F4A261';
      case "EN_COURS":
        return '#3498DB';
      case "RESOLUE":
        return '#27AE60';
      default:
        return '#95A5A6';
    }
  };

  const getStatusText = (statut) => {
    switch (statut?.trim().toUpperCase()) {
      case "SOUMISE":
        return t('submitted');
      case "EN_COURS":
        return t('inProgress');
      case "RESOLUE":
        return t('resolved');
      default:
        return statut;
    }
  };

  const getStatusIcon = (statut) => {
    switch (statut?.trim().toUpperCase()) {
      case "SOUMISE":
        return 'clock-o';
      case "EN_COURS":
        return 'cog';
      case "RESOLUE":
        return 'check-circle';
      default:
        return 'question-circle';
    }
  };

  const getCategoryColor = (id) => {
    switch (id) {
      case 1: return '#E67E22'; // Déchets (orange)
      case 2: return '#E74C3C'; // Agression (rouge)
      case 3: return '#8E44AD'; // Corruption (violet)
      case 4: return '#3498DB'; // Voirie (bleu)
      case 5: return '#95A5A6'; // Autres (gris)
      default: return '#C41E3A';
    }
  };

  const StatCard = ({ icon, title, value, color, iconLib = "FontAwesome5" }) => (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 249, 250, 0.9)']}
        style={styles.statCardGradient}
      >
        <View style={[styles.statIconContainer, { backgroundColor: color }]}>
          {iconLib === "MaterialIcons" ? (
            <MaterialIcons name={icon} size={18} color="#fff" />
          ) : (
            <FontAwesome5 name={icon} size={16} color="#fff" />
          )}
        </View>
        <View style={[styles.statContent, isRTL && styles.statContentRTL]}>
          <Text style={[styles.statValue, isRTL && styles.textRTL]}>{value}</Text>
          <Text style={[styles.statTitle, isRTL && styles.textRTL]}>{title}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.complaintsCard}
      onPress={() => navigation.navigate('Details de Plainte', { plainteId: item.id })}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['#fff', '#f8f9fa']}
        style={styles.cardGradient}
      >
        <View style={[styles.cardHeader, isRTL && styles.cardHeaderRTL]}>
          <View style={[styles.statusContainer, isRTL && styles.statusContainerRTL]}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statut) }]}>
              <FontAwesome5 name={getStatusIcon(item.statut)} size={12} color="#fff" />
              <Text style={[styles.statusText, isRTL && styles.textRTL]}>
                {getStatusText(item.statut)}
              </Text>
            </View>
          </View>
          <Text style={[styles.dateText, isRTL && styles.textRTL]}>
            {new Date(item.dateSoumission).toLocaleDateString(
              currentLanguage === 'ar' ? 'ar-MA' : 'fr-FR'
            )}
          </Text>
        </View>

        <Text style={[
          styles.description, 
          isRTL && styles.textRTL
        ]} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={[styles.cardFooter, isRTL && styles.cardFooterRTL]}>
          <View style={[styles.categoryContainer, isRTL && styles.categoryContainerRTL]}>
            {item.categorie && (
              <View style={[
                  styles.categoryTag, 
                  { backgroundColor: getCategoryColor(item.categorie?.id) }
                ]}>
                <MaterialIcons name="category" size={14} color="#fff" />
                <Text style={[styles.categoryText, isRTL && styles.textRTL, { color: '#fff' }]}>
                  {item.categorie.nom}
                </Text>
            </View>

            )}
          </View>
          
          <View style={[styles.actionButton, isRTL && styles.actionButtonRTL]}>
            <Text style={[styles.viewDetails, isRTL && styles.textRTL]}>
              {t('viewDetails')}
            </Text>
            <MaterialIcons 
              name={isRTL ? "arrow-back-ios" : "arrow-forward-ios"} 
              size={14} 
              color="#C41E3A" 
            />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={['rgba(196, 30, 58, 0.1)', 'rgba(0, 98, 51, 0.1)']}
        style={styles.emptyGradient}
      >
        <MaterialIcons name="inbox" size={80} color="#C41E3A" />
        <Text style={[styles.emptyTitle, isRTL && styles.textRTL]}>
          {t('noComplaints')}
        </Text>
        <Text style={[styles.emptySubtitle, isRTL && styles.textRTL]}>
          {t('startReporting')}
        </Text>
      </LinearGradient>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <LinearGradient colors={['#f8f9fa', '#e9ecef']} style={styles.centeredContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C41E3A" />
          <Text style={[styles.loadingText, isRTL && styles.textRTL]}>
            {t('loadingComplaints')}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={['#f8f9fa', '#e9ecef']} style={styles.centeredContainer}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={60} color="#E74C3C" />
          <Text style={[styles.errorText, isRTL && styles.textRTL]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchPlaintes()}>
            <LinearGradient colors={['#C41E3A', '#8B1538']} style={styles.retryButtonGradient}>
              <MaterialIcons name="refresh" size={18} color="#fff" />
              <Text style={[styles.retryButtonText, isRTL && styles.textRTL]}>
                {t('retry')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f8f9fa', '#e9ecef']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={['#C41E3A', '#8B1538']} style={styles.headerGradient}>
          <View style={[styles.headerContent, isRTL && styles.headerContentRTL]}>
            <View style={[styles.headerTextContainer, isRTL && styles.headerTextContainerRTL]}>
              <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>
                {t('myComplaints')}
              </Text>
              <Text style={[styles.headerSubtitle, isRTL && styles.textRTL]}>
                {currentLanguage === 'ar' 
              ? 'تتبع الشكاوى الخاصة بك' 
              : 'SuivezVosPlaintes'
            }
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Statistics Section */}
      <View style={styles.statsSection}>
        <View style={styles.statsSectionHeader}>
          <MaterialIcons name="analytics" size={20} color="#C41E3A" />
          <Text style={[styles.statsSectionTitle, isRTL && styles.textRTL]}>
            {t('statistics') || 'Statistiques'}
          </Text>
        </View>
        <View style={[styles.statsContainer, isRTL && styles.statsContainerRTL]}>
          <StatCard 
            icon="inbox" 
            iconLib="MaterialIcons"
            title={t('total') || 'Total'} 
            value={stats.totalPlaintes} 
            color="#C41E3A" 
          />
          <StatCard 
            icon="schedule" 
            iconLib="MaterialIcons"
            title={t('submitted') || 'Soumises'} 
            value={stats.plaintesSoumises} 
            color="#F4A261" 
          />
          <StatCard 
            icon="sync" 
            iconLib="MaterialIcons"
            title={t('inProgress') || 'En cours'} 
            value={stats.plaintesEnCours} 
            color="#3498DB" 
          />
          <StatCard 
            icon="check-circle" 
            iconLib="MaterialIcons"
            title={t('resolved') || 'Résolues'} 
            value={stats.plaintesResolues} 
            color="#27AE60" 
          />
        </View>
      </View>

      <FlatList
        data={plaintes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyListComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchPlaintes(true)}
            colors={['#C41E3A']}
            tintColor="#C41E3A"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Action Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => navigation.navigate('Soumettre une plainte')}
          activeOpacity={0.9}
        >
          <LinearGradient colors={['#C41E3A', '#8B1538']} style={styles.bottomButtonGradient}>
            <MaterialIcons name="add-circle-outline" size={22} color="#fff" />
            <Text style={[styles.bottomButtonText, isRTL && styles.textRTL]}>
              {t('addNewComplaint') || 'Nouvelle plainte'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 0,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerContentRTL: {
    alignItems: 'center',
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerTextContainerRTL: {
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
    textAlign: 'center',
  },
  statsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsContainerRTL: {
    flexDirection: 'row-reverse',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 3,
    borderRadius: 12,
    overflow: 'hidden',
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statCardGradient: {
    padding: 12,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statContent: {
    alignItems: 'center',
  },
  statContentRTL: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statTitle: {
    fontSize: 10,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 2,
  },
  listContent: { 
    paddingHorizontal: 20,
    paddingBottom: 120,
    flexGrow: 1,
  },
  complaintsCard: { 
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
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
  statusContainer: {
    flex: 1,
  },
  statusContainerRTL: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  description: { 
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    lineHeight: 22,
    marginBottom: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooterRTL: {
    flexDirection: 'row-reverse',
  },
  categoryContainer: {
    flex: 1,
  },
  categoryContainerRTL: {
    alignItems: 'flex-end',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(196, 30, 58, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#C41E3A',
    fontWeight: '600',
    marginLeft: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonRTL: {
    flexDirection: 'row-reverse',
  },
  viewDetails: {
    fontSize: 12,
    color: '#C41E3A',
    fontWeight: '600',
    marginRight: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyGradient: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 20,
    width: '100%',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 25,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  bottomButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  bottomButtonText: { 
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  // RTL Text Alignment
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});