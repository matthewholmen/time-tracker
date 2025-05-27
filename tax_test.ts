// Quick Test Script for Tax Implementation
// This verifies our tax calculations work correctly

import { calculateTax, DEFAULT_TAX_SETTINGS, formatTaxRate } from './src/utils/taxUtils';

// Test basic tax calculation
console.log('=== Tax Calculation Tests ===');

const testEarnings = 1000;
const taxResult = calculateTax(testEarnings, DEFAULT_TAX_SETTINGS);

console.log(`Gross Earnings: $${taxResult.grossEarnings}`);
console.log(`Tax Rate: ${formatTaxRate(taxResult.taxRate)}`);
console.log(`Tax Amount: $${taxResult.taxAmount.toFixed(2)}`);
console.log(`Net Earnings: $${taxResult.netEarnings.toFixed(2)}`);

// Verify calculations
const expectedTaxAmount = testEarnings * (DEFAULT_TAX_SETTINGS.taxRate / 100);
const expectedNetEarnings = testEarnings - expectedTaxAmount;

console.log('\n=== Verification ===');
console.log(`Expected Tax: $${expectedTaxAmount.toFixed(2)}`);
console.log(`Calculated Tax: $${taxResult.taxAmount.toFixed(2)}`);
console.log(`Tax Match: ${Math.abs(expectedTaxAmount - taxResult.taxAmount) < 0.01 ? 'PASS' : 'FAIL'}`);

console.log(`Expected Net: $${expectedNetEarnings.toFixed(2)}`);
console.log(`Calculated Net: $${taxResult.netEarnings.toFixed(2)}`);
console.log(`Net Match: ${Math.abs(expectedNetEarnings - taxResult.netEarnings) < 0.01 ? 'PASS' : 'FAIL'}`);

export {}; // Make this a module