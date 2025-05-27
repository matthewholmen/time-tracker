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

export interface TaxSettings {
  taxRate: number; // percentage (0-100)
  includeInDisplays: boolean; // whether to show tax estimates in UI
  includeInExports: boolean; // whether to include tax columns in CSV exports
}

export interface TaxCalculation {
  grossEarnings: number;
  taxAmount: number;
  netEarnings: number;
  taxRate: number;
}
