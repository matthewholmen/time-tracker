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
    <div className="terminal-window shadow-neon-green p-6 mb-12 animate-fade-in">
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
                    className={`p-6 ${isTimerRunning && currentProject?.id !== project.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                      
                      {/* Cyber Actions */}
                      <div className="flex items-center ml-4">
                        {/* Desktop: Individual buttons */}
                        <div className="hidden sm:flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedProject(expandedProject === project.id ? null : project.id);
                            }}
                            className="cyber-button p-2 border-matrix-600 text-matrix-600 hover:bg-matrix-600 hover:text-black"
                          >
                            {expandedProject === project.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStart(project);
                            }}
                            className="cyber-button p-2 border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-black"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id, project.name);
                            }}
                            className="cyber-button p-2 border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-black"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        {/* Mobile: Dropdown menu */}
                        <div className="relative sm:hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowProjectActions(showProjectActions === project.id ? null : project.id);
                            }}
                            className="cyber-button p-2 border-matrix-600 text-matrix-600 hover:bg-matrix-600 hover:text-black"
                          >
                            <MoreVertical size={18} />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {showProjectActions === project.id && (
                            <div className="absolute right-0 top-full mt-2 w-56 terminal-window py-2 z-10 border-2 border-matrix-500">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedProject(expandedProject === project.id ? null : project.id);
                                  setShowProjectActions(null);
                                }}
                                className="w-full px-4 py-3 text-left matrix-text hover:bg-matrix-500/20 transition-colors flex items-center space-x-3 font-mono"
                              >
                                {expandedProject === project.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                <span>{expandedProject === project.id ? 'HIDE SESSIONS' : 'SHOW SESSIONS'}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditStart(project);
                                }}
                                className="w-full px-4 py-3 text-left neon-cyan hover:bg-cyan-500/20 transition-colors flex items-center space-x-3 font-mono"
                              >
                                <Edit2 size={16} />
                                <span>EDIT PROJECT</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProject(project.id, project.name);
                                }}
                                className="w-full px-4 py-3 text-left text-cyber-red hover:bg-red-500/20 transition-colors flex items-center space-x-3 font-mono"
                              >
                                <Trash2 size={16} />
                                <span>DELETE PROJECT</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Project Details */}
                  {expandedProject === project.id && (
                    <div className="px-6 pb-6 border-t-2 border-matrix-800">
                      <div className="mt-6">
                        {project.timeBlocks.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-matrix-600 rounded-lg flex items-center justify-center">
                              <div className="w-8 h-8 border-2 border-matrix-600 rounded-full animate-pulse"></div>
                            </div>
                            <p className="matrix-text font-mono font-bold mb-2">
                              &gt; NO SESSIONS RECORDED
                            </p>
                            <p className="text-matrix-600 text-sm font-mono">
                              Initialize timer to log session data
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3 mb-6">
                              <div className="w-3 h-3 bg-matrix-500 rounded-full animate-pulse"></div>
                              <h4 className="font-cyber font-bold matrix-text tracking-wider">
                                SESSION LOG ({project.timeBlocks.length})
                              </h4>
                            </div>
                            <div className="space-y-3">
                              {project.timeBlocks
                                .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                                .map((block) => (
                                <div key={block.id} className="terminal-window p-4 hover:border-matrix-500 transition-all duration-300 group">
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                                    <div className="flex-1 min-w-0">
                                      <p className="matrix-text font-mono font-bold text-sm mb-1">
                                        {formatDateTime(new Date(block.startTime))} → {formatDateTime(new Date(block.endTime))}
                                      </p>
                                      <p className="text-matrix-600 font-mono text-xs">
                                        DATE: {new Date(block.startTime).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end space-x-4">
                                      <div className="text-right">
                                        <p className="font-mono font-bold matrix-text text-sm">{formatTime(block.duration)}</p>
                                        <p className="neon-cyan font-mono font-bold text-xs">${block.earnings.toFixed(2)}</p>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTimeBlockDelete(project.id, block.id);
                                        }}
                                        className="opacity-70 sm:opacity-0 group-hover:opacity-100 cyber-button p-2 border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-black"
                                        title="Delete session"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
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