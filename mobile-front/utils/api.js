import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL, NLP_BASE_URL, CLOUDINARY_CONFIG } from '../config';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('jwtToken');
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('jwtToken');
  },
};

// User API calls
export const userAPI = {
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await apiClient.put('/users/profile', userData);
    return response.data;
  },
};

// Complaints API calls
export const plaintesAPI = {
  getMesPlayntes: async () => {
    const response = await apiClient.get('/plaintes/mes-plaintes');
    return response.data;
  },
  
  getPlaynteById: async (id) => {
    const response = await apiClient.get(`/plaintes/${id}`);
    return response.data;
  },
  
  createPlaynte: async (plaintData) => {
    const response = await apiClient.post('/plaintes', plaintData);
    return response.data;
  },
  
  updatePlaynte: async (id, plaintData) => {
    const response = await apiClient.put(`/plaintes/${id}`, plaintData);
    return response.data;
  },
  
  deletePlaynte: async (id) => {
    const response = await apiClient.delete(`/plaintes/${id}`);
    return response.data;
  },
};

// NLP API calls
export const nlpAPI = {
  classifyComplaint: async (description) => {
    const response = await fetch(`${NLP_BASE_URL}/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description }),
    });
    
    if (!response.ok) {
      throw new Error('NLP classification failed');
    }
    
    return response.json();
  },
};

// Cloudinary utilities
export const cloudinaryAPI = {
  uploadImage: async (imageUri) => {
    const data = new FormData();
    data.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    data.append('upload_preset', CLOUDINARY_CONFIG.upload_preset);
    data.append('cloud_name', CLOUDINARY_CONFIG.cloud_name);

    try {
      const response = await fetch(CLOUDINARY_CONFIG.api_url, {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Upload failed');
      }
      
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  },
};

// Utility functions
export const utils = {
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },
  
  formatDateTime: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
  
  getStatusColor: (status) => {
    switch (status?.toUpperCase()) {
      case 'SOUMISE':
        return '#F9AA33';
      case 'EN_COURS':
        return '#007BFF';
      case 'RESOLUE':
        return '#28a745';
      default:
        return '#6c757d';
    }
  },
  
  getStatusLabel: (status) => {
    switch (status?.toUpperCase()) {
      case 'SOUMISE':
        return 'Soumise';
      case 'EN_COURS':
        return 'En cours';
      case 'RESOLUE':
        return 'Résolue';
      default:
        return 'Inconnu';
    }
  },
  
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  validatePassword: (password) => {
    // At least 6 characters
    return password && password.length >= 6;
  },
  
  validateCIN: (cin) => {
    // Moroccan CIN format: 1-2 letters followed by 6-7 digits
    const cinRegex = /^[A-Za-z]{1,2}\d{6,7}$/;
    return cinRegex.test(cin);
  },
  
  truncateText: (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  },
  
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
};

export default apiClient;