import { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Zap,
  Brain,
  TrendingUp
} from 'lucide-react';

export default function NLPStatusWidget() {
  const [nlpStatus, setNlpStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const fetchNLPStatus = async () => {
      try {
        // Your real API call here!
        const res = await fetch('/plaintes/nlp-status');
        if (!res.ok) throw new Error("API Error");
        const data = await res.json();
        setNlpStatus(data);
      } catch (err) {
        setNlpStatus(null);
      }
      setLoading(false);
      setLastUpdate(new Date());
    };

    fetchNLPStatus();

    const interval = setInterval(fetchNLPStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'error':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
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

  // Show a friendly message if the data is missing or malformed
  if (!nlpStatus || !nlpStatus.service) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="text-center text-gray-400">
          <div className="mb-2">Statut du service NLP indisponible</div>
        </div>
      </div>
    );
  }

  // Safe destructuring with fallback
  const service = nlpStatus.service ?? {};
  const model = nlpStatus.model ?? {};
  const queue = nlpStatus.queue ?? {};
  const alerts = nlpStatus.alerts ?? [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="text-blue-600" size={20} />
          <h3 className="font-semibold text-gray-800">Service NLP</h3>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
          {getStatusIcon(service.status)}
          <span className="ml-1 capitalize">{service.status === 'healthy' ? 'Actif' : service.status}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Service Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={14} className="text-gray-500" />
              <span className="text-xs text-gray-600">Disponibilité</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{service.uptime ?? "--"}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-gray-500" />
              <span className="text-xs text-gray-600">Temps de réponse</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{service.responseTime ?? "--"}</div>
          </div>
        </div>

        {/* Model Performance */}
        <div className="border-t pt-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-green-500" />
            <span className="text-sm font-medium text-gray-700">Performance du modèle</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">Précision globale</div>
              <div className="text-xl font-bold text-green-600">{model.accuracy ?? "--"}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Confiance moyenne</div>
              <div className="text-xl font-bold text-blue-600">{model.confidenceScore ?? "--"}%</div>
            </div>
          </div>

          {/* Processing Queue */}
          <div className="bg-blue-50 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">File d'attente</span>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>En attente: <strong>{queue.pending ?? 0}</strong></span>
                <span>En cours: <strong>{queue.processing ?? 0}</strong></span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Temps moyen de traitement: {queue.avgProcessingTime ?? "--"}
            </div>
          </div>

          {/* Today's Stats */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Classifications aujourd'hui</span>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900">{model.todayClassifications ?? 0}</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <div className="border-t pt-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Alertes récentes</div>
            <div className="space-y-2 max-h-20 overflow-y-auto">
              {alerts.slice(0, 2).map((alert, index) => (
                <div key={index} className="flex items-start gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    alert.level === 'warning' ? 'bg-yellow-400' : 
                    alert.level === 'error' ? 'bg-red-400' : 'bg-blue-400'
                  }`}></div>
                  <div className="flex-1">
                    <div className="text-gray-700">{alert.message}</div>
                    <div className="text-gray-500">
                      {alert.time
                        ? new Date(alert.time).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : "--"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Update */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
        </div>
      </div>
    </div>
  );
}
