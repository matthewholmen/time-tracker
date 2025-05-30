import React, { useState } from 'react';
import { Plus, Edit2, Check, X, Trash2, ChevronDown, ChevronUp, MoreVertical, Database, Zap, Shield } from 'lucide-react';
import { Project } from '../types';
import { getProjectGradientClasses } from '../utils/gradientUtils';
import ConfirmDialog from './ConfirmDialog';
import Notification from './Notification';

interface ProjectManagerProps {
  projects: Project[];
  currentProject: Project | null;
  isTimerRunning?: boolean;
  taxSettings?: any;
  onProjectSelect: (project: Project) => void;
  onProjectCreate: (name: string, rate: number) => void;
  onProjectUpdate: (project: Project) => void;
  onProjectDelete: (projectId: string) => void;
  onTimeBlockDelete?: (projectId: string, blockId: string) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  currentProject,
  isTimerRunning = false,
  taxSettings,
  onProjectSelect,
  onProjectCreate,
  onProjectUpdate,
  onProjectDelete,
  onTimeBlockDelete,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showProjectActions, setShowProjectActions] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectRate, setNewProjectRate] = useState('');
  const [editName, setEditName] = useState('');
  const [editRate, setEditRate] = useState('');
  
  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
  }>({ isOpen: false, title: '', message: '', type: 'info' });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(newProjectRate);
    
    if (newProjectName.trim() && rate > 0) {
      // Check for duplicate names
      const exists = projects.some(p => p.name.toLowerCase() === newProjectName.trim().toLowerCase());
      if (exists) {
        setNotification({
          isOpen: true,
          title: '[ERROR] Duplicate Entry',
          message: 'Project name already exists in Matrix database. Select unique identifier.',
          type: 'error'
        });
        return;
      }
      
      onProjectCreate(newProjectName.trim(), rate);
      setNotification({
        isOpen: true,
        title: '[SUCCESS] Project Created',
        message: `Project "${newProjectName.trim()}" has been added to the Matrix database.`,
        type: 'success'
      });
      setNewProjectName('');
      setNewProjectRate('');
      setIsCreating(false);
    }
  };

  const handleEditStart = (project: Project) => {
    setEditingProject(project.id);
    setEditName(project.name);
    setEditRate(project.rate.toString());
    setShowProjectActions(null);
  };

  const handleEditSubmit = (project: Project) => {
    const rate = parseFloat(editRate);
    
    if (editName.trim() && rate > 0) {
      // Check for duplicate names (excluding current project)
      const exists = projects.some(p => 
        p.id !== project.id && 
        p.name.toLowerCase() === editName.trim().toLowerCase()
      );
      if (exists) {
        setNotification({
          isOpen: true,
          title: '[ERROR] Duplicate Entry',
          message: 'Project name already exists in Matrix database. Select unique identifier.',
          type: 'error'
        });
        return;
      }
      
      onProjectUpdate({
        ...project,
        name: editName.trim(),
        rate: rate
      });
      setNotification({
        isOpen: true,
        title: '[SUCCESS] Project Updated',
        message: `Project data successfully modified in Matrix database.`,
        type: 'success'
      });
      setEditingProject(null);
    }
  };

  const handleEditCancel = () => {
    setEditingProject(null);
    setEditName('');
    setEditRate('');
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    setShowProjectActions(null);
    setConfirmDialog({
      isOpen: true,
      title: '[WARNING] Delete Project',
      message: `Confirm deletion of project "${projectName}" from Matrix database. This will permanently erase all time tracking data and cannot be undone.`,
      onConfirm: () => {
        onProjectDelete(projectId);
        setExpandedProject(null);
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
      }
    });
  };

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatTimeSummary = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const calculateTax = (earnings: number, rate: number) => {
    const taxAmount = (earnings * rate) / 100;
    return {
      taxAmount,
      netEarnings: earnings - taxAmount
    };
  };

  const handleTimeBlockDelete = (projectId: string, blockId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: '[WARNING] Delete Session',
      message: 'Confirm deletion of time block from Matrix database. This operation cannot be reversed.',
      onConfirm: () => {
        onTimeBlockDelete?.(projectId, blockId);
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
      }
    });
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

  return (
    <div className="mb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <Database className="w-6 h-6 matrix-text animate-pulse" />
          <h2 className="text-2xl font-cyber font-black matrix-text tracking-wider">
            PROJECT DATABASE
          </h2>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="cyber-button flex items-center justify-center space-x-3 px-6 py-3 w-full sm:w-auto"
        >
          <Plus size={18} />
          <span>NEW PROJECT</span>
        </button>
      </div>

      {/* Create New Project Form */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="mb-6 cyber-card p-6">
          <div className="border-l-4 border-matrix-500 pl-4 mb-6">
            <h3 className="text-lg font-cyber font-bold matrix-text tracking-wide">
              &gt; CREATE_PROJECT.EXE
            </h3>
            <p className="text-sm text-matrix-600 font-mono mt-1">
              Initialize new project in Matrix database
            </p>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="PROJECT_NAME"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="cyber-input w-full"
              required
            />
            <input
              type="number"
              placeholder="HOURLY_RATE ($)"
              value={newProjectRate}
              onChange={(e) => setNewProjectRate(e.target.value)}
              min="0"
              step="0.01"
              className="cyber-input w-full"
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
            <button
              type="submit"
              className="cyber-button border-matrix-500 text-matrix-500 hover:bg-matrix-500 hover:text-black flex items-center justify-center space-x-2"
            >
              <Check size={18} />
              <span>EXECUTE</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewProjectName('');
                setNewProjectRate('');
              }}
              className="cyber-button border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-black flex items-center justify-center space-x-2"
            >
              <X size={18} />
              <span>ABORT</span>
            </button>
          </div>
        </form>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 border-2 border-dashed border-matrix-500 rounded-lg flex items-center justify-center">
              <Database size={32} className="text-matrix-500 animate-pulse" />
            </div>
            <p className="matrix-text text-lg font-mono font-bold mb-2">
              &gt; DATABASE EMPTY
            </p>
            <p className="text-matrix-600 text-sm font-mono">
              Initialize first project to begin Matrix operations
            </p>
          </div>
        ) : (
          projects.map((project, index) => {
            const isSelected = currentProject?.id === project.id;
            
            return (
            <div
              key={project.id}
              className={`cyber-card transition-all duration-300 ${
                isSelected
                  ? 'border-matrix-500 shadow-neon-green'
                  : 'border-terminal-medium hover:border-matrix-600'
              }`}
            >
              {editingProject === project.id ? (
                <div className="p-6">
                  <div className="border-l-4 border-cyber-cyan pl-4 mb-6">
                    <h3 className="text-lg font-cyber font-bold neon-cyan tracking-wide">
                      &gt; EDIT_PROJECT.EXE
                    </h3>
                    <p className="text-sm text-cyan-400 font-mono mt-1">
                      Modify project data in Matrix database
                    </p>
                  </div>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="cyber-input w-full"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <input
                      type="number"
                      value={editRate}
                      onChange={(e) => setEditRate(e.target.value)}
                      min="0"
                      step="0.01"
                      className="cyber-input w-full"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSubmit(project);
                      }}
                      className="cyber-button border-matrix-500 text-matrix-500 hover:bg-matrix-500 hover:text-black flex items-center justify-center space-x-2"
                    >
                      <Check size={16} />
                      <span>SAVE</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCancel();
                      }}
                      className="cyber-button border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-black flex items-center justify-center space-x-2"
                    >
                      <X size={16} />
                      <span>CANCEL</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div 
                    className={`${isTimerRunning && currentProject?.id !== project.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => {
                      if (isTimerRunning && currentProject?.id !== project.id) {
                        setNotification({
                          isOpen: true,
                          title: '[ERROR] Timer Active',
                          message: 'Cannot switch projects while neural link is active. Terminate current session first.',
                          type: 'warning'
                        });
                        return;
                      }
                      onProjectSelect(project);
                    }}
                  >
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                      {/* Header with status and project name */}
                      <div className="p-3">
                        {/* Active status at top if applicable */}
                        {currentProject?.id === project.id && (
                          <div className="mb-2">
                            <span className="px-2 py-1 bg-matrix-500 text-black text-xs font-mono font-bold rounded border border-matrix-500 animate-pulse">
                              ACTIVE
                            </span>
                          </div>
                        )}
                        
                        {/* Project name */}
                        <h3 className={`text-lg font-cyber font-black tracking-wider mb-3 ${
                          currentProject?.id === project.id ? 'matrix-text glitch-text' : 'text-matrix-600'
                        }`}>
                          {project.name.toUpperCase()}
                        </h3>
                        
                        {/* Key stats in a clean row */}
                        <div className="flex items-center justify-between text-sm font-mono">
                          <div className="flex items-center space-x-2">
                            <Zap className="w-4 h-4 text-cyber-yellow animate-pulse" />
                            <span className={currentProject?.id === project.id ? 'neon-cyan' : 'text-matrix-600'}>
                              <span className="font-bold">${project.rate}</span>/HR
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"></div>
                            <span className={currentProject?.id === project.id ? 'neon-cyan' : 'text-matrix-600'}>
                              <span className="font-bold">${project.totalEarnings.toFixed(2)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom section with secondary stats and actions */}
                      <div className="px-3 pb-3">
                        <div className="flex items-start justify-between">
                          {/* Secondary stats - more breathing room */}
                          <div className="flex flex-col space-y-1.5 text-xs font-mono text-matrix-600 min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-matrix-500 rounded-full animate-pulse"></div>
                              <span>{formatTimeSummary(project.totalTime)} logged</span>
                            </div>
                            {taxSettings?.includeInDisplays && project.totalEarnings > 0 && (
                              <div className="flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-cyber-purple rounded-full animate-pulse"></div>
                                <span>${calculateTax(project.totalEarnings, taxSettings.taxRate).netEarnings.toFixed(2)} net</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Cyber-style action buttons */}
                          <div className="flex items-center space-x-4 ml-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedProject(expandedProject === project.id ? null : project.id);
                              }}
                              className="text-matrix-500 hover:text-matrix-400 transition-colors p-1"
                              title={expandedProject === project.id ? 'Hide sessions' : 'Show sessions'}
                            >
                              {expandedProject === project.id ? (
                                <div className="flex items-center space-x-1 text-xs font-mono">
                                  <ChevronUp size={14} />
                                  <span className="hidden sm:inline">HIDE</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1 text-xs font-mono">
                                  <ChevronDown size={14} />
                                  <span className="hidden sm:inline">SESSIONS</span>
                                </div>
                              )}
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowProjectActions(showProjectActions === project.id ? null : project.id);
                              }}
                              className="text-matrix-500 hover:text-matrix-400 transition-colors p-1"
                              title="Project actions"
                            >
                              <div className="flex items-center space-x-1 text-xs font-mono">
                                <MoreVertical size={14} />
                                <span className="hidden sm:inline">OPTS</span>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile Dropdown Menu */}
                      {showProjectActions === project.id && (
                        <div className="border-t border-matrix-800 bg-terminal-black">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStart(project);
                              setShowProjectActions(null);
                            }}
                            className="w-full px-3 py-2 text-left neon-cyan hover:bg-cyan-500/20 transition-colors flex items-center space-x-3 font-mono text-sm border-b border-matrix-800"
                          >
                            <Edit2 size={14} />
                            <span>EDIT PROJECT</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id, project.name);
                            }}
                            className="w-full px-3 py-2 text-left text-cyber-red hover:bg-red-500/20 transition-colors flex items-center space-x-3 font-mono text-sm"
                          >
                            <Trash2 size={14} />
                            <span>DELETE PROJECT</span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Desktop Layout */}
                    <div className="hidden sm:block p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4">
                            <h3 className={`text-xl font-cyber font-black truncate tracking-wider ${
                              currentProject?.id === project.id ? 'matrix-text glitch-text' : 'text-matrix-600'
                            }`}>
                              {project.name.toUpperCase()}
                            </h3>
                            {currentProject?.id === project.id && (
                              <span className="px-3 py-1 bg-matrix-500 text-black text-xs font-mono font-bold rounded border border-matrix-500 whitespace-nowrap animate-pulse">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          
                          {/* Project Stats - Cyber Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm font-mono">
                            <div className="flex items-center space-x-2">
                              <Zap className="w-4 h-4 text-cyber-yellow animate-pulse" />
                              <span className={currentProject?.id === project.id ? 'neon-cyan' : 'text-matrix-600'}>
                                <span className="font-bold">${project.rate}</span>/HR
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-matrix-500 rounded-full animate-pulse"></div>
                              <span className={currentProject?.id === project.id ? 'matrix-text' : 'text-matrix-600'}>
                                <span className="font-bold">{formatTimeSummary(project.totalTime)}</span> LOGGED
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"></div>
                              <span className={currentProject?.id === project.id ? 'neon-cyan' : 'text-matrix-600'}>
                                <span className="font-bold">${project.totalEarnings.toFixed(2)}</span> EARNED
                              </span>
                            </div>
                            {taxSettings?.includeInDisplays && project.totalEarnings > 0 && (
                              <div className="flex items-center space-x-2">
                                <Shield className="w-4 h-4 text-cyber-purple animate-pulse" />
                                <span className={currentProject?.id === project.id ? 'neon-purple' : 'text-matrix-600'}>
                                  <span className="font-bold">${calculateTax(project.totalEarnings, taxSettings.taxRate).netEarnings.toFixed(2)}</span> NET
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Desktop Actions - Match mobile styling */}
                        <div className="flex items-center ml-4 space-x-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedProject(expandedProject === project.id ? null : project.id);
                            }}
                            className="text-matrix-500 hover:text-matrix-400 transition-colors p-1"
                            title={expandedProject === project.id ? 'Hide sessions' : 'Show sessions'}
                          >
                            <div className="flex items-center space-x-1 text-xs font-mono">
                              {expandedProject === project.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStart(project);
                            }}
                            className="text-cyber-cyan hover:text-cyan-400 transition-colors p-1"
                            title="Edit project"
                          >
                            <div className="flex items-center space-x-1 text-xs font-mono">
                              <Edit2 size={16} />
                            </div>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id, project.name);
                            }}
                            className="text-cyber-red hover:text-red-400 transition-colors p-1"
                            title="Delete project"
                          >
                            <div className="flex items-center space-x-1 text-xs font-mono">
                              <Trash2 size={16} />
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Project Details */}
                  {expandedProject === project.id && (
                    <div className="border-t border-matrix-800 bg-terminal-black/50">
                      <div className="p-4">
                        {project.timeBlocks.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 mx-auto mb-3 border border-dashed border-matrix-600 rounded-lg flex items-center justify-center">
                              <div className="w-6 h-6 border border-matrix-600 rounded-full animate-pulse"></div>
                            </div>
                            <p className="matrix-text font-mono font-bold mb-1 text-sm">
                              &gt; NO SESSIONS RECORDED
                            </p>
                            <p className="text-matrix-600 text-xs font-mono">
                              Initialize timer to log session data
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-0">
                            <div className="flex items-center space-x-2 mb-4">
                              <div className="w-2 h-2 bg-matrix-500 rounded-full animate-pulse"></div>
                              <h4 className="font-cyber font-bold matrix-text tracking-wider text-sm">
                                SESSION LOG ({project.timeBlocks.length})
                              </h4>
                            </div>
                            <div>
                              {project.timeBlocks
                                .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                                .map((block, index) => (
                                <div key={block.id}>
                                  <div className="py-3 hover:bg-matrix-900/30 transition-all duration-300 group">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0 pr-3">
                                        <p className="matrix-text font-mono font-bold text-xs mb-1 leading-relaxed">
                                          {formatDateTime(new Date(block.startTime))} → {formatDateTime(new Date(block.endTime))}
                                        </p>
                                        <p className="text-matrix-600 font-mono text-xs">
                                          {new Date(block.startTime).toLocaleDateString()}
                                        </p>
                                        <div className="flex items-center space-x-3 mt-2">
                                          <span className="font-mono font-bold matrix-text text-xs">{formatTime(block.duration)}</span>
                                          <span className="neon-cyan font-mono font-bold text-xs">${block.earnings.toFixed(2)}</span>
                                        </div>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTimeBlockDelete(project.id, block.id);
                                        }}
                                        className="opacity-60 hover:opacity-100 text-cyber-red hover:text-red-400 transition-all p-1"
                                        title="Delete session"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                  {index < project.timeBlocks.length - 1 && (
                                    <div className="border-b border-matrix-800/50"></div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            );
          })
        )}
      </div>

      {/* Overlay to close mobile dropdown */}
      {showProjectActions && (
        <div 
          className="fixed inset-0 z-5 sm:hidden" 
          onClick={() => setShowProjectActions(null)}
        />
      )}
      
      {/* Styled Dialogs */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
        confirmText="EXECUTE"
        cancelText="ABORT"
        type="danger"
      />
      
      <Notification
        isOpen={notification.isOpen}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ isOpen: false, title: '', message: '', type: 'info' })}
      />
    </div>
  );
};

export default ProjectManager;