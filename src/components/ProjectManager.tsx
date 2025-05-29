import React, { useState } from 'react';
import { Plus, Edit2, Check, X, Trash2, ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';
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
          title: 'Duplicate Project Name',
          message: 'A project with this name already exists. Please choose a different name.',
          type: 'error'
        });
        return;
      }
      
      onProjectCreate(newProjectName.trim(), rate);
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
          title: 'Duplicate Project Name',
          message: 'A project with this name already exists. Please choose a different name.',
          type: 'error'
        });
        return;
      }
      
      onProjectUpdate({
        ...project,
        name: editName.trim(),
        rate: rate
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
      title: 'Delete Project',
      message: `Are you sure you want to delete "${projectName}"? This will permanently remove all time tracking data for this project.`,
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
      title: 'Delete Session',
      message: 'Are you sure you want to delete this session? This action cannot be undone.',
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
    <div className="glass rounded-3xl shadow-glass p-4 sm:p-8 mb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-slate-800">Projects</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-primary hover:shadow-elevated text-white rounded-2xl transition-all duration-300 transform hover:scale-105 font-semibold w-full sm:w-auto"
        >
          <Plus size={18} />
          <span>Add Project</span>
        </button>
      </div>

      {/* Create New Project Form */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="mb-6 p-4 sm:p-6 glass rounded-2xl">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 text-slate-800 font-medium"
              required
            />
            <input
              type="number"
              placeholder="Hourly rate ($)"
              value={newProjectRate}
              onChange={(e) => setNewProjectRate(e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 text-slate-800 font-medium"
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-4">
            <button
              type="submit"
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-success hover:shadow-elevated text-white rounded-2xl transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <Check size={18} />
              <span>Create</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewProjectName('');
                setNewProjectRate('');
              }}
              className="flex items-center justify-center space-x-2 px-6 py-3 glass hover:shadow-soft text-slate-700 rounded-2xl transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <X size={18} />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
              <Plus size={32} className="text-slate-500" />
            </div>
            <p className="text-slate-500 text-lg font-medium">
              No projects yet. Create your first project to get started!
            </p>
          </div>
        ) : (
          projects.map((project, index) => {
            const gradientClasses = getProjectGradientClasses(index);
            const isSelected = currentProject?.id === project.id;
            
            return (
            <div
              key={project.id}
              className={`rounded-2xl border-2 transition-all duration-300 ${
                isSelected
                  ? `bg-white shadow-sm hover:shadow-md ${gradientClasses.border}`
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {editingProject === project.id ? (
                <div className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 text-slate-800 font-medium"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <input
                      type="number"
                      value={editRate}
                      onChange={(e) => setEditRate(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 text-slate-800 font-medium"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSubmit(project);
                      }}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-success hover:shadow-soft text-white rounded-xl text-sm transition-all duration-300 transform hover:scale-105 font-semibold"
                    >
                      <Check size={16} />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCancel();
                      }}
                      className="flex items-center justify-center space-x-2 px-4 py-2 glass hover:shadow-soft text-slate-700 rounded-xl text-sm transition-all duration-300 transform hover:scale-105 font-semibold"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div 
                    className={`p-4 sm:p-6 ${isTimerRunning && currentProject?.id !== project.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => {
                      if (isTimerRunning && currentProject?.id !== project.id) {
                        setNotification({
                          isOpen: true,
                          title: 'Timer is Running',
                          message: 'Cannot switch projects while timer is running. Please stop the timer first.',
                          type: 'warning'
                        });
                        return;
                      }
                      onProjectSelect(project);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                          <h3 className={`text-lg font-bold truncate ${
                            currentProject?.id === project.id ? 'text-slate-800' : 'text-slate-600'
                          }`}>{project.name}</h3>
                          {currentProject?.id === project.id && (
                            <span className={`px-3 py-1 text-white text-xs font-semibold rounded-full ${gradientClasses.background} whitespace-nowrap`}>ACTIVE</span>
                          )}
                        </div>
                        
                        {/* Project Stats - Mobile Responsive Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                          <span className={`flex items-center ${
                            currentProject?.id === project.id ? 'text-slate-700' : 'text-slate-500'
                          }`}>
                            <span className={`font-semibold ${
                              currentProject?.id === project.id ? 'text-primary-600' : 'text-primary-500'
                            }`}>${project.rate}</span>/hour
                          </span>
                          <span className={`flex items-center ${
                            currentProject?.id === project.id ? 'text-slate-700' : 'text-slate-500'
                          }`}>
                            <span className={`font-semibold ${
                              currentProject?.id === project.id ? 'text-accent-cyan' : 'text-slate-600'
                            }`}>{formatTimeSummary(project.totalTime)}</span> tracked
                          </span>
                          <span className={`flex items-center ${
                            currentProject?.id === project.id ? 'text-slate-700' : 'text-slate-500'
                          }`}>
                            <span className={`font-semibold ${
                              currentProject?.id === project.id ? 'text-accent-emerald' : 'text-slate-600'
                            }`}>${project.totalEarnings.toFixed(2)}</span> earned
                          </span>
                          {taxSettings?.includeInDisplays && project.totalEarnings > 0 && (
                            <span className={`flex items-center ${
                              currentProject?.id === project.id ? 'text-slate-700' : 'text-slate-500'
                            }`}>
                              <span className={`font-semibold ${
                                currentProject?.id === project.id ? 'text-green-600' : 'text-slate-600'
                              }`}>${calculateTax(project.totalEarnings, taxSettings.taxRate).netEarnings.toFixed(2)}</span> after taxes
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Mobile-Friendly Actions */}
                      <div className="flex items-center ml-2">
                        {/* Desktop: Individual buttons */}
                        <div className="hidden sm:flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedProject(expandedProject === project.id ? null : project.id);
                            }}
                            className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                              currentProject?.id === project.id
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                            }`}
                          >
                            {expandedProject === project.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStart(project);
                            }}
                            className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                              currentProject?.id === project.id
                                ? 'bg-slate-100 text-primary-600 hover:bg-slate-200'
                                : 'bg-slate-200 text-primary-500 hover:bg-slate-300'
                            }`}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id, project.name);
                            }}
                            className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                              currentProject?.id === project.id
                                ? 'bg-slate-100 text-red-500 hover:bg-slate-200'
                                : 'bg-slate-200 text-red-400 hover:bg-slate-300'
                            }`}
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
                            className={`p-3 rounded-xl transition-all duration-300 ${
                              currentProject?.id === project.id
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                            }`}
                          >
                            <MoreVertical size={18} />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {showProjectActions === project.id && (
                            <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl shadow-glass border border-white/20 py-2 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedProject(expandedProject === project.id ? null : project.id);
                                  setShowProjectActions(null);
                                }}
                                className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-100 transition-colors flex items-center space-x-3"
                              >
                                {expandedProject === project.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                <span>{expandedProject === project.id ? 'Hide Sessions' : 'Show Sessions'}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditStart(project);
                                }}
                                className="w-full px-4 py-3 text-left text-primary-600 hover:bg-slate-100 transition-colors flex items-center space-x-3"
                              >
                                <Edit2 size={16} />
                                <span>Edit Project</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProject(project.id, project.name);
                                }}
                                className="w-full px-4 py-3 text-left text-red-500 hover:bg-slate-100 transition-colors flex items-center space-x-3"
                              >
                                <Trash2 size={16} />
                                <span>Delete Project</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Project Details */}
                  {expandedProject === project.id && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-white/20">
                      <div className="mt-6">
                        {project.timeBlocks.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                              <div className="w-6 h-6 bg-slate-400 rounded-full"></div>
                            </div>
                            <p className="text-slate-500 font-medium">
                              No sessions recorded for this project yet.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <h4 className="font-bold text-slate-700 mb-4 flex items-center">
                              <div className="w-2 h-2 bg-gradient-primary rounded-full mr-3"></div>
                              Sessions ({project.timeBlocks.length})
                            </h4>
                            <div className="space-y-3">
                              {project.timeBlocks
                                .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                                .map((block) => (
                                <div key={block.id} className="glass rounded-xl p-4 hover:shadow-sm transition-all duration-300 group">
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-slate-800 font-medium text-sm sm:text-base">
                                        {formatDateTime(new Date(block.startTime))} - {formatDateTime(new Date(block.endTime))}
                                      </p>
                                      <p className="text-slate-500 text-xs sm:text-sm mt-1">
                                        {new Date(block.startTime).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end space-x-3">
                                      <div className="text-left sm:text-right">
                                        <p className="font-bold text-slate-800 text-sm sm:text-base">{formatTime(block.duration)}</p>
                                        <p className="text-accent-emerald font-bold text-xs sm:text-sm">${block.earnings.toFixed(2)}</p>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTimeBlockDelete(project.id, block.id);
                                        }}
                                        className="opacity-70 sm:opacity-0 group-hover:opacity-100 p-2 glass rounded-lg text-red-500 hover:text-red-700 transition-all duration-300 hover:scale-110"
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
        confirmText="Delete"
        cancelText="Cancel"
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