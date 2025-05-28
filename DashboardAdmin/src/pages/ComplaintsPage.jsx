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
  Download
} from "lucide-react";
import { fetchComplaints } from "../api/ComplaintsApi";

const DEFAULT_FILTERS = {
  status: "all",
  category: "all",
  commune: "all",
  sortBy: "dateSoumission",
  sortOrder: "desc"
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

  const renderBadge = (status) => {
    const base = "px-2 py-1 rounded-full text-xs flex items-center";
    switch (status) {
      case "EN_ATTENTE": return <span className={`${base} bg-yellow-100 text-yellow-800`}><Clock size={12} className="mr-1"/>En attente</span>;
      case "EN_COURS":   return <span className={`${base} bg-blue-100 text-blue-800`}><Clock size={12} className="mr-1"/>En cours</span>;
      case "RESOLUE":    return <span className={`${base} bg-green-100 text-green-800`}><CheckCircle size={12} className="mr-1"/>Résolue</span>;
      case "REJETEE":    return <span className={`${base} bg-red-100 text-red-800`}><XCircle size={12} className="mr-1"/>Rejetée</span>;
      default:            return <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Gestion des Plaintes</h1>
        <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 w-full md:w-64 border rounded-md"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPagination(prev => ({ ...prev, page: 0 })); }}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
          </div>
          <button onClick={handleClearFilters} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md">
            <Filter size={16}/>Tout effacer
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md">
            <Download size={16}/>Exporter
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Statut</label>
          <select className="border rounded-md p-2" value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}>
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>{opt === 'all' ? 'Tous' : opt.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Catégorie</label>
          <select className="border rounded-md p-2" value={filters.category} onChange={e => handleFilterChange('category', e.target.value)}>
            {categoryOptions.map(opt => (
              <option key={opt} value={opt}>{opt === 'all' ? 'Toutes' : opt}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Commune</label>
          <select className="border rounded-md p-2" value={filters.commune} onChange={e => handleFilterChange('commune', e.target.value)}>
            {communeOptions.map(opt => (
              <option key={opt} value={opt}>{opt === 'all' ? 'Toutes' : opt}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Trier par</label>
          <select className="border rounded-md p-2" value={filters.sortBy} onChange={e => handleFilterChange('sortBy', e.target.value)}>
            <option value="dateSoumission">Date</option>
            <option value="categorie.nom">Categorie</option>
            <option value="statut">Statut</option>
            <option value="zone">Commune</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Ordre</label>
          <select className="border rounded-md p-2" value={filters.sortOrder} onChange={e => handleFilterChange('sortOrder', e.target.value)}>
            <option value="asc">Ascendant</option>
            <option value="desc">Descendant</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">Chargement…</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : complaints.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Aucune plainte</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commune</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soumise le</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {complaints.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{c.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{c.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.categorie.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.zone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{renderBadge(c.statut)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(c.dateSoumission).toLocaleString("fr-FR", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="p-1 text-blue-600 hover:text-blue-900" onClick={() => navigate(`/complaints/${c.id}`)} title="Voir détails"><Eye size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <button onClick={() => handlePageChange(Math.max(0, pagination.page - 1))} disabled={pagination.page === 0} className="px-4 py-2 border rounded-md text-sm">Précédent</button>
                <span className="text-sm text-gray-700">Page {pagination.page + 1} sur {pagination.totalPages}</span>
                <button onClick={() => handlePageChange(Math.min(pagination.totalPages - 1, pagination.page + 1))} disabled={pagination.page === pagination.totalPages - 1} className="px-4 py-2 border rounded-md text-sm">Suivant</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
