import React, { useState } from 'react';
import { Clock, DollarSign, Calendar, ChevronDown, ChevronUp, Calculator, Database, Activity, Zap } from 'lucide-react';
import { Project, TimeBlock, TaxSettings } from '../types';
import { formatDateForExport } from '../utils/projectUtils';
import { calculateTax } from '../utils/taxUtils';

interface TimeBlockHistoryProps {
  projects: Project[];
  currentProject: Project | null;
  taxSettings: TaxSettings;
}

const TimeBlockHistory: React.FC<TimeBlockHistoryProps> = ({ projects, currentProject, taxSettings }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('all');

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDateTime = (date: Date): string => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateOnly = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get all time blocks from all projects or selected project
  const getAllTimeBlocks = (): Array<TimeBlock & { projectName: string; projectRate: number }> => {
    const allBlocks: Array<TimeBlock & { projectName: string; projectRate: number }> = [];
    
    const projectsToShow = selectedProject === 'all' 
      ? projects 
      : projects.filter(p => p.id === selectedProject);

    projectsToShow.forEach(project => {
      project.timeBlocks.forEach(block => {
        allBlocks.push({
          ...block,
          projectName: project.name,
          projectRate: project.rate
        });
      });
    });

    // Sort by start time (most recent first)
    return allBlocks.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  };

  // Group time blocks by date
  const groupBlocksByDate = (blocks: Array<TimeBlock & { projectName: string; projectRate: number }>) => {
    const grouped: { [key: string]: Array<TimeBlock & { projectName: string; projectRate: number }> } = {};
    
    blocks.forEach(block => {
      const dateKey = formatDateOnly(new Date(block.startTime));
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(block);
    });

    return grouped;
  };

  const allTimeBlocks = getAllTimeBlocks();
  const groupedBlocks = groupBlocksByDate(allTimeBlocks);
  const totalSessions = allTimeBlocks.length;
  const totalTime = allTimeBlocks.reduce((sum, block) => sum + block.duration, 0);
  const totalEarnings = allTimeBlocks.reduce((sum, block) => sum + block.earnings, 0);
  const totalTaxCalc = calculateTax(totalEarnings, taxSettings);

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="mb-12 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 neon-yellow animate-pulse" />
          <h2 className="text-2xl font-cyber font-black neon-yellow tracking-wider">
            SESSION ARCHIVE
          </h2>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-cyber-yellow hover:text-yellow-400 transition-colors p-2 rounded-lg border border-cyber-yellow/30 hover:border-cyber-yellow/60"
          title={isExpanded ? 'Collapse archive' : 'Expand archive'}
        >
          <div className="flex items-center space-x-2 text-sm font-mono">
            {isExpanded ? <ChevronUp size={18} className="animate-pulse" /> : <ChevronDown size={18} />}
            <span className="hidden sm:inline font-bold tracking-wider">{isExpanded ? 'COLLAPSE' : 'EXPAND'}</span>
          </div>
        </button>
      </div>

      {/* Summary Stats Grid */}
      <div className={`grid grid-cols-1 ${taxSettings.includeInDisplays && totalEarnings > 0 ? 'md:grid-cols-2 lg:grid-cols-5' : 'md:grid-cols-3'} gap-4 mb-8`}>
        <div className="cyber-card p-6 hover:border-matrix-500 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <Calendar className="w-5 h-5 text-matrix-500 animate-pulse" />
            <span className="font-mono font-bold text-matrix-600 tracking-wider text-sm">SESSIONS</span>
          </div>
          <p className="text-3xl font-cyber font-black matrix-text">{totalSessions}</p>
          <p className="text-xs text-matrix-700 font-mono mt-1">TOTAL_COUNT</p>
        </div>
        
        <div className="cyber-card p-6 hover:border-cyber-cyan transition-all duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <Clock className="w-5 h-5 text-cyber-cyan animate-pulse" />
            <span className="font-mono font-bold text-cyan-400 tracking-wider text-sm">TIME_LOG</span>
          </div>
          <p className="text-3xl font-cyber font-black neon-cyan">{formatTime(totalTime)}</p>
          <p className="text-xs text-cyan-300 font-mono mt-1">ACCUMULATED</p>
        </div>
        
        <div className="cyber-card p-6 hover:border-matrix-500 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <DollarSign className="w-5 h-5 text-matrix-500 animate-pulse" />
            <span className="font-mono font-bold text-matrix-600 tracking-wider text-sm">EARNINGS</span>
          </div>
          <p className="text-3xl font-cyber font-black matrix-text">${totalEarnings.toFixed(2)}</p>
          <p className="text-xs text-matrix-700 font-mono mt-1">GROSS_TOTAL</p>
        </div>
        
        {taxSettings.includeInDisplays && totalEarnings > 0 && (
          <>
            <div className="cyber-card p-6 hover:border-cyber-red transition-all duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <Calculator className="w-5 h-5 text-cyber-red animate-pulse" />
                <span className="font-mono font-bold text-red-400 tracking-wider text-sm">TAX_EST</span>
              </div>
              <p className="text-3xl font-cyber font-black text-cyber-red">${totalTaxCalc.taxAmount.toFixed(2)}</p>
              <p className="text-xs text-red-300 font-mono mt-1">DEDUCTION</p>
            </div>
            
            <div className="cyber-card p-6 hover:border-cyber-cyan transition-all duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <Zap className="w-5 h-5 text-cyber-cyan animate-pulse" />
                <span className="font-mono font-bold text-cyan-400 tracking-wider text-sm">NET_TOTAL</span>
              </div>
              <p className="text-3xl font-cyber font-black neon-cyan">${totalTaxCalc.netEarnings.toFixed(2)}</p>
              <p className="text-xs text-cyan-300 font-mono mt-1">AFTER_TAX</p>
            </div>
          </>
        )}
      </div>

      {isExpanded && (
        <>
          {/* Filter Dropdown */}
          {projects.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-mono font-bold matrix-text mb-3 tracking-wider">
                FILTER_PROJECT:
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="cyber-input px-4 py-3 text-sm font-mono"
              >
                <option value="all">ALL_PROJECTS</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Time Blocks List */}
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {totalSessions === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 border-2 border-dashed border-matrix-600 rounded-lg flex items-center justify-center">
                  <Clock size={32} className="text-matrix-600 animate-pulse" />
                </div>
                <p className="matrix-text text-lg font-mono font-bold mb-2">
                  &gt; NO SESSION DATA FOUND
                </p>
                <p className="text-matrix-600 text-sm font-mono">
                  Initialize timer to generate session archives
                </p>
              </div>
            ) : (
              Object.entries(groupedBlocks).map(([date, blocks]) => (
                <div key={date} className="cyber-card p-6 hover:border-matrix-500 transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-3 h-3 bg-matrix-500 rounded-full animate-pulse"></div>
                    <h3 className="text-lg font-cyber font-bold matrix-text tracking-wider">
                      {date.toUpperCase()}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {blocks.map(block => (
                      <div 
                        key={block.id} 
                        className="terminal-window p-4 hover:border-matrix-500 transition-all duration-300"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-mono font-bold matrix-text mb-1 tracking-wider">
                              {block.projectName.toUpperCase()}
                            </p>
                            <p className="text-sm text-matrix-600 font-mono">
                              {formatDateTime(new Date(block.startTime))} → {formatDateTime(new Date(block.endTime))}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold matrix-text">{formatTime(block.duration)}</p>
                            <p className="text-sm neon-cyan font-mono font-bold">${block.earnings.toFixed(2)}</p>
                            <p className="text-xs text-matrix-600 font-mono">${block.rate}/HR</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Day Total */}
                  <div className="mt-6 pt-4 border-t-2 border-matrix-800">
                    <div className="flex justify-between text-sm font-mono font-bold">
                      <span className="matrix-text tracking-wider">DAY_TOTAL:</span>
                      <span className="text-right">
                        <div className="matrix-text">{formatTime(blocks.reduce((sum, b) => sum + b.duration, 0))}</div>
                        <div className="neon-cyan">${blocks.reduce((sum, b) => sum + b.earnings, 0).toFixed(2)}</div>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TimeBlockHistory;