import React, { useState } from 'react';
import { Download, FileText, BarChart3, Calendar, Database, Cpu, Zap } from 'lucide-react';
import { Project, TaxSettings } from '../types';
import { generateCSV, generateProjectSummaryCSV, downloadCSV } from '../utils/csvExport';

interface ExportManagerProps {
  projects: Project[];
  taxSettings: TaxSettings;
}

const ExportManager: React.FC<ExportManagerProps> = ({ projects, taxSettings }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportTimeBlocks = () => {
    if (projects.length === 0) {
      alert('[ERROR] No data available for transmission');
      return;
    }

    setIsExporting(true);
    
    try {
      const csvContent = generateCSV(projects, taxSettings);
      const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const filename = `matrix-sessions-${timestamp}.csv`;
      
      downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('[ERROR] Data transmission failed. Retry protocol.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportProjectSummary = () => {
    if (projects.length === 0) {
      alert('[ERROR] No data available for transmission');
      return;
    }

    setIsExporting(true);
    
    try {
      const csvContent = generateProjectSummaryCSV(projects, taxSettings);
      const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const filename = `matrix-summary-${timestamp}.csv`;
      
      downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('[ERROR] Data transmission failed. Retry protocol.');
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
    <div className="terminal-window shadow-neon-green p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Database className="w-6 h-6 matrix-text animate-pulse" />
          <h2 className="text-2xl font-cyber font-black matrix-text tracking-wider">
            DATA EXPORT PROTOCOL
          </h2>
        </div>
        <div className="flex items-center space-x-3 text-matrix-600">
          <Calendar className="w-5 h-5 animate-pulse" />
          <span className="font-mono text-sm tracking-wider">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Export Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="cyber-card p-6 hover:border-matrix-500 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <FileText className="w-5 h-5 text-matrix-500 animate-pulse" />
            <span className="font-mono font-bold text-matrix-600 tracking-wider text-sm">SESSIONS</span>
          </div>
          <p className="text-3xl font-cyber font-black matrix-text">{totalSessions}</p>
          <p className="text-xs text-matrix-700 font-mono mt-1">TOTAL_COUNT</p>
        </div>
        
        <div className="cyber-card p-6 hover:border-cyber-cyan transition-all duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <BarChart3 className="w-5 h-5 text-cyber-cyan animate-pulse" />
            <span className="font-mono font-bold text-cyan-400 tracking-wider text-sm">TIME_LOG</span>
          </div>
          <p className="text-3xl font-cyber font-black neon-cyan">{formatTime(totalTime)}</p>
          <p className="text-xs text-cyan-300 font-mono mt-1">ACCUMULATED</p>
        </div>
        
        <div className="cyber-card p-6 hover:border-matrix-500 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <Zap className="w-5 h-5 text-matrix-500 animate-pulse" />
            <span className="font-mono font-bold text-matrix-600 tracking-wider text-sm">EARNINGS</span>
          </div>
          <p className="text-3xl font-cyber font-black matrix-text">${totalEarnings.toFixed(2)}</p>
          <p className="text-xs text-matrix-700 font-mono mt-1">GROSS_TOTAL</p>
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-3 h-3 bg-matrix-500 rounded-full animate-pulse"></div>
          <h3 className="text-xl font-cyber font-bold matrix-text tracking-wider">
            TRANSMISSION_OPTIONS
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Detailed Time Blocks Export */}
          <div className="cyber-card p-6 hover:border-matrix-500 transition-all duration-300">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 border-2 border-matrix-500 rounded-lg bg-matrix-500/20">
                <FileText size={24} className="text-matrix-500" />
              </div>
              <div>
                <h4 className="text-lg font-cyber font-bold matrix-text tracking-wider">
                  DETAILED_SESSIONS.CSV
                </h4>
                <p className="text-sm text-matrix-600 font-mono">All time blocks with timestamps</p>
              </div>
            </div>
            <p className="text-sm text-matrix-600 font-mono mb-6 leading-relaxed">
              &gt; Exports comprehensive CSV with every time tracking session including 
              start/end times, duration, and earnings calculations.
            </p>
            <button
              onClick={handleExportTimeBlocks}
              disabled={isExporting}
              className={`cyber-button w-full group flex items-center justify-center space-x-3 px-6 py-4 ${
                isExporting 
                  ? 'border-terminal-medium text-terminal-medium opacity-50 cursor-not-allowed' 
                  : 'border-matrix-500 text-matrix-500 hover:bg-matrix-500 hover:text-black'
              } transition-all duration-300`}
            >
              <Download size={18} className={isExporting ? '' : 'group-hover:animate-bounce'} />
              <span className="font-mono tracking-wider">
                {isExporting ? 'TRANSMITTING...' : 'EXPORT SESSIONS'}
              </span>
            </button>
          </div>

          {/* Project Summary Export */}
          <div className="cyber-card p-6 hover:border-cyber-cyan transition-all duration-300">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 border-2 border-cyber-cyan rounded-lg bg-cyber-cyan/20">
                <BarChart3 size={24} className="text-cyber-cyan" />
              </div>
              <div>
                <h4 className="text-lg font-cyber font-bold neon-cyan tracking-wider">
                  PROJECT_SUMMARY.CSV
                </h4>
                <p className="text-sm text-cyan-400 font-mono">Aggregated project statistics</p>
              </div>
            </div>
            <p className="text-sm text-matrix-600 font-mono mb-6 leading-relaxed">
              &gt; Exports summary CSV with total time, earnings, and statistical 
              analysis for each project in the database.
            </p>
            <button
              onClick={handleExportProjectSummary}
              disabled={isExporting}
              className={`cyber-button w-full group flex items-center justify-center space-x-3 px-6 py-4 ${
                isExporting 
                  ? 'border-terminal-medium text-terminal-medium opacity-50 cursor-not-allowed' 
                  : 'border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-black'
              } transition-all duration-300`}
            >
              <Download size={18} className={isExporting ? '' : 'group-hover:animate-bounce'} />
              <span className="font-mono tracking-wider">
                {isExporting ? 'TRANSMITTING...' : 'EXPORT SUMMARY'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Export Format Info */}
      <div className="mt-8 terminal-window p-6 bg-terminal-black border-2 border-matrix-800">
        <div className="flex items-center space-x-3 mb-6">
          <Cpu className="w-5 h-5 text-matrix-500 animate-pulse" />
          <h4 className="text-lg font-cyber font-bold matrix-text tracking-wider">
            FORMAT_SPECIFICATIONS
          </h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm font-mono">
          <div className="space-y-4">
            <p className="font-bold matrix-text text-base tracking-wider mb-3">
              DETAILED_SESSIONS.CSV:
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-matrix-500 rounded-full animate-pulse"></div>
                <span className="text-matrix-600">PROJECT_NAME</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-matrix-500 rounded-full animate-pulse"></div>
                <span className="text-matrix-600">START_TIMESTAMP</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-matrix-500 rounded-full animate-pulse"></div>
                <span className="text-matrix-600">END_TIMESTAMP</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-matrix-500 rounded-full animate-pulse"></div>
                <span className="text-matrix-600">DURATION_HOURS</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-matrix-500 rounded-full animate-pulse"></div>
                <span className="text-matrix-600">RATE_EARNINGS</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="font-bold neon-cyan text-base tracking-wider mb-3">
              PROJECT_SUMMARY.CSV:
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"></div>
                <span className="text-matrix-600">PROJECT_RATE</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"></div>
                <span className="text-matrix-600">TOTAL_TIME_SESSIONS</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"></div>
                <span className="text-matrix-600">TOTAL_EARNINGS</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"></div>
                <span className="text-matrix-600">AVERAGE_SESSION</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"></div>
                <span className="text-matrix-600">TAX_CALCULATIONS</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="mt-6 p-3 border-2 border-matrix-800 rounded bg-terminal-dark">
          <div className="flex items-center justify-between text-xs font-mono text-matrix-600">
            <div className="flex items-center space-x-4">
              <span>FORMAT:</span>
              <span className="text-matrix-500">CSV_STANDARD</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>ENCODING:</span>
              <span className="text-matrix-500">UTF-8</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>STATUS:</span>
              <span className="text-matrix-500 animate-pulse">READY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportManager;