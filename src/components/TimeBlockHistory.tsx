import React, { useState } from 'react';
import { Clock, DollarSign, Calendar, ChevronDown, ChevronUp, Calculator } from 'lucide-react';
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
    <div className="glass rounded-3xl shadow-glass p-8 mb-12 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Session History</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-3 px-6 py-3 glass hover:shadow-soft rounded-2xl transition-all duration-300 transform hover:scale-105 font-semibold text-slate-700"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className={`grid grid-cols-1 ${taxSettings.includeInDisplays && totalEarnings > 0 ? 'md:grid-cols-2 lg:grid-cols-5' : 'md:grid-cols-3'} gap-6 mb-8`}>
        <div className="glass rounded-2xl p-6 hover:shadow-soft transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-3 text-primary-600 mb-3">
            <div className="p-2 bg-primary-100 rounded-xl">
              <Calendar size={20} />
            </div>
            <span className="font-semibold">Total Sessions</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalSessions}</p>
        </div>
        <div className="glass rounded-2xl p-6 hover:shadow-soft transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-3 text-accent-cyan mb-3">
            <div className="p-2 bg-cyan-100 rounded-xl">
              <Clock size={20} />
            </div>
            <span className="font-semibold">Total Time</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{formatTime(totalTime)}</p>
        </div>
        <div className="glass rounded-2xl p-6 hover:shadow-soft transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-3 text-accent-emerald mb-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <DollarSign size={20} />
            </div>
            <span className="font-semibold">Total Earnings</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">${totalEarnings.toFixed(2)}</p>
        </div>
        {taxSettings.includeInDisplays && totalEarnings > 0 && (
          <>
            <div className="glass rounded-2xl p-6 hover:shadow-soft transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-3 text-red-600 mb-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <Calculator size={20} />
                </div>
                <span className="font-semibold">Est. Taxes</span>
              </div>
              <p className="text-3xl font-bold text-slate-800">${totalTaxCalc.taxAmount.toFixed(2)}</p>
            </div>
            <div className="glass rounded-2xl p-6 hover:shadow-soft transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-3 text-green-600 mb-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <DollarSign size={20} />
                </div>
                <span className="font-semibold">After Taxes</span>
              </div>
              <p className="text-3xl font-bold text-slate-800">${totalTaxCalc.netEarnings.toFixed(2)}</p>
            </div>
          </>
        )}
      </div>

      {isExpanded && (
        <>
          {/* Filter Dropdown */}
          {projects.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Filter by Project:
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 text-slate-800 font-medium"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Time Blocks List */}
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {totalSessions === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                  <Clock size={32} className="text-slate-500" />
                </div>
                <p className="text-slate-500 text-lg font-medium">
                  No time sessions recorded yet. Start tracking to see your history!
                </p>
              </div>
            ) : (
              Object.entries(groupedBlocks).map(([date, blocks]) => (
                <div key={date} className="glass rounded-2xl p-6 hover:shadow-soft transition-all duration-300">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-gradient-primary rounded-full mr-3"></div>
                    {date}
                  </h3>
                  <div className="space-y-3">
                    {blocks.map(block => (
                      <div 
                        key={block.id} 
                        className="flex justify-between items-center p-4 glass rounded-xl hover:shadow-soft transition-all duration-300"
                      >
                        <div>
                          <p className="font-bold text-slate-800 mb-1">{block.projectName}</p>
                          <p className="text-sm text-slate-600">
                            {formatDateTime(new Date(block.startTime))} - {formatDateTime(new Date(block.endTime))}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">{formatTime(block.duration)}</p>
                          <p className="text-sm text-accent-emerald font-bold">${block.earnings.toFixed(2)}</p>
                          <p className="text-xs text-slate-500">${block.rate}/hr</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex justify-between text-sm font-bold text-slate-700">
                      <span>Day Total:</span>
                      <span className="text-right">
                        <div>{formatTime(blocks.reduce((sum, b) => sum + b.duration, 0))}</div>
                        <div className="text-accent-emerald">${blocks.reduce((sum, b) => sum + b.earnings, 0).toFixed(2)}</div>
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