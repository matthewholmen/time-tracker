import React, { useState } from 'react';
import { Download, FileText, BarChart3, Calendar } from 'lucide-react';
import { Project } from '../types';
import { generateCSV, generateProjectSummaryCSV, downloadCSV } from '../utils/csvExport';

interface ExportManagerProps {
  projects: Project[];
}

const ExportManager: React.FC<ExportManagerProps> = ({ projects }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportTimeBlocks = () => {
    if (projects.length === 0) {
      alert('No projects to export');
      return;
    }

    setIsExporting(true);
    
    try {
      const csvContent = generateCSV(projects);
      const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const filename = `time-tracker-sessions-${timestamp}.csv`;
      
      downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportProjectSummary = () => {
    if (projects.length === 0) {
      alert('No projects to export');
      return;
    }

    setIsExporting(true);
    
    try {
      const csvContent = generateProjectSummaryCSV(projects);
      const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const filename = `time-tracker-summary-${timestamp}.csv`;
      
      downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const totalSessions = projects.reduce((sum, project) => sum + project.timeBlocks.length, 0);
  const totalTime = projects.reduce((sum, project) => sum + project.totalTime, 0);
  const totalEarnings = projects.reduce((sum, project) => sum + project.totalEarnings, 0);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Export Data</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Export Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-800 mb-2">
            <FileText size={18} />
            <span className="font-medium">Total Sessions</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{totalSessions}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 text-green-800 mb-2">
            <BarChart3 size={18} />
            <span className="font-medium">Total Time</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{formatTime(totalTime)}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 text-purple-800 mb-2">
            <Download size={18} />
            <span className="font-medium">Total Earnings</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">${totalEarnings.toFixed(2)}</p>
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Export Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Detailed Time Blocks Export */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Detailed Sessions</h4>
                <p className="text-sm text-gray-600">All time blocks with timestamps</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Exports a detailed CSV with every time tracking session including start/end times, duration, and earnings.
            </p>
            <button
              onClick={handleExportTimeBlocks}
              disabled={isExporting}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
            >
              <Download size={16} />
              <span>{isExporting ? 'Exporting...' : 'Export Sessions'}</span>
            </button>
          </div>

          {/* Project Summary Export */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 size={20} className="text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Project Summary</h4>
                <p className="text-sm text-gray-600">Aggregated project statistics</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Exports a summary CSV with total time, earnings, and statistics for each project.
            </p>
            <button
              onClick={handleExportProjectSummary}
              disabled={isExporting}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg transition-colors"
            >
              <Download size={16} />
              <span>{isExporting ? 'Exporting...' : 'Export Summary'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export Format Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Export Format</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-medium mb-1">Detailed Sessions includes:</p>
            <ul className="space-y-1">
              <li>• Project name</li>
              <li>• Start and end timestamps</li>
              <li>• Duration (hours and formatted time)</li>
              <li>• Hourly rate and earnings</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Project Summary includes:</p>
            <ul className="space-y-1">
              <li>• Project name and rate</li>
              <li>• Total time and sessions</li>
              <li>• Total earnings</li>
              <li>• Average session length</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportManager;