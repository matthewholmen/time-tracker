import React, { useState } from 'react';
import { Clock, DollarSign, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Project, TimeBlock } from '../types';
import { formatDateForExport } from '../utils/projectUtils';

interface TimeBlockHistoryProps {
  projects: Project[];
  currentProject: Project | null;
}

const TimeBlockHistory: React.FC<TimeBlockHistoryProps> = ({ projects, currentProject }) => {
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

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Session History</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-800">
            <Calendar size={16} />
            <span className="text-sm font-medium">Total Sessions</span>
          </div>
          <p className="text-lg font-bold text-blue-900">{totalSessions}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2 text-green-800">
            <Clock size={16} />
            <span className="text-sm font-medium">Total Time</span>
          </div>
          <p className="text-lg font-bold text-green-900">{formatTime(totalTime)}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2 text-purple-800">
            <DollarSign size={16} />
            <span className="text-sm font-medium">Total Earnings</span>
          </div>
          <p className="text-lg font-bold text-purple-900">${totalEarnings.toFixed(2)}</p>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Filter Dropdown */}
          {projects.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Project:
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {totalSessions === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No time sessions recorded yet. Start tracking to see your history!
              </p>
            ) : (
              Object.entries(groupedBlocks).map(([date, blocks]) => (
                <div key={date} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-3 border-b border-gray-100 pb-2">
                    {date}
                  </h3>
                  <div className="space-y-2">
                    {blocks.map(block => (
                      <div 
                        key={block.id} 
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{block.projectName}</p>
                          <p className="text-sm text-gray-600">
                            {formatDateTime(new Date(block.startTime))} - {formatDateTime(new Date(block.endTime))}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-800">{formatTime(block.duration)}</p>
                          <p className="text-sm text-green-600 font-medium">${block.earnings.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">${block.rate}/hr</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <div className="flex justify-between text-sm font-medium text-gray-700">
                      <span>Day Total:</span>
                      <span>
                        {formatTime(blocks.reduce((sum, b) => sum + b.duration, 0))} • 
                        ${blocks.reduce((sum, b) => sum + b.earnings, 0).toFixed(2)}
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