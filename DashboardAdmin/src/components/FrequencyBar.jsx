import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LabelList
} from 'recharts';
import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

// Professional color palette with better contrast
const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1'  // Indigo
];

export default function FrequencyBar({ counts, zone }) {
  const [chartData, setChartData] = useState([]);
  const [noData, setNoData] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [maxValue, setMaxValue] = useState(0);

  useEffect(() => {
    if (!counts || counts.length === 0) {
      setChartData([]);
      setNoData(true);
      setTotalCount(0);
      setMaxValue(0);
      return;
    }

    // Filter by zone if provided and not 'ALL' or 'Inconnu'
    const filtered = (zone && zone !== 'ALL' && zone !== 'Inconnu')
      ? counts.filter(c => c.zone === zone)
      : counts;

    if (filtered.length === 0) {
      setChartData([]);
      setNoData(true);
      setTotalCount(0);
      setMaxValue(0);
      return;
    }

    setNoData(false);

    // Aggregate by category for better visualization
    const agg = filtered.reduce((acc, c) => {
      const category = c.category || c.nom || 'Autres';
      acc[category] = (acc[category] || 0) + (c.count || 0);
      return acc;
    }, {});

    const formatted = Object.entries(agg)
      .map(([category, count], index) => ({
        category: category.length > 15 ? category.substring(0, 12) + '...' : category,
        fullCategory: category,
        count,
        percentage: 0, // Will be calculated after total
        fill: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Limit to top 8 categories for better readability

    const total = formatted.reduce((sum, item) => sum + item.count, 0);
    const max = Math.max(...formatted.map(item => item.count));

    // Calculate percentages
    formatted.forEach(item => {
      item.percentage = total > 0 ? ((item.count / total) * 100) : 0;
    });

    setChartData(formatted);
    setTotalCount(total);
    setMaxValue(max);
  }, [counts, zone]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-xl rounded-lg backdrop-blur-sm">
          <h4 className="font-semibold text-gray-900 mb-2">{data.fullCategory}</h4>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium text-gray-700">Nombre:</span>
              <span className="ml-2 font-bold" style={{ color: data.fill }}>
                {data.count} plainte{data.count > 1 ? 's' : ''}
              </span>
            </p>
            <p className="text-sm">
              <span className="font-medium text-gray-700">Pourcentage:</span>
              <span className="ml-2 font-bold text-blue-600">
                {data.percentage.toFixed(1)}%
              </span>
            </p>
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
            <BarChart3 className="text-blue-600 mr-2" size={20} />
            <h3 className="font-semibold text-gray-900">Répartition par Catégorie</h3>
          </div>
          <span className="text-sm text-gray-500">
            {zone && zone !== 'ALL' && zone !== 'Inconnu' ? zone : 'Toutes zones'}
          </span>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <AlertCircle size={48} className="text-gray-400 mb-4" />
          <h4 className="font-medium text-gray-700 mb-2">Aucune donnée disponible</h4>
          <p className="text-sm text-center text-gray-600">
            Aucune plainte trouvée pour cette sélection.<br />
            Essayez de modifier la période ou la zone.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 flex flex-col">
      {/* Header with stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <BarChart3 className="text-blue-600 mr-2" size={20} />
          <h3 className="font-semibold text-gray-900">Répartition par Catégorie</h3>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{totalCount} plaintes</p>
          <p className="text-xs text-gray-500">
            {zone && zone !== 'ALL' && zone !== 'Inconnu' ? zone : 'Toutes zones'}
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-blue-600">{chartData.length}</div>
          <div className="text-xs text-blue-700">Catégories</div>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-green-600">{maxValue}</div>
          <div className="text-xs text-green-700">Maximum</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-purple-600">
            {chartData.length > 0 ? (totalCount / chartData.length).toFixed(0) : 0}
          </div>
          <div className="text-xs text-purple-700">Moyenne</div>
        </div>
      </div>

      {/* Chart - Fixed height */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
            barCategoryGap="20%"
          >
            <defs>
              {chartData.map((entry, i) => (
                <linearGradient key={i} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={entry.fill} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={entry.fill} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              opacity={0.3}
              stroke="#E5E7EB"
            />
            
            <XAxis
              dataKey="category"
              angle={-45}
              textAnchor="end"
              height={-60}
              tick={{ 
                fontSize: 10, 
                fill: '#6B7280',
                fontWeight: 500
              }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
            />
            
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ 
                fontSize: 10, 
                fill: '#6B7280',
                fontWeight: 500
              }}
              domain={[0, 'dataMax']}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Bar 
              dataKey="count" 
              name="Nombre de plaintes" 
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            >
              {chartData.map((entry, i) => (
                <Cell 
                  key={i} 
                  fill={`url(#gradient-${i})`}
                  stroke={entry.fill}
                  strokeWidth={1}
                />
              ))}
              
              <LabelList 
                dataKey="count" 
                position="top"
                offset={3}
                content={({ x, y, width, value }) => (
                  <text
                    x={x + width / 2}
                    y={y - 3}
                    fill="#374151"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {value}
                  </text>
                )}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend - Compact */}
      <div className="mt-3 flex flex-wrap gap-2">
        {chartData.slice(0, 4).map((item, index) => (
          <div key={index} className="flex items-center text-xs">
            <div 
              className="w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: item.fill }}
            ></div>
            <span className="text-gray-600 truncate max-w-20">
              {item.category}
            </span>
          </div>
        ))}
        {chartData.length > 4 && (
          <span className="text-xs text-gray-500">
            +{chartData.length - 4} autres
          </span>
        )}
      </div>
    </div>
  );
}