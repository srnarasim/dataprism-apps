import React, { useState } from 'react';
import { 
  Puzzle, 
  Play, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  ExternalLink,
  Code,
  Activity,
  Zap
} from 'lucide-react';

export interface PluginInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  category: 'import' | 'visualization' | 'analysis' | 'export' | 'utility';
  author: string;
  status: 'available' | 'installed' | 'loading' | 'error';
  size: string;
  features: string[];
  demoUrl?: string;
  documentationUrl?: string;
  npmUrl?: string;
  githubUrl?: string;
  lastUpdated: string;
  downloads: number;
  rating: number;
  tags: string[];
}

interface PluginCardProps {
  plugin: PluginInfo;
  onInstall: (pluginId: string) => void;
  onRealDemo?: (pluginId: string) => void;
  onConfigure: (pluginId: string) => void;
  isLoading?: boolean;
  className?: string;
}

const CategoryIcons = {
  import: Download,
  visualization: Activity,
  analysis: Zap,
  export: ExternalLink,
  utility: Settings
};

const StatusColors = {
  available: 'text-gray-500 bg-gray-100',
  installed: 'text-green-700 bg-green-100',
  loading: 'text-blue-700 bg-blue-100',
  error: 'text-red-700 bg-red-100'
};

const PluginCard: React.FC<PluginCardProps> = ({
  plugin,
  onInstall,
  onRealDemo,
  onConfigure,
  isLoading = false,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const CategoryIcon = CategoryIcons[plugin.category];

  const handleInstall = () => {
    if (plugin.status === 'available') {
      onInstall(plugin.id);
    }
  };


  const handleConfigure = () => {
    onConfigure(plugin.id);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {/* Card Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <CategoryIcon className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {plugin.name}
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                v{plugin.version} by {plugin.author}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2">
                {plugin.description}
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${StatusColors[plugin.status]}`}>
            <div className="flex items-center space-x-1">
              {plugin.status === 'installed' ? (
                <CheckCircle className="w-3 h-3" />
              ) : plugin.status === 'error' ? (
                <AlertCircle className="w-3 h-3" />
              ) : null}
              <span className="capitalize">{plugin.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Plugin Statistics */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span>{plugin.downloads.toLocaleString()} downloads</span>
            <span>★ {plugin.rating.toFixed(1)}</span>
            <span>{plugin.size}</span>
          </div>
          <div className="text-xs">
            Updated {plugin.lastUpdated}
          </div>
        </div>

        {/* Features */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {plugin.features.slice(0, 3).map(feature => (
              <span
                key={feature}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
              >
                {feature}
              </span>
            ))}
            {plugin.features.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                +{plugin.features.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-1">
            {plugin.tags.slice(0, 4).map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {plugin.status === 'available' && (
            <button
              onClick={handleInstall}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Install</span>
            </button>
          )}
          
          {plugin.status === 'installed' && (
            <button
              onClick={handleConfigure}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Configure</span>
            </button>
          )}
          
          {onRealDemo && (
            <button
              onClick={() => onRealDemo!(plugin.id)}
              className="flex items-center justify-center space-x-1 px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
              title="Uses real plugin from DataPrism CDN"
            >
              <Zap className="w-4 h-4" />
              <span>Live Demo</span>
            </button>
          )}
        </div>

        {/* External Links */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-sm">
              {plugin.documentationUrl && (
                <a
                  href={plugin.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Docs</span>
                </a>
              )}
              {plugin.githubUrl && (
                <a
                  href={plugin.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                >
                  <Code className="w-4 h-4" />
                  <span>Source</span>
                </a>
              )}
              {plugin.npmUrl && (
                <a
                  href={plugin.npmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>NPM</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toggle Details */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          {showDetails ? 'Show Less' : 'Show More'}
        </button>
      </div>
    </div>
  );
};

export default PluginCard;