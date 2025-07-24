import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Database, 
  Zap, 
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';

export interface MetricData {
  value: number | string;
  previousValue?: number | string;
  unit?: string;
  format?: 'number' | 'percentage' | 'bytes' | 'milliseconds' | 'currency';
  trend?: 'up' | 'down' | 'stable';
  status?: 'good' | 'warning' | 'error';
}

interface MetricsCardProps {
  title: string;
  metric: MetricData;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  className?: string;
}

const StatusIcons = {
  good: CheckCircle,
  warning: AlertTriangle,
  error: AlertTriangle
};

const StatusColors = {
  good: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600'
};

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  metric,
  icon: Icon = Activity,
  description,
  className = ''
}) => {
  const formatValue = (value: number | string, format?: string): string => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'bytes':
        if (value < 1024) return `${value} B`;
        if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
        if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
        return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
      case 'milliseconds':
        if (value < 1000) return `${value.toFixed(0)}ms`;
        return `${(value / 1000).toFixed(2)}s`;
      case 'currency':
        return `$${value.toFixed(2)}`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable':
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
      default:
        return 'text-gray-500';
    }
  };

  const StatusIcon = metric.status ? StatusIcons[metric.status] : null;
  const statusColor = metric.status ? StatusColors[metric.status] : 'text-gray-500';

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">{title}</h3>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
        </div>
        
        {StatusIcon && (
          <StatusIcon className={`w-5 h-5 ${statusColor}`} />
        )}
      </div>

      {/* Main Value */}
      <div className="mb-2">
        <div className="text-2xl font-bold text-gray-900">
          {formatValue(metric.value, metric.format)}
          {metric.unit && (
            <span className="text-sm font-normal text-gray-500 ml-1">
              {metric.unit}
            </span>
          )}
        </div>
      </div>

      {/* Trend and Previous Value */}
      {(metric.previousValue !== undefined || metric.trend) && (
        <div className="flex items-center space-x-2 text-sm">
          {getTrendIcon()}
          
          {metric.previousValue !== undefined && (
            <span className={`font-medium ${getTrendColor()}`}>
              {typeof metric.value === 'number' && typeof metric.previousValue === 'number' && (
                <>
                  {metric.trend === 'up' ? '+' : metric.trend === 'down' ? '-' : ''}
                  {Math.abs(
                    ((metric.value - metric.previousValue) / metric.previousValue) * 100
                  ).toFixed(1)}%
                </>
              )}
            </span>
          )}
          
          <span className="text-gray-500">
            vs previous period
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricsCard;