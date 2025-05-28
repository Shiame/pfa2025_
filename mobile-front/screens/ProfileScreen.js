import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { BASE_URL } from '../config';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

export default function ProfileScreen({ navigation }) {
  const { t, currentLanguage, isRTL } = useLanguage();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlaintes: 0,
    plaintesResolues: 0,
    plaintesEnCours: 0
  });

  useEffect(() => {
    loadUserProfile();
    loadUserStats();
  }, []);

  const loadUserProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('jwtToken');
    if (token) {
      const decoded = jwtDecode(token);

      try {
        const response = await axios.get(`${BASE_URL}/utilisateurs/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Log backend response for debugging
        console.log("Profile API response:", response.data);

        // Accept both { utilisateur: {...} } and { ... }
        let user = response.data;
        if (user.utilisateur) {
          setUserInfo(user.utilisateur);
        } else if (user) {
          setUserInfo(user);
        } else {
          setUserInfo({
            email: decoded.sub,
            nom: 'Utilisateur',
            prenom: '',
            cin: 'N/A'
          });
        }
      } catch (apiError) {
        // Fallback to token data if API fails
        setUserInfo({
          email: decoded.sub,
          nom: 'Utilisateur',
          prenom: '',
          cin: 'N/A'
        });
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  } finally {
    setLoading(false);
  }
};


  const loadUserStats = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await axios.get(`${BASE_URL}/plaintes/mes-plaintes`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const plaintes = response.data;
      const total = plaintes.length;
      const resolues = plaintes.filter(p => p.statut === 'RESOLUE').length;
      const enCours = plaintes.filter(p => p.statut === 'EN_COURS').length;
      
      setStats({
        totalPlaintes: total,
        plaintesResolues: resolues,
        plaintesEnCours: enCours
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirm'),
      [
        {
          text: t('cancel'),
          style: "cancel"
        },
        {
          text: t('logoutButton'),
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem('jwtToken');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  const ProfileCard = ({ icon, title, value, color = "#C41E3A" }) => (
    <View style={[styles.profileCard, isRTL && styles.profileCardRTL]}>
      <LinearGradient
        colors={['rgba(196, 30, 58, 0.1)', 'rgba(255, 255, 255, 0.5)']}
        style={styles.profileCardGradient}
      >
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <MaterialIcons name={icon} size={20} color="#fff" />
        </View>
        <View style={[styles.cardContent, isRTL && styles.cardContentRTL]}>
          <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>{title}</Text>
          <Text style={[styles.cardValue, isRTL && styles.textRTL]}>{value}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const StatCard = ({ icon, title, value, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }, isRTL && { borderRightColor: color, borderLeftColor: 'transparent' }]}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.9)', 'rgba(248, 249, 250, 0.9)']}
        style={styles.statCardGradient}
      >
        <FontAwesome5 name={icon} size={18} color={color} />
        <View style={[styles.statContent, isRTL && styles.statContentRTL]}>
          <Text style={[styles.statValue, isRTL && styles.textRTL]}>{value}</Text>
          <Text style={[styles.statTitle, isRTL && styles.textRTL]}>{title}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const ActionButton = ({ icon, title, onPress, showArrow = true }) => (
    <TouchableOpacity 
      style={[styles.actionButton, isRTL && styles.actionButtonRTL]} 
      onPress={onPress}
    >
      <View style={[styles.actionButtonContent, isRTL && styles.actionButtonContentRTL]}>
        <MaterialIcons name={icon} size={20} color="#C41E3A" />
        <Text style={[styles.actionButtonText, isRTL && styles.textRTL]}>{title}</Text>
        {showArrow && (
          <MaterialIcons 
            name={isRTL ? "chevron-left" : "chevron-right"} 
            size={20} 
            color="#ccc" 
          />
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#f8f9fa', '#e9ecef']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C41E3A" />
        <Text style={[styles.loadingText, isRTL && styles.textRTL]}>
          {t('loading')}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f8f9fa', '#e9ecef']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <LinearGradient colors={['#C41E3A', '#8B1538']} style={styles.headerGradient}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <FontAwesome5 name="user" size={30} color="#C41E3A" />
              </View>
              <Text style={[styles.userName, isRTL && styles.textRTL]}>
                {userInfo?.nom} {userInfo?.prenom}
              </Text>
              <Text style={[styles.userEmail, isRTL && styles.textRTL]}>
                {userInfo?.email}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Language Selection */}
        <View style={styles.section}>
          <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.sectionGradient}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {t('language')} 
            </Text>
            <LanguageSelector />
          </LinearGradient>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.sectionGradient}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {t('statistics')}
            </Text>
            <View style={[styles.statsContainer, isRTL && styles.statsContainerRTL]}>
              <StatCard 
                icon="clipboard-list" 
                title={t('totalComplaints')} 
                value={stats.totalPlaintes} 
                color="#C41E3A" 
              />
              <StatCard 
                icon="clock" 
                title={t('inProgress')} 
                value={stats.plaintesEnCours} 
                color="#F4A261" 
              />
              <StatCard 
                icon="check-circle" 
                title={t('resolved')} 
                value={stats.plaintesResolues} 
                color="#27AE60" 
              />
            </View>
          </LinearGradient>
        </View>

        {/* Profile Info Section */}
        <View style={styles.section}>
          <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.sectionGradient}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {t('personalInfo')}
            </Text>
            <ProfileCard 
              icon="person" 
              title={t('fullName')} 
              value={`${userInfo?.nom || 'N/A'} ${userInfo?.prenom || ''}`} 
            />
            <ProfileCard 
              icon="email" 
              title={t('email')} 
              value={userInfo?.email || 'N/A'} 
            />
            <ProfileCard 
              icon="credit-card" 
              title={t('cin')} 
              value={userInfo?.cin || 'N/A'} 
            />
          </LinearGradient>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.sectionGradient}>
            <ActionButton 
              icon="edit" 
              title={t('editProfile')} 
              onPress={() => {}}
            />
            <ActionButton 
              icon="help" 
              title={t('helpSupport')} 
              onPress={() => {}}
            />
            <ActionButton 
              icon="info" 
              title={t('about')} 
              onPress={() => {}}
            />
          </LinearGradient>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LinearGradient colors={['#E74C3C', '#C0392B']} style={styles.logoutButtonGradient}>
              <MaterialIcons name="logout" size={20} color="#fff" />
              <Text style={[styles.logoutButtonText, isRTL && styles.textRTL]}>
                {t('logoutButton')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoText, isRTL && styles.textRTL]}>
            {t('appName')} {t('version')} 1.0.0
          </Text>
          <Text style={[styles.appInfoText, isRTL && styles.textRTL]}>
            {currentLanguage === 'ar' 
              ? 'صوتك من أجل مغرب أفضل' 
              : 'Votre voix pour un Maroc meilleur'
            }
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    marginBottom: 15,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionGradient: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
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
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden',
    borderLeftWidth: 4,
  },
  statCardGradient: {
    padding: 15,
    alignItems: 'center',
  },
  statContent: {
    alignItems: 'center',
    marginTop: 8,
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
    fontSize: 11,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 2,
  },
  profileCard: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  profileCardRTL: {
    // RTL specific styles if needed
  },
  profileCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  iconContainer: {
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardContentRTL: {
    alignItems: 'flex-end',
  },
  cardTitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  actionButton: {
    marginBottom: 1,
  },
  actionButtonRTL: {
    // RTL specific styles if needed
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButtonContentRTL: {
    flexDirection: 'row-reverse',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 15,
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appInfoText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
    textAlign: 'center',
  },
  // RTL Text Alignment
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});