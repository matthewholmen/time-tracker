import React, { useState } from 'react';
import { Plus, Edit2, Check, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Project } from '../types';

interface ProjectManagerProps {
  projects: Project[];
  currentProject: Project | null;
  onProjectSelect: (project: Project) => void;
  onProjectCreate: (name: string, rate: number) => void;
  onProjectUpdate: (project: Project) => void;
  onProjectDelete: (projectId: string) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  currentProject,
  onProjectSelect,
  onProjectCreate,
  onProjectUpdate,
  onProjectDelete,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectRate, setNewProjectRate] = useState('');
  const [editName, setEditName] = useState('');
  const [editRate, setEditRate] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(newProjectRate);
    
    if (newProjectName.trim() && rate > 0) {
      // Check for duplicate names
      const exists = projects.some(p => p.name.toLowerCase() === newProjectName.trim().toLowerCase());
      if (exists) {
        alert('A project with this name already exists');
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
        alert('A project with this name already exists');
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
    if (window.confirm(`Are you sure you want to delete "${projectName}"? This will permanently remove all time tracking data for this project.`)) {
      onProjectDelete(projectId);
      setExpandedProject(null);
    }
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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Projects</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Plus size={16} />
          <span>Add Project</span>
        </button>
      </div>

      {/* Create New Project Form */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <input
              type="text"
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              placeholder="Hourly rate ($)"
              value={newProjectRate}
              onChange={(e) => setNewProjectRate(e.target.value)}
              min="0"
              step="0.01"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex items-center space-x-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Check size={16} />
              <span>Create</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewProjectName('');
                setNewProjectRate('');
              }}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      )}

      {/* Projects List */}
      <div className="space-y-2">
        {projects.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No projects yet. Create your first project to get started!</p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className={`rounded-lg border-2 transition-colors ${
                currentProject?.id === project.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {editingProject === project.id ? (
                <div className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <input
                      type="number"
                      value={editRate}
                      onChange={(e) => setEditRate(e.target.value)}
                      min="0"
                      step="0.01"
                      className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSubmit(project);
                      }}
                      className="flex items-center space-x-1 px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                    >
                      <Check size={14} />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCancel();
                      }}
                      className="flex items-center space-x-1 px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                    >
                      <X size={14} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => onProjectSelect(project)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-800">{project.name}</h3>
                          {currentProject?.id === project.id && (
                            <span className="px-3 py-1 bg-gradient-primary text-white text-xs font-semibold rounded-full">ACTIVE</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center text-slate-600">
                            <span className="font-semibold text-primary-600">${project.rate}</span>/hour
                          </span>
                          <span className="flex items-center text-slate-600">
                            <span className="font-semibold text-accent-cyan">{formatTime(project.totalTime)}</span> tracked
                          </span>
                          <span className="flex items-center text-slate-600">
                            <span className="font-semibold text-accent-emerald">${project.totalEarnings.toFixed(2)}</span> earned
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedProject(expandedProject === project.id ? null : project.id);
                          }}
                          className="p-3 glass rounded-xl text-slate-600 hover:text-slate-800 transition-all duration-300 hover:scale-110"
                        >
                          {expandedProject === project.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditStart(project);
                          }}
                          className="p-3 glass rounded-xl text-primary-600 hover:text-primary-800 transition-all duration-300 hover:scale-110"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id, project.name);
                          }}
                          className="p-3 glass rounded-xl text-red-500 hover:text-red-700 transition-all duration-300 hover:scale-110"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Project Details */}
                  {expandedProject === project.id && (
                    <div className="px-6 pb-6 border-t border-white/20">
                      <div className="mt-6">
                        {project.timeBlocks.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                              <div className="w-6 h-6 bg-slate-400 rounded-full"></div>
                            </div>
                            <p className="text-slate-500 font-medium">
                              No time blocks recorded for this project yet.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <h4 className="font-bold text-slate-700 mb-4 flex items-center">
                              <div className="w-2 h-2 bg-gradient-primary rounded-full mr-3"></div>
                              Time Blocks ({project.timeBlocks.length})
                            </h4>
                            <div className="max-h-64 overflow-y-auto space-y-3">
                              {project.timeBlocks
                                .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                                .map((block) => (
                                <div key={block.id} className="glass rounded-xl p-4 hover:shadow-soft transition-all duration-300">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="text-slate-800 font-medium">
                                        {formatDateTime(new Date(block.startTime))} - {formatDateTime(new Date(block.endTime))}
                                      </p>
                                      <p className="text-slate-500 text-sm mt-1">
                                        {new Date(block.startTime).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-slate-800">{formatTime(block.duration)}</p>
                                      <p className="text-accent-emerald font-bold text-sm">${block.earnings.toFixed(2)}</p>
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
          ))
        )}
      </div>

      {/* Current Project Info */}
      {currentProject && (
        <div className="mt-8 p-6 bg-gradient-primary rounded-2xl text-white animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm font-medium mb-1">Currently Active</p>
              <p className="text-xl font-bold">
                {currentProject.name} 
              </p>
              <p className="text-white/80 text-sm">
                ${currentProject.rate}/hour • {formatTime(currentProject.totalTime)} total
              </p>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;