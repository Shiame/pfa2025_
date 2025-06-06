import { useState, useEffect } from 'react';
import {
  AlertTriangle, TrendingUp, TrendingDown, MapPin, Clock, Target, Activity,
  BarChart3, Eye, Zap, RefreshCw, Filter, Download, Bell, CheckCircle, X
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { fetchAnomalyDetection, fetchTemporalPatterns } from '../api/intelligentApi';

const COLORS = ['#EF4444', '#F97316', '#EAB308', '#84CC16', '#10B981'];

export default function AnomalyDetectionComponent() {
  const [anomalies, setAnomalies] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');

  // Helper to compute date range
  const getFromTo = () => {
    const now = new Date();
    let from;
    if (timeRange === '1h') from = new Date(now.getTime() - 60 * 60 * 1000);
    else if (timeRange === '24h') from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    else if (timeRange === '7d') from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (timeRange === '30d') from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return { from, to: now };
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { from, to } = getFromTo();
      try {
        const [anomalyData, seriesData] = await Promise.all([
          fetchAnomalyDetection(from, to),
          fetchTemporalPatterns(from, to)
        ]);
        setAnomalies(anomalyData || []);
        setTimeSeriesData(seriesData || []);
      } catch (e) {
        setAnomalies([]);
        setTimeSeriesData([]);
      }
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line
  }, [timeRange]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 text-red-700';
      case 'high':     return 'border-orange-500 bg-orange-50 text-orange-700';
      case 'medium':   return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      case 'low':      return 'border-green-500 bg-green-50 text-green-700';
      default:         return 'border-gray-500 bg-gray-50 text-gray-700';
    }
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      critical: { label: 'Critique', color: 'bg-red-100 text-red-700' },
      high: { label: 'Élevée', color: 'bg-orange-100 text-orange-700' },
      medium: { label: 'Moyenne', color: 'bg-yellow-100 text-yellow-700' },
      low: { label: 'Faible', color: 'bg-green-100 text-green-700' }
    };
    const badge = badges[severity] || badges.medium;
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'spike':       return <TrendingUp className="text-red-500" size={18} />;
      case 'drop':        return <TrendingDown className="text-blue-500" size={18} />;
      case 'correlation': return <BarChart3 className="text-purple-500" size={18} />;
      case 'seasonal':    return <Clock className="text-orange-500" size={18} />;
      default:            return <AlertTriangle className="text-gray-500" size={18} />;
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: 'Actif', color: 'bg-red-100 text-red-700' },
      investigating: { label: 'Investigation', color: 'bg-yellow-100 text-yellow-700' },
      monitoring: { label: 'Surveillance', color: 'bg-blue-100 text-blue-700' },
      resolved: { label: 'Résolu', color: 'bg-green-100 text-green-700' }
    };
    const statusInfo = statusMap[status] || statusMap.active;
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const filteredAnomalies = anomalies.filter(anomaly => {
    if (filter === 'all') return true;
    if (filter === 'active') return anomaly.status === 'active';
    if (filter === 'critical') return anomaly.severity === 'critical';
    if (filter === 'resolved') return anomaly.status === 'resolved';
    return true;
  });

  const acknowledgeAnomaly = (id) => {
    setAnomalies(prev =>
      prev.map(anomaly =>
        anomaly.id === id
          ? { ...anomaly, status: 'investigating', actionTaken: true }
          : anomaly
      )
    );
  };

  const dismissAnomaly = (id) => {
    setAnomalies(prev =>
      prev.map(anomaly =>
        anomaly.id === id
          ? { ...anomaly, status: 'resolved' }
          : anomaly
      )
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="text-blue-600" size={20} />
            <h3 className="font-semibold text-gray-800">Détection d'Anomalies</h3>
            <div className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
              {filteredAnomalies.filter(a => a.status === 'active').length} actives
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-xs border rounded px-2 py-1 bg-white"
            >
              <option value="1h">Dernière heure</option>
              <option value="24h">24 heures</option>
              <option value="7d">7 jours</option>
              <option value="30d">30 jours</option>
            </select>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-xs border rounded px-2 py-1 bg-white"
            >
              <option value="all">Toutes ({anomalies.length})</option>
              <option value="active">Actives ({anomalies.filter(a => a.status === 'active').length})</option>
              <option value="critical">Critiques ({anomalies.filter(a => a.severity === 'critical').length})</option>
              <option value="resolved">Résolues ({anomalies.filter(a => a.status === 'resolved').length})</option>
            </select>
            <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
              <RefreshCw size={14} />
            </button>
            <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
              <Download size={14} />
            </button>
          </div>
        </div>
        {/* Time Series Visualization */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">Détection en Temps Réel ({timeRange})</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <ReferenceLine y={8} stroke="#EF4444" strokeDasharray="5 5" label="Seuil supérieur" />
              <ReferenceLine y={1} stroke="#EF4444" strokeDasharray="5 5" label="Seuil inférieur" />
              <Area type="monotone" dataKey="normal" stroke="#10B981" fill="#10B981" fillOpacity={0.2} name="normal" />
              <Area type="monotone" dataKey="observed" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="observed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Anomalies List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h4 className="font-medium text-gray-800 mb-4">Anomalies Détectées</h4>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredAnomalies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Eye size={32} className="mx-auto mb-2 text-gray-400" />
              <p>Aucune anomalie détectée pour ce filtre</p>
            </div>
          ) : (
            filteredAnomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedAnomaly?.id === anomaly.id ? 'ring-2 ring-blue-500' : ''
                } ${getSeverityColor(anomaly.severity)}`}
                onClick={() => setSelectedAnomaly(selectedAnomaly?.id === anomaly.id ? null : anomaly)}
              >
                {/* ...rest of your display code, unchanged, using anomaly fields... */}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
