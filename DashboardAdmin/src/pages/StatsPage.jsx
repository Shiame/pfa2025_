import { subDays } from 'date-fns';
import { useState, useEffect } from 'react';

import PeriodPicker from '../components/PeriodPicker';
import CatSelect from '../components/CatSelect';

import TopList from '../components/TopList';
import ResolutionTable from '../components/ResolutionTable';
import HourlyArea from '../components/HourlyArea';

import { fetchTopCommunes, fetchResolution } from '../api/stats';

/**
 * StatsPage – vue détaillée (Top communes + Résolution + Horaires)
 * ---------------------------------------------------------------
 * Design revamp – all filtres regroupés dans un bandeau en haut et
 * présentation des deux tableaux côte à côte sur grand écran.
 */
export default function StatsPage() {
  /* ───────────────────────── State */
  const [range, setRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [category, setCategory] = useState('ALL');

  const [topCommunes, setTopCommunes] = useState([]);
  const [resolutionRows, setResolutionRows] = useState([]);
  const [loadingTop, setLoadingTop] = useState(false);
  const [loadingRes, setLoadingRes] = useState(false);

  /* ───────────────────────── Data fetching */
  // Top communes
  useEffect(() => {
    const refIso = range.to.toISOString().slice(0, 10);
    setLoadingTop(true);
    fetchTopCommunes(refIso)
      .then(setTopCommunes)
      .catch(console.error)
      .finally(() => setLoadingTop(false));
  }, [range.to]);

  // Résolutions
  useEffect(() => {
    const fromIso = range.from.toISOString();
    const toIso = range.to.toISOString();
    setLoadingRes(true);
    fetchResolution(fromIso, toIso)
      .then(setResolutionRows)
      .catch(console.error)
      .finally(() => setLoadingRes(false));
  }, [range]);

  /* ───────────────────────── Render */
  return (
    <div className="space-y-8">
      {/* Title + filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Statistiques détaillées</h1>

        <div className="flex flex-wrap gap-2 md:gap-4">
          <PeriodPicker range={range} setRange={setRange} />
          <CatSelect value={category} onChange={setCategory} />
        </div>
      </div>

      {/* Tables side‑by‑side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top communes */}
        <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Top communes </h2>
          {loadingTop ? (
            <div className="h-32 flex items-center justify-center text-gray-500">Chargement…</div>
          ) : (
            <TopList communes={topCommunes} />
          )}
        </section>

        {/* Résolution table */}
        <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Taux de résolution</h2>
          {loadingRes ? (
            <div className="h-32 flex items-center justify-center text-gray-500">Chargement…</div>
          ) : (
            <ResolutionTable rows={resolutionRows} />
          )}
        </section>
      </div>

      {/* Hourly distribution – full width */}
      <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Répartition horaire (24 h)</h2>
        <HourlyArea from={range.from} to={range.to} />
      </section>
    </div>
  );
}
