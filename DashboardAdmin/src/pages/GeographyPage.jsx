import { subDays } from 'date-fns'
import { useState } from 'react'

import PeriodPicker from '../components/PeriodPicker'
import CommuneMap   from '../components/CommuneMap'

export default function GeographyPage() {
  const [range, setRange] = useState({
    from: subDays(new Date(), 30),
    to:   new Date(),
  })

  return (
    <div className="p-6 space-y-6">
     
      {/* Header & filter */}
<div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 relative z-10">
  <div>
    <h1 className="text-2xl font-bold text-gray-800">Carte des plaintes</h1>
    <p className="text-sm text-gray-500">
      Visualisez la répartition des plaintes par zone géographique
    </p>
  </div>
  <PeriodPicker range={range} setRange={setRange} />
</div>

{/* Map container */}
<div className="bg-white shadow rounded-xl relative h-[600px] overflow-visible">
  <CommuneMap
    from={range.from}
    to={range.to}
    className="w-full h-full"
  />
</div>

    </div>
  )
}
