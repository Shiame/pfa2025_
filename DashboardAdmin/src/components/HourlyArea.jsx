import { useState, useMemo } from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';

const SimplifiedHourlyArea = ({ data = [], loading = false }) => {
  const [viewType, setViewType] = useState('area');
  
  // Normalize data from backend
  const normalizedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(d => ({
      hour: d.heure || d.hour || 0,
      value: d.total || d.count || 0,
      name: `${d.heure || d.hour || 0}h`
    })).sort((a, b) => a.hour - b.hour);
  }, [data]);

  // Simple statistics
  const stats = useMemo(() => {
    if (normalizedData.length === 0) {
      return { total: 0, avg: 0, peak: { hour: 'N/A', value: 0 } };
    }

    const total = normalizedData.reduce((sum, d) => sum + d.value, 0);
    const avg = total / normalizedData.length;
    const peak = normalizedData.reduce((max, curr) => 
      curr.value > max.value ? curr : max, normalizedData[0]
    );

    return { total, avg, peak };
  }, [normalizedData]);

  // Loading state
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données horaires...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (normalizedData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="font-medium text-gray-700 mb-2">Aucune donnée horaire</h3>
          <p className="text-sm">Aucune plainte trouvée pour cette période</p>
        </div>
      </div>
    );
  }

  // Simple tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <h4 className="font-semibold text-gray-900">{data.name}</h4>
          <p className="text-sm text-gray-600">
            Plaintes: <span className="font-bold text-blue-600">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            % du total: <span className="font-medium">{((data.value / stats.total) * 100).toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <TrendingUp size={14} />
            Total: <strong className="text-gray-900">{stats.total}</strong>
          </span>
          <span>Moyenne/h: <strong className="text-gray-900">{stats.avg.toFixed(1)}</strong></span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            Pic: <strong className="text-blue-600">{stats.peak.name} ({stats.peak.value})</strong>
          </span>
        </div>
        
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewType('area')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewType === 'area' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Aire
          </button>
          <button
            onClick={() => setViewType('bar')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewType === 'bar' 
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Barres
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {viewType === 'area' ? (
            <AreaChart 
              data={normalizedData} 
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={2}
                fill="url(#areaGradient)" 
              />
            </AreaChart>
          ) : (
            <BarChart 
              data={normalizedData} 
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill="#3B82F6"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Simple Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600 mb-1">Activité maximale</div>
            <div className="font-semibold text-blue-600">
              {stats.peak.name} ({stats.peak.value} plaintes)
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Moyenne horaire</div>
            <div className="font-semibold text-green-600">
              {stats.avg.toFixed(1)} plaintes/h
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Total analysé</div>
            <div className="font-semibold text-purple-600">
              {normalizedData.length} heures
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedHourlyArea;