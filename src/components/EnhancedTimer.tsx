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
    <div className="fixed top-0 left-0 right-0 z-[9999] border-b border-matrix-500" style={{background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(8px) saturate(150%)'}}>
      <div>
        <div className="container mx-auto px-4 py-3 max-w-6xl">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-center justify-between">
            <div className="text-2xl sm:text-3xl font-mono text-matrix-500" style={{ color: '#00ff00', textShadow: '0 0 10px #00ff00' }}>
              {formatTime(sessionSeconds)}
            </div>
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
          
          {/* Desktop Layout - Left earnings, Center timer, Right button */}
          <div className="hidden sm:flex items-center justify-between">
            {/* Left-aligned Earnings */}
            <div className="flex items-center space-x-3">
              <div className="text-2xl lg:text-3xl font-mono neon-cyan">
                ${currentEarnings.toFixed(2)}
              </div>
              <div className="text-base text-matrix-600">SESSION</div>
            </div>
            
            {/* Center-aligned Timer */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <div 
                className="text-5xl lg:text-6xl font-mono font-black"
                style={{ color: '#00ff00', textShadow: '0 0 10px #00ff00' }}
              >
                {formatTime(sessionSeconds)}
              </div>
            </div>
            
            {/* Control Button */}
            <button
              onClick={onToggle}
              className={`rounded-full w-14 h-14 border-2 flex items-center justify-center transition-colors ${
                isRunning 
                  ? 'border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-black' 
                  : 'border-matrix-500 text-matrix-500 hover:bg-matrix-500 hover:text-black'
              }`}
            >
              {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
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
        {/* Standalone Timer Display */}
        <div className="text-center mb-8">
          <div className="digital-clock-segments">
            {formatTime(displayTime)}
          </div>
        </div>
        
        {/* Pill-shaped Control Button - Below Timer */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleToggle}
            disabled={!currentProject}
            className={`group relative px-12 sm:px-16 py-2 sm:py-3 rounded-lg text-xs sm:text-lg font-mono font-bold tracking-wider transition-all duration-500 transform hover:scale-105 flex items-center justify-center space-x-1.5 sm:space-x-3 w-full max-w-xs sm:max-w-sm ${
              !currentProject 
                ? 'border-2 border-terminal-medium text-terminal-medium cursor-not-allowed opacity-50 bg-black/20'
                : isRunning 
                  ? 'border-2 border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-black bg-black/40' 
                  : 'bg-matrix-500 border-2 border-matrix-500 text-black hover:bg-matrix-600 hover:border-matrix-600'
            }`}
          >
            <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
              {isRunning ? <Pause size={14} className="sm:w-5 sm:h-5" strokeWidth={2} /> : <Play size={14} className="ml-1 sm:w-5 sm:h-5" strokeWidth={2} />}
            </div>
            <span className="relative z-10">
              {isRunning ? 'PAUSE' : 'START'}
            </span>
          </button>
        </div>
        
        {/* Project Selection Message - Only shown when no project */}
        {!currentProject && (
          <div className="p-6 sm:p-8 text-center border-2 border-matrix-500 terminal-window shadow-neon-green mb-8">
            <p className="matrix-text font-mono font-bold tracking-wider text-lg sm:text-xl">
              &gt; SELECT PROJECT TO INITIALIZE NEURAL INTERFACE_
            </p>
            <div className="text-sm text-matrix-600 mt-3 font-mono">
              CONNECTION STATUS: STANDBY
            </div>
          </div>
        )}
        
        {/* Earnings/Tax Data Section */}
        <div className="terminal-window overflow-hidden shadow-neon-green">
          <div className="p-6 sm:p-8 lg:p-10">
            {/* Project Info Header */}
            {currentProject && (
              <div className="mb-8 p-4 border-2 border-matrix-500 terminal-window bg-black/30">
                <div className="text-center">
                  <h2 className="text-lg font-cyber font-black matrix-text tracking-wider mb-2">
                    {currentProject.name.toUpperCase()}
                  </h2>
                  <p className="neon-cyan text-sm font-mono tracking-wider">
                    RATE: ${currentProject.rate}/HR
                  </p>
                </div>
              </div>
            )}
            
            {/* Cyber Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Current Session Earnings */}
              <div className="cyber-card p-6 sm:p-8 text-center sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-matrix-500 mr-2 animate-pulse" />
                  <span className="text-base font-mono text-matrix-600 tracking-wider">
                    EARNINGS
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-cyber font-black neon-cyan mb-3">
                  ${displayEarnings.toFixed(2)}
                </div>
                <div className="text-sm font-mono text-matrix-700">
                  {showTotal ? 'TOTAL ACCUMULATED' : 'CURRENT SESSION'}
                </div>
              </div>
              
              {/* Tax Information */}
              {taxSettings.includeInDisplays && currentProject ? (
                <>
                  <div className="cyber-card p-6 sm:p-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                      <Calculator className="w-6 h-6 text-cyber-red mr-2 animate-pulse" />
                      <span className="text-base font-mono text-matrix-600 tracking-wider">
                        TAX.SYS
                      </span>
                    </div>
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-cyber font-black text-cyber-red mb-3">
                      ${taxCalc.taxAmount.toFixed(2)}
                    </div>
                    <div className="text-sm font-mono text-red-400">
                      EST. TAXES ({taxSettings.taxRate}%)
                    </div>
                  </div>
                  <div className="cyber-card p-6 sm:p-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                      <Activity className="w-6 h-6 text-matrix-500 mr-2 animate-pulse" />
                      <span className="text-base font-mono text-matrix-600 tracking-wider">
                        NET.EXE
                      </span>
                    </div>
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-cyber font-black neon-cyan mb-3">
                      ${taxCalc.netEarnings.toFixed(2)}
                    </div>
                    <div className="text-sm font-mono text-matrix-700">
                      AFTER TAX DEDUCTION
                    </div>
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2 lg:col-span-2 cyber-card p-6 sm:p-8 text-center opacity-50">
                  <div className="flex items-center justify-center mb-4">
                    <Calculator className="w-6 h-6 text-terminal-medium mr-2" />
                    <span className="text-base font-mono text-terminal-medium tracking-wider">
                      TAX.SYS [DISABLED]
                    </span>
                  </div>
                  <div className="text-terminal-medium font-mono text-base">
                    &gt; ENABLE TAX CALCULATIONS IN SETTINGS
                  </div>
                </div>
              )}
            </div>
            
            {/* View Toggle - Bottom Section */}
            <div className="mt-10 mb-6 flex justify-center">
              <div className="flex items-center space-x-6">
                <span className={`text-base sm:text-lg font-mono font-bold transition-colors ${
                  !showTotal ? 'matrix-text' : 'text-matrix-600'
                }`}>SESSION</span>
                <button
                  onClick={() => setShowTotal(!showTotal)}
                  className={`relative inline-flex h-10 w-20 items-center rounded-full border-2 transition-colors focus:outline-none ${
                    showTotal ? 'border-cyber-cyan bg-cyber-cyan/20' : 'border-matrix-500 bg-matrix-500/20'
                  }`}
                >
                  <span
                    className={`inline-block h-8 w-8 transform rounded-full transition-transform ${
                      showTotal ? 'translate-x-10 bg-cyber-cyan shadow-neon-cyan' : 'translate-x-1 bg-matrix-500 shadow-neon-green'
                    }`}
                  />
                </button>
                <span className={`text-base sm:text-lg font-mono font-bold transition-colors ${
                  showTotal ? 'neon-cyan' : 'text-matrix-600'
                }`}>TOTAL</span>
              </div>
            </div>
            
            {/* Status Bar */}
            <div className="mt-6 p-4 sm:p-6 border-2 border-matrix-800 rounded" style={{background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(3px)'}}>
              <div className="flex items-center justify-between text-sm sm:text-base font-mono text-matrix-600 flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <span>STATUS:</span>
                  <span className={isRunning ? 'text-matrix-500 animate-pulse' : 'text-cyber-yellow'}>
                    {isRunning ? 'ACTIVE' : 'STANDBY'}
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