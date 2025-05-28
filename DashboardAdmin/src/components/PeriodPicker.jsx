// PeriodPicker – compact button + pop‑over calendar
import { useState, useEffect, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, differenceInCalendarDays } from 'date-fns';
import { CalendarRange } from 'lucide-react';
import 'react-day-picker/dist/style.css';

export default function PeriodPicker({ range, setRange }) {
  const [open, setOpen] = useState(false);
  const popover = useRef(null);

  /* keep “from” ≤ “to” */
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

  const label =
    range.from && range.to
      ? `${format(range.from, 'dd/MM/yy')} – ${format(range.to, 'dd/MM/yy')}`
      : 'Choisir période';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm shadow-sm 
                   hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <CalendarRange size={16} className="text-gray-500" />
        <span className="whitespace-nowrap">{label}</span>
      </button>

      {open && (
        <div
          ref={popover}
          className="absolute right-0 mt-2 z-20 bg-white rounded-xl shadow-lg p-4"
        >
          <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange}
            captionLayout="dropdown"
            fromYear={2024}
            toYear={new Date().getFullYear()}
          />
        </div>
      )}
    </div>
  );
}
