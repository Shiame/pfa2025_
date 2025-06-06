import { useState, useEffect, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, differenceInCalendarDays, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarRange, ChevronDown, Clock } from 'lucide-react';
import 'react-day-picker/dist/style.css';

export default function PeriodPicker({ range, setRange }) {
  const [open, setOpen] = useState(false);
  const [quickOption, setQuickOption] = useState('custom');
  const popover = useRef(null);

  // Quick selection options
  const quickOptions = [
    { 
      label: '7 derniers jours', 
      value: '7d',
      getRange: () => ({ from: subDays(new Date(), 7), to: new Date() })
    },
    { 
      label: '30 derniers jours', 
      value: '30d',
      getRange: () => ({ from: subDays(new Date(), 30), to: new Date() })
    },
    { 
      label: 'Cette semaine', 
      value: 'week',
      getRange: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: new Date() })
    },
    { 
      label: 'Ce mois', 
      value: 'month',
      getRange: () => ({ from: startOfMonth(new Date()), to: new Date() })
    },
    { 
      label: 'Cette année', 
      value: 'year',
      getRange: () => ({ from: startOfYear(new Date()), to: new Date() })
    },
    { 
      label: 'Personnalisé', 
      value: 'custom',
      getRange: () => range
    }
  ];

  /* keep "from" ≤ "to" */
  useEffect(() => {
    if (
      range.from &&
      range.to &&
      differenceInCalendarDays(range.from, range.to) > 0
    ) {
      setRange({ from: range.from, to: undefined });
    }
  }, [range, setRange]);

  /* click‑outside → close */
  useEffect(() => {
    function onClick(e) {
      if (open && popover.current && !popover.current.contains(e.target)) {
        setOpen(false);
      }
    }
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [open]);

  const handleQuickSelect = (option) => {
    if (option.value !== 'custom') {
      const newRange = option.getRange();
      setRange(newRange);
      setQuickOption(option.value);
    } else {
      setQuickOption('custom');
    }
  };

  // Format label based on selected range
  const getLabel = () => {
    if (!range.from || !range.to) {
      return 'Sélectionner période';
    }

    const days = differenceInCalendarDays(range.to, range.from);
    const fromStr = format(range.from, 'dd/MM/yy', { locale: fr });
    const toStr = format(range.to, 'dd/MM/yy', { locale: fr });
    
    return `${fromStr} - ${toStr} (${days + 1}j)`;
  };

  // Determine which quick option is currently selected
  useEffect(() => {
    if (range.from && range.to) {
      const selectedOption = quickOptions.find(option => {
        if (option.value === 'custom') return false;
        const optionRange = option.getRange();
        return (
          format(range.from, 'yyyy-MM-dd') === format(optionRange.from, 'yyyy-MM-dd') &&
          format(range.to, 'yyyy-MM-dd') === format(optionRange.to, 'yyyy-MM-dd')
        );
      });
      
      setQuickOption(selectedOption ? selectedOption.value : 'custom');
    }
  }, [range]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm 
                   hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   transition-colors duration-200 min-w-56"
      >
        <CalendarRange size={16} className="text-gray-500" />
        <span className="flex-1 text-left truncate">{getLabel()}</span>
        <ChevronDown 
          size={14} 
          className={`text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
        />
      </button>

      {open && (
        <div
          ref={popover}
          className="absolute right-0 mt-2 z-30 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
          style={{ minWidth: '320px' }}
        >
          {/* Quick Options */}
          <div className="p-4 border-b border-gray-100">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Clock size={14} className="mr-2 text-blue-600" />
              Sélection rapide
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {quickOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleQuickSelect(option)}
                  className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    quickOption === option.value
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Sélection personnalisée
            </h4>
            <DayPicker
              mode="range"
              selected={range}
              onSelect={(newRange) => {
                setRange(newRange || { from: undefined, to: undefined });
                setQuickOption('custom');
              }}
              locale={fr}
              captionLayout="dropdown"
              fromYear={2024}
              toYear={new Date().getFullYear()}
              className="rdp-custom"
              modifiersClassNames={{
                selected: 'rdp-selected-custom',
                range_start: 'rdp-range-start-custom',
                range_end: 'rdp-range-end-custom',
                range_middle: 'rdp-range-middle-custom'
              }}
            />
          </div>

          {/* Actions */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <div className="text-xs text-gray-600">
              {range.from && range.to && (
                <>
                  {differenceInCalendarDays(range.to, range.from) + 1} jour
                  {differenceInCalendarDays(range.to, range.from) > 0 ? 's' : ''} sélectionné
                  {differenceInCalendarDays(range.to, range.from) > 0 ? 's' : ''}
                </>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .rdp-custom {
          --rdp-cell-size: 32px;
          --rdp-accent-color: #3b82f6;
          --rdp-background-color: #eff6ff;
          font-size: 14px;
        }
        
        .rdp-selected-custom {
          background-color: var(--rdp-accent-color) !important;
          color: white !important;
        }
        
        .rdp-range-start-custom {
          background-color: var(--rdp-accent-color) !important;
          color: white !important;
          border-radius: 6px 0 0 6px !important;
        }
        
        .rdp-range-end-custom {
          background-color: var(--rdp-accent-color) !important;
          color: white !important;
          border-radius: 0 6px 6px 0 !important;
        }
        
        .rdp-range-middle-custom {
          background-color: var(--rdp-background-color) !important;
          color: var(--rdp-accent-color) !important;
        }
      `}</style>
    </div>
  );
}