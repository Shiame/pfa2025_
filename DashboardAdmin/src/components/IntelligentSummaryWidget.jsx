import { useState, useEffect } from 'react';
import { 
  Brain, AlertTriangle, MessageSquare, Activity, ChevronRight, Clock, 
  MapPin, Tag, TrendingUp, TrendingDown 
} from 'lucide-react';
import { fetchIntelligentSummaries, fetchComprehensiveAnalysis } from '../api/intelligentApi';

export default function IntelligentSummaryWidget({ hours = 24, zone = null }) {
  const [activeTab, setActiveTab] = useState('summaries');
  const [summaries, setSummaries] = useState([]);
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummaries = async () => {
      setLoading(true);
      try {
        const [summariesRes, compAnalysisRes] = await Promise.all([
          fetchIntelligentSummaries(hours, zone),
          fetchComprehensiveAnalysis(hours)
        ]);
        setSummaries(summariesRes || []);
        setComprehensiveAnalysis(compAnalysisRes || null);
      } catch (e) {
        setSummaries([]);
        setComprehensiveAnalysis(null);
      }
      setLoading(false);
    };
    fetchSummaries();
    // eslint-disable-next-line
  }, [hours, zone]);

  const renderNaturalLanguageSummaries = () => (
    <div className="space-y-3">
      {summaries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Brain size={32} className="mx-auto mb-3 text-gray-400" />
          <p className="font-medium">Aucun résumé intelligent disponible</p>
          <p className="text-sm mt-1">Les données seront analysées automatiquement</p>
        </div>
      ) : (
        summaries.slice(0, 5).map((summary, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
              summary.isAnomaly 
                ? 'border-red-500 bg-red-50 hover:bg-red-100' 
                : 'border-blue-500 bg-blue-50 hover:bg-blue-100'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <MessageSquare size={16} className="text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Résumé Automatique</span>
                  {summary.isAnomaly && (
                    <span className="ml-2 px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full">
                      Anomalie
                    </span>
                  )}
                </div>
                <p className="text-gray-900 font-medium mb-3 leading-relaxed">
                  {summary.naturalLanguageSummary || summary.natural_language_summary}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-600">
                  <div className="flex items-center">
                    <MapPin size={12} className="mr-1" />
                    {summary.zone}
                  </div>
                  <div className="flex items-center">
                    <Tag size={12} className="mr-1" />
                    {summary.groupedCategory || summary.category}
                  </div>
                  <div className="flex items-center">
                    <Activity size={12} className="mr-1" />
                    {summary.count} plainte(s)
                  </div>
                  {summary.percentageChange !== 0 && (
                    <div className={`flex items-center ${
                      summary.percentageChange > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {summary.percentageChange > 0 ? 
                        <TrendingUp size={12} className="mr-1" /> : 
                        <TrendingDown size={12} className="mr-1" />
                      }
                      {summary.percentageChange > 0 ? '+' : ''}{summary.percentageChange.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
              {summary.isAnomaly && (
                <AlertTriangle size={20} className="text-red-500 ml-3" />
              )}
            </div>
          </div>
        ))
      )}
      {summaries.length > 5 && (
        <div className="text-center pt-3">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mx-auto">
            Voir tous les résumés ({summaries.length})
            <ChevronRight size={14} className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );

  const renderComprehensiveAnalysis = () => {
    if (!comprehensiveAnalysis) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Brain size={32} className="mx-auto mb-3 text-gray-400" />
          <p>Analyse complète en cours...</p>
        </div>
      );
    }
    const { aggregate_summary, recommendations = [], individual_classifications = [] } = comprehensiveAnalysis;
    return (
      <div className="space-y-6">
        {aggregate_summary && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Brain size={16} className="mr-2" />
              Résumé Général par IA
            </h4>
            <p className="text-blue-800 leading-relaxed">{aggregate_summary}</p>
          </div>
        )}
        {individual_classifications.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Activity size={16} className="mr-2" />
              Classifications Récentes ({individual_classifications.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {individual_classifications.slice(0, 6).map((classification, index) => (
                <div key={index} className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-gray-600">#{classification.complaintId || classification.complaint_id}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      classification.niveauUrgence === 'critical' || classification.niveau_urgence === 'critical' ? 'bg-red-100 text-red-800' :
                      classification.niveauUrgence === 'high' || classification.niveau_urgence === 'high' ? 'bg-orange-100 text-orange-800' :
                      classification.niveauUrgence === 'medium' || classification.niveau_urgence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {classification.niveauUrgence || classification.niveau_urgence}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <div className="font-medium">{classification.categorie}</div>
                    <div className="text-gray-500">Priorité: {classification.priorite}</div>
                  </div>
                </div>
              ))}
            </div>
            {individual_classifications.length > 6 && (
              <p className="text-sm text-gray-500 mt-3 text-center">
                ... et {individual_classifications.length - 6} autres classifications
              </p>
            )}
          </div>
        )}
        {recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <AlertTriangle size={16} className="mr-2 text-orange-500" />
              Actions Recommandées
            </h4>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                  <AlertTriangle size={16} className="text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-orange-800 text-sm leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'summaries', label: 'Résumés Intelligents', icon: MessageSquare, count: summaries.length },
    { id: 'analysis', label: 'Analyse Complète', icon: Brain, count: comprehensiveAnalysis?.individual_classifications?.length || 0 }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="border-b border-gray-200">
        <div className="px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Brain className="mr-2 text-blue-500" size={20} />
            Analyse Intelligente par IA
          </h3>
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={16} className="mr-2" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-6">
        {activeTab === 'summaries' && renderNaturalLanguageSummaries()}
        {activeTab === 'analysis' && renderComprehensiveAnalysis()}
      </div>
    </div>
  );
}
