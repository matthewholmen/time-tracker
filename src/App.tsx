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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Time Tracker
          </h1>
          <p className="text-gray-600">
            Track your billable hours and calculate earnings across projects
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
        
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Built with React + TypeScript • Data stored locally in your browser
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
