import { useState, useEffect } from 'react';
import {
  Lightbulb,
  Target,
  Clock,
  Users,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Star,
  Zap,
  Calendar,
  DollarSign,
  Activity,
  BarChart3,
  RefreshCw
} from 'lucide-react';

export default function SmartRecommendationsPanel() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');

  useEffect(() => {
    const fetchRecommendations = () => {
      // Mock smart recommendations data
      const mockRecommendations = [
        {
          id: 1,
          type: 'resource_allocation',
          title: 'Optimiser les équipes de nettoyage',
          description: 'Redéployer 2 équipes vers Agdal pendant les heures de pointe (6h-10h) pour réduire les plaintes DECHETS de 40%',
          priority: 'high',
          confidence: 94.2,
          impact: 'high',
          category: 'DECHETS',
          zone: 'Agdal',
          estimatedReduction: '40% de plaintes en moins',
          estimatedCost: '2,500 MAD/mois',
          implementationTime: '3 jours',
          basedOn: 'Analyse des patterns temporels et géographiques',
          evidence: [
            'Pic de 67% des plaintes DECHETS entre 6h-10h à Agdal',
            'Corrélation 0.89 entre horaires et volume de plaintes',
            'Réduction similaire observée à Hassan (-38%)'
          ],
          kpis: [
            { label: 'Réduction prévue', value: '-40%', type: 'negative' },
            { label: 'ROI estimé', value: '+180%', type: 'positive' },
            { label: 'Temps de mise en œuvre', value: '3 jours', type: 'neutral' }
          ],
          status: 'pending',
          aiGenerated: true
        },
        {
          id: 2,
          type: 'preventive_action',
          title: 'Renforcer la surveillance nocturne',
          description: 'Augmenter la présence sécuritaire entre 20h-2h dans le quartier Hassan pour prévenir les agressions',
          priority: 'critical',
          confidence: 91.7,
          impact: 'high',
          category: 'AGRESSION',
          zone: 'Hassan',
          estimatedReduction: '60% de risque en moins',
          estimatedCost: '15,000 MAD/mois',
          implementationTime: '1 semaine',
          basedOn: 'Analyse prédictive des zones à risque',
          evidence: [
            '78% des agressions surviennent entre 20h-2h',
            'Concentration dans un rayon de 300m',
            'Augmentation de 45% ce mois-ci'
          ],
          kpis: [
            { label: 'Réduction du risque', value: '-60%', type: 'negative' },
            { label: 'Zone couverte', value: '2.5 km²', type: 'neutral' },
            { label: 'Coût par incident évité', value: '750 MAD', type: 'positive' }
          ],
          status: 'pending',
          aiGenerated: true
        },
        {
          id: 3,
          type: 'process_optimization',
          title: 'Automatiser le tri des plaintes',
          description: 'Implémenter un système de classification automatique pour réduire le temps de traitement de 65%',
          priority: 'medium',
          confidence: 87.3,
          impact: 'medium',
          category: 'ALL',
          zone: 'Toutes zones',
          estimatedReduction: '65% de temps en moins',
          estimatedCost: '50,000 MAD (one-time)',
          implementationTime: '2 mois',
          basedOn: 'Analyse de l\'efficacité des processus actuels',
          evidence: [
            'Temps moyen de tri actuel: 8.5 minutes/plainte',
            'Précision IA: 94.2% sur 1000+ plaintes',
            'Économie estimée: 120h/mois'
          ],
          kpis: [
            { label: 'Gain de temps', value: '-65%', type: 'negative' },
            { label: 'Précision', value: '94.2%', type: 'positive' },
            { label: 'ROI', value: '8 mois', type: 'neutral' }
          ],
          status: 'in_review',
          aiGenerated: true
        },
        {
          id: 4,
          type: 'infrastructure',
          title: 'Installer des poubelles intelligentes',
          description: 'Déployer 15 poubelles connectées à Agdal avec capteurs de remplissage pour optimiser la collecte',
          priority: 'medium',
          confidence: 83.9,
          impact: 'medium',
          category: 'DECHETS',
          zone: 'Agdal',
          estimatedReduction: '50% d\'optimisation de collecte',
          estimatedCost: '180,000 MAD (installation)',
          implementationTime: '6 semaines',
          basedOn: 'Analyse IoT et optimisation des tournées',
          evidence: [
            'Réduction de 50% des tournées inutiles',
            'Notification en temps réel du remplissage',
            'Exemple de Casablanca: -45% de plaintes'
          ],
          kpis: [
            { label: 'Optimisation tournées', value: '+50%', type: 'positive' },
            { label: 'Points de collecte', value: '15', type: 'neutral' },
            { label: 'Économie annuelle', value: '85,000 MAD', type: 'positive' }
          ],
          status: 'approved',
          aiGenerated: true
        },
        {
          id: 5,
          type: 'communication',
          title: 'Campagne de sensibilisation ciblée',
          description: 'Lancer une campagne dans les zones à forte concentration de corruption pour sensibiliser les citoyens',
          priority: 'low',
          confidence: 76.4,
          impact: 'low',
          category: 'CORRUPTION',
          zone: 'Centre-ville',
          estimatedReduction: '25% de signalements en plus',
          estimatedCost: '25,000 MAD (campagne)',
          implementationTime: '1 mois',
          basedOn: 'Analyse comportementale et géographique',
          evidence: [
            'Sous-déclaration estimée à 60%',
            'Corrélation zones administratives/corruption',
            'Succès campagne Fès: +35% signalements'
          ],
          kpis: [
            { label: 'Augmentation signalements', value: '+25%', type: 'positive' },
            { label: 'Portée estimée', value: '50,000 citoyens', type: 'neutral' },
            { label: 'Coût par contact', value: '0.5 MAD', type: 'positive' }
          ],
          status: 'pending',
          aiGenerated: true
        }
      ];
      
      setRecommendations(mockRecommendations);
      setLoading(false);
    };

    fetchRecommendations();
  }, []);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'resource_allocation':
        return <Users className="text-blue-500" size={18} />;
      case 'preventive_action':
        return <AlertTriangle className="text-red-500" size={18} />;
      case 'process_optimization':
        return <BarChart3 className="text-green-500" size={18} />;
      case 'infrastructure':
        return <MapPin className="text-purple-500" size={18} />;
      case 'communication':
        return <Users className="text-orange-500" size={18} />;
      default:
        return <Lightbulb className="text-gray-500" size={18} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'high':
        return 'border-orange-200 bg-orange-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      critical: { label: 'Critique', color: 'bg-red-100 text-red-700' },
      high: { label: 'Élevée', color: 'bg-orange-100 text-orange-700' },
      medium: { label: 'Moyenne', color: 'bg-yellow-100 text-yellow-700' },
      low: { label: 'Faible', color: 'bg-green-100 text-green-700' }
    };
    
    const badge = badges[priority] || badges.medium;
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'in_review':
        return <Clock className="text-yellow-500" size={16} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getImpactStars = (impact) => {
    const levels = { low: 1, medium: 2, high: 3 };
    const stars = levels[impact] || 1;
    
    return (
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <Star 
            key={i} 
            size={12} 
            className={i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
          />
        ))}
      </div>
    );
  };

  const getKPIColor = (type) => {
    switch (type) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (filter === 'all') return true;
    if (filter === 'pending') return rec.status === 'pending';
    if (filter === 'approved') return rec.status === 'approved';
    if (filter === 'high_impact') return rec.impact === 'high';
    return true;
  });

  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorities = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    }
    if (sortBy === 'confidence') {
      return b.confidence - a.confidence;
    }
    if (sortBy === 'impact') {
      const impacts = { high: 3, medium: 2, low: 1 };
      return impacts[b.impact] - impacts[a.impact];
    }
    return 0;
  });

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
          <Lightbulb className="text-blue-600" size={20} />
          <h3 className="font-semibold text-gray-800">Recommandations IA</h3>
          <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
            {recommendations.length} suggestions
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs border rounded px-2 py-1 bg-white"
          >
            <option value="all">Toutes</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvées</option>
            <option value="high_impact">Fort impact</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border rounded px-2 py-1 bg-white"
          >
            <option value="priority">Priorité</option>
            <option value="confidence">Confiance</option>
            <option value="impact">Impact</option>
          </select>
          
          <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {sortedRecommendations.map((rec) => (
          <div
            key={rec.id}
            className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getPriorityColor(rec.priority)}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                {getTypeIcon(rec.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-800">{rec.title}</h4>
                    {getPriorityBadge(rec.priority)}
                    {rec.aiGenerated && (
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                        IA
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getImpactStars(rec.impact)}
                {getStatusIcon(rec.status)}
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-xs">
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin size={12} />
                <span>{rec.zone}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Target size={12} />
                <span>{rec.confidence}% confiance</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Clock size={12} />
                <span>{rec.implementationTime}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <DollarSign size={12} />
                <span>{rec.estimatedCost}</span>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              {rec.kpis.map((kpi, index) => (
                <div key={index} className="bg-white rounded p-2 text-center">
                  <div className={`text-sm font-bold ${getKPIColor(kpi.type)}`}>
                    {kpi.value}
                  </div>
                  <div className="text-xs text-gray-500">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Evidence */}
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-700 mb-1">Basé sur:</div>
              <div className="text-xs text-gray-600 mb-2">{rec.basedOn}</div>
              <div className="space-y-1">
                {rec.evidence.slice(0, 2).map((evidence, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-gray-600">
                    <div className="w-1 h-1 bg-blue-400 rounded-full mt-2"></div>
                    <span>{evidence}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="text-xs text-gray-500">
                Impact estimé: <span className="font-medium text-gray-700">{rec.estimatedReduction}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {rec.status === 'pending' && (
                  <>
                    <button className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors">
                      Approuver
                    </button>
                    <button className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors">
                      Rejeter
                    </button>
                  </>
                )}
                
                <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  Détails <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t mt-4 text-xs text-gray-500">
        <span>
          {sortedRecommendations.filter(r => r.status === 'pending').length} recommandations en attente
        </span>
        <button className="text-blue-600 hover:text-blue-800 font-medium">
          Voir toutes les recommandations
        </button>
      </div>
    </div>
  );
}