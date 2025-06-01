import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  MapPin, 
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Calendar,
  Activity,
  Users,
  Filter,
  Info,
  Zap,
  TrendingDown,
  Minus,
  Search
} from 'lucide-react';

import PeriodPicker from '../components/PeriodPicker';
import CatSelect from '../components/CatSelect';
import HourlyArea from '../components/HourlyArea'; // Import du composant séparé

import { 
  fetchTopCommunes, 
  fetchResolution, 
  fetchHourly,
  fetchGlobalStats
} from '../api/stats';

// Enhanced TopList Component (inline for this demo)
const EnhancedTopList = ({ communes = [], loading = false }) => {
  const [viewMode, setViewMode] = useState('table');
  const [sortBy, setSortBy] = useState('totalPlaintes');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTopOnly, setShowTopOnly] = useState(false);
  
  // Handle different data formats from backend
  const normalizedCommunes = useMemo(() => {
    return communes.map(c => ({
      commune: c.commune || c.zone || c.name || 'Inconnu',
      totalPlaintes: c.totalPlaintes || c.total || c.count || 0,
      ...c
    }));
  }, [communes]);

  // Filter and sort communes
  const processedCommunes = useMemo(() => {
    let filtered = normalizedCommunes;
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(c => 
        c.commune.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply top filter
    if (showTopOnly) {
      filtered = filtered.slice(0, 5);
    }
    
    // Sort communes
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'totalPlaintes') {
        return b.totalPlaintes - a.totalPlaintes;
      }
      return a.commune.localeCompare(b.commune);
    });
    
    return sorted;
  }, [normalizedCommunes, searchTerm, showTopOnly, sortBy]);

  const stats = useMemo(() => {
    const totalPlaintes = processedCommunes.reduce((sum, c) => sum + c.totalPlaintes, 0);
    const maxPlaintes = Math.max(...processedCommunes.map(c => c.totalPlaintes), 0);
    const avgPlaintes = processedCommunes.length > 0 ? totalPlaintes / processedCommunes.length : 0;
    
    return { totalPlaintes, maxPlaintes, avgPlaintes, communesCount: processedCommunes.length };
  }, [processedCommunes]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="w-24 h-4 bg-gray-300 rounded"></div>
            </div>
            <div className="w-16 h-4 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (normalizedCommunes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="font-medium text-gray-700 mb-2">Aucune donnée disponible</h3>
        <p className="text-sm">Aucune commune trouvée pour cette période</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span><span className="font-medium">{stats.communesCount}</span> commune{stats.communesCount > 1 ? 's' : ''}</span>
        <span><span className="font-medium">{stats.totalPlaintes.toLocaleString()}</span> plaintes total</span>
      </div>
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {processedCommunes.slice(0, 15).map((c, idx) => {
          const percentage = stats.totalPlaintes > 0 ? (c.totalPlaintes / stats.totalPlaintes) * 100 : 0;
          const isTop3 = idx < 3;
          
          return (
            <div
              key={c.commune}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                isTop3 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  idx === 0 ? 'bg-yellow-500 text-white' :
                  idx === 1 ? 'bg-gray-400 text-white' :
                  idx === 2 ? 'bg-orange-400 text-white' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {idx + 1}
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 truncate max-w-32" title={c.commune}>
                    {c.commune}
                  </p>
                  <p className="text-xs text-gray-500">
                    {percentage.toFixed(1)}% du total
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-bold text-gray-900">{c.totalPlaintes.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">plaintes</p>
                </div>
                
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      idx === 0 ? 'bg-yellow-500' :
                      idx === 1 ? 'bg-gray-400' :
                      idx === 2 ? 'bg-orange-400' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${(c.totalPlaintes / stats.maxPlaintes) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Enhanced ResolutionTable Component (simplified)
const EnhancedResolutionTable = ({ rows = [] }) => {
  const [selectedCommune, setSelectedCommune] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  const communes = useMemo(() => {
    const uniqueCommunes = [...new Set(rows.map(r => r.commune))].filter(Boolean);
    return ['all', ...uniqueCommunes];
  }, [rows]);

  const filtered = useMemo(() => {
    let data = rows;
    
    if (selectedCommune !== 'all') {
      data = data.filter(r => r.commune === selectedCommune);
    }
    
    return data.sort((a, b) => {
      return sortOrder === 'desc' 
        ? (b.tauxResolution || 0) - (a.tauxResolution || 0)
        : (a.tauxResolution || 0) - (b.tauxResolution || 0);
    });
  }, [rows, selectedCommune, sortOrder]);

  const avgResolution = useMemo(() => {
    if (filtered.length === 0) return 0;
    return filtered.reduce((sum, r) => sum + (r.tauxResolution || 0), 0) / filtered.length;
  }, [filtered]);

  if (rows.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Aucune donnée de résolution disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">{avgResolution.toFixed(1)}%</div>
            <div className="text-xs text-gray-600">Taux moyen</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">{filtered.length}</div>
            <div className="text-xs text-gray-600">Catégories</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">
              {filtered.reduce((sum, r) => sum + (r.total || r.totalPlaintes || 0), 0)}
            </div>
            <div className="text-xs text-gray-600">Total plaintes</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <select
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          value={selectedCommune}
          onChange={e => setSelectedCommune(e.target.value)}
        >
          <option value="all">Toutes les communes</option>
          {communes.slice(1).map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        
        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1"
        >
          <Filter className="w-4 h-4" />
          {sortOrder === 'desc' ? '↓' : '↑'}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Catégorie
              </th>
              {selectedCommune === 'all' && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Commune
                </th>
              )}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Résolues
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Taux
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Performance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((r, idx) => {
              const isAboveAvg = (r.tauxResolution || 0) > avgResolution;
              const rate = r.tauxResolution || 0;
              
              return (
                <tr key={`${r.commune}-${r.categorie}-${idx}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {r.categorie || 'N/A'}
                  </td>
                  {selectedCommune === 'all' && (
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {r.commune || 'N/A'}
                    </td>
                  )}
                  <td className="px-4 py-3 text-center text-sm">
                    {(r.total || r.totalPlaintes || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {(r.resolues || r.plaintesResolues || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-semibold ${
                      isAboveAvg ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {rate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rate >= 90 ? 'bg-green-100 text-green-800' :
                        rate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        rate >= 50 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {rate >= 90 ? 'Excellent' :
                         rate >= 70 ? 'Bon' :
                         rate >= 50 ? 'Moyen' : 'Faible'}
                      </span>
                      <div className="w-12 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            rate >= 90 ? 'bg-green-500' :
                            rate >= 70 ? 'bg-yellow-500' :
                            rate >= 50 ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(rate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Aucun résultat pour les filtres sélectionnés</p>
        </div>
      )}
    </div>
  );
};

// Helper function to subtract days from date
const subDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

// Helper function to format date
const formatDate = (date, format = 'short') => {
  const options = format === 'short' 
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('fr-FR', options);
};

const formatTime = (date) => {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

export default function StatsPage() {
  // State management
  const [range, setRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [category, setCategory] = useState('ALL');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Data states
  const [topCommunes, setTopCommunes] = useState([]);
  const [resolutionRows, setResolutionRows] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  
  // Loading states
  const [loadingTop, setLoadingTop] = useState(false);
  const [loadingRes, setLoadingRes] = useState(false);
  const [loadingHourly, setLoadingHourly] = useState(false);
  
  // Error states
  const [errors, setErrors] = useState({});
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Stats globales
  const [globalStats, setGlobalStats] = useState(null);

  // Enhanced stats summary
  const [summary, setSummary] = useState({
    totalComplaints: 0,
    totalCommunes: 0,
    avgResolutionRate: 0,
    peakHour: 'N/A',
    previousPeriodComplaints: 0,
    resolutionTrend: 0
  });

  // Computed values
  const daysDiff = Math.ceil((range.to - range.from) / (1000 * 60 * 60 * 24));
  const isLoading = loadingTop || loadingRes || loadingHourly;
  
  // Enhanced summary calculations
  const enhancedSummary = useMemo(() => {
    const complaintsTrend = summary.previousPeriodComplaints > 0 
      ? ((summary.totalComplaints - summary.previousPeriodComplaints) / summary.previousPeriodComplaints) * 100 
      : 0;

    const dailyAverage = daysDiff > 0 ? summary.totalComplaints / daysDiff : 0;
    
    const topCommune = topCommunes.length > 0 ? topCommunes[0] : null;
    const concentrationRate = topCommune && summary.totalComplaints > 0 
      ? ((topCommune.total || topCommune.totalPlaintes || 0) / summary.totalComplaints) * 100 
      : 0;

    return {
      ...summary,
      complaintsTrend,
      dailyAverage,
      topCommune,
      concentrationRate
    };
  }, [summary, topCommunes, daysDiff]);

  

  // Fetch top communes avec stats globales
  useEffect(() => {
    const refIso = range.to.toISOString().slice(0, 10);
    setLoadingTop(true);
    setErrors(prev => ({ ...prev, topCommunes: null }));
    
    Promise.all([
      fetchTopCommunes(refIso),
      fetchGlobalStats()
    ])
      .then(([communes, global]) => {
        const processedData = Array.isArray(communes) ? communes : [];
        setTopCommunes(processedData);
        setGlobalStats(global);
        
        setSummary(prev => ({
          ...prev,
          totalCommunes: processedData.length,
          totalComplaints: global.totalComplaints,
          avgResolutionRate: global.globalResolutionRate
        }));
      })
      .catch((error) => {
        console.error('Error fetching top communes and global stats:', error);
        setErrors(prev => ({ 
          ...prev, 
          topCommunes: 'Impossible de charger les données des communes.' 
        }));
        setTopCommunes([]);
      })
      .finally(() => setLoadingTop(false));
  }, [range.to]);

  // Fetch resolution data
  useEffect(() => {
    const fromIso = range.from.toISOString();
    const toIso = range.to.toISOString();
    setLoadingRes(true);
    setErrors(prev => ({ ...prev, resolution: null }));
    
    fetchResolution(fromIso, toIso)
      .then((data) => {
        const processedData = (Array.isArray(data) ? data : []).map(item => ({
          ...item,
          tauxResolution: Number(item.tauxResolution || 0),
          commune: item.commune || item.zone || 'Inconnu',
          categorie: item.categorie || item.category || 'AUTRES'
        }));
        
        setResolutionRows(processedData);
      })
      .catch((error) => {
        console.error('Error fetching resolution data:', error);
        setErrors(prev => ({ 
          ...prev, 
          resolution: 'Erreur lors du chargement des données de résolution.' 
        }));
        setResolutionRows([]);
      })
      .finally(() => setLoadingRes(false));
  }, [range]);

  // Fetch hourly data with peak analysis
  useEffect(() => {
    const fromIso = range.from.toISOString();
    const toIso = range.to.toISOString();
    setLoadingHourly(true);
    setErrors(prev => ({ ...prev, hourly: null }));
    
    fetchHourly(fromIso, toIso)
      .then((data) => {
        const processedData = Array.isArray(data) ? data.map(item => ({
          heure: item.heure || item.hour || 0,
          total: item.total || item.count || 0,
          ...item
        })) : [];
        
        setHourlyData(processedData);
        
        // Find peak hour with better handling
        if (processedData.length > 0) {
          const peak = processedData.reduce((max, curr) => 
            curr.total > max.total ? curr : max, 
            processedData[0]
          );
          setSummary(prev => ({ ...prev, peakHour: `${peak.heure}h` }));
        }
      })
      .catch((error) => {
        console.error('Error fetching hourly data:', error);
        setErrors(prev => ({ 
          ...prev, 
          hourly: 'Erreur lors du chargement des données horaires.' 
        }));
        setHourlyData([]);
      })
      .finally(() => setLoadingHourly(false));
  }, [range]);

  // Enhanced refresh function
  const refreshAllData = async () => {
    const refIso = range.to.toISOString().slice(0, 10);
    const fromIso = range.from.toISOString();
    const toIso = range.to.toISOString();

    const refreshPromises = [];

    // Refresh top communes + global stats
    setLoadingTop(true);
    refreshPromises.push(
      Promise.all([
        fetchTopCommunes(refIso),
        fetchGlobalStats()
      ])
        .then(([communes, global]) => {
          setTopCommunes(communes);
          setGlobalStats(global);
        })
        .catch(console.error)
        .finally(() => setLoadingTop(false))
    );

    // Refresh resolution data  
    setLoadingRes(true);
    refreshPromises.push(
      fetchResolution(fromIso, toIso)
        .then((data) => {
          const processedData = (Array.isArray(data) ? data : []).map(item => ({
            ...item,
            tauxResolution: Number(item.tauxResolution || 0)
          }));
          setResolutionRows(processedData);
        })
        .catch(console.error)
        .finally(() => setLoadingRes(false))
    );

    // Refresh hourly data
    setLoadingHourly(true);
    refreshPromises.push(
      fetchHourly(fromIso, toIso)
        .then(setHourlyData)
        .catch(console.error)
        .finally(() => setLoadingHourly(false))
    );

    await Promise.all(refreshPromises);
    setLastRefresh(new Date());
  };

  // Enhanced export function
  const exportData = () => {
    const exportData = {
      period: {
        from: formatDate(range.from, 'long'),
        to: formatDate(range.to, 'long'),
        days: daysDiff
      },
      summary: enhancedSummary,
      globalStats,
      topCommunes,
      resolutionData: resolutionRows,
      hourlyData,
      exportedAt: new Date().toLocaleString('fr-FR')
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stats-plaintes-${new Date().toISOString().slice(0, 16).replace(/[:-]/g, '')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Trend component
  const TrendIndicator = ({ value, label }) => {
    if (value === 0) {
      return (
        <div className="flex items-center text-xs text-gray-500">
          <Minus size={12} className="mr-1" />
          <span>Stable</span>
        </div>
      );
    }
    
    const isPositive = value > 0;
    return (
      <div className={`flex items-center text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
        <span>{Math.abs(value).toFixed(1)}% {label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques Détaillées</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
            <span>
              Période: {formatDate(range.from)} - {formatDate(range.to, 'long')}
            </span>
            <span>•</span>
            <span>{daysDiff} jour{daysDiff > 1 ? 's' : ''}</span>
            {category !== 'ALL' && (
              <>
                <span>•</span>
                <span className="font-medium">{category}</span>
              </>
            )}
            <span>•</span>
            <span className="text-xs">
              Dernière MAJ: {formatTime(lastRefresh)}
            </span>
          </div>
        </div>

    <div className="flex flex-nowrap gap-3 items-center">
      <PeriodPicker range={range} setRange={setRange} />
      <CatSelect value={category} onChange={setCategory} />

      <button
        onClick={exportData}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Download size={16} />
        Exporter
      </button>

      <button
        onClick={refreshAllData}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
          isLoading ? "animate-spin" : ""
        }`}
      >
        <RefreshCw size={16} />
        Actualiser
      </button>
    </div>

      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Plaintes</p>
              <p className="text-3xl font-bold text-gray-900">
                {globalStats ? globalStats.totalComplaints.toLocaleString() : enhancedSummary.totalComplaints.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <TrendIndicator value={enhancedSummary.complaintsTrend} label="vs période précédente" />
            <span className="text-xs text-gray-500">
              {enhancedSummary.dailyAverage.toFixed(1)}/jour
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Communes Actives</p>
              <p className="text-3xl font-bold text-gray-900">{enhancedSummary.totalCommunes}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MapPin className="text-purple-600" size={24} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">
              Top: {enhancedSummary.topCommune?.commune || enhancedSummary.topCommune?.zone || 'N/A'}
            </span>
            <span className="text-xs text-gray-500">
              {enhancedSummary.concentrationRate.toFixed(1)}% du total
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux Résolution Moyen</p>
              <p className="text-3xl font-bold text-gray-900">
                {globalStats ? globalStats.globalResolutionRate.toFixed(1) : enhancedSummary.avgResolutionRate.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
          <TrendIndicator value={enhancedSummary.resolutionTrend} label="d'amélioration" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Heure de Pic</p>
              <p className="text-3xl font-bold text-gray-900">{enhancedSummary.peakHour}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="text-orange-600" size={24} />
            </div>
          </div>
          <span className="text-xs text-gray-500">
            {hourlyData.length} tranches horaires analysées
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Top Communes */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="mr-2 text-purple-600" size={20} />
                Top Communes
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({topCommunes.length})
                </span>
              </h2>
              <div className="flex items-center gap-2">
                {loadingTop && <RefreshCw className="animate-spin text-gray-400" size={16} />}
                {!loadingTop && !errors.topCommunes && (
                  <div className="text-xs text-green-600 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    À jour
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {errors.topCommunes ? (
              <div className="flex flex-col items-center justify-center h-32 text-red-500 space-y-2">
                <AlertCircle size={24} />
                <span className="text-sm text-center">{errors.topCommunes}</span>
                <button 
                  onClick={refreshAllData}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Réessayer
                </button>
              </div>
            ) : (
              <EnhancedTopList communes={topCommunes} loading={loadingTop} />
            )}
          </div>
        </section>

        {/* Enhanced Resolution Table */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="mr-2 text-blue-600" size={20} />
                Taux de Résolution
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({resolutionRows.length} catégories)
                </span>
              </h2>
              <div className="flex items-center gap-2">
                {loadingRes && <RefreshCw className="animate-spin text-gray-400" size={16} />}
                {!loadingRes && !errors.resolution && (
                  <div className="text-xs text-green-600 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    À jour
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {errors.resolution ? (
              <div className="flex flex-col items-center justify-center h-32 text-red-500 space-y-2">
                <AlertCircle size={24} />
                <span className="text-sm text-center">{errors.resolution}</span>
                <button 
                  onClick={refreshAllData}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Réessayer
                </button>
              </div>
            ) : (
              <EnhancedResolutionTable rows={resolutionRows} />
            )}
          </div>
        </section>
      </div>

      {/* Enhanced Hourly Distribution */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="mr-2 text-orange-600" size={20} />
              Répartition Horaire (24h)
            </h2>
            <div className="flex items-center gap-4">
              {loadingHourly && <RefreshCw className="animate-spin text-gray-400" size={16} />}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{hourlyData.length} points de données</span>
                {!loadingHourly && !errors.hourly && (
                  <div className="text-xs text-green-600 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    À jour
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {errors.hourly ? (
            <div className="flex flex-col items-center justify-center h-32 text-red-500 space-y-2">
              <AlertCircle size={24} />
              <span className="text-sm text-center">{errors.hourly}</span>
              <button 
                onClick={refreshAllData}
                className="text-xs text-blue-600 hover:underline"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <HourlyArea data={hourlyData} loading={loadingHourly} />
          )}
        </div>
      </section>
    </div>
  );
}