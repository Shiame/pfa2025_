import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { fetchCommunes } from '../api/stats';   // ⬅︎ utilise l’instance api

export default function CommuneMap() {
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    fetchCommunes(since).then(setNodes).catch(console.error);
  }, []);

  const center = [33.9716, -6.8498]; // Rabat

  return (
    <div className="bg-white shadow rounded-xl p-4 col-span-full">
      <h2 className="font-semibold mb-2">Carte des plaintes </h2>

      <MapContainer center={center} zoom={12} style={{ height: 400, width: '100%' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {nodes?.map(n => (
          <CircleMarker
            key={n.commune + n.lat + n.lon}
            center={[n.lat, n.lon]}
            radius={Math.min(40, 5 + n.totalPlaintes)}
            pathOptions={{ color: '#e11d48', fillColor: '#e11d48', fillOpacity: 0.6, weight: 1 }}
          >
            <Tooltip direction="top" offset={[0, -4]} opacity={1}>
              <span>{`${n.commune} : ${n.totalPlaintes}`}</span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
