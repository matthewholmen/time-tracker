import React, { useState } from 'react';
import { Settings, DollarSign, Calculator, Info, Eye, EyeOff, FileText } from 'lucide-react';
import { TaxSettings } from '../types';
import { 
  formatTaxRate, 
  getTaxRateDescription, 
  TAX_RATE_PRESETS,
  calculateTax 
} from '../utils/taxUtils';

interface TaxSettingsComponentProps {
  taxSettings: TaxSettings;
  onTaxSettingsChange: (settings: TaxSettings) => void;
  sampleEarnings?: number; // for preview calculations
}

const TaxSettingsComponent: React.FC<TaxSettingsComponentProps> = ({ 
  taxSettings, 
  onTaxSettingsChange,
  sampleEarnings = 1000 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRateChange = (rate: number) => {
    onTaxSettingsChange({
      ...taxSettings,
      taxRate: rate,
    });
  };

  const handleDisplayToggle = () => {
    onTaxSettingsChange({
      ...taxSettings,
      includeInDisplays: !taxSettings.includeInDisplays,
    });
  };

  const handleExportToggle = () => {
    onTaxSettingsChange({
      ...taxSettings,
      includeInExports: !taxSettings.includeInExports,
    });
  };

  const sampleTaxCalc = calculateTax(sampleEarnings, taxSettings);

  return (
    <div className="glass rounded-3xl shadow-glass p-8 mb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl">
            <Calculator size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Tax Settings</h2>
            <p className="text-sm text-slate-600">Estimate taxes for better financial planning</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 glass rounded-xl hover:shadow-soft transition-all duration-300"
        >
          <Settings size={18} className={`text-slate-600 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Quick Tax Rate Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-2xl p-4 hover:shadow-soft transition-all duration-300">
          <div className="flex items-center space-x-3 mb-2">
            <DollarSign size={16} className="text-emerald-600" />
            <span className="text-sm font-semibold text-slate-700">Tax Rate</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatTaxRate(taxSettings.taxRate)}</p>
          <p className="text-xs text-slate-500 mt-1">{getTaxRateDescription(taxSettings.taxRate)}</p>
        </div>
        
        <div className="glass rounded-2xl p-4 hover:shadow-soft transition-all duration-300">
          <div className="flex items-center space-x-3 mb-2">
            <Eye size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-slate-700">Display</span>
          </div>
          <p className="text-lg font-bold text-slate-800">
            {taxSettings.includeInDisplays ? 'Enabled' : 'Disabled'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Show in UI</p>
        </div>
        
        <div className="glass rounded-2xl p-4 hover:shadow-soft transition-all duration-300">
          <div className="flex items-center space-x-3 mb-2">
            <FileText size={16} className="text-purple-600" />
            <span className="text-sm font-semibold text-slate-700">Export</span>
          </div>
          <p className="text-lg font-bold text-slate-800">
            {taxSettings.includeInExports ? 'Enabled' : 'Disabled'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Include in CSV</p>
        </div>
      </div>

      {/* Expanded Settings */}
      {isExpanded && (
        <div className="space-y-6 animate-fade-in">
          {/* Tax Rate Slider */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mr-3"></div>
              Tax Rate Adjustment
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700">
                  Estimated Tax Rate
                </label>
                <span className="text-lg font-bold text-emerald-600">
                  {formatTaxRate(taxSettings.taxRate)}
                </span>
              </div>
              
              <input
                type="range"
                min="5"
                max="50"
                step="0.5"
                value={taxSettings.taxRate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-lg appearance-none cursor-pointer slider"
              />
              
              <div className="flex justify-between text-xs text-slate-500">
                <span>5%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>
            
            {/* Preset Buttons */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-700 mb-3">Quick Presets:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {TAX_RATE_PRESETS.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleRateChange(preset.rate)}
                    className={`p-3 rounded-xl text-left transition-all duration-300 hover:scale-105 ${
                      Math.abs(taxSettings.taxRate - preset.rate) < 0.1
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-soft'
                        : 'glass hover:shadow-soft text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm">{formatTaxRate(preset.rate)}</div>
                    <div className="text-xs opacity-90">{preset.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Display & Export Options */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mr-3"></div>
              Display Options
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 glass rounded-xl hover:shadow-soft transition-all duration-300">
                <div className="flex items-center space-x-3">
                  {taxSettings.includeInDisplays ? 
                    <Eye size={20} className="text-blue-600" /> : 
                    <EyeOff size={20} className="text-slate-400" />
                  }
                  <div>
                    <p className="font-semibold text-slate-800">Show in Interface</p>
                    <p className="text-sm text-slate-600">Display tax estimates in timer and summaries</p>
                  </div>
                </div>
                <button
                  onClick={handleDisplayToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    taxSettings.includeInDisplays ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      taxSettings.includeInDisplays ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 glass rounded-xl hover:shadow-soft transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <FileText size={20} className={taxSettings.includeInExports ? 'text-purple-600' : 'text-slate-400'} />
                  <div>
                    <p className="font-semibold text-slate-800">Include in Exports</p>
                    <p className="text-sm text-slate-600">Add tax columns to CSV files</p>
                  </div>
                </div>
                <button
                  onClick={handleExportToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    taxSettings.includeInExports ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      taxSettings.includeInExports ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Tax Preview */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mr-3"></div>
              Tax Estimate Preview
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <p className="text-sm font-semibold text-emerald-700 mb-1">Gross Earnings</p>
                <p className="text-xl font-bold text-emerald-800">${sampleTaxCalc.grossEarnings.toFixed(2)}</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200">
                <p className="text-sm font-semibold text-red-700 mb-1">Estimated Taxes</p>
                <p className="text-xl font-bold text-red-800">${sampleTaxCalc.taxAmount.toFixed(2)}</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <p className="text-sm font-semibold text-blue-700 mb-1">Net Earnings</p>
                <p className="text-xl font-bold text-blue-800">${sampleTaxCalc.netEarnings.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start space-x-3">
                <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Tax Estimation Disclaimer</p>
                  <p>
                    This is an estimate only. Actual taxes depend on your total income, deductions, 
                    filing status, and local tax laws. Consult a tax professional for accurate planning.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxSettingsComponent;