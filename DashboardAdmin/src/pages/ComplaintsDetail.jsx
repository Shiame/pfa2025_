import { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Tag,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  Image,
  Brain,
  Target,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  Eye,
  Zap
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function EnhancedComplaintDetail({ complaintId = "123" }) {
  const [complaint, setComplaint] = useState(null);
  const [nlpAnalysis, setNlpAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('classification');

  useEffect(() => {
    const fetchComplaintData = async () => {
      setLoading(true);
      
      try {
        // Mock complaint data with NLP analysis
        const mockComplaint = {
          id: complaintId,
          description: "Il y a des déchets partout dans la rue près de l'école. C'est très dangereux pour les enfants, il faut faire quelque chose d'urgent !",
          dateSoumission: "2025-01-15T10:30:00Z",
          statut: "EN_COURS",
          zone: "Agdal",
          latitude: 34.0181,
          longitude: -6.8344,
          imgUrl: "/api/placeholder/400/300",
          localisation: "Rue des Écoles, Agdal",
          priorite: 8,
          categorie: { nom: "DECHETS" },
          utilisateur: {
            nom: "Ahmed Benali",
            email: "a.benali@email.com",
            telephone: "+212 661 234 567"
          }
        };

        const mockNlpAnalysis = {
          classification: {
            predictedCategory: "DECHETS",
            confidence: 94.2,
            scores: {
              "DECHETS": 94.2,
              "VOIRIE": 3.8,
              "AUTRES": 1.5,
              "AGRESSION": 0.3,
              "CORRUPTION": 0.2
            },
            processingTime: "0.12s",
            modelVersion: "v2.1.3"
          },
          sentiment: {
            overall: "negative",
            score: -0.6,
            confidence: 89.3,
            emotions: {
              frustration: 75,
              urgency: 85,
              concern: 90,
              anger: 45
            }
          },
          textAnalysis: {
            wordCount: 23,
            sentenceCount: 2,
            avgWordsPerSentence: 11.5,
            readabilityScore: 82,
            keyWords: [
              { word: "déchets", importance: 95, category: "DECHETS" },
              { word: "dangereux", importance: 88, category: "SENTIMENT" },
              { word: "urgent", importance: 85, category: "URGENCY" },
              { word: "enfants", importance: 78, category: "CONTEXT" },
              { word: "école", importance: 75, category: "LOCATION" }
            ],
            entities: [
              { entity: "école", type: "LIEU", confidence: 91.2 },
              { entity: "rue", type: "LIEU", confidence: 87.5 },
              { entity: "enfants", type: "PERSONNE", confidence: 94.8 }
            ],
            urgencyIndicators: ["urgent", "dangereux", "il faut"],
            locationReferences: ["rue", "école", "Agdal"]
          },
          priority: {
            calculatedScore: 8,
            factors: {
              baseCategory: 5,    // DECHETS base score
              urgencyWords: 2,    // "urgent", "dangereux"
              locationSensitive: 1, // near school
              sentiment: 0        // negative sentiment doesn't add priority for DECHETS
            },
            level: "high",
            reasoning: "Score élevé dû à la proximité d'une école et aux mots d'urgence détectés"
          },
          qualityMetrics: {
            completeness: 85,    // has location, description, context
            specificity: 78,     // specific problem described
            actionability: 92,   // clear what needs to be done
            duplicateRisk: 12    // low risk of being duplicate
          },
          recommendations: [
            {
              type: "immediate",
              action: "Nettoyer la zone près de l'école",
              priority: "high",
              estimatedTime: "2-4 heures"
            },
            {
              type: "preventive", 
              action: "Installer des poubelles supplémentaires",
              priority: "medium",
              estimatedTime: "1-2 jours"
            },
            {
              type: "monitoring",
              action: "Surveillance renforcée de la zone scolaire",
              priority: "low",
              estimatedTime: "En continu"
            }
          ],
          similarComplaints: [
            { id: 234, similarity: 87.2, description: "Déchets devant l'école maternelle..." },
            { id: 189, similarity: 72.1, description: "Poubelles renversées rue des Écoles..." },
            { id: 156, similarity: 69.8, description: "Ordures près du lycée Moulay..." }
          ]
        };

        setComplaint(mockComplaint);
        setNlpAnalysis(mockNlpAnalysis);
      } catch (error) {
        console.error('Error fetching complaint data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaintData();
  }, [complaintId]);

  const handleStatusChange = async (newStatus) => {
    if (!complaint) return;
    setSubmitting(true);
    
    try {
      // Mock status update
      setComplaint(prev => ({ ...prev, statut: newStatus }));
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!complaint || !nlpAnalysis) {
    return <div className="p-6 text-center text-red-500">Plainte introuvable</div>;
  }

  const classificationData = Object.entries(nlpAnalysis.classification.scores).map(([category, score]) => ({
    name: category,
    value: score,
    fill: COLORS[Object.keys(nlpAnalysis.classification.scores).indexOf(category) % COLORS.length]
  }));

  const analysisTabsData = [
    { id: 'classification', label: 'Classification', icon: Target },
    { id: 'sentiment', label: 'Sentiment', icon: MessageSquare },
    { id: 'analysis', label: 'Analyse Textuelle', icon: BarChart3 },
    { id: 'recommendations', label: 'Recommandations', icon: Zap }
  ];

  return (
    <div className="space-y-6 p-6">
      <button
        onClick={() => console.log('Navigate back')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <ChevronLeft size={20} className="mr-2" /> Retour
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Complaint Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Plainte #{complaint.id}</h1>
              <div className="flex items-center gap-2">
                <Brain className="text-blue-600" size={20} />
                <span className="text-sm text-blue-600 font-medium">IA Analysée</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-gray-800 mb-2">Description</h3>
                <p className="text-gray-700">{complaint.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Tag className="text-blue-500 mt-0.5 mr-2" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Catégorie</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{complaint.categorie.nom}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(nlpAnalysis.classification.confidence)}`}>
                        {nlpAnalysis.classification.confidence}% confiance
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="text-blue-500 mt-0.5 mr-2" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Localisation</p>
                    <p className="font-medium">{complaint.localisation}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="text-blue-500 mt-0.5 mr-2" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Date de soumission</p>
                    <p className="font-medium">
                      {new Date(complaint.dateSoumission).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <TrendingUp className="text-blue-500 mt-0.5 mr-2" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Priorité IA</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{complaint.priorite}/10</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        complaint.priorite >= 8 ? 'bg-red-100 text-red-700' :
                        complaint.priorite >= 6 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {nlpAnalysis.priority.level === 'high' ? 'Élevée' :
                         nlpAnalysis.priority.level === 'medium' ? 'Moyenne' : 'Faible'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NLP Analysis Tabs */}
          <div className="bg-white shadow rounded-lg">
            <div className="border-b">
              <div className="flex overflow-x-auto">
                {analysisTabsData.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAnalysisTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeAnalysisTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeAnalysisTab === 'classification' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4">Scores de Classification</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={classificationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {classificationData.map((entry, index) => (
                              <Cell key={index} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4">Détails Techniques</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Catégorie prédite:</span>
                          <span className="font-medium">{nlpAnalysis.classification.predictedCategory}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Confiance:</span>
                          <span className={`font-medium ${getConfidenceColor(nlpAnalysis.classification.confidence)}`}>
                            {nlpAnalysis.classification.confidence}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Temps de traitement:</span>
                          <span className="font-medium">{nlpAnalysis.classification.processingTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Version du modèle:</span>
                          <span className="font-medium">{nlpAnalysis.classification.modelVersion}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Calcul de Priorité</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{nlpAnalysis.priority.factors.baseCategory}</div>
                          <div className="text-xs text-gray-600">Base catégorie</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">{nlpAnalysis.priority.factors.urgencyWords}</div>
                          <div className="text-xs text-gray-600">Mots urgents</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">{nlpAnalysis.priority.factors.locationSensitive}</div>
                          <div className="text-xs text-gray-600">Lieu sensible</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{nlpAnalysis.priority.factors.sentiment}</div>
                          <div className="text-xs text-gray-600">Sentiment</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 italic">
                        {nlpAnalysis.priority.reasoning}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeAnalysisTab === 'sentiment' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4">Analyse du Sentiment</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>Sentiment général:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(nlpAnalysis.sentiment.overall)}`}>
                            {nlpAnalysis.sentiment.overall === 'positive' ? 'Positif' :
                             nlpAnalysis.sentiment.overall === 'negative' ? 'Négatif' : 'Neutre'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>Score de sentiment:</span>
                          <span className="font-medium">{nlpAnalysis.sentiment.score}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>Confiance:</span>
                          <span className="font-medium">{nlpAnalysis.sentiment.confidence}%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4">Émotions Détectées</h4>
                      <div className="space-y-3">
                        {Object.entries(nlpAnalysis.sentiment.emotions).map(([emotion, score]) => (
                          <div key={emotion}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm capitalize">{emotion}:</span>
                              <span className="text-sm font-medium">{score}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeAnalysisTab === 'analysis' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4">Mots-clés Importants</h4>
                      <div className="space-y-2">
                        {nlpAnalysis.textAnalysis.keyWords.map((word, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{word.word}</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {word.category}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-blue-600">{word.importance}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4">Entités Reconnues</h4>
                      <div className="space-y-2">
                        {nlpAnalysis.textAnalysis.entities.map((entity, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{entity.entity}</span>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                {entity.type}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-green-600">{entity.confidence}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{nlpAnalysis.textAnalysis.wordCount}</div>
                      <div className="text-sm text-gray-600">Mots</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{nlpAnalysis.textAnalysis.sentenceCount}</div>
                      <div className="text-sm text-gray-600">Phrases</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{nlpAnalysis.qualityMetrics.completeness}%</div>
                      <div className="text-sm text-gray-600">Complétude</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{nlpAnalysis.qualityMetrics.actionability}%</div>
                      <div className="text-sm text-gray-600">Actionnable</div>
                    </div>
                  </div>
                </div>
              )}

              {activeAnalysisTab === 'recommendations' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">Actions Recommandées</h4>
                    <div className="space-y-3">
                      {nlpAnalysis.recommendations.map((rec, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {rec.type === 'immediate' ? 'Immédiat' :
                               rec.type === 'preventive' ? 'Préventif' : 'Surveillance'}
                            </span>
                            <span className="text-sm text-gray-600">{rec.estimatedTime}</span>
                          </div>
                          <p className="font-medium">{rec.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">Plaintes Similaires</h4>
                    <div className="space-y-2">
                      {nlpAnalysis.similarComplaints.map((similar, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium">Plainte #{similar.id}</span>
                            <p className="text-sm text-gray-600 truncate">{similar.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-blue-600">{similar.similarity}%</div>
                            <div className="text-xs text-gray-500">similarité</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>  
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Gestion du statut</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleStatusChange('EN_ATTENTE')}
                disabled={complaint.statut === 'EN_ATTENTE' || submitting}
                className={`w-full px-4 py-2 rounded-md flex items-center justify-center text-sm ${
                  complaint.statut === 'EN_ATTENTE'
                    ? 'bg-yellow-100 text-yellow-800 cursor-default'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Clock size={16} className="mr-2" /> En attente
              </button>
              <button
                onClick={() => handleStatusChange('EN_COURS')}
                disabled={complaint.statut === 'EN_COURS' || submitting}
                className={`w-full px-4 py-2 rounded-md flex items-center justify-center text-sm ${
                  complaint.statut === 'EN_COURS'
                    ? 'bg-blue-100 text-blue-800 cursor-default'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Clock size={16} className="mr-2" /> En cours
              </button>
              <button
                onClick={() => handleStatusChange('RESOLUE')}
                disabled={complaint.statut === 'RESOLUE' || submitting}
                className={`w-full px-4 py-2 rounded-md flex items-center justify-center text-sm ${
                  complaint.statut === 'RESOLUE'
                    ? 'bg-green-100 text-green-800 cursor-default'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CheckCircle size={16} className="mr-2" /> Résolue
              </button>
              <button
                onClick={() => handleStatusChange('REJETEE')}
                disabled={complaint.statut === 'REJETEE' || submitting}
                className={`w-full px-4 py-2 rounded-md flex items-center justify-center text-sm ${
                  complaint.statut === 'REJETEE'
                    ? 'bg-red-100 text-red-800 cursor-default'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <XCircle size={16} className="mr-2" /> Rejetée
              </button>
            </div>
          </div>

          {/* Citizen Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Informations du citoyen</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium">{complaint.utilisateur.nom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{complaint.utilisateur.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="font-medium">{complaint.utilisateur.telephone}</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Image jointe</h2>
            </div>
            <img
              src={complaint.imgUrl}
              alt="Image de la plainte"
              className="w-full h-48 object-cover"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions rapides</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                Envoyer notification
              </button>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                Exporter analyse IA
              </button>
              <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm">
                Voir plaintes similaires
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}