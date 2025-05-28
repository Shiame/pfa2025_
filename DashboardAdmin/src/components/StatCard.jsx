import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, delta, subvalue, icon }) {
  // Determine if the delta is positive, negative, or neutral
  const getDeltaColor = () => {
    if (!delta) return '';
    if (delta > 0) return 'text-green-500';
    if (delta < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getDeltaIcon = () => {
    if (!delta) return null;
    if (delta > 0) return <TrendingUp size={16} />;
    if (delta < 0) return <TrendingDown size={16} />;
    return null;
  };

  return (
   <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subvalue && (
              <span className="ml-2 text-sm text-gray-500">{subvalue}</span>
            )}
          </div>
          
          {delta !== undefined && (
            <div className={`flex items-center gap-1 mt-2 ${getDeltaColor()}`}>
              {getDeltaIcon()}
              <span className="text-sm">
                {delta > 0 ? `+${delta}` : delta} depuis la dernière période
              </span>
            </div>
          )}
        </div>
        
        <div className="p-2 rounded-lg bg-gray-50">
          {icon}
        </div>
      </div>
    </div>
  );
}