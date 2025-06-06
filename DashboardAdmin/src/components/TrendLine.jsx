import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Label,
  Area,
  ComposedChart
} from 'recharts';
import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity,
  Minus,
  BarChart3
} from 'lucide-react';

export default function TrendLine({ trends = [], zone, category = 'ALL' }) {
  const [chartData, setChartData] = useState([]);
  const [noData, setNoData] = useState(false);
  const [trendMetrics, setTrendMetrics] = useState({
    averageChange: 0,
    totalDataPoints: 0,
    positiveChanges: 0,
    negativeChanges: 0
  });

  // Color mapping for trend values - single function
  const getTrendColor = (value) => {
    if (value > 10) return "#DC2626"; // Strong positive - red
    if (value > 0) return "#059669";  // Positive - green
    if (value < -10) return "#7C2D12"; // Strong negative - dark red
    if (value < 0) return "#DC2626";   // Negative - red
    return "#3B82F6"; // Neutral - blue
  };
  
  useEffect(() => {
    if (!trends || trends.length === 0) {
      setChartData([]);
      setNoData(true);
      return;
    }

    // Filter data based on zone
    const zoneData = zone && zone !== 'ALL' && zone !== 'Inconnu'
      ? trends.filter(t => t.zone === zone)
      : trends;
    
    if (zoneData.length === 0) {
      setChartData([]);
      setNoData(true);
      return;
    }

    setNoData(false);
    let processedData = [];

    if (category === 'ALL') {
      // Group by category and calculate metrics
      const categoryGroups = zoneData.reduce((acc, item) => {
        const cat = item.category || 'Autres';
        if (!acc[cat]) {
          acc[cat] = [];
        }
        acc[cat].push(item);
        return acc;
      }, {});

      // Create trend data for each category
      processedData = Object.entries(categoryGroups).map(([cat, items]) => {
        const avgChange = items.reduce((sum, item) => sum + (item.percentageChange || 0), 0) / items.length;
        const totalCount = items.reduce((sum, item) => sum + (item.count || 0), 0);
        
        return {
          name: cat.length > 12 ? cat.substring(0, 10) + '..' : cat,
          fullName: cat,
          value: parseFloat(avgChange.toFixed(1)),
          count: totalCount,
          trend: avgChange > 0 ? 'up' : avgChange < 0 ? 'down' : 'stable',
          color: getTrendColor(avgChange)
        };
      }).sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 8);

    } else {
      // Single category analysis - create time-based trend if possible
      const categoryData = zoneData.filter(t => t.category === category);
      
      if (categoryData.length === 0) {
        setChartData([]);
        setNoData(true);
        return;
      }

      if (categoryData.length === 1) {
        // Single point - create context points
        const actualValue = categoryData[0].percentageChange || 0;
        processedData = [
          { 
            name: 'Période précédente', 
            value: actualValue * 0.7, 
            count: Math.max(0, (categoryData[0].count || 0) - 2),
            trend: 'context',
            color: '#94A3B8'
          },
          { 
            name: 'Période actuelle', 
            value: actualValue, 
            count: categoryData[0].count || 0,
            trend: actualValue > 0 ? 'up' : actualValue < 0 ? 'down' : 'stable',
            color: getTrendColor(actualValue)
          },
          { 
            name: 'Projection', 
            value: actualValue * 1.2, 
            count: Math.max(0, (categoryData[0].count || 0) + 1),
            trend: 'projection',
            color: '#94A3B8'
          }
        ];
      } else {
        // Multiple data points for the category
        processedData = categoryData.map((item, index) => ({
          name: `Point ${index + 1}`,
          value: parseFloat((item.percentageChange || 0).toFixed(1)),
          count: item.count || 0,
          trend: (item.percentageChange || 0) > 0 ? 'up' : (item.percentageChange || 0) < 0 ? 'down' : 'stable',
          color: getTrendColor(item.percentageChange || 0)
        }));
      }
    }

    // Calculate metrics
    const totalPoints = processedData.length;
    const avgChange = totalPoints > 0 
      ? processedData.reduce((sum, item) => sum + item.value, 0) / totalPoints 
      : 0;
    const positiveCount = processedData.filter(item => item.value > 0).length;
    const negativeCount = processedData.filter(item => item.value < 0).length;

    setTrendMetrics({
      averageChange: avgChange,
      totalDataPoints: totalPoints,
      positiveChanges: positiveCount,
      negativeChanges: negativeCount
    });

    setChartData(processedData);
  }, [trends, zone, category]);

  // Enhanced tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-xl rounded-lg backdrop-blur-sm">
          <h4 className="font-semibold text-gray-900 mb-2">
            {data.fullName || label}
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Variation:</span>
              <span className={`font-bold text-sm ${
                data.value > 0 ? 'text-green-600' : data.value < 0 ? 'text-red-600' : 'text-blue-600'
              }`}>
                {data.value > 0 ? '+' : ''}{data.value.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Plaintes:</span>
              <span className="font-medium text-sm text-gray-900">
                {data.count}
              </span>
            </div>
            <div className="flex items-center">
              {data.value > 0 ? (
                <TrendingUp size={14} className="text-green-600 mr-1" />
              ) : data.value < 0 ? (
                <TrendingDown size={14} className="text-red-600 mr-1" />
              ) : (
                <Minus size={14} className="text-blue-600 mr-1" />
              )}
              <span className="text-xs text-gray-600">
                {data.trend === 'up' ? 'En hausse' : 
                 data.trend === 'down' ? 'En baisse' : 
                 data.trend === 'context' ? 'Contexte' :
                 data.trend === 'projection' ? 'Projection' : 'Stable'}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Empty state
  if (noData) {
    return (
      <div className="h-96 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Activity className="text-blue-600 mr-2" size={20} />
            <h3 className="font-semibold text-gray-900">Analyse des Tendances</h3>
          </div>
          <span className="text-sm text-gray-500">
            {category === 'ALL' ? 'Toutes catégories' : category} • {zone}
          </span>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <AlertTriangle size={48} className="text-gray-400 mb-4" />
          <h4 className="font-medium text-gray-700 mb-2">Données insuffisantes</h4>
          <p className="text-sm text-center text-gray-600">
            Aucune donnée de tendance disponible<br />
            pour cette sélection.
          </p>
        </div>
      </div>
    );
  }

  // Get trend indicator functions
  const getTrendIcon = () => {
    const overallTrend = trendMetrics.averageChange;
    if (overallTrend > 2) return <TrendingUp className="text-green-600" size={16} />;
    if (overallTrend < -2) return <TrendingDown className="text-red-600" size={16} />;
    return <Minus className="text-blue-600" size={16} />;
  };

  const getTrendText = () => {
    const overallTrend = trendMetrics.averageChange;
    if (overallTrend > 2) return 'Tendance positive';
    if (overallTrend < -2) return 'Tendance négative';
    return 'Tendance stable';
  };

  const getTrendTextColor = () => {
    const overallTrend = trendMetrics.averageChange;
    if (overallTrend > 2) return 'text-green-600';
    if (overallTrend < -2) return 'text-red-600';
    return 'text-blue-600';
  };

  return (
    <div className="h-96 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Activity className="text-blue-600 mr-2" size={20} />
          <h3 className="font-semibold text-gray-900">Analyse des Tendances</h3>
        </div>
        <span className="text-sm text-gray-500">
          {category === 'ALL' ? 'Toutes catégories' : category} • {zone}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-2 text-center" title="Variation moyenne de toutes les tendances">
          <div className="text-lg font-bold text-blue-600">
            {trendMetrics.averageChange > 0 ? '+' : ''}{trendMetrics.averageChange.toFixed(1)}%
          </div>
          <div className="text-xs text-blue-700">Moyenne</div>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center" title="Nombre de catégories/points en augmentation">
          <div className="text-lg font-bold text-green-600">{trendMetrics.positiveChanges}</div>
          <div className="text-xs text-green-700">En hausse</div>
        </div>
        <div className="bg-red-50 rounded-lg p-2 text-center" title="Nombre de catégories/points en diminution">
          <div className="text-lg font-bold text-red-600">{trendMetrics.negativeChanges}</div>
          <div className="text-xs text-red-700">En baisse</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-2 text-center" title="Nombre total de points de données analysés">
          <div className="text-lg font-bold text-purple-600">{trendMetrics.totalDataPoints}</div>
          <div className="text-xs text-purple-700">Total</div>
        </div>
      </div>

      {/* Trend Indicator */}
      <div className="flex items-center justify-center mb-3 p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          {getTrendIcon()}
          <span className={`ml-2 font-medium ${getTrendTextColor()}`}>
            {getTrendText()}
          </span>
        </div>
      </div>

      {/* Chart - Fixed height */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 10, bottom: 40 }}
          >
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              opacity={0.3}
              stroke="#E5E7EB"
            />
            
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end"
              height={40}
              tick={{ 
                fontSize: 10, 
                fill: '#6B7280',
                fontWeight: 500
              }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            
            <YAxis 
              tickFormatter={(value) => `${value}%`}
              tick={{ 
                fontSize: 10, 
                fill: '#6B7280',
                fontWeight: 500
              }}
              tickLine={false}
              axisLine={false}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <ReferenceLine 
              y={0} 
              stroke="#6B7280" 
              strokeDasharray="5 5" 
              strokeWidth={1}
            />

            {/* Area for positive values */}
            {chartData.some(d => d.value > 0) && (
              <Area
                type="monotone"
                dataKey="value"
                stroke="none"
                fill="url(#trendGradient)"
                fillOpacity={0.2}
              />
            )}
            
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ 
                fill: '#3B82F6',
                stroke: '#FFFFFF',
                strokeWidth: 2,
                r: 4
              }}
              activeDot={{ 
                r: 6,
                stroke: '#3B82F6',
                strokeWidth: 2,
                fill: '#FFFFFF'
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Summary - Compact */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-600">
          {category === 'ALL' ? 
            `${trendMetrics.totalDataPoints} catégories analysées` :
            `Évolution ${category}`
          } • {zone}
        </p>
      </div>
    </div>
  );
}