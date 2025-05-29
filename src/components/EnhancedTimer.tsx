import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Calculator } from 'lucide-react';
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
      const currentScrollY = window.scrollY;
      
      // Show sticky header when scrolled down past 400px and timer is running or has time
      if (currentScrollY > 400 && (isRunning || sessionSeconds > 0)) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
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
    <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="glass border-b border-white/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 max-w-5xl">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full transition-colors ${
                isRunning ? 'bg-green-400 animate-pulse' : 'bg-orange-400'
              }`}></div>
              <div>
                <div className="text-sm font-semibold text-slate-800">{currentProject.name}</div>
                <div className="text-xs text-slate-600">${currentProject.rate}/hour</div>
              </div>
            </div>
            <div className="font-mono text-lg font-bold text-slate-800">
              {formatTime(sessionSeconds)}
            </div>
            <button
              onClick={onToggle}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 transform hover:scale-110 shadow-soft hover:shadow-elevated ${
                isRunning 
                  ? 'bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white' 
                  : 'bg-gradient-primary text-white'
              }`}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            {/* Project Info & Timer */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full transition-colors ${
                  isRunning ? 'bg-green-400 animate-pulse' : 'bg-orange-400'
                }`}></div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">{currentProject.name}</div>
                  <div className="text-xs text-slate-600">${currentProject.rate}/hour</div>
                </div>
              </div>
              
              <div className="font-mono text-2xl font-bold text-slate-800">
                {formatTime(sessionSeconds)}
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                  ${currentEarnings.toFixed(2)}
                </div>
                <div className="text-xs text-slate-600">Current Session</div>
              </div>
            </div>
            
            {/* Control Button */}
            <button
              onClick={onToggle}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 transform hover:scale-110 shadow-soft hover:shadow-elevated ${
                isRunning 
                  ? 'bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white' 
                  : 'bg-gradient-primary text-white'
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
        title: 'No Project Selected',
        message: 'Please select a project first before starting the timer.',
        type: 'warning'
      });
      return;
    }

    if (isRunning) {
      // Stopping the timer - complete the session
      if (sessionSeconds > 0 && sessionStartRef.current && currentProject) {
        const endTime = new Date();
        const earnings = calculateEarnings(sessionSeconds, currentProject.rate);
        onSessionComplete?.(sessionStartRef.current, endTime, sessionSeconds, earnings);
      }
      setSessionSeconds(0);
      sessionStartRef.current = null;
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
  
  // Get the gradient for the current project
  const projectIndex = currentProject ? projects.findIndex(p => p.id === currentProject.id) : -1;
  const gradientClasses = projectIndex >= 0 ? getProjectGradientClasses(projectIndex) : getProjectGradientClasses(0); // Default to project 1's purple theme

  return (
    <>
      <div className="relative mb-16">
        {/* Animated background ring for running state */}
        {isRunning && (
          <div className="absolute -inset-4 bg-gradient-primary rounded-3xl opacity-5 animate-pulse-slow"></div>
        )}
        
        <div className="glass rounded-3xl shadow-glass backdrop-blur-xl border border-white/20 overflow-hidden">
          {/* Project Header - Mobile Responsive */}
          {currentProject ? (
            <div className={`p-4 sm:p-6 relative overflow-hidden ${gradientClasses.background}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] animate-[shimmer_3s_ease-in-out_infinite]"></div>
              
              {/* Desktop Layout: Flex with proper positioning */}
              <div className="relative z-10">
                {/* Mobile: Stack everything */}
                <div className="block sm:hidden space-y-4">
                  {/* Project Info */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-1">{currentProject.name}</h3>
                    <p className="text-white/90 text-sm font-medium">${currentProject.rate}/hour</p>
                  </div>
                  
                  {/* Control Button - Centered */}
                  <div className="flex justify-center py-4">
                    <button
                      onClick={handleToggle}
                      disabled={!currentProject}
                      className={`group relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-500 transform hover:scale-110 shadow-elevated hover:shadow-glass ${
                        !currentProject 
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          : isRunning 
                            ? 'bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white' 
                            : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                      }`}
                    >
                      <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                        {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                      </div>
                      
                      {/* Disabled state shimmer */}
                      {!currentProject && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-full"></div>
                      )}
                    </button>
                  </div>
                  
                  {/* View Toggle - Toggle Switch */}
                  <div className="flex justify-center">
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-semibold transition-colors ${
                        !showTotal ? 'text-white' : 'text-white/60'
                      }`}>Session</span>
                      <button
                        onClick={() => setShowTotal(!showTotal)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent ${
                          showTotal ? 'bg-white/30' : 'bg-white/20'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                            showTotal ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`text-sm font-semibold transition-colors ${
                        showTotal ? 'text-white' : 'text-white/60'
                      }`}>Total</span>
                    </div>
                  </div>
                </div>
                
                {/* Desktop: Original flex layout */}
                <div className="hidden sm:flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{currentProject.name}</h3>
                    <p className="text-white/90 text-sm font-medium">${currentProject.rate}/hour</p>
                  </div>
                  
                  {/* Control Button - Centered */}
                  <div className="absolute left-1/2 transform -translate-x-1/2">
                    <button
                      onClick={handleToggle}
                      disabled={!currentProject}
                      className={`group relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-500 transform hover:scale-110 shadow-elevated hover:shadow-glass ${
                        !currentProject 
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          : isRunning 
                            ? 'bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white' 
                            : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                      }`}
                    >
                      <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                        {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                      </div>
                      
                      {/* Disabled state shimmer */}
                      {!currentProject && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-full"></div>
                      )}
                    </button>
                  </div>
                  
                  {/* View Toggle - Toggle Switch */}
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-semibold transition-colors ${
                      !showTotal ? 'text-white' : 'text-white/60'
                    }`}>Session</span>
                    <button
                      onClick={() => setShowTotal(!showTotal)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent ${
                        showTotal ? 'bg-white/30' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                          showTotal ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-sm font-semibold transition-colors ${
                      showTotal ? 'text-white' : 'text-white/60'
                    }`}>Total</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-4 sm:p-6 text-center ${gradientClasses.background}`}>
              <p className="text-white font-semibold">Select a project to start tracking time</p>
            </div>
          )}
          
          {/* Main Timer Content */}
          <div className="p-4 sm:p-6">
            {/* Timer Display - Responsive font size */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="text-4xl sm:text-6xl md:text-7xl font-mono font-black text-slate-800 timer-display leading-none tracking-tighter">
                {formatTime(displayTime)}
              </div>
            </div>
            
            {/* Earnings & Tax Section - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Current Session Earnings */}
              <div className="glass rounded-2xl p-4 sm:p-6 shadow-soft text-center sm:col-span-2 lg:col-span-1">
                <div className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  ${displayEarnings.toFixed(2)}
                </div>
                <div className="text-slate-700 font-semibold text-sm">
                  {showTotal ? 'Total Earnings' : 'Current Session'}
                </div>
              </div>
              
              {/* Tax Information */}
              {taxSettings.includeInDisplays && currentProject ? (
                <>
                  <div className="glass rounded-2xl p-4 sm:p-6 shadow-soft text-center">
                    <div className="text-xl sm:text-2xl font-bold text-red-700 mb-2">
                      ${taxCalc.taxAmount.toFixed(2)}
                    </div>
                    <div className="text-red-700 font-semibold text-sm">
                      Est. Taxes ({taxSettings.taxRate}%)
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-4 sm:p-6 shadow-soft text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-700 mb-2">
                      ${taxCalc.netEarnings.toFixed(2)}
                    </div>
                    <div className="text-green-700 font-semibold text-sm">
                      After Taxes
                    </div>
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2 lg:col-span-2 glass rounded-2xl p-4 sm:p-6 shadow-soft text-center opacity-50">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Calculator size={16} className="text-slate-400" />
                    <span className="text-sm font-semibold text-slate-600">Tax Estimates Disabled</span>
                  </div>
                  <div className="text-slate-500 text-sm">
                    Enable in tax settings to see estimates
                  </div>
                </div>
              )}
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