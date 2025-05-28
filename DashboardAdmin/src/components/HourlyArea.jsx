import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { fetchHourly } from '../api/stats';

export default function HourlyArea() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const to   = new Date().toISOString();
    const from = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    fetchHourly(from, to)
      .then(setData)      // payload: [{ trancheHoraire, totalPlaintes }]
      .catch(console.error);
  }, []);

  // Recharts attend un tableau d'objets { name, value }
  const chartData = data.map(d => ({
    name: d.trancheHoraire,
    value: d.totalPlaintes,
  }));

  return (
    <div className="bg-white shadow rounded-xl p-4 col-span-full">
      <h2 className="font-semibold mb-2">Répartition horaire des plaintes (24 h)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={v => `${v} plaintes`} />
          <Area type="monotone" dataKey="value" fillOpacity={0.25} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
