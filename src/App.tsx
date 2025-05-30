import React, { useState } from 'react';
import ProjectManager from './components/ProjectManager';
import EnhancedTimer from './components/EnhancedTimer';
import TimeBlockHistory from './components/TimeBlockHistory';
import ExportManager from './components/ExportManager';
import TaxSettings from './components/TaxSettings';
import MoneyRain from './components/MoneyRain';
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
    <div className="min-h-screen bg-black relative overflow-hidden crt-effect">
      {/* Money Rain Background Effect - Only active when timer is running */}
      <MoneyRain isActive={isTimerRunning} />
      
      {/* Subtle Matrix Grid Overlay */}
      <div className="fixed inset-0 matrix-grid opacity-10 pointer-events-none z-1"></div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 max-w-6xl pt-8">
        
        {/* Main Timer Interface */}
        <section className="cyber-card animate-scale-in mb-8" style={{animationDelay: '0s'}}>
          <div className="border-l-4 border-matrix-500 pl-4 mb-6">
            <h1 className="text-xl font-cyber font-bold matrix-text tracking-wide">
              &gt; TIMER_TERMINAL.EXE
            </h1>
            <p className="text-sm text-matrix-600 font-mono mt-1">
              Neural time tracking interface
            </p>
          </div>
          <EnhancedTimer
            currentProject={currentProject}
            projects={projects}
            taxSettings={taxSettings}
            onSessionComplete={handleSessionComplete}
            onTimerStateChange={setIsTimerRunning}
          />
        </section>
        {/* Main Interface Grid */}
        <div className="space-y-8">
          
          {/* Project Manager Section */}
          <section className="cyber-card animate-scale-in" style={{animationDelay: '0.1s'}}>
            <div className="border-l-4 border-cyber-cyan pl-4 mb-6">
              <h2 className="text-xl font-cyber font-bold neon-cyan tracking-wide">
                &gt; PROJECT_MATRIX.DB
              </h2>
              <p className="text-sm text-cyan-400 font-mono mt-1">
                Client database management system
              </p>
            </div>
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
          </section>
          
          {/* Tax Settings Section */}
          <section className="cyber-card animate-scale-in" style={{animationDelay: '0.2s'}}>
            <div className="border-l-4 border-cyber-purple pl-4 mb-6">
              <h2 className="text-xl font-cyber font-bold neon-purple tracking-wide">
                &gt; TAX_CALC.SYS
              </h2>
              <p className="text-sm text-purple-400 font-mono mt-1">
                Financial calculation protocols
              </p>
            </div>
            <TaxSettings
              taxSettings={taxSettings}
              onTaxSettingsChange={setTaxSettings}
              sampleEarnings={currentProject?.totalEarnings || 1000}
            />
          </section>
          
          {/* History Section */}
          <section className="cyber-card animate-scale-in" style={{animationDelay: '0.3s'}}>
            <div className="border-l-4 border-cyber-yellow pl-4 mb-6">
              <h2 className="text-xl font-cyber font-bold neon-yellow tracking-wide">
                &gt; HISTORY_LOG.DAT
              </h2>
              <p className="text-sm text-yellow-400 font-mono mt-1">
                Temporal data archive access
              </p>
            </div>
            <TimeBlockHistory
              projects={projects}
              currentProject={currentProject}
              taxSettings={taxSettings}
            />
          </section>
          
          {/* Export Section */}
          <section className="cyber-card animate-scale-in" style={{animationDelay: '0.4s'}}>
            <div className="border-l-4 border-matrix-600 pl-4 mb-6">
              <h2 className="text-xl font-cyber font-bold text-matrix-600 tracking-wide">
                &gt; EXPORT_STREAM.CSV
              </h2>
              <p className="text-sm text-matrix-700 font-mono mt-1">
                Data transmission protocols
              </p>
            </div>
            <ExportManager
              projects={projects}
              taxSettings={taxSettings}
            />
          </section>
        </div>
        
        {/* Matrix Footer */}
        <footer className="mt-16 text-center animate-fade-in">
          <div className="terminal-window p-6 max-w-md mx-auto">
            <div className="text-matrix-500 font-mono text-sm">
              <div className="mb-2">
                <span className="text-cyber-cyan">[SYSTEM]</span> React + TypeScript
              </div>
              <div className="mb-2">
                <span className="text-cyber-purple">[STORAGE]</span> Local Neural Network
              </div>
              <div className="text-xs opacity-75 mt-4 border-t border-matrix-800 pt-3">
                &gt; Connection established to Matrix mainframe_
                <span className="animate-pulse">|</span>
              </div>
            </div>
          </div>
        </footer>
        </div>
      </div>
      
      {/* Matrix Code Rain Effect */}
      <div className="fixed bottom-4 right-4 font-mono text-xs text-matrix-500 opacity-50 pointer-events-none">
        <div className="animate-type-in overflow-hidden whitespace-nowrap">
          01001000 01100101 01101100 01101100 01101111
        </div>
      </div>
    </div>
  );
}

export default App;