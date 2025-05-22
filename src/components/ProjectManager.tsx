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
                    className="p-3 cursor-pointer"
                    onClick={() => onProjectSelect(project)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{project.name}</h3>
                        <p className="text-sm text-gray-600">
                          ${project.rate}/hour • {formatTime(project.totalTime)} tracked • ${project.totalEarnings.toFixed(2)} earned
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedProject(expandedProject === project.id ? null : project.id);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {expandedProject === project.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditStart(project);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id, project.name);
                          }}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Project Details */}
                  {expandedProject === project.id && (
                    <div className="px-3 pb-3 border-t border-gray-200">
                      <div className="mt-3">
                        {project.timeBlocks.length === 0 ? (
                          <p className="text-gray-500 text-sm text-center py-4">
                            No time blocks recorded for this project yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Time Blocks</h4>
                            <div className="max-h-48 overflow-y-auto space-y-1">
                              {project.timeBlocks
                                .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                                .map((block) => (
                                <div key={block.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                  <div>
                                    <p className="text-gray-800">
                                      {formatDateTime(new Date(block.startTime))} - {formatDateTime(new Date(block.endTime))}
                                    </p>
                                    <p className="text-gray-600 text-xs">
                                      {new Date(block.startTime).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium text-gray-800">{formatTime(block.duration)}</p>
                                    <p className="text-green-600 font-medium text-xs">${block.earnings.toFixed(2)}</p>
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
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Active Project:</strong> {currentProject.name} (${currentProject.rate}/hour)
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;