import { useState, useEffect } from 'react'
import { 
  AlertCircle, 
  CheckSquare, 
  MapPin, 
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Clock,
  BarChart3,
  PieChart,
  Calendar,
  Brain,
  Target
} from 'lucide-react'

import PeriodPicker   from '../components/PeriodPicker'
import ZoneSelect     from '../components/ZoneSelect'
import CatSelect      from '../components/CatSelect'
import StatCard       from '../components/StatCard'
import FrequencyBar   from '../components/FrequencyBar'
import TrendLine      from '../components/TrendLine'

import {
  fetchDashboard,
  fetchTrend,
  fetchTopCommunes,
  fetchResolution,
  fetchHourly,
  fetchIntelligentSummaries,
  fetchNLPServiceStatus,
  fetchGlobalStats,
  fetchComplaintsStats
} from '../api/stats'

// Helper function to subtract days
const subDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

export default function Dashboard() {
  /* date range */
  const [range, setRange] = useState({
    from: new Date(2020, 0, 1), // Include all historical data
    to:   new Date(),
  })

  /* core data */
  const [freqData,      setFreq]       = useState(null)
  const [trendData,     setTrend]      = useState(null)
  const [topCommunes,   setTopCommunes] = useState([])
  const [resolutionData, setResolution] = useState([])
  const [hourlyData,    setHourlyData] = useState([])
  const [zone,          setZone]       = useState('ALL')
  const [category,      setCategory]   = useState('ALL')
  const [loading,       setLoading]    = useState(true)

  /* AI summary - minimal */
  const [aiSummary,     setAiSummary]  = useState(null)
  const [nlpAvailable,  setNlpAvailable] = useState(false)

  /* Stats globales cohérentes */
  const [globalStats,   setGlobalStats] = useState(null)

  /* enhanced summary stats */
  const [summary, setSummary] = useState({
    totalPlaintes:      0,
    nouveauPlaintes:    0,
    tauxResolution:     0,
    topCommune:         'N/A',
    moyennePriorite:    0,
    plaintesCritiques:  0,
    tauxCroissance:     0,
    zonesPerformantes:  0,
    totalPlaintesResolution: 0,
    totalResolues:      0
  })

  /* Load AI summary (minimal) */
  const loadAISummary = async () => {
    try {
      const [nlpStatus, summaries] = await Promise.allSettled([
        fetchNLPServiceStatus(),
        fetchIntelligentSummaries(24, zone === 'Inconnu' ? null : zone)
      ])

      if (nlpStatus.status === 'fulfilled') {
        setNlpAvailable(nlpStatus.value.available)
      }

      if (summaries.status === 'fulfilled' && summaries.value.length > 0) {
  console.log("Résumé IA affiché :", summaries.value[0]);
  setAiSummary(summaries.value[0]);


      }
    } catch (error) {
      console.warn('AI summary not available:', error)
      setNlpAvailable(false)
    }
  }

  /* main data loading */
  useEffect(() => {
    if (!range.from || !range.to) return

    setLoading(true)
    const refIso  = range.to.toISOString().slice(0, 10)
    const fromIso = range.from.toISOString()
    const toIso   = range.to.toISOString()

    Promise.all([
      fetchDashboard(refIso),
      fetchTrend(fromIso, toIso),
      fetchTopCommunes(refIso),
      fetchGlobalStats(),
      fetchResolution(fromIso, toIso),
      fetchHourly(fromIso, toIso)
    ])
      .then(([dash, trends, topComs, globalStats, resolutionPeriod, hourly]) => {
        setFreq(dash.frequency)
        setTrend(trends)
        setTopCommunes(topComs)
        setHourlyData(hourly)
        setResolution(resolutionPeriod || [])
        setGlobalStats(globalStats)

        if (dash.frequency.counts.length) {
          if (zone === 'Inconnu') {
            setZone('ALL');
          }
        }

        // Calculs basés sur globalStats comme source de vérité
        const dashboardTotal = dash.frequency.counts.reduce((sum, i) => sum + i.count, 0)
        const delta = dashboardTotal - (dash.previousTotal ?? 0)
        const croissance = dash.previousTotal > 0 
          ? ((dashboardTotal - dash.previousTotal) / dash.previousTotal) * 100 
          : 0

        // Zones performantes calculées sur la période
        const zonesPerformantes = resolutionPeriod ? resolutionPeriod.filter(r => 
          (r.tauxResolution || 0) >= 70
        ).length : 0

        setSummary({
          totalPlaintes:      globalStats.totalComplaints,
          nouveauPlaintes:    delta,
          tauxResolution:     globalStats.globalResolutionRate,
          topCommune:         topComs.length > 0 ? topComs[0].commune : 'N/A',
          moyennePriorite:    dash.averagePriority || 0,
          plaintesCritiques:  dash.criticalComplaints || 0,
          tauxCroissance:     croissance,
          zonesPerformantes:  zonesPerformantes,
          totalPlaintesResolution: globalStats.totalComplaints,
          totalResolues:      globalStats.totalResolved
        })

        loadAISummary()
      })
      .catch((error) => {
        console.error('Error loading dashboard data:', error)
      })
      .finally(() => setLoading(false))
  }, [range])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (!freqData || !trendData) {
    return (
      <div className="p-8 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-red-600">Erreur de chargement des données</p>
      </div>
    )
  }

  // apply category filter
  const filteredTrends = category === 'ALL'
    ? trendData.trends
    : trendData.trends.filter(t => t.category === category)

  // Calculate period info
  const daysDiff = Math.ceil((range.to - range.from) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="text-gray-600 mt-1">
            Analyse des plaintes sur {daysDiff} jour{daysDiff > 1 ? 's' : ''}
            {zone !== 'ALL' && zone !== 'Inconnu' && ` • ${zone}`}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <PeriodPicker range={range} setRange={setRange} />
          <CatSelect value={category} onChange={setCategory} />
          {freqData.counts.length > 0 && (
            <ZoneSelect
              counts={freqData.counts}
              zone={zone}
              setZone={setZone}
            />
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Plaintes"
          value={summary.totalPlaintes}
          delta={summary.nouveauPlaintes}
          icon={<AlertCircle className="text-blue-500" />}
          trend={summary.tauxCroissance}
          loading={loading}
        />
        
        <StatCard
          title="Taux de Résolution Global"
          value={`${summary.tauxResolution}%`}
          icon={<CheckSquare className="text-green-500" />}
          subtitle={`${summary.totalResolues} résolues sur ${summary.totalPlaintesResolution}`}
          loading={loading}
        />
        
        <StatCard
          title="Zone Principale"
          value={summary.topCommune !== 'N/A' ? summary.topCommune : 'Aucune zone'}
          subtitle={topCommunes.length > 0 && topCommunes[0] ? 
            `${topCommunes[0].total || topCommunes[0].totalPlaintes || topCommunes[0].count || 0} plainte${(topCommunes[0].total || topCommunes[0].totalPlaintes || topCommunes[0].count || 0) > 1 ? 's' : ''}` : 
            'Aucune donnée disponible'
          }
          icon={<MapPin className="text-purple-500" />}
          loading={loading}
        />
        
        <StatCard
          title="Activité"
          value={!isNaN(summary.tauxCroissance) && summary.tauxCroissance !== 0 ? 
            (summary.tauxCroissance >= 0 ? 'En hausse' : 'En baisse') : 
            'Stable'
          }
          subtitle={!isNaN(summary.tauxCroissance) ? 
            `${Math.abs(summary.tauxCroissance).toFixed(1)}% vs période précédente` : 
            'Données insuffisantes'
          }
          icon={!isNaN(summary.tauxCroissance) ? 
            (summary.tauxCroissance >= 0 ? 
              <TrendingUp className="text-orange-500" /> : 
              <TrendingDown className="text-green-500" />
            ) : 
            <Activity className="text-gray-500" />
          }
          trend={!isNaN(summary.tauxCroissance) ? summary.tauxCroissance : undefined}
          loading={loading}
        />
      </div>

      {/* AI Summary Card (Minimal) */}
     {nlpAvailable && aiSummary && (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center mb-3">
          <Brain className="text-blue-600 mr-2" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Résumé Intelligence Artificielle</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">
          {/* Utilise la propriété exacte de ta réponse JSON */}
          {aiSummary?.natural_language_summary || "Aucun résumé disponible"}
        </p>
        <div className="flex items-center mt-3 space-x-4 text-sm text-blue-700">
          <span className="flex items-center">
            <MapPin size={14} className="mr-1" />
            {aiSummary.zone}
          </span>
          <span className="flex items-center">
            <Activity size={14} className="mr-1" />
            {aiSummary.count} plainte(s)
          </span>
          {aiSummary.anomaly && (
            <span className="flex items-center bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
              <Target size={12} className="mr-1" />
              Anomalie détectée
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
)}


      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frequency Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <FrequencyBar 
            counts={freqData.counts} 
            zone={zone} 
          />
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <TrendLine
            trends={filteredTrends}
            zone={zone}
            category={category}
          />
        </div>
      </div>
    </div>
  )
}