import { TaxSettings, TaxCalculation } from '../types';

// Default tax settings - US national average for freelancers
export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  taxRate: 30, // 30% is typical for freelancers (federal + state + self-employment)
  includeInDisplays: true,
  includeInExports: true,
};

/**
 * Calculate tax information for given earnings
 */
export const calculateTax = (grossEarnings: number, taxSettings: TaxSettings): TaxCalculation => {
  const taxAmount = (grossEarnings * taxSettings.taxRate) / 100;
  const netEarnings = grossEarnings - taxAmount;

  return {
    grossEarnings,
    taxAmount,
    netEarnings,
    taxRate: taxSettings.taxRate,
  };
};

/**
 * Format tax rate as percentage string
 */
export const formatTaxRate = (rate: number): string => {
  return `${rate.toFixed(1)}%`;
};

/**
 * Get tax rate description based on percentage
 */
export const getTaxRateDescription = (rate: number): string => {
  if (rate <= 15) return 'Low tax burden';
  if (rate <= 25) return 'Moderate tax burden';
  if (rate <= 35) return 'High tax burden';
  return 'Very high tax burden';
};

/**
 * Common tax rate presets for different situations
 */
export const TAX_RATE_PRESETS = [
  { rate: 15, label: 'Low tax state, part-time' },
  { rate: 22, label: 'Average employed rate' },
  { rate: 30, label: 'Freelancer national average' },
  { rate: 35, label: 'High earner, high tax state' },
  { rate: 40, label: 'California/NY high earner' },
];
