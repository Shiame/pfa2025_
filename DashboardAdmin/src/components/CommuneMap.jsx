import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { fetchCommunes } from '../api/stats';
import { MapPin, Loader, AlertTriangle } from 'lucide-react';

export default function CommuneMap({ 
  from, 
  to, 
  className = "",
  onZoneClick = null,
  showTitle = true 
}) {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use the provided date range or default to last 30 days
        const since = from ? from.toISOString() : new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
        const communesData = await fetchCommunes(since);
        setNodes(communesData || []);
      } catch (err) {
        console.error('Error loading communes:', err);
        setError('Erreur lors du chargement des données');
        setNodes([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [from, to]);

  const center = [33.9716, -6.8498]; // Rabat

  // Enhanced marker styling based on complaint count
  const getMarkerStyle = (count) => {
    if (count >= 20) {
      return {
        color: '#dc2626',      // red-600
        fillColor: '#dc2626',
        fillOpacity: 0.7,
        weight: 3,
        radius: Math.min(35, 8 + count)
      };
    } else if (count >= 10) {
      return {
        color: '#ea580c',      // orange-600
        fillColor: '#ea580c',
        fillOpacity: 0.6,
        weight: 2,
        radius: Math.min(30, 6 + count)
      };
    } else if (count >= 5) {
      return {
        color: '#d97706',      // amber-600
        fillColor: '#d97706',
        fillOpacity: 0.5,
        weight: 2,
        radius: Math.min(25, 5 + count)
      };
    } else {
      return {
        color: '#059669',      // emerald-600
        fillColor: '#059669',
        fillOpacity: 0.4,
        weight: 1,
        radius: Math.min(20, 4 + count)
      };
    }
  };

  const totalComplaints = nodes.reduce((sum, n) => sum + (n.totalPlaintes || 0), 0);

  if (loading) {
    return (
      <div className={`bg-white shadow rounded-xl p-4 ${className}`}>
        {showTitle && <h2 className="font-semibold mb-4">Carte des plaintes</h2>}
        <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader className="animate-spin" size={24} />
            <span>Chargement de la carte...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white shadow rounded-xl p-4 ${className}`}>
        {showTitle && <h2 className="font-semibold mb-4">Carte des plaintes</h2>}
        <div className="h-[400px] flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-2 text-red-500" size={32} />
            <p className="text-red-700 font-medium">Erreur de chargement</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow rounded-xl p-4 ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <MapPin size={20} className="text-blue-500" />
            Carte des plaintes
          </h2>
          <div className="text-sm text-gray-500">
            {nodes.length} zones • {totalComplaints} plaintes
          </div>
        </div>
      )}

      <div className="relative">
        <MapContainer 
          center={center} 
          zoom={12} 
          style={{ height: 400, width: '100%' }}
          className="rounded-lg z-0"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {nodes?.map((n, index) => {
            const style = getMarkerStyle(n.totalPlaintes || 0);
            
            return (
              <CircleMarker
                key={`${n.commune}-${n.lat}-${n.lon}-${index}`}
                center={[n.lat, n.lon]}
                radius={style.radius}
                pathOptions={{
                  color: style.color,
                  fillColor: style.fillColor,
                  fillOpacity: style.fillOpacity,
                  weight: style.weight
                }}
                eventHandlers={{
                  click: () => {
                    if (onZoneClick) {
                      onZoneClick(n);
                    }
                  }
                }}
              >
                <Tooltip 
                  direction="top" 
                  offset={[0, -8]} 
                  opacity={1}
                  className="custom-tooltip"
                >
                  <div className="text-center">
                    <div className="font-medium text-gray-800">{n.commune}</div>
                    <div className="text-sm text-gray-600">
                      {n.totalPlaintes || 0} plainte{(n.totalPlaintes || 0) !== 1 ? 's' : ''}
                    </div>
                    {n.totalPlaintes >= 15 && (
                      <div className="text-xs text-red-600 font-medium mt-1">
                        ⚠️ Zone d'attention
                      </div>
                    )}
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs z-10">
          <div className="font-medium text-gray-800 mb-2">Légende</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span>≥ 20 plaintes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
              <span>10-19 plaintes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-600"></div>
              <span>5-9 plaintes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
              <span>1-4 plaintes</span>
            </div>
          </div>
        </div>

        {/* No data message */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 rounded-lg">
            <div className="text-center text-gray-500">
              <MapPin size={32} className="mx-auto mb-2 text-gray-400" />
              <p>Aucune donnée disponible</p>
              <p className="text-sm">pour la période sélectionnée</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}