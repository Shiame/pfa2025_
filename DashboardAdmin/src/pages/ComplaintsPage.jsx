import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  SortAsc,
  SortDesc,
  Zap
} from "lucide-react";
import { fetchComplaints } from "../api/ComplaintsApi";

const DEFAULT_FILTERS = {
  status: "all",
  category: "all",
  commune: "all",
  priority: "all",
  sortBy: "dateSoumission",
  sortOrder: "desc"
};

const PRIORITY_RANGES = {
  all: "Toutes",
  critical: "Critique (18-20)",
  high: "Élevée (15-17)",
  medium: "Moyenne (8-14)",
  low: "Faible (0-7)"
};

export default function ComplaintsPage() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });

  const loadComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        sort: `${filters.sortBy},${filters.sortOrder}`
      };
      if (filters.status !== "all")   params.status   = filters.status;
      if (filters.category !== "all") params.category = filters.category;
      if (filters.commune !== "all")  params.commune  = filters.commune;
      if (searchQuery.trim())          params.query    = searchQuery.trim();

      const data = await fetchComplaints(params);
      const { content, totalPages, totalElements } = data;
      const maxPage = totalPages > 0 ? totalPages - 1 : 0;
      if (pagination.page > maxPage) {
        setPagination(prev => ({ ...prev, page: maxPage, totalPages, totalElements }));
      } else {
        setComplaints(content);
        setPagination(prev => ({ ...prev, totalPages, totalElements }));
      }
    } catch (err) {
      console.error(err);
      setError("Erreur de chargement des plaintes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadComplaints(); }, [pagination.page, filters, searchQuery]);

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery("");
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Enhanced filtering logic with AI priority (inchangée)
  const filteredComplaints = useMemo(() => {
    if (filters.priority === "all") return complaints;

    return complaints.filter(complaint => {
      const aiPriority = getAIPriority(complaint);
      if (aiPriority === null) return filters.priority === "low"; // No AI analysis = low priority

      switch (filters.priority) {
        case "critical": return aiPriority >= 18;
        case "high": return aiPriority >= 15 && aiPriority < 18;
        case "medium": return aiPriority >= 8 && aiPriority < 15;
        case "low": return aiPriority < 8;
        default: return true;
      }
    });
  }, [complaints, filters.priority]);

  const statusOptions = useMemo(
    () => ["all", ...[...new Set(complaints.map(c => c.statut).filter(Boolean))]],
    [complaints]
  );
  const categoryOptions = useMemo(
    () => ["all", ...[...new Set(complaints.map(c => c.categorie?.nom).filter(Boolean))]],
    [complaints]
  );
  const communeOptions = useMemo(
    () => ["all", ...[...new Set(complaints.map(c => c.zone).filter(Boolean))]],
    [complaints]
  );

  // Helper functions pour IA (gardées au cas où on conserve l'affichage de priorité IA)
  const getAIPriority = (complaint) => {
    if (complaint.analyseIA?.priorite) return complaint.analyseIA.priorite;
    if (complaint.analyseIA?.fullResponse?.priorite) return complaint.analyseIA.fullResponse.priorite;
    return null;
  };

  const getAIUrgency = (complaint) => {
    if (complaint.analyseIA?.niveauUrgence) return complaint.analyseIA.niveauUrgence;
    if (complaint.analyseIA?.fullResponse?.niveau_urgence) return complaint.analyseIA.fullResponse.niveau_urgence;
    return null;
  };

  const hasAIAnalysis = (complaint) => {
    return complaint.analyseIA !== null && complaint.analyseIA !== undefined;
  };

   function exportToCSV(data, filename = 'export.csv') {
  if (!Array.isArray(data) || !data.length) {
    alert("Aucune donnée à exporter !");
    return;
  }
  // Utilise le point-virgule comme séparateur pour Excel FR
  const separator = ';';
  // Ajoute BOM UTF-8 pour les accents/arabe
  const BOM = '\uFEFF';

  const headers = Object.keys(data[0]).join(separator);
  const rows = data.map(row =>
    Object.values(row)
      .map(val => `"${String(val ?? '').replace(/"/g, '""')}"`)
      .join(separator)
  );
  const csvContent = BOM + [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a); // Pour compatibilité IE/Edge
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


  // Rendu du badge de statut (inchangé)
  const renderStatusBadge = (status) => {
    const base = "px-2 py-1 rounded-full text-xs flex items-center font-medium";
    switch (status) {
      case "EN_ATTENTE": return <span className={`${base} bg-yellow-100 text-yellow-800`}><Clock size={12} className="mr-1"/>En attente</span>;
      case "EN_COURS":   return <span className={`${base} bg-blue-100 text-blue-800`}><Clock size={12} className="mr-1"/>En cours</span>;
      case "RESOLUE":    return <span className={`${base} bg-green-100 text-green-800`}><CheckCircle size={12} className="mr-1"/>Résolue</span>;
      case "REJETEE":    return <span className={`${base} bg-red-100 text-red-800`}><XCircle size={12} className="mr-1"/>Rejetée</span>;
      default:           return <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  // Rendu de la priorité IA (optionnel, conservé si besoin)
  const renderAIPriority = (complaint) => {
    const priority = getAIPriority(complaint);
    const urgency = getAIUrgency(complaint);

    if (priority === null) {
      return (
        <div className="flex items-center justify-center">
          <span className="text-xs text-gray-400">Non analysée</span>
        </div>
      );
    }

    const getPriorityColor = (priority) => {
      if (priority >= 18) return "bg-red-100 text-red-800 border-red-200";
      if (priority >= 15) return "bg-orange-100 text-orange-800 border-orange-200";
      if (priority >= 8) return "bg-yellow-100 text-yellow-800 border-yellow-200";
      return "bg-green-100 text-green-800 border-green-200";
    };

    const getUrgencyIcon = (urgency) => {
      switch(urgency) {
        case "critical": return <AlertTriangle size={12} className="text-red-600" />;
        case "high": return <TrendingUp size={12} className="text-orange-600" />;
        case "medium": return <Clock size={12} className="text-yellow-600" />;
        default: return <CheckCircle size={12} className="text-green-600" />;
      }
    };

    return (
      <div className="flex flex-col items-center space-y-1">
        <div className={`px-2 py-1 rounded-full border text-xs font-bold ${getPriorityColor(priority)}`}>
          {priority}/20
        </div>
        <div className="flex items-center space-x-1">
          {getUrgencyIcon(urgency)}
          <span className="text-xs text-gray-600 capitalize">{urgency}</span>
        </div>
      </div>
    );
  };

  const handleExport = () => {
  if (!complaints.length) return alert("Aucune donnée à exporter !");
  // Sélectionnez les colonnes à exporter
  const exportData = complaints.map(c => ({
    ID: c.id,
    Description: c.description,
    Catégorie: c.category || c.categorie?.nom,
    Commune: c.commune || c.zone,
    Statut: c.status || c.statut,
    Date: c.dateCreation || c.dateSoumission,
  }));
  exportToCSV(exportData, 'plaintes_export.csv');
};

  // ICÔNE de tri
  const getSortIcon = (column) => {
    if (filters.sortBy !== column) return null;
    return filters.sortOrder === 'asc' ?
      <SortAsc size={14} className="ml-1 inline" /> :
      <SortDesc size={14} className="ml-1 inline" />;
  };

  const handleSort = (column) => {
    if (filters.sortBy === column) {
      handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      handleFilterChange('sortBy', column);
      handleFilterChange('sortOrder', 'desc');
    }
  };

  // Stats IA (inchangées)
  const aiAnalyzedCount = complaints.filter(hasAIAnalysis).length;
  const highPriorityCount = complaints.filter(c => (getAIPriority(c) || 0) >= 15).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Plaintes</h1>
          <div className="flex items-center space-x-4 mt-2">
            <div className="text-sm text-gray-600">
              Total: <span className="font-semibold">{pagination.totalElements}</span>
            </div>
            <div className="flex items-center text-sm text-blue-600">
              <TrendingUp size={16} className="mr-1" />
              IA Analysées: <span className="font-semibold ml-1">{aiAnalyzedCount}</span>
            </div>
            <div className="flex items-center text-sm text-red-600">
              <AlertTriangle size={16} className="mr-1" />
              Priorité élevée: <span className="font-semibold ml-1">{highPriorityCount}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:gap-4 w-full lg:w-auto">
          <div className="relative flex-grow lg:flex-grow-0">
            <input
              type="text"
              placeholder="Rechercher dans les plaintes..."
              className="pl-10 pr-4 py-2 w-full lg:w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPagination(prev => ({ ...prev, page: 0 })); }}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
          </div>
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter size={16}/>
            Réinitialiser
          </button>
          <button
            onClick={loadComplaints}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16}/>
            Actualiser
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16}/>
            Exporter
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
            >
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'all' ? 'Tous les statuts' : opt.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              value={filters.category}
              onChange={e => handleFilterChange('category', e.target.value)}
            >
              {categoryOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'all' ? 'Toutes les catégories' : opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Commune</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              value={filters.commune}
              onChange={e => handleFilterChange('commune', e.target.value)}
            >
              {communeOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'all' ? 'Toutes les communes' : opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priorité IA</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              value={filters.priority}
              onChange={e => handleFilterChange('priority', e.target.value)}
            >
              {Object.entries(PRIORITY_RANGES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              value={filters.sortBy}
              onChange={e => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="dateSoumission">Date de soumission</option>
              <option value="categorie.nom">Catégorie</option>
              <option value="statut">Statut</option>
              <option value="zone">Commune</option>
              <option value="priorite">Priorité IA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des plaintes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
            <p className="text-gray-600">Chargement des plaintes...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={loadComplaints}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-8 text-center">
            <Search size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Aucune plainte trouvée avec ces filtres</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('id')}
                    >
                      # {getSortIcon('id')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('categorie.nom')}
                    >
                      <span>Catégorie {getSortIcon('categorie.nom')}</span>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('zone')}
                    >
                      <span>Commune {getSortIcon('zone')}</span>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('statut')}
                    >
                      <span>Statut {getSortIcon('statut')}</span>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-center">
                        <Zap size={14} className="mr-1" />
                        Priorité IA
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('dateSoumission')}
                    >
                      <span>Date {getSortIcon('dateSoumission')}</span>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredComplaints.map(complaint => (
                    <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">#{complaint.id}</span>
                          {hasAIAnalysis(complaint) && (
                            <Zap size={12} className="ml-2 text-blue-500" title="Analysée par IA" />
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 truncate max-w-xs" title={complaint.description}>
                          {complaint.description}
                        </div>
                      </td>

                      {/* Affichage uniquement de la catégorie issue de votre table Plainte */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {complaint.categorie?.nom || 'Non classée'}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {complaint.zone || 'Non spécifiée'}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(complaint.statut)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {renderAIPriority(complaint)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex flex-col">
                          <span>{new Date(complaint.dateSoumission).toLocaleDateString("fr-FR")}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(complaint.dateSoumission).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="inline-flex items-center p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => navigate(`/complaints/${complaint.id}`)}
                          title="Voir les détails"
                        >
                          <Eye size={18}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
                <div className="flex items-center text-sm text-gray-700">
                  <span>
                    Affichage de {pagination.page * pagination.size + 1} à{' '}
                    {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} sur{' '}
                    {pagination.totalElements} plaintes
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(Math.max(0, pagination.page - 1))}
                    disabled={pagination.page === 0}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-gray-700 px-4">
                    Page {pagination.page + 1} sur {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(Math.min(pagination.totalPages - 1, pagination.page + 1))}
                    disabled={pagination.page === pagination.totalPages - 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Note : Les fonctions getAICategory et renderAIIndicator ont été supprimées, 
// et la colonne « Catégorie » n’affiche plus que le champ issu de la table Plainte.
