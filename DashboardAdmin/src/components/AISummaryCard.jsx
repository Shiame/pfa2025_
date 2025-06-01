import { useState } from 'react';
import { 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  Tag,
  Zap
} from 'lucide-react';

export default function AISummaryCard({ summary, detailed = false }) {
  const [expanded, setExpanded] = useState(false);

  if (!summary) return null;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const mainText = summary.naturalLanguageSummary || 
                   summary.natural_language_summary || 
                   summary.summary ||
                   'Résumé IA non disponible';

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="text-blue-600 flex-shrink-0" size={18} />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">
                Analyse IA - {summary.zone || 'Zone non spécifiée'}
              </h4>
              {summary.category && (
                <div className="flex items-center mt-1">
                  <Tag size={12} className="text-gray-400 mr-1" />
                  <span className="text-xs text-gray-600">{summary.category}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Anomaly Indicator */}
          {summary.anomaly && (
            <AlertTriangle className="text-orange-500 flex-shrink-0" size={16} title="Anomalie détectée" />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <p className="text-sm text-gray-800 leading-relaxed mb-3">
          {mainText}
        </p>

        {/* Metrics Row */}
        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
          <div className="flex items-center space-x-4">
            {summary.count !== undefined && (
              <span className="flex items-center">
                <BarChart3 size={12} className="mr-1" />
                {summary.count} plainte(s)
              </span>
            )}
            
            {summary.periodStart && (
              <span className="flex items-center">
                <Clock size={12} className="mr-1" />
                {formatTimestamp(summary.periodStart)}
              </span>
            )}
          </div>

          {detailed && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span className="mr-1">Détails</span>
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>

        {/* Priority and Urgency Indicators */}
        {(summary.urgency || summary.priority) && (
          <div className="flex items-center space-x-2 mb-3">
            {summary.urgency && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(summary.urgency)}`}>
                {summary.urgency}
              </span>
            )}
            {summary.priority && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Priorité: {summary.priority}/20
              </span>
            )}
          </div>
        )}

        {/* Expanded Details */}
        {expanded && detailed && (
          <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
            {/* Recommendations */}
            {summary.recommendations && summary.recommendations.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                  <Zap size={12} className="mr-1" />
                  Recommandations
                </h5>
                <div className="space-y-1">
                  {summary.recommendations.slice(0, 3).map((rec, idx) => (
                    <div key={idx} className="text-xs text-gray-600 bg-blue-50 rounded p-2">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Metrics */}
            {summary.confidence && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Confiance IA:</span>
                <span className={`font-medium ${summary.confidence > 0.8 ? 'text-green-600' : summary.confidence > 0.6 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {(summary.confidence * 100).toFixed(1)}%
                </span>
              </div>
            )}

            {/* Trend Information */}
            {summary.trend && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Tendance:</span>
                <div className="flex items-center">
                  <TrendingUp 
                    size={12} 
                    className={summary.trend > 0 ? 'text-red-600' : 'text-green-600'} 
                  />
                  <span className={`ml-1 font-medium ${summary.trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {summary.trend > 0 ? '+' : ''}{summary.trend.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}