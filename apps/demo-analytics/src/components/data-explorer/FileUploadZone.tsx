import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, AlertCircle, CheckCircle, Loader2, Database, X } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { cn } from '@/utils/cn';
import type { 
  UploadProgress, 
  UploadResult, 
  ParseOptions, 
  SampleDataSet 
} from '@/types/data';

interface FileUploadZoneProps {
  onUpload: (result: UploadResult) => void;
  onProgress?: (progress: UploadProgress) => void;
  maxFileSize?: number;
  supportedFormats?: string[];
  sampleDataSets?: SampleDataSet[];
  className?: string;
}

const DEFAULT_SUPPORTED_FORMATS = ['.csv', '.tsv', '.json', '.xlsx', '.xls'];
const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onUpload,
  onProgress,
  maxFileSize = DEFAULT_MAX_SIZE,
  supportedFormats = DEFAULT_SUPPORTED_FORMATS,
  sampleDataSets = [],
  className
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSampleData, setShowSampleData] = useState(false);

  const updateProgress = useCallback((progress: UploadProgress) => {
    setUploadProgress(progress);
    onProgress?.(progress);
  }, [onProgress]);

  const processFile = async (file: File): Promise<UploadResult> => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    updateProgress({
      stage: 'reading',
      progress: 10,
      message: 'Reading file...'
    });

    try {
      let data: any[] = [];
      const startTime = Date.now();

      if (fileExtension === '.csv' || fileExtension === '.tsv') {
        data = await parseCSV(file, fileExtension === '.tsv');
      } else if (fileExtension === '.json') {
        data = await parseJSON(file);
      } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        data = await parseExcel(file);
      } else {
        throw new Error(`Unsupported file format: ${fileExtension}`);
      }

      updateProgress({
        stage: 'validating',
        progress: 80,
        message: 'Validating data...',
        rowsProcessed: data.length,
        totalRows: data.length
      });

      // Generate table name from filename
      const tableName = file.name.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9_]/g, '_');
      
      // Infer schema
      const schema = inferSchema(data, tableName);

      updateProgress({
        stage: 'complete',
        progress: 100,
        message: 'Upload complete!',
        rowsProcessed: data.length,
        totalRows: data.length
      });

      const duration = Date.now() - startTime;

      return {
        success: true,
        tableName,
        schema,
        sampleData: data.slice(0, 100), // First 100 rows for preview
        importDuration: duration,
        warnings: []
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return {
        success: false,
        tableName: '',
        schema: {
          name: '',
          columns: [],
          rowCount: 0,
          createdAt: new Date()
        },
        sampleData: [],
        importDuration: 0,
        error: errorMessage
      };
    }
  };

  const parseCSV = (file: File, isTSV: boolean = false): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        delimiter: isTSV ? '\t' : ',',
        skipEmptyLines: true,
        complete: (results) => {
          updateProgress({
            stage: 'parsing',
            progress: 60,
            message: 'Parsing CSV data...',
            rowsProcessed: results.data.length,
            totalRows: results.data.length
          });

          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }

          resolve(results.data as any[]);
        },
        error: (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      });
    });
  };

  const parseJSON = async (file: File): Promise<any[]> => {
    const text = await file.text();
    
    updateProgress({
      stage: 'parsing',
      progress: 50,
      message: 'Parsing JSON data...'
    });

    try {
      const parsed = JSON.parse(text);
      const data = Array.isArray(parsed) ? parsed : [parsed];
      
      updateProgress({
        stage: 'parsing',
        progress: 70,
        message: 'Processing JSON records...',
        rowsProcessed: data.length,
        totalRows: data.length
      });

      return data;
    } catch (err) {
      throw new Error(`Invalid JSON format: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const parseExcel = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          updateProgress({
            stage: 'parsing',
            progress: 40,
            message: 'Reading Excel file...'
          });

          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Use the first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          updateProgress({
            stage: 'parsing',
            progress: 60,
            message: 'Converting Excel data...'
          });

          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          updateProgress({
            stage: 'parsing',
            progress: 70,
            message: 'Processing Excel records...',
            rowsProcessed: jsonData.length,
            totalRows: jsonData.length
          });

          resolve(jsonData);
        } catch (err) {
          reject(new Error(`Excel parsing failed: ${err instanceof Error ? err.message : 'Unknown error'}`));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read Excel file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const inferSchema = (data: any[], tableName: string) => {
    if (data.length === 0) {
      return {
        name: tableName,
        columns: [],
        rowCount: 0,
        createdAt: new Date()
      };
    }

    const sampleSize = Math.min(1000, data.length);
    const sample = data.slice(0, sampleSize);
    const columns = Object.keys(data[0]).map(name => {
      const values = sample.map(row => row[name]).filter(val => val !== null && val !== undefined && val !== '');
      
      let type: 'string' | 'number' | 'date' | 'boolean' = 'string';
      
      // Infer type from non-null values
      if (values.length > 0) {
        const firstValue = values[0];
        
        if (typeof firstValue === 'boolean') {
          type = 'boolean';
        } else if (typeof firstValue === 'number' || !isNaN(Number(firstValue))) {
          type = 'number';
        } else if (firstValue instanceof Date || !isNaN(Date.parse(String(firstValue)))) {
          type = 'date';
        }
      }

      const nullCount = sample.length - values.length;
      const uniqueValues = new Set(values);

      return {
        name,
        type,
        nullable: nullCount > 0,
        nullCount,
        uniqueCount: uniqueValues.size,
        unique: uniqueValues.size === values.length && values.length > 0
      };
    });

    return {
      name: tableName,
      columns,
      rowCount: data.length,
      createdAt: new Date()
    };
  };

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setError(null);
    setIsUploading(true);

    try {
      const result = await processFile(file);
      onUpload(result);
      
      if (!result.success) {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onUpload({
        success: false,
        tableName: '',
        schema: { name: '', columns: [], rowCount: 0, createdAt: new Date() },
        sampleData: [],
        importDuration: 0,
        error: errorMessage
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleSampleDataSelect = async (sampleData: SampleDataSet) => {
    setError(null);
    setIsUploading(true);
    setShowSampleData(false);

    try {
      updateProgress({
        stage: 'reading',
        progress: 10,
        message: `Loading ${sampleData.name}...`
      });

      const data = await sampleData.generator();
      
      updateProgress({
        stage: 'parsing',
        progress: 50,
        message: 'Processing sample data...',
        rowsProcessed: data.length,
        totalRows: data.length
      });

      const schema = inferSchema(data, sampleData.id);
      
      updateProgress({
        stage: 'complete',
        progress: 100,
        message: 'Sample data loaded!'
      });

      const result: UploadResult = {
        success: true,
        tableName: sampleData.id,
        schema,
        sampleData: data.slice(0, 100),
        importDuration: 500,
        warnings: [`Loaded sample dataset: ${sampleData.name}`]
      };

      onUpload(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sample data';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop: handleUpload,
    accept: {
      'text/csv': ['.csv'],
      'text/tab-separated-values': ['.tsv'],
      'application/json': ['.json'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxSize: maxFileSize,
    maxFiles: 1,
    disabled: isUploading
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Upload Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
            {uploadProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{uploadProgress.message}</span>
                  <span>{uploadProgress.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.progress}%` }}
                  />
                </div>
                {uploadProgress.rowsProcessed && (
                  <div className="text-sm text-gray-500">
                    Processed {uploadProgress.rowsProcessed.toLocaleString()} rows
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop your file here' : 'Upload your data file'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop or click to select • {supportedFormats.join(', ')} • Max {formatFileSize(maxFileSize)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File Rejection Errors */}
      {fileRejections.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="space-y-2">
              <p className="font-medium text-red-800">Upload Failed</p>
              {fileRejections.map(({ file, errors }, index) => (
                <div key={index} className="text-sm text-red-700">
                  <p className="font-medium">{file.name}</p>
                  <ul className="list-disc list-inside ml-4">
                    {errors.map(error => (
                      <li key={error.code}>{error.message}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* General Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-red-100 rounded"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      )}

      {/* Sample Data Section */}
      {sampleDataSets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Or try sample datasets
            </h3>
            <button
              onClick={() => setShowSampleData(!showSampleData)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showSampleData ? 'Hide' : 'Show'} samples
            </button>
          </div>

          {showSampleData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleDataSets.map((dataset) => (
                <div
                  key={dataset.id}
                  className="border rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer group"
                  onClick={() => handleSampleDataSelect(dataset)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Database className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                      <h4 className="font-medium text-gray-900">{dataset.name}</h4>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {dataset.category}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{dataset.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{dataset.rows.toLocaleString()} rows</span>
                    <span>{dataset.columns} columns</span>
                    <span>{dataset.size}</span>
                  </div>
                  
                  {dataset.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {dataset.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;