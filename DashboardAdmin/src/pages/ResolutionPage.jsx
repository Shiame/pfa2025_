import { useState, useEffect } from 'react';
import { fetchResolution } from '../api/stats';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  BarChart, CheckCircle, Save, Search, Filter, Download, 
  AlertTriangle, TrendingUp, Target, Clock, MapPin,
  RefreshCw, Loader, Info, Award
} from 'lucide-react';
import PeriodPicker from '../components/PeriodPicker';

// Helper function to subtract days
const subDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};
function formatDateFR(date) {
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function ResolutionsPage() {
  const [resolutionData, setResolutionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState({
    from: new Date(2020, 0, 1), // Include all historical data
    to: new Date(),
  });
  const [selectedCommune, setSelectedCommune] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('tauxResolution');
  const [sortDirection, setSortDirection] = useState('desc');

  // Fonction de chargement des données
  const loadResolutionData = async (showRefreshLoader = false) => {
    if (!range.from || !range.to) return;
    
    if (showRefreshLoader) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const fromIso = range.from.toISOString();
      const toIso = range.to.toISOString();
      
      const data = await fetchResolution(fromIso, toIso);
      setResolutionData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching resolution data:', err);
      setError('Erreur lors du chargement des données de résolution');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadResolutionData();
  }, [range]);




const handleSaveWellnessReport = () => {
  if (!sortedData.length) {
    alert("Aucune donnée à inclure dans le rapport !");
    return;
  }

  // Stat global et par catégorie
  const totalPlaintes = sortedData.reduce((sum, r) => sum + (r.totalPlaintes || 0), 0);
  const totalResolues = sortedData.reduce((sum, r) => sum + (r.resoluePlaintes || 0), 0);
  const tauxGlobal = totalPlaintes ? (totalResolues / totalPlaintes) * 100 : 0;

  // Par catégorie
  const statsParCategorie = {};
  sortedData.forEach(r => {
    if (!statsParCategorie[r.categorie]) statsParCategorie[r.categorie] = { total: 0, resolues: 0 };
    statsParCategorie[r.categorie].total += r.totalPlaintes || 0;
    statsParCategorie[r.categorie].resolues += r.resoluePlaintes || 0;
  });

  // Préparer le PDF
  const doc = new jsPDF();

  // Logo ou titre principal
  // doc.addImage(...); // Si tu veux un logo

  doc.setFontSize(20);
  doc.text("Rapport de la Résolution des Plaintes", 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Date du rapport : ${formatDateFR(new Date())}`, 14, 30);

  doc.setFontSize(13);
  doc.setTextColor(50);
  doc.text(
    "Ce rapport présente une synthèse du traitement des plaintes dans la commune pour la période sélectionnée. Il vise à évaluer le bien-être collectif à travers la capacité de résolution des problématiques signalées par les citoyens.",
    14, 40, { maxWidth: 180 }
  );

  doc.setFontSize(14);
  doc.setTextColor(60, 140, 70);
  doc.text(`\nTaux global de résolution : ${tauxGlobal.toFixed(1)}%`, 14, 60);

  doc.setFontSize(12);
  doc.setTextColor(80);
  doc.text(
    `Nombre total de plaintes enregistrées : ${totalPlaintes}
Nombre total de plaintes résolues : ${totalResolues}
Période analysée : ${formatDateFR(range?.from)} au ${formatDateFR(range?.to)}`,
    14, 70
  );

  // Statistiques par catégorie (sous forme de paragraphe)
  let yPos = 100;
  doc.setFontSize(13);
  doc.setTextColor(44, 62, 80);
  doc.text("Taux de résolution par catégorie :", 14, yPos);

  Object.entries(statsParCategorie).forEach(([cat, obj], idx) => {
    yPos += 8;
    const taux = obj.total ? (obj.resolues / obj.total) * 100 : 0;
    doc.text(`- ${cat} : ${taux.toFixed(1)}% (${obj.resolues} / ${obj.total})`, 20, yPos);
  });

  yPos += 12;
  doc.setFontSize(13);
  doc.setTextColor(100, 100, 160);
  doc.text(
    "La capacité de résolution rapide des problèmes contribue fortement au sentiment de bien-être collectif ressenti par la population. Un taux de résolution élevé témoigne d’une administration réactive.",
    14, yPos, { maxWidth: 180 }
  );

  yPos += 20;

  // Tableau détaillé (commune/catégorie/total/résolu/taux)
  autoTable(doc, {
    head: [['Commune', 'Catégorie', 'Plaintes', 'Résolues', 'Taux (%)']],
    body: sortedData.map(r => [
      r.commune,
      r.categorie,
      r.totalPlaintes,
      r.resoluePlaintes,
      (r.tauxResolution?.toFixed(1) || '0.0')
    ]),
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 10 }
  });


  // (Optionnel) Signature / footer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(
    "Rapport généré automatiquement. Pour tout complément : contact@observatoire.com",
    14, doc.internal.pageSize.getHeight() - 10
  );

  doc.save('rapport.pdf');
};


  // Filter data based on selected filters and search
  const filteredData = resolutionData.filter(row => {
    if (selectedCommune !== 'all' && row.commune !== selectedCommune) return false;
    if (selectedCategory !== 'all' && row.categorie !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        row.commune.toLowerCase().includes(query) ||
        row.categorie.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Sort filtered data
  const sortedData = [...filteredData].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Unique lists for filter dropdowns
  const communes = [...new Set(resolutionData.map(item => item.commune))].sort();
  const categories = [...new Set(resolutionData.map(item => item.categorie))].sort();

  // Calculate summary statistics
  const summaryStats = {
    avgResolution: filteredData.length > 0 
      ? Math.round((filteredData.reduce((sum, r) => sum + (r.tauxResolution || 0), 0) / filteredData.length) * 10) / 10
      : 0,
    totalComplaints: filteredData.reduce((sum, item) => sum + (item.totalPlaintes || 0), 0),
    resolvedComplaints: filteredData.reduce((sum, item) => sum + (item.resoluePlaintes || 0), 0),
    bestPerformer: filteredData.length > 0 
      ? filteredData.reduce((best, current) => 
          (current.tauxResolution || 0) > (best.tauxResolution || 0) ? current : best
        )
      : null,
    worstPerformer: filteredData.length > 0 
      ? filteredData.reduce((worst, current) => 
          (current.tauxResolution || 0) < (worst.tauxResolution || 0) ? current : worst
        )
      : null
  };

  // Helper functions
  const getPerformanceColor = (taux) => {
    if (taux >= 80) return 'text-green-600 bg-green-50';
    if (taux >= 60) return 'text-blue-600 bg-blue-50';
    if (taux >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getProgressBarColor = (taux) => {
    if (taux >= 80) return 'bg-green-500';
    if (taux >= 60) return 'bg-blue-500';
    if (taux >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const exportData = () => {
  if (!sortedData.length) {
    alert("Aucune donnée à exporter !");
    return;
  }
  const separator = ';';
  const BOM = '\uFEFF';
  const headers = ['Commune', 'Catégorie', 'Total Plaintes', 'Plaintes Résolues', 'Taux de Résolution (%)'];
  const rows = sortedData.map(row => [
    row.commune,
    row.categorie,
    row.totalPlaintes,
    row.resoluePlaintes,
    row.tauxResolution?.toFixed(1) || '0.0'
  ].map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(separator));
  const csvContent = BOM + [headers.join(separator), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `resolution_export.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin mr-3" size={32} />
        <span className="text-lg">Chargement des données de résolution...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Taux de Résolution des Plaintes</h1>
          <p className="text-gray-600">Analyse de la performance de résolution par commune et catégorie</p>
        </div>
        
        <div className="flex flex-wrap gap-2 md:gap-4">
          <PeriodPicker range={range} setRange={setRange} />
          <button
            onClick={() => loadResolutionData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50"
          >
            <RefreshCw className={refreshing ? "animate-spin" : ""} size={16} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle size={20} className="text-red-500 mr-3" />
            <div>
              <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Taux moyen</h3>
              <p className="text-2xl font-bold text-gray-900">
                {summaryStats.avgResolution.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Sur {filteredData.length} zone{filteredData.length > 1 ? 's' : ''}-catégorie{filteredData.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-50">
              <Target className="text-blue-500" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Total plaintes</h3>
              <p className="text-2xl font-bold text-gray-900">
                {summaryStats.totalComplaints.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {summaryStats.resolvedComplaints.toLocaleString()} résolues
              </p>
            </div>
            <div className="p-2 rounded-lg bg-yellow-50">
              <BarChart className="text-yellow-500" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Meilleure performance</h3>
              {summaryStats.bestPerformer ? (
                <>
                  <p className="text-2xl font-bold text-green-600">
                    {summaryStats.bestPerformer.tauxResolution?.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {summaryStats.bestPerformer.commune} - {summaryStats.bestPerformer.categorie}
                  </p>
                </>
              ) : (
                <p className="text-lg text-gray-400">Aucune donnée</p>
              )}
            </div>
            <div className="p-2 rounded-lg bg-green-50">
              <Award className="text-green-500" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">À améliorer</h3>
              {summaryStats.worstPerformer ? (
                <>
                  <p className="text-2xl font-bold text-red-600">
                    {summaryStats.worstPerformer.tauxResolution?.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {summaryStats.worstPerformer.commune} - {summaryStats.worstPerformer.categorie}
                  </p>
                </>
              ) : (
                <p className="text-lg text-gray-400">Aucune donnée</p>
              )}
            </div>
            <div className="p-2 rounded-lg bg-red-50">
              <TrendingUp className="text-red-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par commune ou catégorie..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <select
              className="border border-gray-300 rounded-md p-2 text-sm min-w-[150px]"
              value={selectedCommune}
              onChange={(e) => setSelectedCommune(e.target.value)}
            >
              <option value="all">Toutes les communes</option>
              {communes.map(commune => (
                <option key={commune} value={commune}>{commune}</option>
              ))}
            </select>
            
            <select
              className="border border-gray-300 rounded-md p-2 text-sm min-w-[150px]"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              <Download size={16} />
              <span>Exporter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resolution Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {sortedData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Info size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Aucune donnée disponible</h3>
            <p>Aucune donnée de résolution trouvée pour cette période et ces filtres.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    onClick={() => handleSort('commune')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      Commune
                      {sortField === 'commune' && (
                        <span className="text-blue-500">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('categorie')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Catégorie
                      {sortField === 'categorie' && (
                        <span className="text-blue-500">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('totalPlaintes')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Total Plaintes
                      {sortField === 'totalPlaintes' && (
                        <span className="text-blue-500">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('resoluePlaintes')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} />
                      Résolues
                      {sortField === 'resoluePlaintes' && (
                        <span className="text-blue-500">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('tauxResolution')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <Target size={14} />
                      Taux de Résolution
                      {sortField === 'tauxResolution' && (
                        <span className="text-blue-500">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.map((row, index) => (
                  <tr key={`${row.commune}-${row.categorie}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.commune}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        {row.categorie}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="font-medium">{row.totalPlaintes}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="font-medium text-green-600">{row.resoluePlaintes}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[120px]">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(row.tauxResolution || 0)}`}
                              style={{ width: `${Math.min(row.tauxResolution || 0, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${getPerformanceColor(row.tauxResolution || 0)}`}>
                          {(row.tauxResolution || 0).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {sortedData.length} résultat{sortedData.length > 1 ? 's' : ''} affiché{sortedData.length > 1 ? 's' : ''} 
          {filteredData.length !== resolutionData.length && (
            <span> (filtré{sortedData.length > 1 ? 's' : ''} à partir de {resolutionData.length} total)</span>
          )}
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={handleSaveWellnessReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save size={16}/>
            Sauvegarder le rapport
          </button>

        </div>
      </div>
    </div>
  );
}