import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Calculator, Zap, Activity } from 'lucide-react';
import { Project, TaxSettings } from '../types';
import { calculateTax } from '../utils/taxUtils';
import { getProjectGradientClasses } from '../utils/gradientUtils';
import Notification from './Notification';

interface StickyTimerHeaderProps {
  currentProject: Project | null;
  sessionSeconds: number;
  isRunning: boolean;
  onToggle: () => void;
  showSession: boolean;
}

const StickyTimerHeader: React.FC<StickyTimerHeaderProps> = ({
  currentProject,
  sessionSeconds,
  isRunning,
  onToggle,
  showSession
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 200 && (isRunning || sessionSeconds > 0);
      setIsVisible(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isRunning, sessionSeconds]);

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateEarnings = (seconds: number, rate: number): number => {
    return (seconds / 3600) * rate;
  };

  if (!currentProject || !isVisible) return null;

  const currentEarnings = calculateEarnings(sessionSeconds, currentProject.rate);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-black/90 border-b border-matrix-500">
      <div className="backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 max-w-6xl">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-center justify-between">
            <div className="text-xl font-mono text-matrix-500" style={{ color: '#00ff00', textShadow: '0 0 10px #00ff00' }}>
              {formatTime(sessionSeconds)}
            </div>
            <button
              onClick={onToggle}
              className={`rounded-full w-10 h-10 border-2 flex items-center justify-center transition-colors ${
                isRunning 
                  ? 'border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-black' 
                  : 'border-matrix-500 text-matrix-500 hover:bg-matrix-500 hover:text-black'
              }`}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
          </div>
          
          {/* Desktop Layout - Left-aligned Timer */}
          <div className="hidden sm:flex items-center justify-between">
            {/* Left-aligned Timer & Earnings */}
            <div className="flex items-center space-x-8">
              <div 
                className="text-4xl font-cyber font-black"
                style={{ color: '#00ff00', textShadow: '0 0 10px #00ff00' }}
              >
                {formatTime(sessionSeconds)}
              </div>
              
              <div className="text-right">
                <div className="text-xl font-mono neon-cyan">
                  ${currentEarnings.toFixed(2)}
                </div>
                <div className="text-sm text-matrix-600">SESSION</div>
              </div>
            </div>
            
            {/* Control Button */}
            <button
              onClick={onToggle}
              className={`rounded-full w-12 h-12 border-2 flex items-center justify-center transition-colors ${
                isRunning 
                  ? 'border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-black' 
                  : 'border-matrix-500 text-matrix-500 hover:bg-matrix-500 hover:text-black'
              }`}
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EnhancedTimerProps {
  currentProject: Project | null;
  projects: Project[];
  taxSettings: TaxSettings;
  onTimeUpdate?: (seconds: number) => void;
  onSessionComplete?: (startTime: Date, endTime: Date, duration: number, earnings: number) => void;
  onTimerStateChange?: (isRunning: boolean) => void;
}

const EnhancedTimer: React.FC<EnhancedTimerProps> = ({ 
  currentProject,
  projects,
  taxSettings,
  onTimeUpdate, 
  onSessionComplete,
  onTimerStateChange
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [showTotal, setShowTotal] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<Date | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
  }>({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    if (isRunning && currentProject) {
      if (!sessionStartRef.current) {
        sessionStartRef.current = new Date();
      }
      
      intervalRef.current = setInterval(() => {
        setSessionSeconds(prev => {
          const newSeconds = prev + 1;
          onTimeUpdate?.(newSeconds);
          return newSeconds;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, currentProject, onTimeUpdate]);

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateEarnings = (seconds: number, rate: number): number => {
    return (seconds / 3600) * rate;
  };

  const handleToggle = () => {
    if (!currentProject) {
      setNotification({
        isOpen: true,
        title: '[ERROR] No Project Selected',
        message: 'Matrix connection failed. Please select a project before initializing time tracking protocol.',
        type: 'error'
      });
      return;
    }

    if (isRunning) {
      // Stopping the timer - complete the session
      if (sessionSeconds > 0 && sessionStartRef.current && currentProject) {
        const endTime = new Date();
        const earnings = calculateEarnings(sessionSeconds, currentProject.rate);
        onSessionComplete?.(sessionStartRef.current, endTime, sessionSeconds, earnings);
        
        // Session completed silently - no notification needed
      }
      setSessionSeconds(0);
      sessionStartRef.current = null;
    } else {
      // Starting the timer - no notification needed
    }
    
    const newRunningState = !isRunning;
    setIsRunning(newRunningState);
    onTimerStateChange?.(newRunningState);
  };

  const currentSessionEarnings = currentProject ? calculateEarnings(sessionSeconds, currentProject.rate) : 0;
  const displayTime = showTotal && currentProject ? currentProject.totalTime : sessionSeconds;
  const displayEarnings = showTotal && currentProject ? currentProject.totalEarnings : currentSessionEarnings;
  
  // Calculate tax information for current display
  const taxCalc = calculateTax(displayEarnings, taxSettings);

  return (
    <>
      <div className="relative mb-16">
        <div className="terminal-window overflow-hidden shadow-neon-green">
          {/* Project Header */}
          {currentProject ? (
            <div className="bg-gradient-terminal p-6 relative overflow-hidden border-b-2 border-matrix-500">
              {/* Scan line effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-matrix-500/20 to-transparent animate-scan-line"></div>
              
              <div className="relative z-10">
                {/* Mobile: Stack everything */}
                <div className="block sm:hidden space-y-6">
                  {/* Project Info */}
                  <div className="text-center">
                    <h3 className="text-2xl font-cyber font-black matrix-text mb-2 glitch-text">
                      {currentProject.name.toUpperCase()}
                    </h3>
                    <p className="neon-cyan text-sm font-mono tracking-wider">
                      RATE: ${currentProject.rate}/HR
                    </p>
                  </div>
                  
                  {/* Control Button - Cyber Style */}
                  <div className="flex justify-center py-4">
                    <button
                      onClick={handleToggle}
                      disabled={!currentProject}
                      className={`group relative cyber-button w-20 h-20 rounded-full text-2xl transition-all duration-500 transform hover:scale-110 ${
                        !currentProject 
                          ? 'border-terminal-medium text-terminal-medium cursor-not-allowed opacity-50'
                          : isRunning 
                            ? 'border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-black animate-neon-pulse' 
                            : 'border-matrix-500 text-matrix-500 hover:bg-matrix-500 hover:text-black'
                      }`}
                    >
                      <div className="relative z-10 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
                        {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
                      </div>
                    </button>
                  </div>
                  
                  {/* View Toggle - Cyber Switch */}
                  <div className="flex justify-center">
                    <div className="flex items-center space-x-4">
                      <span className={`text-sm font-mono font-bold transition-colors ${
                        !showTotal ? 'matrix-text' : 'text-matrix-600'
                      }`}>SESSION</span>
                      <button
                        onClick={() => setShowTotal(!showTotal)}
                        className={`relative inline-flex h-8 w-16 items-center rounded-full border-2 transition-colors focus:outline-none ${
                          showTotal ? 'border-cyber-cyan bg-cyber-cyan/20' : 'border-matrix-500 bg-matrix-500/20'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full transition-transform ${
                            showTotal ? 'translate-x-8 bg-cyber-cyan shadow-neon-cyan' : 'translate-x-1 bg-matrix-500 shadow-neon-green'
                          }`}
                        />
                      </button>
                      <span className={`text-sm font-mono font-bold transition-colors ${
                        showTotal ? 'neon-cyan' : 'text-matrix-600'
                      }`}>TOTAL</span>
                    </div>
                  </div>
                </div>
                
                {/* Desktop: Matrix grid layout */}
                <div className="hidden sm:flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-cyber font-black matrix-text mb-2 glitch-text">
                      {currentProject.name.toUpperCase()}
                    </h3>
                    <p className="neon-cyan text-sm font-mono tracking-wider">
                      RATE: ${currentProject.rate}/HR
                    </p>
                  </div>
                  
                  {/* Control Button - Centered */}
                  <div className="absolute left-1/2 transform -translate-x-1/2">
                    <button
                      onClick={handleToggle}
                      disabled={!currentProject}
                      className={`group relative cyber-button w-24 h-24 rounded-full text-2xl transition-all duration-500 transform hover:scale-110 ${
                        !currentProject 
                          ? 'border-terminal-medium text-terminal-medium cursor-not-allowed opacity-50'
                          : isRunning 
                            ? 'border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-black animate-neon-pulse' 
                            : 'border-matrix-500 text-matrix-500 hover:bg-matrix-500 hover:text-black'
                      }`}
                    >
                      <div className="relative z-10 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
                        {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-0.5" />}
                      </div>
                    </button>
                  </div>
                  
                  {/* View Toggle - Cyber Switch */}
                  <div className="flex items-center space-x-4">
                    <span className={`text-sm font-mono font-bold transition-colors ${
                      !showTotal ? 'matrix-text' : 'text-matrix-600'
                    }`}>SESSION</span>
                    <button
                      onClick={() => setShowTotal(!showTotal)}
                      className={`relative inline-flex h-8 w-16 items-center rounded-full border-2 transition-colors focus:outline-none ${
                        showTotal ? 'border-cyber-cyan bg-cyber-cyan/20' : 'border-matrix-500 bg-matrix-500/20'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full transition-transform ${
                          showTotal ? 'translate-x-8 bg-cyber-cyan shadow-neon-cyan' : 'translate-x-1 bg-matrix-500 shadow-neon-green'
                        }`}
                      />
                    </button>
                    <span className={`text-sm font-mono font-bold transition-colors ${
                      showTotal ? 'neon-cyan' : 'text-matrix-600'
                    }`}>TOTAL</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-terminal p-6 text-center border-b-2 border-matrix-500">
              <p className="matrix-text font-mono font-bold tracking-wider">
                &gt; SELECT PROJECT TO INITIALIZE NEURAL INTERFACE_
              </p>
              <div className="text-xs text-matrix-600 mt-2 font-mono">
                CONNECTION STATUS: STANDBY
              </div>
            </div>
          )}
          
          {/* Main Timer Content - Digital Display */}
          <div className="p-6 bg-terminal-dark">
            {/* Massive Digital Timer Display */}
            <div className="text-center mb-8">
              <div className="digital-display text-5xl sm:text-7xl md:text-8xl font-cyber font-black leading-none mb-4">
                {formatTime(displayTime)}
              </div>
              <div className="text-sm font-mono text-matrix-600 tracking-widest">
                {showTotal ? '&gt; TOTAL_TIME.LOG' : '&gt; CURRENT_SESSION.EXE'}
              </div>
            </div>
            
            {/* Cyber Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Current Session Earnings */}
              <div className="cyber-card p-6 text-center sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-matrix-500 mr-2 animate-pulse" />
                  <span className="text-sm font-mono text-matrix-600 tracking-wider">
                    EARNINGS
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-cyber font-black neon-cyan mb-2">
                  ${displayEarnings.toFixed(2)}
                </div>
                <div className="text-xs font-mono text-matrix-700">
                  {showTotal ? 'TOTAL ACCUMULATED' : 'CURRENT SESSION'}
                </div>
              </div>
              
              {/* Tax Information */}
              {taxSettings.includeInDisplays && currentProject ? (
                <>
                  <div className="cyber-card p-6 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <Calculator className="w-5 h-5 text-cyber-red mr-2 animate-pulse" />
                      <span className="text-sm font-mono text-matrix-600 tracking-wider">
                        TAX.SYS
                      </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-cyber font-black text-cyber-red mb-2">
                      ${taxCalc.taxAmount.toFixed(2)}
                    </div>
                    <div className="text-xs font-mono text-red-400">
                      EST. TAXES ({taxSettings.taxRate}%)
                    </div>
                  </div>
                  <div className="cyber-card p-6 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <Activity className="w-5 h-5 text-matrix-500 mr-2 animate-pulse" />
                      <span className="text-sm font-mono text-matrix-600 tracking-wider">
                        NET.EXE
                      </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-cyber font-black neon-cyan mb-2">
                      ${taxCalc.netEarnings.toFixed(2)}
                    </div>
                    <div className="text-xs font-mono text-matrix-700">
                      AFTER TAX DEDUCTION
                    </div>
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2 lg:col-span-2 cyber-card p-6 text-center opacity-50">
                  <div className="flex items-center justify-center mb-3">
                    <Calculator className="w-5 h-5 text-terminal-medium mr-2" />
                    <span className="text-sm font-mono text-terminal-medium tracking-wider">
                      TAX.SYS [DISABLED]
                    </span>
                  </div>
                  <div className="text-terminal-medium font-mono text-sm">
                    &gt; ENABLE TAX CALCULATIONS IN SETTINGS
                  </div>
                </div>
              )}
            </div>
            
            {/* Status Bar */}
            <div className="mt-8 p-4 border-2 border-matrix-800 rounded bg-terminal-black">
              <div className="flex items-center justify-between text-xs font-mono text-matrix-600">
                <div className="flex items-center space-x-4">
                  <span>STATUS:</span>
                  <span className={isRunning ? 'text-matrix-500 animate-pulse' : 'text-cyber-yellow'}>
                    {isRunning ? 'ACTIVE' : 'STANDBY'}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>PROJECT:</span>
                  <span className="neon-cyan">
                    {currentProject ? currentProject.name.toUpperCase() : 'NULL'}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>MODE:</span>
                  <span className={showTotal ? 'neon-cyan' : 'matrix-text'}>
                    {showTotal ? 'TOTAL' : 'SESSION'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sticky Timer Header */}
      <StickyTimerHeader 
        currentProject={currentProject}
        sessionSeconds={sessionSeconds}
        isRunning={isRunning}
        onToggle={handleToggle}
        showSession={!showTotal}
      />
      
      {/* Styled Notification */}
      <Notification
        isOpen={notification.isOpen}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ isOpen: false, title: '', message: '', type: 'info' })}
      />
    </>
  );
};

export default EnhancedTimer;