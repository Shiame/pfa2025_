import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';

const { width } = Dimensions.get('window');

const LanguageSelector = ({ style }) => {
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(300));

  const languages = [
    {
      code: 'fr',
      name: 'Français',
      nativeName: 'Français',
      flag: '🇫🇷',
      description: 'French'
    },
    {
      code: 'ar',
      name: 'العربية',
      nativeName: 'العربية',
      flag: '🇲🇦',
      description: 'Arabic'
    }
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  const showModal = () => {
    setModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const selectLanguage = async (languageCode) => {
    await changeLanguage(languageCode);
    hideModal();
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity style={styles.selector} onPress={showModal}>
        <View style={styles.currentLanguage}>
          <Text style={styles.flag}>{currentLang?.flag}</Text>
          <Text style={styles.languageName}>{currentLang?.nativeName}</Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
        </View>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground} 
            onPress={hideModal}
            activeOpacity={1}
          />
          
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={['#fff', '#f8f9fa']}
              style={styles.modalGradient}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('language')} | اللغة</Text>
                <TouchableOpacity onPress={hideModal} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Language Options */}
              <View style={styles.languageList}>
                {languages.map((language) => (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageOption,
                      currentLanguage === language.code && styles.selectedLanguage
                    ]}
                    onPress={() => selectLanguage(language.code)}
                  >
                    <LinearGradient
                      colors={
                        currentLanguage === language.code 
                          ? ['rgba(196, 30, 58, 0.1)', 'rgba(0, 98, 51, 0.1)']
                          : ['transparent', 'transparent']
                      }
                      style={styles.languageOptionGradient}
                    >
                      <View style={styles.languageInfo}>
                        <Text style={styles.languageFlag}>{language.flag}</Text>
                        <View style={styles.languageTexts}>
                          <Text style={[
                            styles.languageDisplayName,
                            currentLanguage === language.code && styles.selectedText
                          ]}>
                            {language.nativeName}
                          </Text>
                          <Text style={styles.languageDescription}>
                            {language.description}
                          </Text>
                        </View>
                      </View>
                      
                      {currentLanguage === language.code && (
                        <View style={styles.checkContainer}>
                          <MaterialIcons name="check-circle" size={24} color="#C41E3A" />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Footer */}
              <View style={styles.modalFooter}>
                <Text style={styles.footerText}>
                  {currentLanguage === 'ar' 
                    ? 'ستحتاج إلى إعادة تشغيل التطبيق لتطبيق التغييرات'
                    : 'Un redémarrage peut être nécessaire pour appliquer les changements'
                  }
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  selector: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
  },
  currentLanguage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  flag: {
    fontSize: 20,
    marginRight: 10,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '60%',
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeButton: {
    padding: 5,
  },
  languageList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  languageOption: {
    marginBottom: 10,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  selectedLanguage: {
    borderColor: '#C41E3A',
    borderWidth: 2,
  },
  languageOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 15,
  },
  languageTexts: {
    flex: 1,
  },
  languageDisplayName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  selectedText: {
    color: '#C41E3A',
  },
  languageDescription: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  checkContainer: {
    marginLeft: 10,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 15,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default LanguageSelector;