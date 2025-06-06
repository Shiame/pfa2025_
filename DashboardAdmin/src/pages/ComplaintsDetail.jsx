import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Tag, CheckCircle, XCircle, Clock, ChevronLeft, Image, Brain,
  Target, TrendingUp, AlertTriangle, Zap, Loader, RefreshCw, ChevronDown,
  ChevronUp, Activity, BarChart3, Database, Award, Cpu, Eye, Bell
} from 'lucide-react';

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';

import {
  fetchComplaintById, updateComplaintStatus, fetchCitizenByComplaint
} from '../api/ComplaintsApi';
import { fetchSmartRecommendations } from '../api/intelligentApi';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SendMailModal from '../components/SendMailModal';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4'];

export default function ComplaintsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [citizen, setCitizen] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingComplaint, setLoadingComplaint] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [mailModalOpen, setMailModalOpen] = useState(false); // <-- pour le modal

  const [activeAnalysisTab, setActiveAnalysisTab] = useState('overview');
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  useEffect(() => {
    setLoadingComplaint(true);
    fetchComplaintById(id)
      .then((data) => setComplaint(data))
      .catch(() => setError("Erreur lors du chargement de la plainte"))
      .finally(() => setLoadingComplaint(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchCitizenByComplaint(id).then(setCitizen).catch(() => setCitizen(null));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoadingRecommendations(true);
    fetchSmartRecommendations(id)
      .then(setRecommendations)
      .catch(() => setRecommendations([]))
      .finally(() => setLoadingRecommendations(false));
  }, [id]);

  // Helpers
  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority) => {
    if (priority >= 15) return 'text-red-600 bg-red-100';
    if (priority >= 8) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  const getUrgencyBadgeColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderStatusBadge = (status) => {
    const statusConfig = {
      'SOUMISE': { icon: Clock, color: 'bg-gray-100 text-gray-800', label: 'Soumise' },
      'EN_ATTENTE': { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      'EN_COURS': { icon: Clock, color: 'bg-blue-100 text-blue-800', label: 'En cours' },
      'RESOLUE': { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Résolue' },
      'REJETEE': { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Rejetée' }
    };
    const config = statusConfig[status] || statusConfig['SOUMISE'];
    const Icon = config.icon;
    return (
      <span className={`px-2 py-1 rounded-full text-xs flex items-center ${config.color}`}>
        <Icon size={12} className="mr-1" />
        {config.label}
      </span>
    );
  };

  // AI
  const getAIAnalysis = () => {
    if (!complaint) return null;
    if (complaint.aiAnalysis) return complaint.aiAnalysis;
    if (complaint.analyseIA) return complaint.analyseIA;
    return null;
  };
  const aiAnalysis = getAIAnalysis();

  const classificationData = aiAnalysis?.scores
    ? Object.entries(aiAnalysis.scores)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, score], i) => ({
        name: cat,
        value: Math.round(score * 1000) / 10,
        fill: COLORS[i % COLORS.length],
        count: 1
      }))
    : [];

  const maxConfidence = aiAnalysis?.scores
    ? Math.max(...Object.values(aiAnalysis.scores)) * 100
    : 0;

  // =============== EXPORT & NOTIF FUNCTIONS ===============
  function exportAIToCSV() {
    if (!aiAnalysis) {
      alert("Aucune donnée IA à exporter !");
      return;
    }
    const separator = ';';
    const BOM = '\uFEFF';
    const data = [
      ['Catégorie IA', aiAnalysis.categorie],
      ['Score de priorité', aiAnalysis.priorite],
      ['Urgence', aiAnalysis.niveau_urgence],
      ...Object.entries(aiAnalysis.scores || {}).map(
        ([cat, score]) => [`Score ${cat}`, (score * 100).toFixed(1) + '%']
      ),
      ...(recommendations.length ? [['Recommandations IA', recommendations.join(' | ')]] : [])
    ];
    const csvContent = BOM + data.map(row => row.map(val => `"${val}"`).join(separator)).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analyse_IA_plainte_${complaint.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Convert image URL to base64 (async)
  async function getImageAsDataUrl(url) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }
  
  async function exportAIToPDF() {
  if (!aiAnalysis) {
    alert("Aucune donnée IA à exporter !");
    return;
  }
  const doc = new jsPDF();

  // === En-tête ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80);
  doc.text("Rapport IA - Plainte #" + complaint.id, 14, 22);

  // === Détails principaux ===
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  let y = 30;
  doc.setTextColor(90, 90, 90);

  doc.text(`Catégorie prédite : `, 14, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`${aiAnalysis.categorie || ""}`, 70, y);

  doc.setFont('helvetica', 'normal');
  y += 7;
  doc.text(`Score de priorité : `, 14, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`${aiAnalysis.priorite || ""}/20`, 70, y);

  doc.setFont('helvetica', 'normal');
  y += 7;
  doc.text(`Niveau d'urgence : `, 14, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`${aiAnalysis.niveau_urgence || ""}`, 70, y);

  if (citizen) {
    doc.setFont('helvetica', 'normal');
    y += 7;
    doc.text(`Citoyen : `, 14, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`${citizen.nom || ""} ${citizen.prenom || ""}`, 70, y);
  }

  doc.setFont('helvetica', 'normal');
  y += 7;
  doc.text(`Date de la plainte : `, 14, y);
  doc.setFont('helvetica', 'bold');
  doc.text(new Date(complaint.dateSoumission).toLocaleDateString('fr-FR'), 70, y);

  // === Localisation ===
  doc.setFont('helvetica', 'normal');
  y += 7;
  doc.text(`Localisation : `, 14, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`${complaint.localisation || "Non spécifiée"}`, 70, y);

  // === Description ===
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text("Description :", 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  y += 6;
  const descLines = docSplitLines(complaint.description || "", 100);
  doc.text(descLines, 18, y);
  y += 12 + (descLines.length - 1) * 5;

  // === Image plainte (si existe) ===
  if (complaint.imgUrl) {
    try {
      const imgData = await getImageAsDataUrl(complaint.imgUrl);
      if (imgData) {
        doc.setFont('helvetica', 'bold');
        doc.text('Image de la plainte :', 14, y);
        y += 2;
        doc.addImage(imgData, 'JPEG', 14, y, 50, 30);
        y += 45; // Plus d'espace après l'image
      }
    } catch {
      // Ignore image error
    }
  }

  // === Tableau scores ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(33, 33, 33);
  doc.text("Scores de classification IA :", 14, y);

  autoTable(doc, {
    head: [['Catégorie', 'Score (%)']],
    body: Object.entries(aiAnalysis.scores || {}).map(
      ([cat, score]) => [cat, (score * 100).toFixed(1)]
    ),
    startY: y + 3,
    styles: { fontSize: 10, font: 'helvetica' }
  });

  y = doc.lastAutoTable.finalY + 8;

  // === Bloc recommandations IA ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(44, 130, 201);
  doc.text("Recommandations IA :", 14, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(33, 33, 33);
  y += 8;

  // Filtre et affiche SEULEMENT recommandations sans arabe
  const frenchRecommendations = recommendations.filter(
    rec => !/[\u0600-\u06FF]/.test(rec)
  );
  if (frenchRecommendations.length) {
    frenchRecommendations.forEach((rec, idx) => {
      doc.setFont('helvetica', 'italic');
      doc.text(docSplitLines(rec, 90), 18, y + idx * 6);
    });
    y += frenchRecommendations.length * 6;
  } else {
    doc.text('Aucune recommandation disponible.', 18, y);
    y += 8;
  }

  // === Affiche la localisation juste après ===
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(
    `Localisation concernée : ${complaint.localisation || "Non spécifiée"}`,
    18,
    y
  );

  // === Footer ===
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Rapport généré automatiquement. Contact : contact@observatoire.fr",
    14, 287
  );

  doc.save(`rapport_IA_plainte_${complaint.id}.pdf`);
}

// Helper pour split lines
function docSplitLines(str, maxLen = 90) {
  if (!str) return [""];
  const words = str.split(" ");
  const lines = [];
  let line = "";
  for (let w of words) {
    if ((line + " " + w).length > maxLen) {
      lines.push(line);
      line = w;
    } else {
      line = line ? line + " " + w : w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

  

  function handleSendNotification() {
    setMailModalOpen(true);
  }

  if (loadingComplaint) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin mr-2" size={28} />
        <span>Chargement de la plainte...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur de chargement</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-6 text-center text-gray-500">
        <span>Plaine introuvable</span>
      </div>
    );
  }
  // =============== END EXPORT & NOTIF FUNCTIONS ===============

  if (loadingComplaint) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin mr-2" size={28} />
        <span>Chargement de la plainte...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur de chargement</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <RefreshCw size={16} className="mr-2 inline" />
          Réessayer
        </button>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-6 text-center text-gray-500">
        <PieChart size={48} className="mx-auto mb-4 text-gray-400" />
        <p>Plainte introuvable</p>
      </div>
    );
  }

  const analysisTabsData = [
    { id: 'overview', label: "Vue d'ensemble", icon: Eye },
    { id: 'classification', label: 'Classification', icon: Target },
    { id: 'priority', label: 'Calcul Priorité', icon: TrendingUp },
    { id: 'recommendations', label: 'Recommandations IA', icon: Zap },
    { id: 'raw_data', label: 'Données Brutes', icon: Database }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ChevronLeft size={20} className="mr-2" /> Retour à la liste
      </button>

      {/* === BOUTONS AU-DESSUS DU PANNEAU ANALYSE IA === */}
       {aiAnalysis && (
        <div className="flex flex-wrap gap-3 mb-3">
          <button
            onClick={exportAIToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Database size={16}/> Exporter Données IA (CSV)
          </button>
          <button
            onClick={exportAIToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Cpu size={16}/> Exporter Rapport IA (PDF)
          </button>
          <button
            onClick={handleSendNotification}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <Bell size={16}/> Envoyer une notification
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Header */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Plainte #{complaint.id}</h1>
              <div className="flex items-center gap-3">
                {aiAnalysis && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                    <Brain className="text-blue-600" size={18} />
                    <span className="text-sm text-blue-700 font-medium">IA Analysée</span>
                  </div>
                )}
                {renderStatusBadge(complaint.statut)}
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Tag className="mr-2" size={18} />
                Description de la plainte
              </h3>
              <p className="text-gray-700 leading-relaxed">{complaint.description}</p>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center text-blue-600 mb-2">
                  <Tag size={18} className="mr-2" />
                  <span className="text-sm font-medium">Catégorie</span>
                </div>
                <p className="font-semibold text-gray-900">{complaint.categorie?.nom || 'Non classée'}</p>
                {aiAnalysis?.categorie && aiAnalysis.categorie !== complaint.categorie?.nom && (
                  <p className="text-xs text-blue-600 mt-1">IA suggère: {aiAnalysis.categorie}</p>
                )}
              </div>

              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center text-blue-600 mb-2">
                  <MapPin size={18} className="mr-2" />
                  <span className="text-sm font-medium">Localisation</span>
                </div>
                <p className="font-semibold text-gray-900">{complaint.localisation || complaint.zone || 'Non spécifiée'}</p>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center text-blue-600 mb-2">
                  <Calendar size={18} className="mr-2" />
                  <span className="text-sm font-medium">Date</span>
                </div>
                <p className="font-semibold text-gray-900">
                  {new Date(complaint.dateSoumission).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(complaint.dateSoumission).toLocaleTimeString('fr-FR')}
                </p>
              </div>

              {aiAnalysis && (
                <>
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center text-blue-600 mb-2">
                      <TrendingUp size={18} className="mr-2" />
                      <span className="text-sm font-medium">Priorité IA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPriorityColor(aiAnalysis.priorite || 0)}`}>
                        {aiAnalysis.priorite || 0}/20
                      </span>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center text-blue-600 mb-2">
                      <AlertTriangle size={18} className="mr-2" />
                      <span className="text-sm font-medium">Urgence</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyBadgeColor(aiAnalysis.niveau_urgence)}`}>
                      {aiAnalysis.niveau_urgence || 'N/A'}
                    </span>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center text-blue-600 mb-2">
                      <Award size={18} className="mr-2" />
                      <span className="text-sm font-medium">Confiance IA</span>
                    </div>
                    <span className={`font-bold ${getConfidenceColor(maxConfidence)}`}>
                      {maxConfidence.toFixed(1)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ==================== PANEL ANALYSE IA ==================== */}
          {aiAnalysis && (
            <div className="bg-white shadow-lg rounded-xl border border-gray-200">
              <div className="border-b border-gray-200">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Cpu className="text-blue-600" size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Analyse Intelligence Artificielle</h2>
                  </div>
                  <button
                    onClick={() => setShowFullAnalysis(!showFullAnalysis)}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {showFullAnalysis ? (
                      <>
                        <ChevronUp size={18} />
                        Masquer les détails
                      </>
                    ) : (
                      <>
                        <ChevronDown size={18} />
                        Voir les détails
                      </>
                    )}
                  </button>
                </div>

                {/* Tabs */}
                {showFullAnalysis && (
                  <div className="flex overflow-x-auto px-6 bg-gray-50">
                    {analysisTabsData.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveAnalysisTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeAnalysisTab === tab.id
                            ? 'border-blue-500 text-blue-600 bg-white'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <tab.icon size={16} />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Analysis Content */}
              <div className="p-6">
                {!showFullAnalysis ? (
                  // Quick Summary
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{aiAnalysis.categorie}</div>
                      <div className="text-sm text-blue-700">Catégorie prédite</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{maxConfidence.toFixed(1)}%</div>
                      <div className="text-sm text-green-700">Confiance</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{aiAnalysis.priorite}/20</div>
                      <div className="text-sm text-orange-700">Score de priorité</div>
                    </div>
                  </div>
                ) : (
                  // Detailed Tabs
                  <div>
                    {/* Vue d'ensemble */}
                    {activeAnalysisTab === 'overview' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Classification Overview */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-3">Résumé de Classification</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Catégorie identifiée:</span>
                                <span className="font-medium text-blue-600">{aiAnalysis.categorie}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Niveau de confiance:</span>
                                <span className={`font-medium ${getConfidenceColor(maxConfidence)}`}>
                                  {maxConfidence.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Score de priorité:</span>
                                <span className="font-medium">{aiAnalysis.priorite}/20</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Niveau d'urgence:</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyBadgeColor(aiAnalysis.niveau_urgence)}`}>
                                  {aiAnalysis.niveau_urgence}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Top Categories */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-3">Scores par Catégorie</h4>
                            <div className="space-y-2">
                              {Object.entries(aiAnalysis.scores || {})
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 5)
                                .map(([category, score]) => (
                                  <div key={category} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{category}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-blue-500 h-2 rounded-full"
                                          style={{ width: `${score * 100}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-sm font-medium">{(score * 100).toFixed(1)}%</span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab: Classification */}
                    {activeAnalysisTab === 'classification' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-4">Distribution des Scores</h4>
                            {classificationData.length > 0 ? (
                              <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                  <Pie
                                    data={classificationData}
                                    cx="50%"
                                    cy="50%"
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
                            ) : (
                              <div className="h-64 flex items-center justify-center text-gray-500">
                                Aucune donnée de classification disponible
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-4">Légende</h4>
                            <div className="space-y-2">
                              {classificationData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div
                                      className="w-4 h-4 rounded mr-2"
                                      style={{ backgroundColor: item.fill }}
                                    ></div>
                                    <span className="text-sm">{item.name}</span>
                                  </div>
                                  <span className="font-medium">{item.value.toFixed(1)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab: Priority Calculation */}
                    {activeAnalysisTab === 'priority' && aiAnalysis?.details_calcul && (
                      <div className="space-y-6">
                        <h4 className="font-semibold text-gray-800 mb-4">Détail du Calcul de Priorité</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center p-4 bg-blue-50 rounded-lg border">
                            <div className="text-2xl font-bold text-blue-600">{aiAnalysis.details_calcul.base || 0}</div>
                            <div className="text-sm text-blue-700">Base catégorie</div>
                          </div>
                          <div className="text-center p-4 bg-red-50 rounded-lg border">
                            <div className="text-2xl font-bold text-red-600">{aiAnalysis.details_calcul.mots_urgences || 0}</div>
                            <div className="text-sm text-red-700">Mots urgents</div>
                          </div>
                          <div className="text-center p-4 bg-orange-50 rounded-lg border">
                            <div className="text-2xl font-bold text-orange-600">{aiAnalysis.details_calcul.localisation || 0}</div>
                            <div className="text-sm text-orange-700">Lieu sensible</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg border">
                            <div className="text-2xl font-bold text-purple-600">{aiAnalysis.details_calcul.specifique_categorie || 0}</div>
                            <div className="text-sm text-purple-700">Spécifique</div>
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="text-center">
                            <div className="text-sm text-gray-600 mb-2">Score Total Calculé</div>
                            <div className="text-3xl font-bold text-blue-600">
                              {Object.values(aiAnalysis.details_calcul || {}).reduce((a, b) => (a || 0) + (b || 0), 0)} points
                            </div>
                            <div className="text-sm text-gray-600 mt-2">
                              → Niveau d'urgence: <span className="font-semibold text-blue-700">{aiAnalysis.niveau_urgence}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab: Recommendations */}
                    {activeAnalysisTab === 'recommendations' && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4">Recommandations IA</h4>
                        {loadingRecommendations ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader className="animate-spin mr-3" size={20} />
                            <span>Chargement des recommandations...</span>
                          </div>
                        ) : recommendations.length > 0 ? (
                          <div className="space-y-3">
                            {recommendations.map((rec, idx) => (
                              <div key={idx} className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                                <div className="flex items-start">
                                  <Zap className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                                  <span className="text-gray-800">{rec}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Zap size={48} className="mx-auto mb-4 text-gray-400" />
                            <p>Aucune recommandation IA disponible pour cette plainte</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab: Raw Data */}
                    {activeAnalysisTab === 'raw_data' && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4">Données Brutes de l'Analyse NLP</h4>
                        <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-auto">
                          <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                            {JSON.stringify(aiAnalysis.full_response || aiAnalysis, null, 2)}
                          </pre>
                        </div>
                        <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                          <Database className="inline mr-2" size={14} />
                          Cette section affiche la réponse brute du service d'analyse NLP pour debugging et transparence complète.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* ================= FIN PANEL ANALYSE IA ================== */}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {aiAnalysis && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg rounded-xl p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-600 rounded-lg mr-3">
                  <Brain className="text-white" size={20} />
                </div>
                <h2 className="text-lg font-bold text-blue-900">Résumé IA</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Catégorie:</span>
                  <span className="font-bold text-blue-900">{aiAnalysis.categorie}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Priorité:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(aiAnalysis.priorite || 0)}`}>
                    {aiAnalysis.priorite}/20
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Urgence:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyBadgeColor(aiAnalysis.niveau_urgence)}`}>
                    {aiAnalysis.niveau_urgence}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Confiance:</span>
                  <span className={`font-bold ${getConfidenceColor(maxConfidence)}`}>
                    {maxConfidence.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Status Management */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Gestion du Statut</h2>
            <div className="grid grid-cols-1 gap-3">
              {['EN_ATTENTE', 'EN_COURS', 'RESOLUE', 'REJETEE'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setSubmitting(true);
                    updateComplaintStatus(id, status)
                      .then(() => setComplaint(prev => ({ ...prev, statut: status })))
                      .finally(() => setSubmitting(false));
                  }}
                  disabled={complaint.statut === status || submitting}
                  className={`w-full px-4 py-3 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                    complaint.statut === status
                      ? 'bg-blue-100 text-blue-800 cursor-default border border-blue-200'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                  }`}
                >
                  {submitting ? (
                    <Loader className="animate-spin mr-2" size={16} />
                  ) : (
                    <>
                      {status === 'EN_ATTENTE' && <Clock size={16} className="mr-2" />}
                      {status === 'EN_COURS' && <Clock size={16} className="mr-2" />}
                      {status === 'RESOLUE' && <CheckCircle size={16} className="mr-2" />}
                      {status === 'REJETEE' && <XCircle size={16} className="mr-2" />}
                    </>
                  )}
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Citizen Information */}
          {citizen && (
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Informations Citoyen</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium text-gray-900">{citizen.nom} {citizen.prenom}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{citizen.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CIN</p>
                  <p className="font-medium text-gray-900">{citizen.cin}</p>
                </div>
                {citizen.telephone && (
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium text-gray-900">{citizen.telephone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attached Image */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
            <div className="p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Image Jointe</h2>
            </div>
            {complaint.imgUrl ? (
              <img
                src={complaint.imgUrl}
                alt="Image de la plainte"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="h-48 flex items-center justify-center bg-gray-100 text-gray-500">
                <Image size={48} />
                <span className="ml-2">Aucune image disponible</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <SendMailModal
  open={mailModalOpen}
  onClose={() => setMailModalOpen(false)}
  plainteId={complaint.id}
  plainteDetails={{
    dateCreation: complaint.dateSoumission,
    nomPlaignant: citizen ? `${citizen.nom} ${citizen.prenom}` : "",
    cinPlaignant: citizen?.cin, // CIN obligatoire
    emailPlaignant: citizen?.email,
    adressePlaignant: complaint.localisation || "",
    categorie: complaint.categorie?.nom,
    description: complaint.description,
    priorite: complaint.priorite,
    statut: complaint.statut,
    commentaires: complaint.commentaires || ""
  }}
/>


    </div>
  );
}
