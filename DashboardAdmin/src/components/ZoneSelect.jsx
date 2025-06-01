import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, MapPin, Check, Search, BarChart3 } from 'lucide-react';

export default function ZoneSelect({ counts, zone, setZone }) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Process zones with complaint counts
  const zoneData = useMemo(() => {
    if (!counts || counts.length === 0) {
      return [{ zone: 'ALL', count: 0, label: 'Toutes les zones' }];
    }

    // Aggregate counts by zone
    const zoneMap = counts.reduce((acc, item) => {
      const zoneName = item.zone || 'Inconnu';
      if (!acc[zoneName]) {
        acc[zoneName] = { zone: zoneName, count: 0 };
      }
      acc[zoneName].count += item.count || 0;
      return acc;
    }, {});

    // Convert to array and sort by count (descending)
    const zones = Object.values(zoneMap)
      .sort((a, b) => b.count - a.count)
      .map(zoneInfo => ({
        ...zoneInfo,
        label: zoneInfo.zone === 'Inconnu' ? 'Zone non spécifiée' : zoneInfo.zone
      }));

    // Add "ALL" option at the beginning with total count
    const totalCount = zones.reduce((sum, z) => sum + z.count, 0);
    return [
      { zone: 'ALL', count: totalCount, label: 'Toutes les zones' },
      ...zones
    ];
  }, [counts]);

  // Filter zones based on search term
  const filteredZones = useMemo(() => {
    if (!searchTerm.trim()) return zoneData;
    
    return zoneData.filter(zoneInfo => 
      zoneInfo.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zoneInfo.zone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [zoneData, searchTerm]);

  const handleSelect = (selectedZone) => {
    setZone(selectedZone);
    setOpen(false);
    setSearchTerm('');
  };

  const getDisplayLabel = () => {
    const selectedZoneData = zoneData.find(z => z.zone === zone);
    if (selectedZoneData) {
      return selectedZoneData.label;
    }
    return zone === 'ALL' ? 'Toutes les zones' : 
           zone === 'Inconnu' ? 'Zone non spécifiée' : zone;
  };

  const getZoneCount = (zoneInfo) => {
    return zoneInfo.count > 0 ? zoneInfo.count : '';
  };

  return (
    <div className="relative" ref={selectRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm 
                   hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   transition-colors duration-200 min-w-52"
      >
        <MapPin size={16} className="text-gray-500" />
        <span className="flex-1 text-left truncate">
          {getDisplayLabel()}
        </span>
        <div className="flex items-center gap-2">
          {zone !== 'ALL' && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {zoneData.find(z => z.zone === zone)?.count || 0}
            </span>
          )}
          <ChevronDown 
            size={14} 
            className={`text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          {/* Search bar for many zones */}
          {zoneData.length > 5 && (
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une zone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Zone list */}
          <div className="max-h-64 overflow-y-auto">
            {filteredZones.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500">
                <MapPin size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Aucune zone trouvée</p>
              </div>
            ) : (
              filteredZones.map((zoneInfo, index) => (
                <button
                  key={zoneInfo.zone}
                  onClick={() => handleSelect(zoneInfo.zone)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors
                             ${zone === zoneInfo.zone ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                             ${index !== filteredZones.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <MapPin 
                      size={16} 
                      className={zoneInfo.zone === 'ALL' ? 'text-blue-500' : 'text-gray-400'} 
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium truncate">
                        {zoneInfo.label}
                      </span>
                      {zoneInfo.zone !== 'ALL' && zoneInfo.count > 0 && (
                        <span className="text-xs text-gray-500">
                          {zoneInfo.count} plainte{zoneInfo.count > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {zoneInfo.count > 0 && (
                      <div className="flex items-center gap-1">
                        <BarChart3 size={12} className="text-gray-400" />
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          zoneInfo.zone === 'ALL' 
                            ? 'bg-blue-100 text-blue-700' 
                            : zoneInfo.count > 10 
                              ? 'bg-red-100 text-red-700'
                              : zoneInfo.count > 5
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-green-100 text-green-700'
                        }`}>
                          {zoneInfo.count}
                        </span>
                      </div>
                    )}
                    {zone === zoneInfo.zone && (
                      <Check size={16} className="text-blue-600" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer with total count */}
          {filteredZones.length > 1 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center">
              <span className="text-xs text-gray-600">
                {filteredZones.length - 1} zone{filteredZones.length > 2 ? 's' : ''} disponible{filteredZones.length > 2 ? 's' : ''}
                {searchTerm && ` (filtrée${filteredZones.length > 2 ? 's' : ''})`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}