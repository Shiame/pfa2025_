import { useState, useEffect } from 'react'
import { subDays } from 'date-fns'
import { AlertCircle, CheckSquare, MapPin } from 'lucide-react'

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
} from '../api/stats'

export default function Dashboard() {
  /* date range */
  const [range, setRange] = useState({
    from: subDays(new Date(), 7),
    to:   new Date(),
  })

  /* data */
  const [freqData,      setFreq]       = useState(null)
  const [trendData,     setTrend]      = useState(null)
  const [topCommunes,   setTopCommunes] = useState([])
  const [resolutionData, setResolution] = useState([])
  const [zone,          setZone]       = useState('Inconnu')
  const [category,      setCategory]   = useState('ALL')
  const [summary,       setSummary]    = useState({
    totalPlaintes:   0,
    nouveauPlaintes: 0,
    tauxResolution:  0,
    topCommune:      'N/A',
  })
  const [loading,      setLoading]     = useState(true)

  /* reload on date-range change */
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
      fetchResolution(fromIso, toIso),
    ])
      .then(([dash, trends, topComs, resRaw]) => {
        setFreq(dash.frequency)
        setTrend(trends)
        setTopCommunes(topComs)

        if (dash.frequency.counts.length)
          setZone(dash.frequency.counts[0].zone ?? 'Inconnu')

        // resolution → percent
        const resPct = resRaw.map(r => ({
          ...r,
          tauxResolution: (r.tauxResolution ?? 0) * 100,
        }))
        setResolution(resPct)

        // summary
        const totalCount = dash.frequency.counts
          .reduce((sum, i) => sum + i.count, 0)
        const delta = totalCount - (dash.previousTotal ?? 0)
        const avgRes = resPct.length
          ? resPct.reduce((sum, r) => sum + r.tauxResolution, 0) / resPct.length
          : 0

        setSummary({
          totalPlaintes:   totalCount,
          nouveauPlaintes: delta,
          tauxResolution:  avgRes,
          topCommune:      topComs.length ? topComs[0].commune : 'N/A',
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [range])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (!freqData || !trendData) {
    return <div className="p-4">Erreur de chargement</div>
  }

  // apply category filter
  const filteredTrends = category === 'ALL'
    ? trendData.trends
    : trendData.trends.filter(t => t.category === category)

  return (
    <div className="space-y-6">
      {/* Title & filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
        <div className="flex flex-wrap gap-2 md:gap-4">
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

      {/* KPI cards */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1">
          <StatCard
            title="Total des plaintes"
            value={summary.totalPlaintes}
            delta={summary.nouveauPlaintes}
            icon={<AlertCircle className="text-red-500" />}
          />
        </div>
        <div className="flex-1">
          <StatCard
            title="Taux de résolution"
            value={`${summary.tauxResolution.toFixed(1)}%`}
            icon={<CheckSquare className="text-green-500" />}
          />
        </div>
        <div className="flex-1">
          <StatCard
            title="Top commune"
            value={summary.topCommune}
            icon={<MapPin className="text-blue-500" />}
          />
        </div>
      </div>

      {/* Charts */}
<div className="flex flex-wrap gap-6">
  <div className="flex-1 min-h-[400px]">
    <FrequencyBar 
      counts={freqData.counts} 
      zone={zone} 
    />
  </div>

  <div className="flex-1 min-h-[400px]">
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
