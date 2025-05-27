import React, { useState } from 'react';
import ProjectManager from './components/ProjectManager';
import EnhancedTimer from './components/EnhancedTimer';
import TimeBlockHistory from './components/TimeBlockHistory';
import ExportManager from './components/ExportManager';
import TaxSettings from './components/TaxSettings';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Project, TaxSettings as TaxSettingsType } from './types';
import { createProject, createTimeBlock, updateProjectWithTimeBlock } from './utils/projectUtils';
import { DEFAULT_TAX_SETTINGS } from './utils/taxUtils';

function App() {
  const [projects, setProjects] = useLocalStorage<Project[]>('time-tracker-projects', []);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [taxSettings, setTaxSettings] = useLocalStorage<TaxSettingsType>('time-tracker-tax-settings', DEFAULT_TAX_SETTINGS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

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
    setIsTimerRunning(false);
  };

  const handleTimeBlockDelete = (projectId: string, blockId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedTimeBlocks = project.timeBlocks.filter(block => block.id !== blockId);
    const totalTime = updatedTimeBlocks.reduce((sum, block) => sum + block.duration, 0);
    const totalEarnings = updatedTimeBlocks.reduce((sum, block) => sum + block.earnings, 0);

    const updatedProject = {
      ...project,
      timeBlocks: updatedTimeBlocks,
      totalTime,
      totalEarnings
    };

    handleProjectUpdate(updatedProject);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-slate-50 relative overflow-hidden" style={{backgroundColor: '#dad3f4'}}>
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Large floating orbs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-purple-200/10 to-pink-200/8 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute top-1/3 -left-48 w-80 h-80 bg-gradient-to-br from-blue-200/8 to-cyan-200/6 rounded-full filter blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-indigo-200/6 to-purple-200/8 rounded-full filter blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
        
        {/* Smaller accent orbs */}
        <div className="absolute top-1/4 right-1/3 w-32 h-32 bg-gradient-to-br from-pink-200/12 to-rose-200/10 rounded-full filter blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 left-1/4 w-40 h-40 bg-gradient-to-br from-cyan-200/8 to-blue-200/6 rounded-full filter blur-2xl animate-float" style={{animationDelay: '3s'}}></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-5xl">
        <header className="text-left mb-12 animate-fade-in">
          <h1 className="text-3xl font-black bg-gradient-to-r from-slate-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent tracking-tight">
            Time Tracker
          </h1>
        </header>
        
        <EnhancedTimer
          currentProject={currentProject}
          projects={projects}
          taxSettings={taxSettings}
          onSessionComplete={handleSessionComplete}
          onTimerStateChange={setIsTimerRunning}
        />
        
        <ProjectManager
          projects={projects}
          currentProject={currentProject}
          isTimerRunning={isTimerRunning}
          taxSettings={taxSettings}
          onProjectSelect={handleProjectSelect}
          onProjectCreate={handleProjectCreate}
          onProjectUpdate={handleProjectUpdate}
          onProjectDelete={handleProjectDelete}
          onTimeBlockDelete={handleTimeBlockDelete}
        />
        
        <TaxSettings
          taxSettings={taxSettings}
          onTaxSettingsChange={setTaxSettings}
          sampleEarnings={currentProject?.totalEarnings || 1000}
        />
        
        <TimeBlockHistory
          projects={projects}
          currentProject={currentProject}
          taxSettings={taxSettings}
        />
        
        <ExportManager
          projects={projects}
          taxSettings={taxSettings}
        />
        
        <footer className="mt-16 text-center text-slate-300 text-sm animate-fade-in">
          <div className="glass rounded-xl p-6 max-w-md mx-auto border border-white/10">
            <p className="font-medium text-slate-300">
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