import { useState, useEffect } from 'react';
import { fetchResolution } from '../api/stats';
import { BarChart, CheckCircle, Save, Search, Filter, Download } from 'lucide-react';
import PeriodPicker from '../components/PeriodPicker';
import { subDays } from 'date-fns';

export default function ResolutionsPage() {
  const [resolutionData, setResolutionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedCommune, setSelectedCommune] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!range.from || !range.to) return;
    setLoading(true);
    const fromIso = range.from.toISOString();
    const toIso = range.to.toISOString();

    fetchResolution(fromIso, toIso)
      .then(data => {
        setResolutionData(data);
        setError(null);
      })
      .catch(err => {
        console.error('Error fetching resolution data:', err);
        setError('Erreur lors du chargement des données');
      })
      .finally(() => setLoading(false));
  }, [range]);

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

  // Unique lists for filter dropdowns
  const communes = [...new Set(resolutionData.map(item => item.commune))];
  const categories = [...new Set(resolutionData.map(item => item.categorie))];

  // Average resolution rate (used by summary card)
  const avgResolution = filteredData.length
    ? filteredData.reduce((sum, r) => sum + r.tauxResolution, 0) / filteredData.length
    : 0;


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Résolution des Plaintes</h1>
        
        <div className="flex flex-wrap gap-2 md:gap-4">
          <PeriodPicker range={range} setRange={setRange} />
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 w-full md:w-64 border rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md text-sm font-medium">
              <Filter size={16} />
              <span>Filtres</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium">
              <Download size={16} />
              <span>Exporter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 pb-4 border-b">
        <div>
          <label htmlFor="commune-filter" className="block text-sm font-medium text-gray-700 mb-1">Commune</label>
          <select
            id="commune-filter"
            className="border rounded-md p-2 text-sm"
            value={selectedCommune}
            onChange={(e) => setSelectedCommune(e.target.value)}
          >
            <option value="all">Toutes les communes</option>
            {communes.map(commune => (
              <option key={commune} value={commune}>{commune}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select
            id="category-filter"
            className="border rounded-md p-2 text-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Taux de résolution moyen</h3>
              <p className="text-2xl font-bold text-gray-900">
                {loading 
                  ? "..." 
                  : `${Math.round(filteredData.reduce((sum, item) => sum + item.tauxResolution, 0) / filteredData.length)}%`}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-50">
              <BarChart className="text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Total des plaintes</h3>
              <p className="text-2xl font-bold text-gray-900">
                {loading 
                  ? "..." 
                  : filteredData.reduce((sum, item) => sum + item.totalPlaintes, 0)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-yellow-50">
              <Search className="text-yellow-500" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Plaintes résolues</h3>
              <p className="text-2xl font-bold text-gray-900">
                {loading 
                  ? "..." 
                  : filteredData.reduce((sum, item) => sum + item.resoluePlaintes, 0)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-green-50">
              <CheckCircle className="text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Resolution Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : filteredData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucune donnée disponible pour cette période</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commune
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Plaintes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plaintes Résolues
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taux de Résolution
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.commune}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.categorie}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.totalPlaintes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.resoluePlaintes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                          <div 
                            className={`h-2.5 rounded-full ${
                              row.tauxResolution >= 70 ? 'bg-green-600' : 
                              row.tauxResolution >= 40 ? 'bg-yellow-400' : 'bg-red-500'
                            }`} 
                            style={{ width: `${row.tauxResolution}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{row.tauxResolution}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-4">
        <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <Save size={16} />
          <span>Sauvegarder le rapport</span>
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
          <Download size={16} />
          <span>Exporter les données</span>
        </button>
      </div>
    </div>
  );
}