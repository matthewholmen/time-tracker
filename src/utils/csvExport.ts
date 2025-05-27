import { Project, TimeBlock, TaxSettings } from '../types';
import { calculateTax } from './taxUtils';

export const generateCSV = (projects: Project[], taxSettings?: TaxSettings): string => {
  // CSV Headers
  const baseHeaders = [
    'Project',
    'Start Time',
    'End Time', 
    'Duration (Hours)',
    'Duration (HH:MM:SS)',
    'Rate ($/hour)',
    'Earnings ($)'
  ];
  
  const taxHeaders = taxSettings?.includeInExports ? [
    'Tax Rate (%)',
    'Est. Taxes ($)',
    'Net Earnings ($)'
  ] : [];
  
  const headers = [...baseHeaders, ...taxHeaders];

  // Collect all time blocks from all projects
  const allTimeBlocks: Array<TimeBlock & { projectName: string }> = [];
  
  projects.forEach(project => {
    project.timeBlocks.forEach(block => {
      allTimeBlocks.push({
        ...block,
        projectName: project.name
      });
    });
  });

  // Sort by start time (most recent first)
  allTimeBlocks.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  // Convert to CSV rows
  const rows = allTimeBlocks.map(block => {
    const startTime = formatDateTimeForCSV(new Date(block.startTime));
    const endTime = formatDateTimeForCSV(new Date(block.endTime));
    const durationHours = (block.duration / 3600).toFixed(3);
    const durationFormatted = formatDurationForCSV(block.duration);
    
    const baseRow = [
      escapeCSVField(block.projectName),
      startTime,
      endTime,
      durationHours,
      durationFormatted,
      block.rate.toFixed(2),
      block.earnings.toFixed(2)
    ];
    
    if (taxSettings?.includeInExports) {
      const taxCalc = calculateTax(block.earnings, taxSettings);
      const taxRow = [
        taxSettings.taxRate.toFixed(1),
        taxCalc.taxAmount.toFixed(2),
        taxCalc.netEarnings.toFixed(2)
      ];
      return [...baseRow, ...taxRow];
    }
    
    return baseRow;
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  return csvContent;
};

export const generateProjectSummaryCSV = (projects: Project[], taxSettings?: TaxSettings): string => {
  const baseHeaders = [
    'Project Name',
    'Hourly Rate ($/hour)',
    'Total Time (Hours)',
    'Total Time (HH:MM:SS)',
    'Total Sessions',
    'Total Earnings ($)',
    'Average Session Length (Minutes)'
  ];
  
  const taxHeaders = taxSettings?.includeInExports ? [
    'Tax Rate (%)',
    'Est. Total Taxes ($)',
    'Net Total Earnings ($)'
  ] : [];
  
  const headers = [...baseHeaders, ...taxHeaders];

  const rows = projects.map(project => {
    const totalHours = (project.totalTime / 3600).toFixed(3);
    const totalTimeFormatted = formatDurationForCSV(project.totalTime);
    const sessionCount = project.timeBlocks.length;
    const avgSessionLength = sessionCount > 0 
      ? ((project.totalTime / sessionCount) / 60).toFixed(1)
      : '0.0';

    const baseRow = [
      escapeCSVField(project.name),
      project.rate.toFixed(2),
      totalHours,
      totalTimeFormatted,
      sessionCount.toString(),
      project.totalEarnings.toFixed(2),
      avgSessionLength
    ];
    
    if (taxSettings?.includeInExports) {
      const taxCalc = calculateTax(project.totalEarnings, taxSettings);
      const taxRow = [
        taxSettings.taxRate.toFixed(1),
        taxCalc.taxAmount.toFixed(2),
        taxCalc.netEarnings.toFixed(2)
      ];
      return [...baseRow, ...taxRow];
    }
    
    return baseRow;
  });

  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  return csvContent;
};

const formatDateTimeForCSV = (date: Date): string => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const formatDurationForCSV = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const escapeCSVField = (field: string): string => {
  // Escape fields that contain commas, quotes, or newlines
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
};

export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};