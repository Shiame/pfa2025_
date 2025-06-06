import { useState, useEffect } from 'react';
import {
  Brain, TrendingUp, Target, MessageSquare, AlertTriangle, Clock,
  BarChart3, PieChart, Activity, Zap, Eye, Download, RefreshCw
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import PeriodPicker from '../components/PeriodPicker';

import {
  fetchComprehensiveAnalysis,
  fetchModelPerformanceMetrics,
  fetchSentimentAnalysis,
  fetchTextAnalytics,
  fetchPatternAnalysis,
  fetchRealTimeInsights
} from '../api/intelligentApi';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function IntelligentAnalysisPage() {
  const [range, setRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAnalysisData = async () => {
      setLoading(true);
      try {
        // Fetch all analysis sections
        const [
          compAnalysis,
          modelPerf,
          sentiment,
          textStats,
          patterns,
          insights
        ] = await Promise.all([
          fetchComprehensiveAnalysis(range.from, range.to),
          fetchModelPerformanceMetrics(range.from, range.to),
          fetchSentimentAnalysis(range.from, range.to),
          fetchTextAnalytics(range.from, range.to),
          fetchPatternAnalysis(range.from, range.to),
          fetchRealTimeInsights()
        ]);
        setAnalysisData({
          modelPerformance: modelPerf || compAnalysis?.modelPerformance,
          sentimentAnalysis: sentiment || compAnalysis?.sentimentAnalysis,
          textAnalytics: textStats || compAnalysis?.textAnalytics,
          patternAnalysis: patterns || compAnalysis?.patternAnalysis,
          realTimeInsights: insights || compAnalysis?.realTimeInsights || []
        });
      } catch (error) {
        setAnalysisData(null);
        console.error('Erreur récupération analyse IA:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
    // eslint-disable-next-line
  }, [range]);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800); // Just spinner for effect, useEffect already reloads data on range change
  };

  if (loading || !analysisData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: "Vue d'ensemble", icon: BarChart3 },
    { id: 'performance', label: 'Performance IA', icon: Target },
    { id: 'sentiment', label: 'Analyse sentiment', icon: MessageSquare },
    { id: 'patterns', label: 'Patterns & Tendances', icon: TrendingUp },
    { id: 'insights', label: 'Insights temps réel', icon: Zap }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Brain className="text-blue-600" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Analyse Intelligence Artificielle</h1>
            <p className="text-sm text-gray-600">Insights avancés et performance du modèle NLP</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PeriodPicker range={range} setRange={setRange} />
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Actualiser
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Download size={16} />
            Exporter
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* === Overview === */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <Target className="text-blue-600" size={24} />
                <span className="text-2xl font-bold text-gray-900">
                  {analysisData.modelPerformance?.overall?.accuracy ?? '--'}%
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Précision Globale</h3>
              <p className="text-sm text-gray-600">
                {analysisData.modelPerformance?.overall?.correctPredictions ?? '--'} sur {analysisData.modelPerformance?.overall?.totalPredictions ?? '--'} prédictions
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <MessageSquare className="text-green-600" size={24} />
                <span className="text-2xl font-bold text-gray-900">
                  {analysisData.sentimentAnalysis?.overall?.positive ?? '--'}%
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Sentiment Positif</h3>
              <p className="text-sm text-gray-600">Analyse du ton des plaintes</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <Activity className="text-purple-600" size={24} />
                <span className="text-2xl font-bold text-gray-900">
                  {analysisData.textAnalytics?.languagePatterns?.avgWordsPerComplaint ?? '--'}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Mots par Plainte</h3>
              <p className="text-sm text-gray-600">Moyenne de verbosité</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className="text-orange-600" size={24} />
                <span className="text-2xl font-bold text-gray-900">
                  {analysisData.realTimeInsights?.length ?? 0}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Insights Actifs</h3>
              <p className="text-sm text-gray-600">Alertes en temps réel</p>
            </div>
          </div>
        )}

        {/* === Performance Tab === */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Performance par Catégorie</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysisData.modelPerformance?.byCategory || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="#3B82F6" name="Précision %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Distribution de Confiance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      dataKey="count"
                      data={analysisData.modelPerformance?.confidenceDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                    >
                      {(analysisData.modelPerformance?.confidenceDistribution || []).map((entry, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Détails par Catégorie</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Catégorie</th>
                      <th className="text-right py-2">Précision</th>
                      <th className="text-right py-2">Rappel</th>
                      <th className="text-right py-2">F1-Score</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analysisData.modelPerformance?.byCategory || []).map((cat, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 font-medium">{cat.category}</td>
                        <td className="py-2 text-right">{cat.precision}%</td>
                        <td className="py-2 text-right">{cat.recall}%</td>
                        <td className="py-2 text-right">{((cat.precision + cat.recall) / 2).toFixed(1)}%</td>
                        <td className="py-2 text-right">{cat.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* === Sentiment Tab === */}
        {activeTab === 'sentiment' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Évolution du Sentiment</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analysisData.sentimentAnalysis?.trends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="positive" stackId="1" stroke="#10B981" fill="#10B981" />
                    <Area type="monotone" dataKey="neutral" stackId="1" stroke="#6B7280" fill="#6B7280" />
                    <Area type="monotone" dataKey="negative" stackId="1" stroke="#EF4444" fill="#EF4444" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Sentiment par Catégorie</h3>
                <div className="space-y-4">
                  {(analysisData.sentimentAnalysis?.byCategory || []).map((cat, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{cat.category}</span>
                        <span className="text-sm text-gray-500">100%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="flex h-2 rounded-full overflow-hidden">
                          <div className="bg-green-500" style={{ width: `${cat.positive}%` }}></div>
                          <div className="bg-gray-400" style={{ width: `${cat.neutral}%` }}></div>
                          <div className="bg-red-500" style={{ width: `${cat.negative}%` }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>+{cat.positive}%</span>
                        <span>~{cat.neutral}%</span>
                        <span>-{cat.negative}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === Patterns Tab === */}
        {activeTab === 'patterns' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Patterns Temporels</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analysisData.patternAnalysis?.temporalPatterns || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="complaints" fill="#3B82F6" name="Nombre de plaintes" />
                  <Line yAxisId="right" type="monotone" dataKey="avgUrgency" stroke="#EF4444" name="Urgence moyenne" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Mots-clés Fréquents</h3>
                <div className="space-y-3">
                  {(analysisData.textAnalytics?.wordFrequency || []).slice(0, 8).map((word, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{word.word}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{word.category}</span>
                      </div>
                      <span className="font-bold text-blue-600">{word.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Clusters Géographiques</h3>
                <div className="space-y-4">
                  {(analysisData.patternAnalysis?.geographicalClusters || []).map((cluster, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{cluster.zone}</div>
                        <div className="text-sm text-gray-600">Principal: {cluster.mainIssue}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          cluster.density === 'high' ? 'text-red-600' :
                          cluster.density === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {cluster.density === 'high' ? 'Élevée' :
                            cluster.density === 'medium' ? 'Moyenne' : 'Faible'}
                        </div>
                        <div className="text-xs text-gray-500">r={cluster.correlation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === Insights Tab === */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="grid gap-4">
              {(analysisData.realTimeInsights || []).map((insight, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        insight.type === 'trend' ? 'bg-blue-50 text-blue-600' :
                        insight.type === 'anomaly' ? 'bg-red-50 text-red-600' :
                        'bg-green-50 text-green-600'
                      }`}>
                        {insight.type === 'trend' ? <TrendingUp size={20} /> :
                          insight.type === 'anomaly' ? <AlertTriangle size={20} /> :
                          <Eye size={20} />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">{insight.title}</h4>
                        <p className="text-gray-600 mb-2">{insight.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Confiance: {insight.confidence}%</span>
                          <span>
                            {new Date(insight.timestamp).toLocaleString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full mb-2">
                        Action recommandée
                      </div>
                      <p className="text-sm text-gray-600">{insight.action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
