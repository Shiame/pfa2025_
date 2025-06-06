import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Tag, Check } from 'lucide-react';
import { categories } from '../constants/categories';

export default function CatSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (category) => {
    onChange(category);
    setOpen(false);
  };

  const getDisplayLabel = (cat) => {
    if (cat === 'ALL') return 'Toutes les catégories';
    return cat;
  };

  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'AGRESSION': return '⚠️';
      case 'DECHETS': return '🗑️';
      case 'VOIRIE': return '🛣️';
      case 'CORRUPTION': return '💰';
      case 'HARCELEMENT': return '🚫';
      case 'VOL': return '🔓';
      case 'POLLUTION': return '🌫️';
      default: return '📋';
    }
  };

  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'AGRESSION': return 'text-red-600 bg-red-50';
      case 'DECHETS': return 'text-green-600 bg-green-50';
      case 'VOIRIE': return 'text-blue-600 bg-blue-50';
      case 'CORRUPTION': return 'text-purple-600 bg-purple-50';
      case 'HARCELEMENT': return 'text-orange-600 bg-orange-50';
      case 'VOL': return 'text-pink-600 bg-pink-50';
      case 'POLLUTION': return 'text-gray-600 bg-gray-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="relative" ref={selectRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm 
                   hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   transition-colors duration-200 min-w-48"
      >
        <Tag size={16} className="text-gray-500" />
        <span className="flex-1 text-left truncate">
          {getDisplayLabel(value)}
        </span>
        <ChevronDown 
          size={14} 
          className={`text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleSelect(cat)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors
                         ${value === cat ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                         ${cat !== categories[categories.length - 1] ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{getCategoryIcon(cat)}</span>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {getDisplayLabel(cat)}
                  </span>
                  {cat !== 'ALL' && (
                    <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${getCategoryColor(cat)}`}>
                      {cat}
                    </span>
                  )}
                </div>
              </div>
              {value === cat && (
                <Check size={16} className="text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}