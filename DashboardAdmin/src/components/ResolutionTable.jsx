import React, { useMemo, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  Calendar, TrendingUp, Users, AlertTriangle, Clock, MapPin, Filter, 
  RefreshCw, Search, ArrowUpDown, CheckCircle, XCircle, Target 
} from 'lucide-react';

const PERFORMANCE_COLORS = {
  excellent: '#10B981', // green
  good: '#F59E0B',      // yellow
  poor: '#EF4444',      // red
  critical: '#DC2626'   // dark red
};

// Enhanced ResolutionTable Component
const EnhancedResolutionTable = ({ rows = [] }) => {
  const [selectedCommune, setSelectedCommune] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortBy, setSortBy] = useState('tauxResolution');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');

  // Get unique communes
  const communes = useMemo(() => {
    const uniqueCommunes = [...new Set(rows.map(r => r.commune))].filter(Boolean);
    return ['all', ...uniqueCommunes];
  }, [rows]);

  // Process and filter data
  const processedData = useMemo(() => {
    let filtered = rows.filter(r => r.commune && r.categorie);
    
    // Apply commune filter
    if (selectedCommune !== 'all') {
      filtered = filtered.filter(r => r.commune === selectedCommune);
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(r => 
        r.categorie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.commune.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort data
    return filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'tauxResolution':
          aVal = a.tauxResolution || 0;
          bVal = b.tauxResolution || 0;
          break;
        case 'total':
          aVal = a.total || a.totalPlaintes || 0;
          bVal = b.total || b.totalPlaintes || 0;
          break;
        case 'resolues':
          aVal = a.resolues || a.plaintesResolues || 0;
          bVal = b.resolues || b.plaintesResolues || 0;
          break;
        case 'categorie':
          return sortOrder === 'desc' 
            ? b.categorie.localeCompare(a.categorie)
            : a.categorie.localeCompare(b.categorie);
        default:
          aVal = a.tauxResolution || 0;
          bVal = b.tauxResolution || 0;
      }
      
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [rows, selectedCommune, searchTerm, sortBy, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (processedData.length === 0) {
      return {
        avgResolution: 0,
        totalComplaints: 0,
        totalResolved: 0,
        bestCategory: null,
        worstCategory: null,
        performanceDistribution: {}
      };
    }

    const avgResolution = processedData.reduce((sum, r) => sum + (r.tauxResolution || 0), 0) / processedData.length;
    const totalComplaints = processedData.reduce((sum, r) => sum + (r.total || r.totalPlaintes || 0), 0);
    const totalResolved = processedData.reduce((sum, r) => sum + (r.resolues || r.plaintesResolues || 0), 0);
    
    const sortedByPerformance = [...processedData].sort((a, b) => (b.tauxResolution || 0) - (a.tauxResolution || 0));
    const bestCategory = sortedByPerformance[0];
    const worstCategory = sortedByPerformance[sortedByPerformance.length - 1];

    // Performance distribution
    const performanceDistribution = {
      excellent: processedData.filter(r => (r.tauxResolution || 0) >= 90).length,
      good: processedData.filter(r => (r.tauxResolution || 0) >= 70 && (r.tauxResolution || 0) < 90).length,
      poor: processedData.filter(r => (r.tauxResolution || 0) >= 50 && (r.tauxResolution || 0) < 70).length,
      critical: processedData.filter(r => (r.tauxResolution || 0) < 50).length
    };

    return {
      avgResolution,
      totalComplaints,
      totalResolved,
      bestCategory,
      worstCategory,
      performanceDistribution
    };
  }, [processedData]);

  // Get performance level and color
  const getPerformanceLevel = (rate) => {
    if (rate >= 90) return { level: 'excellent', color: PERFORMANCE_COLORS.excellent, label: 'Excellent' };
    if (rate >= 70) return { level: 'good', color: PERFORMANCE_COLORS.good, label: 'Bon' };
    if (rate >= 50) return { level: 'poor', color: PERFORMANCE_COLORS.poor, label: 'Moyen' };
    return { level: 'critical', color: PERFORMANCE_COLORS.critical, label: 'Critique' };
  };

  // Chart data for visualization
  const chartData = processedData.slice(0, 10).map(r => ({
    name: r.categorie.length > 15 ? r.categorie.substring(0, 12) + '...' : r.categorie,
    fullName: r.categorie,
    rate: r.tauxResolution || 0,
    total: r.total || r.totalPlaintes || 0,
    resolved: r.resolues || r.plaintesResolues || 0,
    commune: r.commune
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">{data.fullName}</h4>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Commune:</span> {data.commune}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Taux:</span> {data.rate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Résolues:</span> {data.resolved}/{data.total}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (processedData.length === 0 && rows.length > 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Aucun résultat trouvé</p>
        <button
          onClick={() => {
            setSearchTerm('');
            setSelectedCommune('all');
          }}
          className="text-sm text-blue-600 hover:underline mt-2"
        >
          Effacer les filtres
        </button>
      </div>
    );
  }

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
      {/* Enhanced Header with Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.avgResolution.toFixed(1)}%</div>
          <div className="text-xs text-gray-600">Taux moyen</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.totalResolved.toLocaleString()}</div>
          <div className="text-xs text-gray-600">Résolues</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.totalComplaints.toLocaleString()}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{processedData.length}</div>
          <div className="text-xs text-gray-600">Catégories</div>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Commune Filter */}
        <select
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={selectedCommune}
          onChange={e => setSelectedCommune(e.target.value)}
        >
          <option value="all">Toutes les communes</option>
          {communes.slice(1).map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        
        {/* Sort Controls */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="tauxResolution">Par taux</option>
          <option value="total">Par total</option>
          <option value="resolues">Par résolues</option>
          <option value="categorie">Par nom</option>
        </select>
        
        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1"
        >
          <ArrowUpDown className="w-4 h-4" />
          {sortOrder === 'desc' ? '↓' : '↑'}
        </button>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'chart'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Graphique
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Résolues
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taux de résolution
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedData.map((r, idx) => {
                const performance = getPerformanceLevel(r.tauxResolution || 0);
                const isAboveAvg = (r.tauxResolution || 0) > stats.avgResolution;
                
                return (
                  <tr key={`${r.commune}-${r.categorie}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{r.categorie}</div>
                        {selectedCommune === 'all' && (
                          <div className="text-xs text-gray-500">{r.commune}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {(r.total || r.totalPlaintes || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle className="text-green-600" size={14} />
                        <span className="text-sm font-medium text-gray-900">
                          {(r.resolues || r.plaintesResolues || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`text-sm font-semibold ${
                          isAboveAvg ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {(r.tauxResolution || 0).toFixed(1)}%
                        </span>
                        {isAboveAvg ? (
                          <TrendingUp className="text-green-600" size={14} />
                        ) : (
                          <TrendingDown className="text-orange-600" size={14} />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium`}
                              style={{ backgroundColor: performance.color + '20', color: performance.color }}>
                          {performance.label}
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min(r.tauxResolution || 0, 100)}%`,
                              backgroundColor: performance.color
                            }}
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
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 11, fill: '#6B7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#6B7280' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => {
                  const performance = getPerformanceLevel(entry.rate);
                  return <Cell key={`cell-${index}`} fill={performance.color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Performance Distribution */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        {Object.entries(stats.performanceDistribution).map(([level, count]) => {
          const levelConfig = {
            excellent: { color: PERFORMANCE_COLORS.excellent, label: 'Excellent (≥90%)', icon: '🎯' },
            good: { color: PERFORMANCE_COLORS.good, label: 'Bon (70-89%)', icon: '👍' },
            poor: { color: PERFORMANCE_COLORS.poor, label: 'Moyen (50-69%)', icon: '⚠️' },
            critical: { color: PERFORMANCE_COLORS.critical, label: 'Critique (<50%)', icon: '🚨' }
          };
          
          const config = levelConfig[level];
          const percentage = processedData.length > 0 ? (count / processedData.length) * 100 : 0;
          
          return (
            <div key={level} className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl mb-1">{config.icon}</div>
              <div className="text-lg font-bold" style={{ color: config.color }}>
                {count}
              </div>
              <div className="text-xs text-gray-600 mb-1">{config.label}</div>
              <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
            </div>
          );
        })}
      </div>

      {/* Best and Worst Performers */}
      {stats.bestCategory && stats.worstCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-green-600" size={20} />
              <h4 className="font-semibold text-green-800">Meilleure Performance</h4>
            </div>
            <div className="text-sm text-green-700">
              <div className="font-medium">{stats.bestCategory.categorie}</div>
              <div className="text-xs">{stats.bestCategory.commune}</div>
              <div className="mt-1">
                <span className="font-bold">{stats.bestCategory.tauxResolution.toFixed(1)}%</span>
                <span className="ml-2">({stats.bestCategory.resolues || stats.bestCategory.plaintesResolues || 0}/{stats.bestCategory.total || stats.bestCategory.totalPlaintes || 0})</span>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-red-600" size={20} />
              <h4 className="font-semibold text-red-800">À Améliorer</h4>
            </div>
            <div className="text-sm text-red-700">
              <div className="font-medium">{stats.worstCategory.categorie}</div>
              <div className="text-xs">{stats.worstCategory.commune}</div>
              <div className="mt-1">
                <span className="font-bold">{stats.worstCategory.tauxResolution.toFixed(1)}%</span>
                <span className="ml-2">({stats.worstCategory.resolues || stats.worstCategory.plaintesResolues || 0}/{stats.worstCategory.total || stats.worstCategory.totalPlaintes || 0})</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedResolutionTable;