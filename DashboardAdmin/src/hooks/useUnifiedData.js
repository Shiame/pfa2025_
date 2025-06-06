// src/hooks/useUnifiedData.js - NOUVEAU FICHIER
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchGlobalStats, checkDataConsistency } from '../api/unifiedApi';

// ✅ HOOK PRINCIPAL pour toutes les pages
export const useUnifiedData = (pageType = 'dashboard', initialRange = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [consistency, setConsistency] = useState(null);
  
  const abortControllerRef = useRef(null);

  // Configuration des périodes par défaut selon la page
  const getDefaultRange = useCallback(() => {
    const days = {
      dashboard: 7,
      resolution: 30,
      stats: 30,
      geography: 30,
      complaints: 30
    }[pageType] || 7;

    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - days);
    
    return { from, to };
  }, [pageType]);

  const [dateRange, setDateRange] = useState(initialRange || getDefaultRange());

  // ✅ FONCTION DE CHARGEMENT UNIFIÉE
  const loadData = useCallback(async (range = dateRange, checkConsistencyFlag = false) => {
    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔄 Loading unified data for ${pageType}:`, range);
      
      // Chargement des statistiques globales
      const globalStats = await fetchGlobalStats(range.from, range.to);
      
      // Vérification de cohérence optionnelle
      let consistencyData = null;
      if (checkConsistencyFlag) {
        try {
          consistencyData = await checkDataConsistency(range.from, range.to);
          setConsistency(consistencyData);
        } catch (consistencyError) {
          console.warn('⚠️ Consistency check failed:', consistencyError);
        }
      }
      
      // Adaptation des données selon le type de page
      const adaptedData = adaptDataForPage(globalStats, pageType);
      
      setData(adaptedData);
      setLastFetch(new Date());
      
      console.log(`✅ Data loaded for ${pageType}:`, {
        total: globalStats.total_plaintes,
        resolved: globalStats.total_resolues,
        rate: globalStats.taux_resolution_global,
        consistent: consistencyData?.status === 'CONSISTENT'
      });
      
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(`❌ Error loading data for ${pageType}:`, err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [dateRange, pageType]);

  // ✅ ADAPTATION DES DONNÉES SELON LA PAGE
  const adaptDataForPage = (globalStats, pageType) => {
    const baseData = {
      globalStats,
      totalPlaintes: globalStats.total_plaintes,
      totalResolues: globalStats.total_resolues,
      tauxResolution: globalStats.taux_resolution_global,
      calculatedAt: globalStats.calculated_at
    };

    switch (pageType) {
      case 'dashboard':
        return {
          ...baseData,
          summary: {
            totalPlaintes: globalStats.total_plaintes,
            totalResolues: globalStats.total_resolues,
            tauxResolution: globalStats.taux_resolution_global,
            nouveauPlaintes: 0, // TODO: Implémenter delta
            tauxCroissance: 0,
            zonesPerformantes: globalStats.zones_count || 0,
            totalPlaintesResolution: globalStats.total_plaintes,
            moyennePriorite: globalStats.average_priority || 0,
            plaintesCritiques: globalStats.critical_complaints || 0
          },
          topCommunes: globalStats.top_communes || [],
          resolutionData: globalStats.resolution_data || []
        };

      case 'resolution':
        return {
          ...baseData,
          resolutionData: globalStats.resolution_data || [],
          summaryStats: {
            totalComplaints: globalStats.total_plaintes,
            resolvedComplaints: globalStats.total_resolues,
            avgResolution: globalStats.taux_resolution_global,
            bestPerformer: getBestPerformer(globalStats.resolution_data),
            worstPerformer: getWorstPerformer(globalStats.resolution_data)
          }
        };

      case 'stats':
        return {
          ...baseData,
          topCommunes: globalStats.top_communes || [],
          resolutionRows: globalStats.resolution_data || [],
          enhancedSummary: {
            totalComplaints: globalStats.total_plaintes,
            avgResolutionRate: globalStats.taux_resolution_global,
            communesCount: globalStats.zones_count || 0,
            categoriesCount: globalStats.categories_count || 0
          }
        };

      default:
        return baseData;
    }
  };

  // ✅ UTILITAIRES POUR LES CALCULS
  const getBestPerformer = (resolutionData) => {
    if (!resolutionData || resolutionData.length === 0) return null;
    return resolutionData.reduce((best, current) => 
      (current.tauxResolution || 0) > (best.tauxResolution || 0) ? current : best
    );
  };

  const getWorstPerformer = (resolutionData) => {
    if (!resolutionData || resolutionData.length === 0) return null;
    return resolutionData.reduce((worst, current) => 
      (current.tauxResolution || 0) < (worst.tauxResolution || 0) ? current : worst
    );
  };

  // ✅ FONCTION DE RAFRAÎCHISSEMENT
  const refresh = useCallback((checkConsistency = false) => {
    return loadData(dateRange, checkConsistency);
  }, [loadData, dateRange]);

  // ✅ CHANGEMENT DE PÉRIODE
  const updateDateRange = useCallback((newRange) => {
    setDateRange(newRange);
  }, []);

  // ✅ CHARGEMENT INITIAL
  useEffect(() => {
    loadData(dateRange, false);
    
    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [dateRange, pageType]);

  return {
    // Données
    data,
    loading,
    error,
    lastFetch,
    consistency,
    
    // Actions
    refresh,
    updateDateRange,
    checkConsistency: () => refresh(true),
    
    // État
    dateRange,
    pageType,
    
    // Utilitaires
    isConsistent: consistency?.status === 'CONSISTENT',
    dataQuality: data?.globalStats?.data_quality_status || 'UNKNOWN'
  };
};

// ✅ HOOK SPÉCIALISÉ POUR LA VALIDATION CROISÉE
export const useDataValidation = (primaryData, secondaryDataSource) => {
  const [validation, setValidation] = useState(null);
  
  useEffect(() => {
    if (!primaryData || !secondaryDataSource) return;
    
    const validateData = async () => {
      try {
        const secondaryData = await secondaryDataSource();
        
        const primaryTotal = extractTotal(primaryData);
        const secondaryTotal = extractTotal(secondaryData);
        
        const difference = Math.abs(primaryTotal - secondaryTotal);
        const percentageDiff = primaryTotal > 0 ? (difference / primaryTotal) * 100 : 0;
        
        setValidation({
          consistent: difference <= 1, // Tolérance de 1
          primaryTotal,
          secondaryTotal,
          difference,
          percentageDiff: Math.round(percentageDiff * 10) / 10
        });
        
      } catch (error) {
        console.error('❌ Validation error:', error);
        setValidation({ error: error.message });
      }
    };
    
    validateData();
  }, [primaryData, secondaryDataSource]);
  
  return validation;
};

// ✅ UTILITAIRE D'EXTRACTION DE TOTAL
const extractTotal = (data) => {
  if (typeof data === 'number') return data;
  if (data?.totalPlaintes) return data.totalPlaintes;
  if (data?.total_plaintes) return data.total_plaintes;
  if (data?.totalElements) return data.totalElements;
  if (Array.isArray(data)) {
    return data.reduce((sum, item) => sum + (item.total || item.count || 0), 0);
  }
  return 0;
};

// ✅ HOOK POUR L'AUTO-REFRESH
export const useAutoRefresh = (refreshFunction, intervalMinutes = 5) => {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef(null);
  
  useEffect(() => {
    if (autoRefresh && refreshFunction) {
      intervalRef.current = setInterval(() => {
        console.log('🔄 Auto-refreshing data...');
        refreshFunction();
      }, intervalMinutes * 60 * 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshFunction, intervalMinutes]);
  
  return { autoRefresh, setAutoRefresh };
};

export default useUnifiedData;