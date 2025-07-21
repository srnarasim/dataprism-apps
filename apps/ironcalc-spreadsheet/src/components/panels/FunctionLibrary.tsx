import React, { useState, useMemo } from 'react';
import { Search, X, Book, Calculator, Calendar, Type, Database, BarChart3 } from 'lucide-react';
import { useIronCalc } from '@contexts/IronCalcContext';
import type { FunctionDocumentation } from '@contexts/IronCalcContext';

interface FunctionLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertFunction: (functionName: string) => void;
}

const functionCategories = [
  { id: 'all', name: 'All Functions', icon: Book },
  { id: 'Statistical', name: 'Math & Statistics', icon: Calculator },
  { id: 'Logical', name: 'Logical', icon: BarChart3 },
  { id: 'Text', name: 'Text', icon: Type },
  { id: 'Date', name: 'Date & Time', icon: Calendar },
  { id: 'Lookup', name: 'Lookup & Reference', icon: Database },
];

export default function FunctionLibrary({ isOpen, onClose, onInsertFunction }: FunctionLibraryProps) {
  const { getFunctions, getFunctionHelp, plugin, isPluginLoaded, pluginError } = useIronCalc();
  
  console.log('[FunctionLibrary] Plugin state:', { 
    plugin: !!plugin, 
    isPluginLoaded, 
    pluginError: pluginError?.message,
    pluginMethods: plugin ? Object.keys(plugin) : [],
    hasFunctionsMethod: plugin ? typeof plugin.getFunctions === 'function' : false,
    getFunctionsResult: plugin && typeof plugin.getFunctions === 'function' ? plugin.getFunctions() : 'No getFunctions method'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFunction, setSelectedFunction] = useState<FunctionDocumentation | null>(null);

  // Get all available functions
  const allFunctions = useMemo(() => {
    console.log('[FunctionLibrary] Calling getFunctions from context...');
    const functions = getFunctions();
    console.log('[FunctionLibrary] Available functions:', functions);
    console.log('[FunctionLibrary] Functions length:', functions.length);
    console.log('[FunctionLibrary] Functions type:', typeof functions);
    console.log('[FunctionLibrary] Is array:', Array.isArray(functions));
    return functions;
  }, [getFunctions]);

  // Filter functions based on search and category
  const filteredFunctions = useMemo(() => {
    let functions = allFunctions;

    // Filter by category
    if (selectedCategory !== 'all') {
      functions = functions.filter(fn => fn.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      functions = functions.filter(fn => 
        fn.name.toLowerCase().includes(term) ||
        fn.description.toLowerCase().includes(term)
      );
    }

    // Sort alphabetically
    return functions.sort((a, b) => a.name.localeCompare(b.name));
  }, [allFunctions, selectedCategory, searchTerm]);

  // Handle function selection
  const handleFunctionSelect = (fn: FunctionDocumentation) => {
    setSelectedFunction(fn);
  };

  // Handle function insertion
  const handleInsertFunction = (functionName: string) => {
    onInsertFunction(functionName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-4/5 h-4/5 max-w-5xl max-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Function Library</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search functions..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                {functionCategories.map(category => {
                  const Icon = category.icon;
                  const count = category.id === 'all' 
                    ? allFunctions.length 
                    : allFunctions.filter(fn => fn.category === category.id).length;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={16} className="mr-2" />
                      <span className="flex-1 text-left">{category.name}</span>
                      <span className="text-xs text-gray-500">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Function List */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">
                {selectedCategory === 'all' ? 'All Functions' : 
                 functionCategories.find(c => c.id === selectedCategory)?.name}
              </h3>
              <p className="text-sm text-gray-500">{filteredFunctions.length} functions</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredFunctions.map(fn => (
                <div
                  key={fn.name}
                  onClick={() => handleFunctionSelect(fn)}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedFunction?.name === fn.name ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900">{fn.name}</div>
                  <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {fn.description}
                  </div>
                </div>
              ))}
              
              {filteredFunctions.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Calculator size={32} className="mx-auto mb-3 text-gray-300" />
                  {!isPluginLoaded ? (
                    <>
                      <p>Loading functions...</p>
                      <p className="text-sm">Plugin: {pluginError ? 'Error' : 'Loading'}</p>
                      {pluginError && (
                        <p className="text-xs text-red-600 mt-2">{pluginError.message}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <p>No functions found</p>
                      <p className="text-sm">Try adjusting your search or category filter</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Function Details */}
          <div className="flex-1 flex flex-col">
            {selectedFunction ? (
              <>
                {/* Function header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedFunction.name}
                    </h3>
                    <button
                      onClick={() => handleInsertFunction(selectedFunction.name)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Insert Function
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{selectedFunction.category}</p>
                </div>

                {/* Function details */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-sm text-gray-700">{selectedFunction.description}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Syntax</h4>
                      <code className="block p-3 bg-gray-100 rounded text-sm font-mono">
                        {selectedFunction.syntax}
                      </code>
                    </div>

                    {selectedFunction.parameters && selectedFunction.parameters.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Parameters</h4>
                        <div className="space-y-2">
                          {selectedFunction.parameters.map((param, index) => (
                            <div key={index} className="border border-gray-200 rounded p-3">
                              <div className="flex items-center mb-1">
                                <span className="font-medium text-sm">{param.name}</span>
                                <span className="ml-2 text-xs text-gray-500">({param.type})</span>
                                {param.optional && (
                                  <span className="ml-2 text-xs text-orange-600">optional</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{param.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Example</h4>
                      <code className="block p-3 bg-gray-100 rounded text-sm font-mono">
                        {selectedFunction.example}
                      </code>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Calculator size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>Select a function to view details</p>
                  <p className="text-sm">Browse {allFunctions.length} available Excel-compatible functions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}