// Multilingual utility functions

import { I18nManager } from 'react-native';

/**
 * Format date according to current language
 * @param {Date|string} date - The date to format
 * @param {string} language - Current language (ar|fr)
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, language = 'fr', options = {}) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };

  const locale = language === 'ar' ? 'ar-MA' : 'fr-FR';
  
  try {
    return dateObj.toLocaleDateString(locale, defaultOptions);
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateObj.toLocaleDateString('fr-FR', defaultOptions);
  }
};

/**
 * Format time according to current language
 * @param {Date|string} date - The date to format
 * @param {string} language - Current language (ar|fr)
 * @returns {string} Formatted time string
 */
export const formatTime = (date, language = 'fr') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = language === 'ar' ? 'ar-MA' : 'fr-FR';
  
  try {
    return dateObj.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Time formatting error:', error);
    return dateObj.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

/**
 * Format numbers according to current language
 * @param {number} number - The number to format
 * @param {string} language - Current language (ar|fr)
 * @param {object} options - Formatting options
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, language = 'fr', options = {}) => {
  const locale = language === 'ar' ? 'ar-MA' : 'fr-FR';
  
  try {
    return number.toLocaleString(locale, options);
  } catch (error) {
    console.error('Number formatting error:', error);
    return number.toLocaleString('fr-FR', options);
  }
};

/**
 * Get text direction for the current language
 * @param {string} language - Current language (ar|fr)
 * @returns {string} Text direction ('rtl' or 'ltr')
 */
export const getTextDirection = (language) => {
  return language === 'ar' ? 'rtl' : 'ltr';
};

/**
 * Get text alignment for the current language
 * @param {string} language - Current language (ar|fr)
 * @returns {string} Text alignment ('right' or 'left')
 */
export const getTextAlign = (language) => {
  return language === 'ar' ? 'right' : 'left';
};

/**
 * Get appropriate flex direction for the current language
 * @param {string} language - Current language (ar|fr)
 * @param {boolean} reverse - Whether to reverse the direction
 * @returns {string} Flex direction
 */
export const getFlexDirection = (language, reverse = false) => {
  const isRTL = language === 'ar';
  
  if (reverse) {
    return isRTL ? 'row' : 'row-reverse';
  }
  
  return isRTL ? 'row-reverse' : 'row';
};

/**
 * Get complaint status translation
 * @param {string} status - Status key
 * @param {function} t - Translation function
 * @returns {string} Translated status
 */
export const getComplaintStatus = (status, t) => {
  const statusMap = {
    'SOUMISE': t('submitted'),
    'EN_COURS': t('inProgress'),
    'RESOLUE': t('resolved'),
  };
  
  return statusMap[status?.toUpperCase()] || status;
};

/**
 * Get status color based on status
 * @param {string} status - Status key
 * @returns {string} Color hex code
 */
export const getStatusColor = (status) => {
  const colorMap = {
    'SOUMISE': '#F4A261',
    'EN_COURS': '#3498DB',
    'RESOLUE': '#27AE60',
  };
  
  return colorMap[status?.toUpperCase()] || '#95A5A6';
};

/**
 * Get status icon based on status
 * @param {string} status - Status key
 * @returns {string} Icon name
 */
export const getStatusIcon = (status) => {
  const iconMap = {
    'SOUMISE': 'clock-o',
    'EN_COURS': 'cog',
    'RESOLUE': 'check-circle',
  };
  
  return iconMap[status?.toUpperCase()] || 'question-circle';
};

/**
 * Validate Moroccan CIN format
 * @param {string} cin - CIN to validate
 * @returns {boolean} Whether CIN is valid
 */
export const validateMoroccanCIN = (cin) => {
  if (!cin || typeof cin !== 'string') return false;
  
  // Remove spaces and convert to uppercase
  const cleanCIN = cin.replace(/\s/g, '').toUpperCase();
  
  // Moroccan CIN patterns:
  // - Old format: 1-2 letters + 6-7 digits
  // - New format: 2 letters + 6 digits
  const patterns = [
    /^[A-Z]{1,2}\d{6,7}$/,  // General pattern
    /^[A-Z]{2}\d{6}$/,      // New format
  ];
  
  return patterns.some(pattern => pattern.test(cleanCIN));
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Get error message for validation
 * @param {string} field - Field name
 * @param {string} type - Error type
 * @param {function} t - Translation function
 * @returns {string} Error message
 */
export const getValidationError = (field, type, t) => {
  const errorMap = {
    required: {
      email: t('emailRequired'),
      password: t('passwordRequired'),
      name: t('nameRequired'),
      description: t('descriptionRequired'),
      location: t('locationRequired'),
    },
    invalid: {
      email: t('invalidEmail') || 'Email invalide',
      cin: t('invalidCIN') || 'CIN invalide',
      password: t('weakPassword') || 'Mot de passe trop faible',
    }
  };
  
  return errorMap[type]?.[field] || `${field} ${type}`;
};

/**
 * Truncate text with language-appropriate ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} language - Current language
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100, language = 'fr') => {
  if (!text || text.length <= maxLength) return text;
  
  const ellipsis = language === 'ar' ? '...' : '...';
  return text.substring(0, maxLength - ellipsis.length) + ellipsis;
};

/**
 * Format file size with language-appropriate units
 * @param {number} bytes - File size in bytes
 * @param {string} language - Current language
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, language = 'fr') => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = language === 'ar' 
    ? ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت']
    : ['B', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get relative time string
 * @param {Date|string} date - Date to compare
 * @param {string} language - Current language
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date, language = 'fr') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMinutes = Math.floor((now - dateObj) / (1000 * 60));
  
  if (language === 'ar') {
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    
    return formatDate(dateObj, language);
  } else {
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return formatDate(dateObj, language);
  }
};

/**
 * Force RTL layout update
 * @param {boolean} isRTL - Whether to enable RTL
 */
export const forceRTLUpdate = (isRTL) => {
  try {
    I18nManager.forceRTL(isRTL);
  } catch (error) {
    console.warn('Failed to force RTL layout:', error);
  }
};

/**
 * Get platform-specific text input props for RTL
 * @param {boolean} isRTL - Whether RTL is enabled
 * @returns {object} TextInput props
 */
export const getRTLTextInputProps = (isRTL) => {
  return {
    textAlign: isRTL ? 'right' : 'left',
    writingDirection: isRTL ? 'rtl' : 'ltr',
  };
};

/**
 * Create style object for RTL support
 * @param {object} baseStyle - Base style object
 * @param {object} rtlStyle - RTL-specific style
 * @param {boolean} isRTL - Whether RTL is enabled
 * @returns {object} Combined style object
 */
export const createRTLStyle = (baseStyle, rtlStyle, isRTL) => {
  return isRTL ? { ...baseStyle, ...rtlStyle } : baseStyle;
};

export default {
  formatDate,
  formatTime,
  formatNumber,
  getTextDirection,
  getTextAlign,
  getFlexDirection,
  getComplaintStatus,
  getStatusColor,
  getStatusIcon,
  validateMoroccanCIN,
  validateEmail,
  getValidationError,
  truncateText,
  formatFileSize,
  getRelativeTime,
  forceRTLUpdate,
  getRTLTextInputProps,
  createRTLStyle,
};