import { useState, useEffect } from 'react';
import {
  Zap, TrendingUp, AlertTriangle, Eye, Clock, MapPin, Target, Activity, RefreshCw, Bell, CheckCircle, XCircle, Info
} from 'lucide-react';
import { fetchRealTimeInsights } from '../api/intelligentApi';

export default function RealtimeInsightsWidget() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState('all');

  // Fetch real-time insights from backend
  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const data = await fetchRealTimeInsights();
        setInsights(data || []);
        setLastUpdate(new Date());
      } catch (err) {
        setInsights([]);
      }
      setLoading(false);
    };

    fetchInsights();

    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchInsights, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getInsightIcon = (type) => {
    switch (type) {
      case 'critical_alert':
        return <AlertTriangle className="text-red-500" size={20} />;
      case 'positive_trend':
        return <TrendingUp className="text-green-500" size={20} />;
      case 'pattern_detection':
        return <Target className="text-blue-500" size={20} />;
      case 'anomaly':
        return <Eye className="text-orange-500" size={20} />;
      case 'prediction':
        return <Activity className="text-purple-500" size={20} />;
      default:
        return <Info className="text-gray-500" size={20} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500 bg-red-50 hover:bg-red-100';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 hover:bg-yellow-100';
      case 'medium':
        return 'border-l-orange-500 bg-orange-50 hover:bg-orange-100';
      case 'info':
        return 'border-l-green-500 bg-green-50 hover:bg-green-100';
      default:
        return 'border-l-gray-500 bg-gray-50 hover:bg-gray-100';
    }
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      critical: { label: 'Critique', color: 'bg-red-100 text-red-700' },
      warning: { label: 'Attention', color: 'bg-yellow-100 text-yellow-700' },
      medium: { label: 'Moyen', color: 'bg-orange-100 text-orange-700' },
      info: { label: 'Info', color: 'bg-green-100 text-green-700' }
    };
    const badge = badges[priority] || badges.info;
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredInsights = insights.filter(insight => {
    if (filter === 'all') return true;
    if (filter === 'critical') return insight.priority === 'critical';
    if (filter === 'trends') return insight.type === 'positive_trend' || insight.type === 'prediction';
    if (filter === 'anomalies') return insight.type === 'anomaly' || insight.type === 'pattern_detection';
    return true;
  });

  const manualRefresh = async () => {
    setLoading(true);
    try {
      const data = await fetchRealTimeInsights();
      setInsights(data || []);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="text-blue-600" size={20} />
          <h3 className="font-semibold text-gray-800">Insights Temps Réel</h3>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Live</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs border rounded px-2 py-1 bg-white"
          >
            <option value="all">Tous ({insights.length})</option>
            <option value="critical">Critiques ({insights.filter(i => i.priority === 'critical').length})</option>
            <option value="trends">Tendances</option>
            <option value="anomalies">Anomalies</option>
          </select>
          {/* Auto-refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-1 rounded text-xs ${
              autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
            title={autoRefresh ? 'Auto-refresh activé' : 'Auto-refresh désactivé'}
          >
            <Activity size={14} />
          </button>
          {/* Manual Refresh */}
          <button
            onClick={manualRefresh}
            className="p-1 rounded text-gray-600 hover:bg-gray-100"
            title="Actualiser manuellement"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredInsights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Eye size={32} className="mx-auto mb-2 text-gray-400" />
            <p>Aucun insight pour ce filtre</p>
          </div>
        ) : (
          filteredInsights.map((insight) => (
            <div
              key={insight.id}
              className={`border-l-4 rounded-lg p-4 cursor-pointer transition-all duration-200 ${getPriorityColor(insight.priority)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-800 text-sm">{insight.title}</h4>
                      {getPriorityBadge(insight.priority)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        <span>{insight.zone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{new Date(insight.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${getConfidenceColor(insight.confidence)}`}>
                        <Target size={12} />
                        <span>{insight.confidence}% confiance</span>
                      </div>
                    </div>
                    {/* Details blocks as needed */}
                    {insight.actionRequired && (
                      <div className="flex items-start gap-2 mt-2 p-2 bg-gray-100 rounded">
                        <Bell size={14} className="text-gray-600 mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-1">Action recommandée</div>
                          <div className="text-xs text-gray-600">{insight.recommendedAction}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex flex-col gap-1 ml-2">
                  {insight.actionRequired && (
                    <button className="p-1 text-blue-600 hover:bg-blue-100 rounded text-xs">
                      <CheckCircle size={14} />
                    </button>
                  )}
                  <button className="p-1 text-gray-500 hover:bg-gray-100 rounded text-xs">
                    <XCircle size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t mt-4 text-xs text-gray-500">
        <span>
          Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
        </span>
        <div className="flex items-center gap-2">
          <span>{filteredInsights.filter(i => i.actionRequired).length} actions requises</span>
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Voir tout
          </button>
        </div>
      </div>
    </div>
  );
}
