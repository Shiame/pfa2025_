import { subDays, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Calendar, 
  Loader,
  RefreshCw,
  MapIcon,
  AlertTriangle
} from 'lucide-react'

// Import your actual APIs and components
import { fetchCommunes } from '../api/stats'
import CommuneMap from '../components/CommuneMap'

function PeriodPicker({ range, setRange }) {
  const handleFromChange = (e) => {
    const newFrom = new Date(e.target.value)
    setRange(prev => ({ ...prev, from: newFrom }))
  }

  const handleToChange = (e) => {
    const newTo = new Date(e.target.value)
    setRange(prev => ({ ...prev, to: newTo }))
  }

  return (
    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow border">
      <Calendar size={16} className="text-gray-400" />
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={range.from.toISOString().split('T')[0]}
          onChange={handleFromChange}
          className="text-sm border rounded px-2 py-1"
        />
        <span className="text-gray-500">à</span>
        <input
          type="date"
          value={range.to.toISOString().split('T')[0]}
          onChange={handleToChange}
          className="text-sm border rounded px-2 py-1"
        />
      </div>
    </div>
  )
}

function SimpleStats({ communes }) {
  const totalComplaints = communes.reduce((sum, c) => sum + (c.totalPlaintes || 0), 0)
  const totalZones = communes.length
  const avgPerZone = totalZones > 0 ? Math.round(totalComplaints / totalZones) : 0
  
  // Find top zones
  const topZones = communes
    .sort((a, b) => (b.totalPlaintes || 0) - (a.totalPlaintes || 0))
    .slice(0, 5)

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <MapPin className="text-blue-600" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Statistiques Géographiques</h2>
          <p className="text-sm text-gray-500">Répartition des plaintes par zone</p>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalComplaints}</div>
          <div className="text-xs text-blue-600 font-medium">Total Plaintes</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{avgPerZone}</div>
          <div className="text-xs text-purple-600 font-medium">Moyenne/Zone</div>
        </div>
      </div>

      {/* Top zones */}
      {topZones.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Top 5 des Zones</h3>
          <div className="space-y-2">
            {topZones.map((zone, idx) => (
              <div key={zone.commune} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    idx === 0 ? 'bg-yellow-500' : 
                    idx === 1 ? 'bg-gray-400' : 
                    idx === 2 ? 'bg-orange-600' : 'bg-gray-300'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="font-medium text-gray-800">{zone.commune}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">{zone.totalPlaintes || 0}</span>
                  <span className="text-sm text-gray-500">plaintes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick insights */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2">Résumé</h4>
        <div className="text-sm text-gray-600 space-y-1">
          {totalComplaints === 0 ? (
            <p>Aucune plainte signalée pour cette période.</p>
          ) : (
            <>
              <p>• {totalComplaints} plaintes réparties sur {totalZones} zones</p>
              {topZones.length > 0 && (
                <p>• Zone la plus active: {topZones[0].commune} ({topZones[0].totalPlaintes} plaintes)</p>
              )}
              {avgPerZone > 0 && (
                <p>• Moyenne de {avgPerZone} plaintes par zone</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GeographyPage() {
  const [range, setRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  
  const [communes, setCommunes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Load communes data
      const sinceIso = range.from.toISOString()
      const communesData = await fetchCommunes(sinceIso)
      setCommunes(communesData || [])
    } catch (err) {
      console.error('Error loading geography data:', err)
      setError('Erreur lors du chargement des données géographiques')
      setCommunes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [range.from, range.to])

  const handleZoneClick = (commune) => {
    console.log('Zone cliquée:', commune)
    // Vous pouvez ajouter une modal ou navigation vers détail de zone
  }

  const handleRefresh = () => {
    loadData()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <MapIcon className="text-blue-600" size={32} />
            Carte des Plaintes
          </h1>
          <p className="text-gray-600 mt-1">
            Visualisation géographique des signalements par zone
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodPicker range={range} setRange={setRange} />
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="text-red-500" size={20} />
          <div>
            <p className="text-red-800 font-medium">Erreur de chargement</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader className="animate-spin" size={24} />
            <span>Chargement des données géographiques...</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map */}
          <div className="xl:col-span-2">
            <CommuneMap
              from={range.from}
              to={range.to}
              onZoneClick={handleZoneClick}
              showTitle={true}
              className="h-[600px]"
            />
          </div>

          {/* Stats Sidebar */}
          <div className="xl:col-span-1">
            <SimpleStats communes={communes} />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && communes.length === 0 && (
        <div className="text-center py-12">
          <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Aucune donnée disponible</h3>
          <p className="text-gray-600">
            Aucune plainte trouvée pour la période sélectionnée
          </p>
        </div>
      )}
    </div>
  )
}