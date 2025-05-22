export interface TimeBlock {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // seconds
  rate: number;
  earnings: number;
}

export interface Project {
  id: string;
  name: string;
  rate: number; // hourly rate
  totalTime: number; // seconds
  totalEarnings: number;
  timeBlocks: TimeBlock[];
}
