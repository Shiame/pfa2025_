import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; 
import { fetchCommunes } from '../api/stats';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function CommuneMap() {
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    fetchCommunes(since).then(setNodes).catch(console.error);
  }, []);

  const center = [33.9716, -6.8498]; // Rabat

  return (
    <div id="map" className="bg-white shadow rounded-xl p-4 col-span-full">
      <h2 className="font-semibold mb-2">Carte des plaintes</h2>

      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ height: 400, width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {nodes?.map(n => (
          <CircleMarker
            key={n.commune + n.lat + n.lon}
            center={[n.lat, n.lon]}
            radius={Math.min(40, 5 + n.totalPlaintes)}
            pathOptions={{ 
              color: '#e11d48', 
              fillColor: '#e11d48', 
              fillOpacity: 0.6, 
              weight: 1 
            }}
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