// src/api/unifiedApi.js - NOUVEAU FICHIER
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080',
  timeout: 30000,
});

// ✅ NOUVELLE API UNIFIÉE - Source unique de vérité
export const fetchGlobalStats = async (from, to) => {
  try {
    console.log('🔄 Fetching unified global stats:', { from, to });
    
    const response = await api.get('/debug/global-stats', {
      params: {
        from: from.toISOString(),
        to: to.toISOString()
      }
    });

    const data = response.data;
    
    // Validation des données reçues
    if (!data || typeof data.total_plaintes !== 'number') {
      throw new Error('Invalid global stats response structure');
    }

    console.log('✅ Global stats received:', {
      total: data.total_plaintes,
      resolues: data.total_resolues,
      taux: data.taux_resolution_global
    });

    return data;
  } catch (error) {
    console.error('❌ Error fetching global stats:', error);
    throw error;
  }
};

// ✅ VÉRIFICATION DE COHÉRENCE - Nouveau endpoint
export const checkDataConsistency = async (from, to) => {
  try {
    console.log('🔍 Checking data consistency:', { from, to });
    
    const response = await api.get('/debug/data-consistency', {
      params: {
        from: from.toISOString(),
        to: to.toISOString()
      }
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error checking consistency:', error);
    throw error;
  }
};

// ✅ MIGRATION DES APIS EXISTANTES VERS LA SOURCE UNIFIÉE
export const fetchUnifiedDashboard = async (dateRange) => {
  const globalStats = await fetchGlobalStats(dateRange.from, dateRange.to);
  
  return {
    // Format compatible avec l'ancien Dashboard
    frequency: {
      counts: globalStats.top_communes?.map(commune => ({
        zone: commune.commune,
        category: 'MIXED', // Toutes catégories confondues
        count: commune.total
      })) || []
    },
    previousTotal: 0, // TODO: Implémenter comparaison période précédente
    averagePriority: globalStats.average_priority || 0,
    criticalComplaints: globalStats.critical_complaints || 0
  };
};

export const fetchUnifiedResolution = async (from, to) => {
  const globalStats = await fetchGlobalStats(from, to);
  
  // Retourner les données de résolution dans le format attendu
  return globalStats.resolution_data || [];
};

export const fetchUnifiedTopCommunes = async (dateRange) => {
  const globalStats = await fetchGlobalStats(dateRange.from, dateRange.to);
  
  return globalStats.top_communes?.map(commune => ({
    commune: commune.commune,
    total: commune.total,
    totalPlaintes: commune.total // Alias pour compatibilité
  })) || [];
};

// ✅ UTILITAIRES DE MIGRATION
export const migrateToUnifiedAPI = {
  // Dashboard: remplace fetchDashboard
  dashboard: fetchUnifiedDashboard,
  
  // ResolutionPage: remplace fetchResolution  
  resolution: fetchUnifiedResolution,
  
  // StatsPage: remplace fetchTopCommunes
  topCommunes: fetchUnifiedTopCommunes,
  
  // Global: nouvelle source unique
  globalStats: fetchGlobalStats,
  
  // Debug: vérification cohérence
  consistency: checkDataConsistency
};

// ✅ HOOK DE MIGRATION PROGRESSIVE
export const useUnifiedMigration = (oldFetchFunction, newFetchFunction, ...args) => {
  const [useUnified, setUseUnified] = React.useState(
    localStorage.getItem('use_unified_api') === 'true'
  );
  
  const fetchFunction = useUnified ? newFetchFunction : oldFetchFunction;
  
  const toggleAPI = () => {
    const newValue = !useUnified;
    setUseUnified(newValue);
    localStorage.setItem('use_unified_api', newValue.toString());
    console.log(`🔄 Switched to ${newValue ? 'UNIFIED' : 'LEGACY'} API`);
  };
  
  return { fetchFunction, useUnified, toggleAPI };
};

export default {
  fetchGlobalStats,
  checkDataConsistency,
  migrateToUnifiedAPI
};