import { useState, useMemo } from 'react';
import { Users, MapPin, Award, TrendingUp, BarChart3, Search, Filter, Star } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];

const TopList = ({ communes = [], loading = false }) => {
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

  // Statistics
  const stats = useMemo(() => {
    const totalPlaintes = processedCommunes.reduce((sum, c) => sum + c.totalPlaintes, 0);
    const maxPlaintes = Math.max(...processedCommunes.map(c => c.totalPlaintes), 0);
    const avgPlaintes = processedCommunes.length > 0 ? totalPlaintes / processedCommunes.length : 0;
    
    return {
      totalPlaintes,
      maxPlaintes,
      avgPlaintes,
      communesCount: processedCommunes.length
    };
  }, [processedCommunes]);

  // Loading state
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

  // Empty state
  if (normalizedCommunes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="font-medium text-gray-700 mb-2">Aucune donnée disponible</h3>
        <p className="text-sm">Aucune commune trouvée pour cette période</p>
      </div>
    );
  }

  // Prepare chart data (top 10 for better readability)
  const chartData = processedCommunes.slice(0, 10).map((c, idx) => ({
    name: c.commune.length > 12 ? c.commune.substring(0, 10) + '...' : c.commune,
    fullName: c.commune,
    value: c.totalPlaintes,
    rank: idx + 1,
    fill: COLORS[idx % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = stats.totalPlaintes > 0 ? (data.value / stats.totalPlaintes) * 100 : 0;
      
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-1">{data.fullName}</h4>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Rang:</span> #{data.rank}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Plaintes:</span> {data.value.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Part:</span> {percentage.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">vs Moyenne:</span> {data.value > stats.avgPlaintes ? '+' : ''}{((data.value - stats.avgPlaintes) / stats.avgPlaintes * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get performance indicator
  const getPerformanceIndicator = (value) => {
    if (value > stats.avgPlaintes * 1.5) return { color: 'text-red-600', label: 'Très élevé' };
    if (value > stats.avgPlaintes) return { color: 'text-orange-600', label: 'Élevé' };
    if (value > stats.avgPlaintes * 0.5) return { color: 'text-yellow-600', label: 'Moyen' };
    return { color: 'text-green-600', label: 'Faible' };
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Header with controls */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-medium">{stats.communesCount}</span> commune{stats.communesCount > 1 ? 's' : ''}
            <span>•</span>
            <span className="font-medium">{stats.totalPlaintes.toLocaleString()}</span> plaintes au total
            <span>•</span>
            <span>Moyenne: <span className="font-medium">{stats.avgPlaintes.toFixed(1)}</span></span>
          </div>
          
          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users size={14} />
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'chart'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 size={14} />
            </button>
          </div>
        </div>
        
        {/* Enhanced Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher une commune..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="totalPlaintes">Par plaintes</option>
            <option value="commune">Par nom</option>
          </select>
          
          {/* Top only toggle */}
          <label className="flex items-center text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showTopOnly}
              onChange={(e) => setShowTopOnly(e.target.checked)}
              className="mr-2 rounded"
            />
            Top 5 seulement
          </label>
          
          {/* Clear filters */}
          {(searchTerm || showTopOnly) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setShowTopOnly(false);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Effacer filtres
            </button>
          )}
        </div>
      </div>

      {/* No results state */}
      {processedCommunes.length === 0 && normalizedCommunes.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Aucun résultat pour "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm('')}
            className="text-sm text-blue-600 hover:underline mt-2"
          >
            Effacer la recherche
          </button>
        </div>
      )}

      {/* Content based on view mode */}
      {processedCommunes.length > 0 && (
        <>
          {viewMode === 'table' ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {processedCommunes.slice(0, 20).map((c, idx) => {
                const percentage = stats.totalPlaintes > 0 ? (c.totalPlaintes / stats.totalPlaintes) * 100 : 0;
                const isTop3 = idx < 3;
                const performance = getPerformanceIndicator(c.totalPlaintes);
                
                return (
                  <div
                    key={c.commune}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                      isTop3 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-transform hover:scale-110 ${
                        idx === 0 ? 'bg-yellow-500 text-white' :
                        idx === 1 ? 'bg-gray-400 text-white' :
                        idx === 2 ? 'bg-orange-400 text-white' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {idx < 3 ? <Award size={14} /> : idx + 1}
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-32" title={c.commune}>
                          {c.commune}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{percentage.toFixed(1)}% du total</span>
                          <span>•</span>
                          <span className={performance.color}>{performance.label}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{c.totalPlaintes.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">
                          {c.totalPlaintes > stats.avgPlaintes ? '+' : ''}{((c.totalPlaintes - stats.avgPlaintes) / stats.avgPlaintes * 100).toFixed(0)}% vs moy.
                        </p>
                      </div>
                      
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
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
              
              {/* Show more indicator */}
              {processedCommunes.length > 20 && (
                <div className="text-center py-2 text-sm text-gray-500">
                  ... et {processedCommunes.length - 20} autre{processedCommunes.length - 20 > 1 ? 's' : ''} commune{processedCommunes.length - 20 > 1 ? 's' : ''}
                </div>
              )}
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
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 'dataMax']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* Enhanced Summary stats */}
      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {processedCommunes.length > 0 ? processedCommunes[0].totalPlaintes.toLocaleString() : 0}
          </div>
          <div className="text-xs text-gray-600">Top commune</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {stats.avgPlaintes.toFixed(0)}
          </div>
          <div className="text-xs text-gray-600">Moyenne</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{stats.maxPlaintes.toLocaleString()}</div>
          <div className="text-xs text-gray-600">Maximum</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">
            {processedCommunes.length > 0 ? 
              ((processedCommunes[0].totalPlaintes / stats.totalPlaintes) * 100).toFixed(1) + '%' : 
              '0%'
            }
          </div>
          <div className="text-xs text-gray-600">Concentration</div>
        </div>
      </div>
    </div>
  );
};

export default TopList;