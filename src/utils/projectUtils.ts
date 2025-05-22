import { Project, TimeBlock } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const createProject = (name: string, rate: number): Project => {
  return {
    id: generateId(),
    name,
    rate,
    totalTime: 0,
    totalEarnings: 0,
    timeBlocks: [],
  };
};

export const createTimeBlock = (
  startTime: Date,
  endTime: Date,
  rate: number
): TimeBlock => {
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
  const earnings = (duration / 3600) * rate;

  return {
    id: generateId(),
    startTime,
    endTime,
    duration,
    rate,
    earnings,
  };
};

export const updateProjectWithTimeBlock = (
  project: Project,
  timeBlock: TimeBlock
): Project => {
  const updatedTimeBlocks = [...project.timeBlocks, timeBlock];
  const totalTime = updatedTimeBlocks.reduce((sum, block) => sum + block.duration, 0);
  const totalEarnings = updatedTimeBlocks.reduce((sum, block) => sum + block.earnings, 0);

  return {
    ...project,
    totalTime,
    totalEarnings,
    timeBlocks: updatedTimeBlocks,
  };
};

export const formatTimeForDisplay = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

export const formatDateForExport = (date: Date): string => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};