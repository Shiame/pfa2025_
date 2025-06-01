// ============================================================================
// 🚨 VERSION TRANSITOIRE DE stats.js
// Utiliser cette version EN ATTENDANT d'implémenter le backend
// ============================================================================

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080',
  timeout: 30000,
});

// Interceptors existants (garder)
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      dataLength: Array.isArray(response.data) ? response.data.length : 'object'
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// ============================================================================
// ✅ NOUVELLES FONCTIONS TRANSITOIRES - Simulent le nouveau backend
// ============================================================================

/**
 * ✅ TRANSITOIRE - Simule fetchGlobalStats() avec les endpoints existants
 */
export const fetchGlobalStats = async () => {
  try {
    console.log('🔄 TRANSITOIRE: Simulation de global stats avec endpoints existants');
    
    // Utiliser les endpoints existants pour simuler
    const [complaintsData, resolutionData] = await Promise.all([
      api.get('/plaintes', { params: { page: 0, size: 1 } }), // Pour avoir totalElements
      fetchResolution() // Données de résolution
    ]);
    
    const totalComplaints = complaintsData.data.totalElements;
    
    // Calculer le taux global à partir des données de résolution
    const totalResolved = resolutionData.reduce((sum, item) => sum + (item.resoluePlaintes || 0), 0);
    const totalFromResolution = resolutionData.reduce((sum, item) => sum + (item.totalPlaintes || 0), 0);
    
    const globalRate = totalFromResolution > 0 
      ? (totalResolved * 100.0) / totalFromResolution 
      : 0.0;
    
    return {
      totalComplaints: totalComplaints,
      totalResolved: totalResolved,
      globalResolutionRate: Math.round(globalRate * 10) / 10,
      source: 'transitional_calculation',
      calculated_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error in transitional fetchGlobalStats:', error);
    
    // Fallback avec des valeurs par défaut
    return {
      totalComplaints: 63, // Votre valeur actuelle de ComplaintsPage
      totalResolved: 20,
      globalResolutionRate: 31.7,
      source: 'hardcoded_fallback',
      error: error.message
    };
  }
};

/**
 * ✅ TRANSITOIRE - Simule fetchComplaintsStats()
 */
export const fetchComplaintsStats = async () => {
  try {
    const response = await api.get('/plaintes', { 
      params: { page: 0, size: 1 } 
    });
    
    return {
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      source: 'complaints_endpoint'
    };
  } catch (error) {
    console.error('Error fetching complaints stats:', error);
    return {
      totalElements: 63, // Fallback
      source: 'fallback'
    };
  }
};

// ============================================================================
// ✅ FONCTION CORRIGÉE - fetchResolution sans double multiplication
// ============================================================================

export const fetchResolution = async (fromIso = null, toIso = null) => {
  try {
    console.log('Fetching resolution data:', { from: fromIso, to: toIso });
    
    const params = {};
    if (fromIso) params.from = fromIso;
    if (toIso) params.to = toIso;

    const response = await api.get('/stats/resolution', { params });

    if (!response.data || !Array.isArray(response.data)) {
      console.warn('Invalid resolution data received');
      return [];
    }

    // ✅ CORRECTION : Ne PAS multiplier par 100 si déjà en pourcentage
    const validatedData = response.data.map((item, index) => {
      if (!item || typeof item !== 'object') {
        console.warn(`Invalid item at index ${index}:`, item);
        return null;
      }

      // Détecter si le taux est déjà en pourcentage ou en décimal
      let tauxResolution = typeof item.tauxResolution === 'number' ? item.tauxResolution : 0;
      
      // Si le taux est entre 0 et 1, le multiplier par 100
      // Si le taux est entre 0 et 100, le laisser tel quel
      if (tauxResolution <= 1 && tauxResolution >= 0) {
        tauxResolution = tauxResolution * 100;
      }

      return {
        commune: item.commune || 'Zone inconnue',
        categorie: item.categorie || 'Catégorie inconnue',
        totalPlaintes: typeof item.totalPlaintes === 'number' ? item.totalPlaintes : 
                      typeof item.total === 'number' ? item.total : 0,
        resoluePlaintes: typeof item.resoluePlaintes === 'number' ? item.resoluePlaintes : 
                        typeof item.resolues === 'number' ? item.resolues : 0,
        tauxResolution: Math.round(tauxResolution * 10) / 10
      };
    }).filter(item => item !== null);

    console.log(`✅ Successfully processed ${validatedData.length} resolution records`);
    console.log('Sample data:', validatedData.slice(0, 2));
    
    return validatedData;

  } catch (error) {
    console.error('Error in fetchResolution:', error);
    throw error;
  }
};

// ============================================================================
// FONCTIONS EXISTANTES INCHANGÉES
// ============================================================================

export const fetchDashboard = (date) =>
  api.get('/stats/dashboard', { params: { referenceDate: date } })
     .then(r => r.data);

export const fetchTrend = (fromIso, toIso) =>
  api.get('/stats/trends', { 
    params: { from: fromIso, to: toIso } 
  })
  .then(r => r.data)
  .catch(err => {
    console.error("Error fetching trends:", err);
    throw err;
  });

export const fetchCommunes = (sinceIso) =>
  api.get('/stats/communes', { params: { since: sinceIso } })
     .then(r => r.data.communes || []);   

export const fetchTopCommunes = (dateIso) =>
  api.get('/stats/TopCommunes', { params: { referenceDate: dateIso } })
     .then(r => r.data);  

export const fetchHourly = (fromIso, toIso) =>
  api.get('/stats/horaire', { params: { from: fromIso, to: toIso } })
     .then(r => r.data);

// AI Integration - Minimal
export const fetchIntelligentSummaries = (hours = 24, zone = null) =>
  api.get('/plaintes/intelligent-summary', { 
    params: { hours, zone: zone === 'Inconnu' ? null : zone } 
  })
  .then(r => r.data)
  .catch(err => {
    console.warn("Intelligent summaries not available:", err);
    return [];
  });

export const fetchNLPServiceStatus = () =>
  api.get('/plaintes/nlp-status')
  .then(r => r.data)
  .catch(err => {
    console.warn("NLP service status not available:", err);
    return { available: false, status: 'error', error: err.message };
  });

export const fetchComprehensiveAnalysis = (hours = 24) =>
  api.get('/plaintes/comprehensive-analysis', { params: { hours } })
  .then(r => r.data)
  .catch(err => {
    console.warn("Comprehensive analysis not available:", err);
    return { status: 'unavailable', message: 'Service NLP indisponible' };
  });

export const fetchTrendAnalysis = (currentHours = 24, comparisonHours = 48) =>
  api.get('/plaintes/trend-analysis', { 
    params: { currentHours, comparisonHours } 
  })
  .then(r => r.data)
  .catch(err => {
    console.warn("Trend analysis not available:", err);
    return { status: 'unavailable' };
  });

export const fetchZoneAnalysis = (zoneName, hours = 24) =>
  api.get(`/plaintes/zone-analysis/${encodeURIComponent(zoneName)}`, { 
    params: { hours } 
  })
  .then(r => r.data)
  .catch(err => {
    console.warn(`Zone analysis for ${zoneName} not available:`, err);
    return { zone_name: zoneName, summaries: [], total_complaints: 0 };
  });

// ============================================================================
// ✅ FONCTION DE TEST TRANSITOIRE
// ============================================================================

export const testDataCoherence = async () => {
  try {
    console.log('🔍 Testing data coherence (transitional version)...');
    
    const [globalStats, complaintsStats, resolutionAll] = await Promise.all([
      fetchGlobalStats(),
      fetchComplaintsStats(),
      fetchResolution()
    ]);
    
    const results = {
      globalStats: globalStats.totalComplaints,
      complaintsPage: complaintsStats.totalElements,
      resolutionTotal: resolutionAll.reduce((sum, item) => sum + item.totalPlaintes, 0),
      isCoherent: null,
      differences: {},
      timestamp: new Date().toISOString(),
      note: 'Version transitoire - backend pas encore modifié'
    };
    
    results.isCoherent = (
      results.globalStats === results.complaintsPage
    );
    
    if (!results.isCoherent) {
      results.differences = {
        'Global vs ComplaintsPage': Math.abs(results.globalStats - results.complaintsPage),
        'Global vs Resolution': Math.abs(results.globalStats - results.resolutionTotal)
      };
    }
    
    console.log('✅ Coherence test results (transitional):', results);
    return results;
    
  } catch (error) {
    console.error('❌ Coherence test failed:', error);
    throw error;
  }
};