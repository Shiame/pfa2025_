import { useMemo } from 'react';

export default function ZoneSelect({ counts, zone, setZone }) {
  const zones = useMemo(() => {
    // Extract unique zones from counts
    const uniqueZones = [...new Set(counts.map(c => c.zone))].filter(z => z);
    
    // Sort zones alphabetically
    uniqueZones.sort();
    
    // Add "ALL" option at the beginning
    return ['ALL', ...uniqueZones];
  }, [counts]);

  return (
    <select
      className="border rounded-md p-1"
      value={zone}
      onChange={e => setZone(e.target.value)}
    >
      {zones.map(z => (
        <option key={z} value={z}>
          {z === 'ALL' ? 'Toutes les zones' : z}
        </option>
      ))}
    </select>
  );
}