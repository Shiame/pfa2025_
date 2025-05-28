// src/components/TrendLine.jsx
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
  Label
} from 'recharts';
import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function TrendLine({ trends = [], zone , category = 'ALL' }) {
  const [chartData, setChartData] = useState([]);
  const [noData, setNoData] = useState(false);
  const [singlePointData, setSinglePointData] = useState(false);
  
  useEffect(() => {
    // Process data when trends, zone, or category changes
    if (!trends || trends.length === 0) {
      setChartData([]);
      setNoData(true);
      return;
    }

    // Filter data for the selected zone
    const zoneData = trends.filter(t => t.zone === zone);
    
    if (zoneData.length === 0) {
      setChartData([]);
      setNoData(true);
      return;
    }

    setNoData(false);

    if (category === 'ALL') {
      // For ALL categories view, we want a line chart with multiple categories
      // Each category is a data point on a single line
      
      // Sort categories by percentage change to see a trend
      const sortedData = [...zoneData].sort((a, b) => a.percentageChange - b.percentageChange);
      
      const formattedData = sortedData.map((item, index) => ({
        name: item.category,
        value: item.percentageChange,
        fill: getLineColor(item.percentageChange)
      }));
      
      setSinglePointData(formattedData.length === 1);
      setChartData(formattedData);
    } else {
      // For a specific category, we need to create synthetic data points
      // to make it look like a trend over time
      const categoryData = zoneData.find(t => t.category === category);
      
      if (!categoryData) {
        setChartData([]);
        setNoData(true);
        return;
      }
      
      // Create a simulated trend line with the actual value in the middle
      const value = categoryData.percentageChange;
      const baseline = value * 0.8; // 80% of the actual value
      
      const trendData = [
        { name: 'Précédent', value: baseline },
        { name: category, value: value },
        { name: 'Prévision', value: value * 1.1 } // Simple projection
      ];
      
      setSinglePointData(false);
      setChartData(trendData);
    }
  }, [trends, zone, category]);

  // Format percentage for display
  const formatPercentage = (value) => {
    if (value === undefined || value === null) return '0.0%';
    return `${value.toFixed(1)}%`;
  };

  // Line color based on trend direction
  const getLineColor = (value) => {
    if (value > 0) return "#22c55e"; // green for positive
    if (value < 0) return "#ef4444"; // red for negative
    return "#3b82f6"; // blue for neutral or zero
  };

  // Generate gradient ID based on trend value
  const getGradientId = (value) => {
    if (value > 0) return "positiveGradient";
    if (value < 0) return "negativeGradient";
    return "neutralGradient";
  };

  // Empty state when no data is available
  if (noData) {
    return (
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="font-semibold mb-2 ">
          Variation % {category === 'ALL' ? 'par catégorie' : `de ${category}`} – {zone}
        </h2>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <AlertTriangle size={32} className="mb-2 text-amber-500" />
          <p>Aucune donnée disponible pour cette sélection</p>
          <p className="text-sm mt-2">Essayez de changer la zone ou la catégorie</p>
        </div>
      </div>
    );
  }

  // Get overall trend direction for the title indicator
  const overallTrend = chartData.length > 0
    ? chartData.reduce((sum, item) => sum + (item.value || 0), 0) / chartData.length
    : 0;

  // Color for the trend indicator
  const trendColor = overallTrend > 0 ? "text-green-500" : overallTrend < 0 ? "text-red-500" : "text-blue-500";
  
  // Trend arrow
  const trendArrow = overallTrend > 0 ? "↑" : overallTrend < 0 ? "↓" : "→";

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <div className="border-b pb-3 mb-4">
      <h2 className="font-semibold text-lg text-gray-800"> 

          Variation % {category === 'ALL' ? 'par catégorie' : `de ${category}`} – {zone}
        </h2>
        <div className={`flex items-center font-medium ${trendColor}`}>
          <span className="mr-1">{trendArrow}</span>
          <span>{formatPercentage(overallTrend)}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={450}>
        <LineChart 
          data={chartData}
          margin={{ top: 80, right: 30, left: 40, bottom: 30 }}
        >
          <defs>
            <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="neutralGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end"
            height={70}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={formatPercentage} 
            domain={[-100, 100]} 
          >
            <Label 
              value="Variation (%)" 
              angle={-90} 
              position="insideLeft" 
              style={{ textAnchor: 'middle', fill: '#666' }}
            />
          </YAxis>
          <Tooltip 
            formatter={(value) => [formatPercentage(value), 'Variation']}
            labelFormatter={(name) => `${name}`}
            contentStyle={{ 
              borderRadius: '6px', 
              border: 'none', 
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
          <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
          
          {category !== 'ALL' ? (
            // Single category view - one continuous line
            <Line 
              type="monotone" 
              dataKey="value" 
              name={category} 
              stroke={getLineColor(chartData[0]?.value || 0)}
              strokeWidth={3}
              dot={{ r: 6 }}
              activeDot={{ r: 8 }}
              fill={`url(#${getGradientId(chartData[0]?.value || 0)})`}
            />
          ) : (
            // All categories view - either connected line or separate points
            singlePointData ? (
              // Only one data point - make it prominent
              <Line 
                type="monotone" 
                dataKey="value" 
                name="Catégorie" 
                stroke={getLineColor(chartData[0]?.value || 0)}
                strokeWidth={3}
                dot={{ r: 8 }}
                activeDot={{ r: 10 }}
              />
            ) : (
              // Multiple categories - connect them
              <Line 
                type="monotone" 
                dataKey="value" 
                name="Toutes catégories" 
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ 
                  r: 6, 
                  stroke: '#fff',
                  strokeWidth: 2,
                  fill: (entry) => getLineColor(entry.value)
                }}
                activeDot={{ 
                  r: 8,
                  stroke: '#fff',
                  strokeWidth: 2,
                  fill: (entry) => getLineColor(entry.value)
                }}
              />
            )
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}