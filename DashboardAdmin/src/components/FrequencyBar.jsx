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

// Modern color palette
const COLORS = [
  '#4F46E5', // Indigo
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#6366F1'  // Indigo light
];

export default function FrequencyBar({ counts, zone }) {
  const [chartData, setChartData] = useState([]);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    if (!counts || counts.length === 0) {
      setChartData([]);
      setNoData(true);
      return;
    }

    // Filter by zone if provided and not ALL
    const filtered = zone && zone !== 'ALL'
      ? counts.filter(c => c.zone === zone)
      : counts;

    if (filtered.length === 0) {
      setChartData([]);
      setNoData(true);
      return;
    }

    setNoData(false);

    // Aggregate by category
    const agg = filtered.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + c.count;
      return acc;
    }, {});

    const formatted = Object.entries(agg)
      .map(([category, count]) => ({
        category,
        count,
        fill: COLORS[Math.floor(Math.random() * COLORS.length)]
      }))
      .sort((a, b) => b.count - a.count);

    setChartData(formatted);
  }, [counts, zone]);

  // Empty state
  if (noData) {
    return (
      <div className="bg-white shadow rounded-xl p-4 h-full flex flex-col">
        <div className="border-b pb-3 mb-4">
          <h2 className="font-semibold text-lg text-gray-800">
            Plaintes par catégorie {zone !== 'ALL' ? `- ${zone}` : '(toutes zones)'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Distribution des plaintes par type d'incident
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0-01-2-2z" />
          </svg>
          <p className="font-medium">Aucune donnée disponible</p>
          <p className="text-sm mt-1">Essayez de sélectionner une autre zone ou période</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-xl p-4 h-full flex flex-col">
      <div className="border-b pb-3 mb-4">
        <h2 className="font-semibold text-lg text-gray-800">
          Plaintes par catégorie {zone !== 'ALL' ? `- ${zone}` : '(toutes zones)'}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Distribution des plaintes par type d'incident
        </p>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 80, right: 50, left: 5, bottom: 5 }}
            barSize={100}
            barGap={8}
            className="drop-shadow-sm"
          >
            <defs>
              {chartData.map((entry, i) => (
                <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={entry.fill} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={entry.fill} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis
              dataKey="category"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#6B7280' }}
            />
            <Tooltip content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
                    <p className="font-semibold text-gray-800">{label}</p>
                    <p className="text-sm mt-1">
                      <span className="font-medium" style={{ color: payload[0].payload.fill }}>
                        {payload[0].value}
                      </span> plaintes enregistrées
                    </p>
                  </div>
                );
              }
              return null;
            }} />
            <Bar dataKey="count" name="Nombre de plaintes" radius={[4,4,0,0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={`url(#grad-${i})`} stroke={entry.fill} strokeWidth={1} />
              ))}
              <LabelList dataKey="count" position="center" content={({ x, y, width, height, value }) => {
                if (width < 40) return null;
                return (
                  <text
                    x={x + width/2}
                    y={y + height/2}
                    fill="#FFFFFF"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontWeight="bold"
                    fontSize="12"
                  >
                    {value}
                  </text>
                );
              }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
