import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ 
  title, 
  value, 
  delta, 
  icon, 
  subtitle, 
  trend,
  loading = false,
  onClick = null 
}) {
  // Determine trend direction and styling
  const getTrendInfo = () => {
    if (loading) return { icon: null, color: '', text: '' };
    
    // Use explicit trend prop if provided, otherwise use delta
    const trendValue = trend !== undefined ? trend : delta;
    
    // Handle different types of trend values
    if (typeof trendValue === 'number') {
      if (trendValue > 0) {
        return {
          icon: <TrendingUp size={14} />,
          color: 'text-green-600 bg-green-50',
          text: `+${Math.abs(trendValue).toFixed(1)}${trendValue < 100 ? '%' : ''}`
        };
      } else if (trendValue < 0) {
        return {
          icon: <TrendingDown size={14} />,
          color: 'text-red-600 bg-red-50',
          text: `-${Math.abs(trendValue).toFixed(1)}${Math.abs(trendValue) < 100 ? '%' : ''}`
        };
      } else if (trendValue === 0) {
        return {
          icon: <Minus size={14} />,
          color: 'text-gray-600 bg-gray-50',
          text: 'Stable'
        };
      }
    }
    
    return { icon: null, color: '', text: '' };
  };

  const trendInfo = getTrendInfo();

  // Determine if value should be rendered
  const renderValue = () => {
    if (loading) {
      return <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>;
    }

    // Handle different types of values
    if (value === null || value === undefined) {
      return <div className="text-2xl font-bold text-gray-400">N/A</div>;
    }

    if (typeof value === 'string' && value.trim() === '') {
      return <div className="text-2xl font-bold text-gray-400">N/A</div>;
    }

    // For "Zone Principale" type cards
    if (typeof value === 'string' && value !== 'N/A') {
      return (
        <div className="text-2xl font-bold text-gray-900 truncate" title={value}>
          {value}
        </div>
      );
    }

    // For numeric values
    if (typeof value === 'number') {
      return (
        <div className="text-3xl font-bold text-gray-900">
          {value.toLocaleString()}
        </div>
      );
    }

    // Default case
    return (
      <div className="text-3xl font-bold text-gray-900 truncate" title={value?.toString()}>
        {value}
      </div>
    );
  };

  // Determine if subtitle should be rendered
  const renderSubtitle = () => {
    if (loading) {
      return <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>;
    }

    if (!subtitle || subtitle === 'Aucune donnée') {
      return (
        <p className="text-sm text-gray-400 mt-1">
          Aucune donnée disponible
        </p>
      );
    }

    return (
      <p className="text-sm text-gray-500 mt-1 truncate" title={subtitle}>
        {subtitle}
      </p>
    );
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 ${
        onClick ? 'hover:shadow-md hover:border-blue-300 cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 truncate pr-2">
          {title}
        </h3>
        <div className="flex-shrink-0">
          {loading ? (
            <div className="w-10 h-10 bg-gray-100 rounded-lg animate-pulse"></div>
          ) : (
            <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg">
              {icon}
            </div>
          )}
        </div>
      </div>

      {/* Main Value */}
      <div className="mb-3">
        {renderValue()}
        {renderSubtitle()}
      </div>

      {/* Trend Indicator */}
      {(delta !== undefined || trend !== undefined) && !loading && trendInfo.icon && (
        <div className="flex items-center">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trendInfo.color}`}>
            {trendInfo.icon}
            <span>{trendInfo.text}</span>
          </div>
          <span className="text-xs text-gray-500 ml-2">
            vs période précédente
          </span>
        </div>
      )}

      {/* Loading State for Trend */}
      {(delta !== undefined || trend !== undefined) && loading && (
        <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2"></div>
      )}

      {/* No trend indicator but has value */}
      {delta === undefined && trend === undefined && !loading && subtitle && (
        <div className="mt-2 h-5"></div>
      )}
    </div>
  );
}