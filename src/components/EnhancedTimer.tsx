import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ToggleLeft, ToggleRight } from 'lucide-react';
import { Project } from '../types';

interface EnhancedTimerProps {
  currentProject: Project | null;
  onTimeUpdate?: (seconds: number) => void;
  onSessionComplete?: (startTime: Date, endTime: Date, duration: number, earnings: number) => void;
}

const EnhancedTimer: React.FC<EnhancedTimerProps> = ({ 
  currentProject, 
  onTimeUpdate, 
  onSessionComplete 
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [showTotal, setShowTotal] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<Date | null>(null);

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
      alert('Please select a project first');
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
    
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSessionSeconds(0);
    sessionStartRef.current = null;
    onTimeUpdate?.(0);
  };

  const currentSessionEarnings = currentProject ? calculateEarnings(sessionSeconds, currentProject.rate) : 0;
  const displayTime = showTotal && currentProject ? currentProject.totalTime : sessionSeconds;
  const displayEarnings = showTotal && currentProject ? currentProject.totalEarnings : currentSessionEarnings;

  return (
    <div className="glass rounded-3xl shadow-glass p-10 max-w-2xl mx-auto mb-12 animate-scale-in backdrop-blur-xl border border-white/20">
      <div className="text-center">
        {/* Project Info */}
        {currentProject ? (
          <div className="mb-8 p-6 bg-gradient-primary rounded-2xl shadow-soft transform hover:scale-105 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-2">{currentProject.name}</h3>
            <p className="text-white/90 text-lg font-medium">${currentProject.rate}/hour</p>
            <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        ) : (
          <div className="mb-8 p-6 bg-gradient-warning rounded-2xl shadow-soft">
            <p className="text-white font-semibold text-lg">Select a project to start tracking time</p>
          </div>
        )}

        {/* Time Display */}
        <div className="relative mb-8">
          <div className="text-7xl font-mono font-bold text-slate-800 mb-4 tracking-wider leading-none">
            {formatTime(displayTime)}
          </div>
          {isRunning && (
            <div className="absolute -inset-4 bg-gradient-success rounded-2xl opacity-20 animate-pulse-slow"></div>
          )}
        </div>

        {/* Earnings Display */}
        <div className="mb-8">
          <div className="text-4xl font-bold bg-gradient-success bg-clip-text text-transparent mb-2">
            ${displayEarnings.toFixed(2)}
          </div>
          <div className="text-sm text-slate-600 font-medium">
            {showTotal ? 'Total Earnings' : 'Current Session'}
          </div>
        </div>

        {/* Toggle Button */}
        {currentProject && (
          <button
            onClick={() => setShowTotal(!showTotal)}
            className="flex items-center justify-center space-x-3 mx-auto mb-8 px-6 py-3 glass rounded-full text-slate-700 hover:text-slate-900 transition-all duration-300 hover:scale-105 group"
          >
            <div className={`transition-colors duration-300 ${showTotal ? 'text-primary-600' : 'text-slate-400'}`}>
              {showTotal ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            </div>
            <span className="font-medium group-hover:text-primary-600 transition-colors">
              {showTotal ? 'Total Time/Earnings' : 'Current Session'}
            </span>
          </button>
        )}
        
        {/* Control Buttons */}
        <div className="flex justify-center items-center space-x-8 mb-8">
          <button
            onClick={handleToggle}
            disabled={!currentProject}
            className={`group flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 transform hover:scale-110 shadow-elevated relative overflow-hidden ${
              !currentProject 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : isRunning 
                  ? 'bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-rose-200' 
                  : 'bg-gradient-success hover:shadow-cyan-200 text-white'
            }`}
          >
            <div className="relative z-10">
              {isRunning ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </div>
            {!currentProject && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            )}
          </button>
          
          <button
            onClick={handleReset}
            className="group px-8 py-4 glass rounded-2xl text-slate-700 hover:text-slate-900 transition-all duration-300 transform hover:scale-105 font-semibold shadow-soft relative overflow-hidden"
          >
            <span className="relative z-10">Reset</span>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200/50 to-slate-300/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
        
        {/* Status */}
        <div className="flex items-center justify-center space-x-2">
          <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
            !currentProject 
              ? 'bg-slate-400' 
              : isRunning 
                ? 'bg-green-400 animate-pulse' 
                : 'bg-orange-400'
          }`}></div>
          <div className="text-sm text-slate-600 font-medium">
            {!currentProject 
              ? 'No project selected' 
              : isRunning 
                ? 'Timer is running...' 
                : 'Timer is stopped'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTimer;