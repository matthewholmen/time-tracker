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
    <div className="glass rounded-3xl shadow-glass p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Export Data</h2>
        <div className="flex items-center space-x-3 text-slate-600">
          <div className="p-2 glass rounded-xl">
            <Calendar size={18} />
          </div>
          <span className="font-medium">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Export Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-2xl p-6 hover:shadow-soft transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-3 text-primary-600 mb-3">
            <div className="p-2 bg-primary-100 rounded-xl">
              <FileText size={20} />
            </div>
            <span className="font-semibold">Total Sessions</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalSessions}</p>
        </div>
        <div className="glass rounded-2xl p-6 hover:shadow-soft transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-3 text-accent-cyan mb-3">
            <div className="p-2 bg-cyan-100 rounded-xl">
              <BarChart3 size={20} />
            </div>
            <span className="font-semibold">Total Time</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{formatTime(totalTime)}</p>
        </div>
        <div className="glass rounded-2xl p-6 hover:shadow-soft transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-3 text-accent-emerald mb-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Download size={20} />
            </div>
            <span className="font-semibold">Total Earnings</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">${totalEarnings.toFixed(2)}</p>
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <div className="w-2 h-2 bg-gradient-primary rounded-full mr-3"></div>
          Export Options
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Detailed Time Blocks Export */}
          <div className="glass rounded-2xl p-6 hover:shadow-soft transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-primary rounded-2xl">
                <FileText size={24} className="text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">Detailed Sessions</h4>
                <p className="text-sm text-slate-600">All time blocks with timestamps</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Exports a detailed CSV with every time tracking session including start/end times, duration, and earnings.
            </p>
            <button
              onClick={handleExportTimeBlocks}
              disabled={isExporting}
              className="w-full group flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-primary hover:shadow-elevated disabled:opacity-50 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <Download size={18} className="group-hover:animate-bounce" />
              <span>{isExporting ? 'Exporting...' : 'Export Sessions'}</span>
            </button>
          </div>

          {/* Project Summary Export */}
          <div className="glass rounded-2xl p-6 hover:shadow-soft transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-success rounded-2xl">
                <BarChart3 size={24} className="text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">Project Summary</h4>
                <p className="text-sm text-slate-600">Aggregated project statistics</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Exports a summary CSV with total time, earnings, and statistics for each project.
            </p>
            <button
              onClick={handleExportProjectSummary}
              disabled={isExporting}
              className="w-full group flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-success hover:shadow-elevated disabled:opacity-50 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <Download size={18} className="group-hover:animate-bounce" />
              <span>{isExporting ? 'Exporting...' : 'Export Summary'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export Format Info */}
      <div className="mt-8 glass rounded-2xl p-6">
        <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <div className="w-2 h-2 bg-gradient-warning rounded-full mr-3"></div>
          Export Format Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600">
          <div className="space-y-3">
            <p className="font-semibold text-slate-700 text-base">Detailed Sessions includes:</p>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                <span>Project name</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                <span>Start and end timestamps</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                <span>Duration (hours and formatted time)</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                <span>Hourly rate and earnings</span>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-semibold text-slate-700 text-base">Project Summary includes:</p>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-accent-emerald rounded-full"></div>
                <span>Project name and rate</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-accent-emerald rounded-full"></div>
                <span>Total time and sessions</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-accent-emerald rounded-full"></div>
                <span>Total earnings</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-accent-emerald rounded-full"></div>
                <span>Average session length</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportManager;