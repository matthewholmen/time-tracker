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
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg mx-auto mb-8">
      <div className="text-center">
        {/* Project Info */}
        {currentProject ? (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800">{currentProject.name}</h3>
            <p className="text-blue-600">${currentProject.rate}/hour</p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 font-medium">Select a project to start tracking time</p>
          </div>
        )}

        {/* Time Display */}
        <div className="text-5xl font-mono font-bold text-gray-800 mb-3 tracking-wider">
          {formatTime(displayTime)}
        </div>

        {/* Earnings Display */}
        <div className="text-2xl font-bold text-green-600 mb-6">
          ${displayEarnings.toFixed(2)}
        </div>

        {/* Toggle Button */}
        {currentProject && (
          <button
            onClick={() => setShowTotal(!showTotal)}
            className="flex items-center justify-center space-x-2 mx-auto mb-4 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            {showTotal ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            <span>{showTotal ? 'Total Time/Earnings' : 'Current Session'}</span>
          </button>
        )}
        
        {/* Control Buttons */}
        <div className="flex justify-center space-x-6 mb-6">
          <button
            onClick={handleToggle}
            disabled={!currentProject}
            className={`flex items-center justify-center w-20 h-20 rounded-full transition-all duration-200 transform hover:scale-105 ${
              !currentProject 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isRunning 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isRunning ? <Pause size={28} /> : <Play size={28} />}
          </button>
          
          <button
            onClick={handleReset}
            className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 font-medium"
          >
            Reset
          </button>
        </div>
        
        {/* Status */}
        <div className="text-sm text-gray-600">
          {!currentProject 
            ? 'No project selected' 
            : isRunning 
              ? 'Timer is running...' 
              : 'Timer is stopped'
          }
        </div>
      </div>
    </div>
  );
};

export default EnhancedTimer;