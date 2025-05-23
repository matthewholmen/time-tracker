import React, { useState } from 'react';
import ProjectManager from './components/ProjectManager';
import EnhancedTimer from './components/EnhancedTimer';
import TimeBlockHistory from './components/TimeBlockHistory';
import ExportManager from './components/ExportManager';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Project } from './types';
import { createProject, createTimeBlock, updateProjectWithTimeBlock } from './utils/projectUtils';

function App() {
  const [projects, setProjects] = useLocalStorage<Project[]>('time-tracker-projects', []);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Update current project when projects change
  React.useEffect(() => {
    if (projects.length > 0 && !currentProject) {
      setCurrentProject(projects[0]);
    } else if (currentProject && projects.length > 0) {
      // Update current project reference when projects are updated
      const updatedCurrentProject = projects.find(p => p.id === currentProject.id);
      if (updatedCurrentProject) {
        setCurrentProject(updatedCurrentProject);
      }
    }
  }, [projects, currentProject]);


  const handleProjectCreate = (name: string, rate: number) => {
    const newProject = createProject(name, rate);
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    
    // Auto-select the first project if none is selected
    if (!currentProject) {
      setCurrentProject(newProject);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    const updatedProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    setProjects(updatedProjects);
    
    // Update current project if it's the one being edited
    if (currentProject?.id === updatedProject.id) {
      setCurrentProject(updatedProject);
    }
  };

  const handleProjectDelete = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    
    // If we deleted the current project, select another one or set to null
    if (currentProject?.id === projectId) {
      setCurrentProject(updatedProjects.length > 0 ? updatedProjects[0] : null);
    }
  };

  const handleSessionComplete = (startTime: Date, endTime: Date, duration: number, earnings: number) => {
    if (!currentProject) return;

    const timeBlock = createTimeBlock(startTime, endTime, currentProject.rate);
    const updatedProject = updateProjectWithTimeBlock(currentProject, timeBlock);
    
    handleProjectUpdate(updatedProject);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-primary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-warning rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-12 max-w-5xl">
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-6xl font-bold gradient-text mb-4 tracking-tight">
            Time Tracker
          </h1>
          <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Track your billable hours and calculate earnings across projects with style
          </p>
        </header>
        
        <EnhancedTimer
          currentProject={currentProject}
          onSessionComplete={handleSessionComplete}
        />
        
        <ProjectManager
          projects={projects}
          currentProject={currentProject}
          onProjectSelect={handleProjectSelect}
          onProjectCreate={handleProjectCreate}
          onProjectUpdate={handleProjectUpdate}
          onProjectDelete={handleProjectDelete}
        />
        
        <TimeBlockHistory
          projects={projects}
          currentProject={currentProject}
        />
        
        <ExportManager
          projects={projects}
        />
        
        <footer className="mt-16 text-center text-slate-500 text-sm animate-fade-in">
          <div className="glass rounded-xl p-6 max-w-md mx-auto">
            <p className="font-medium">
              Built with React + TypeScript
            </p>
            <p className="text-xs mt-1 opacity-75">
              Data stored securely in your browser
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
