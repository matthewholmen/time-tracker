import React, { useState } from 'react';
import { Settings, DollarSign, Calculator, Info, Eye, EyeOff, FileText, Zap, Shield, Cpu } from 'lucide-react';
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
    <div className="mb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Calculator className="w-6 h-6 neon-purple animate-pulse" />
          <div>
            <h2 className="text-2xl font-cyber font-black neon-purple tracking-wider">
              TAX CALCULATION MATRIX
            </h2>
            <p className="text-sm text-purple-400 font-mono mt-1">
              Financial computation protocols
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-cyber-purple hover:text-purple-400 transition-colors p-2 rounded-lg border border-cyber-purple/30 hover:border-cyber-purple/60"
          title={isExpanded ? 'Collapse settings' : 'Expand settings'}
        >
          <div className="flex items-center space-x-2 text-sm font-mono">
            <Settings size={18} className={isExpanded ? 'animate-pulse' : ''} />
            <span className="hidden sm:inline font-bold tracking-wider">{isExpanded ? 'COLLAPSE' : 'EXPAND'}</span>
          </div>
        </button>
      </div>

      {/* Quick Tax Rate Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="cyber-card p-6 hover:border-cyber-purple transition-all duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <DollarSign className="w-5 h-5 text-cyber-purple animate-pulse" />
            <span className="text-sm font-mono font-bold text-purple-400 tracking-wider">
              TAX_RATE
            </span>
          </div>
          <p className="text-2xl font-cyber font-black neon-purple">{formatTaxRate(taxSettings.taxRate)}</p>
          <p className="text-xs text-purple-300 mt-2 font-mono">{getTaxRateDescription(taxSettings.taxRate)}</p>
        </div>
        
        <div className="cyber-card p-6 hover:border-cyber-purple transition-all duration-300">
          <div className="flex items-center space-x-3 mb-3">
            {taxSettings.includeInDisplays ? 
              <Eye className="w-5 h-5 text-matrix-500 animate-pulse" /> : 
              <EyeOff className="w-5 h-5 text-terminal-medium" />
            }
            <span className="text-sm font-mono font-bold text-purple-400 tracking-wider">
              DISPLAY_MODE
            </span>
          </div>
          <p className={`text-lg font-cyber font-black ${
            taxSettings.includeInDisplays ? 'matrix-text' : 'text-terminal-medium'
          }`}>
            {taxSettings.includeInDisplays ? 'ENABLED' : 'DISABLED'}
          </p>
          <p className="text-xs text-purple-300 mt-2 font-mono">UI INTEGRATION</p>
        </div>
        
        <div className="cyber-card p-6 hover:border-cyber-purple transition-all duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <FileText className={`w-5 h-5 ${taxSettings.includeInExports ? 'text-cyber-cyan animate-pulse' : 'text-terminal-medium'}`} />
            <span className="text-sm font-mono font-bold text-purple-400 tracking-wider">
              EXPORT_PROTOCOL
            </span>
          </div>
          <p className={`text-lg font-cyber font-black ${
            taxSettings.includeInExports ? 'neon-cyan' : 'text-terminal-medium'
          }`}>
            {taxSettings.includeInExports ? 'ENABLED' : 'DISABLED'}
          </p>
          <p className="text-xs text-purple-300 mt-2 font-mono">CSV INCLUSION</p>
        </div>
      </div>

      {/* Expanded Settings */}
      {isExpanded && (
        <div className="space-y-6 animate-fade-in">
          {/* Tax Rate Slider */}
          <div className="cyber-card p-6">
            <div className="border-l-4 border-cyber-purple pl-4 mb-6">
              <h3 className="text-lg font-cyber font-bold neon-purple tracking-wide">
                &gt; TAX_RATE_ADJUSTMENT.EXE
              </h3>
              <p className="text-sm text-purple-400 font-mono mt-1">
                Configure taxation calculation parameters
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-mono font-bold matrix-text tracking-wider">
                  ESTIMATED_TAX_RATE:
                </label>
                <span className="text-xl font-cyber font-black neon-purple">
                  {formatTaxRate(taxSettings.taxRate)}
                </span>
              </div>
              
              {/* Clean Cyber Slider */}
              <div className="relative">
                <div className="cyber-progress h-8 relative">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="0.5"
                    value={taxSettings.taxRate}
                    onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div 
                    className="cyber-progress-bar h-full"
                    style={{width: `${((taxSettings.taxRate - 5) / (50 - 5)) * 100}%`}}
                  />
                  {/* Value display overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs font-mono font-bold text-white mix-blend-difference tracking-wider">
                      {formatTaxRate(taxSettings.taxRate)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-matrix-600 font-mono">
                <span>5%_MIN</span>
                <span>25%_STANDARD</span>
                <span>50%_MAX</span>
              </div>
            </div>
            
            {/* Preset Buttons */}
            <div className="mt-8">
              <p className="text-sm font-mono font-bold matrix-text mb-4 tracking-wider">PRESET_CONFIGURATIONS:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {TAX_RATE_PRESETS.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleRateChange(preset.rate)}
                    className={`p-4 text-left transition-all duration-300 border rounded-lg ${
                      Math.abs(taxSettings.taxRate - preset.rate) < 0.1
                        ? 'border-cyber-purple text-cyber-purple bg-cyber-purple/20 animate-neon-pulse'
                        : 'border-terminal-medium text-matrix-600 hover:border-cyber-purple hover:text-cyber-purple'
                    }`}
                  >
                    <div className="font-cyber font-bold text-sm">{formatTaxRate(preset.rate)}</div>
                    <div className="text-xs font-mono opacity-80 mt-1">{preset.label.toUpperCase()}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Display & Export Options */}
          <div className="cyber-card p-6">
            <div className="border-l-4 border-cyber-cyan pl-4 mb-6">
              <h3 className="text-lg font-cyber font-bold neon-cyan tracking-wide">
                &gt; DISPLAY_OPTIONS.CFG
              </h3>
              <p className="text-sm text-cyan-400 font-mono mt-1">
                Configure interface display parameters
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="cyber-card p-4 hover:border-matrix-500 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {taxSettings.includeInDisplays ? 
                      <Eye className="w-6 h-6 text-matrix-500 animate-pulse" /> : 
                      <EyeOff className="w-6 h-6 text-terminal-medium" />
                    }
                    <div>
                      <p className="font-mono font-bold matrix-text tracking-wider">UI_INTEGRATION</p>
                      <p className="text-sm text-matrix-600 font-mono">Display tax estimates in neural interface</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDisplayToggle}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full border-2 transition-colors focus:outline-none ${
                      taxSettings.includeInDisplays ? 'border-matrix-500 bg-matrix-500/20' : 'border-terminal-medium bg-terminal-medium/20'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full transition-transform ${
                        taxSettings.includeInDisplays 
                          ? 'translate-x-8 bg-matrix-500 shadow-neon-green' 
                          : 'translate-x-1 bg-terminal-medium'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              <div className="cyber-card p-4 hover:border-cyber-cyan transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FileText className={`w-6 h-6 ${taxSettings.includeInExports ? 'text-cyber-cyan animate-pulse' : 'text-terminal-medium'}`} />
                    <div>
                      <p className="font-mono font-bold matrix-text tracking-wider">EXPORT_PROTOCOL</p>
                      <p className="text-sm text-matrix-600 font-mono">Include tax data in CSV transmission</p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportToggle}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full border-2 transition-colors focus:outline-none ${
                      taxSettings.includeInExports ? 'border-cyber-cyan bg-cyber-cyan/20' : 'border-terminal-medium bg-terminal-medium/20'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full transition-transform ${
                        taxSettings.includeInExports 
                          ? 'translate-x-8 bg-cyber-cyan shadow-neon-cyan' 
                          : 'translate-x-1 bg-terminal-medium'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Preview */}
          <div className="cyber-card p-6">
            <div className="border-l-4 border-cyber-yellow pl-4 mb-6">
              <h3 className="text-lg font-cyber font-bold neon-yellow tracking-wide">
                &gt; TAX_SIMULATION.LOG
              </h3>
              <p className="text-sm text-yellow-400 font-mono mt-1">
                Preview calculation results
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="cyber-card p-6 text-center border-matrix-500">
                <div className="flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-matrix-500 mr-2 animate-pulse" />
                  <span className="text-sm font-mono text-matrix-600 tracking-wider">
                    GROSS_EARNINGS
                  </span>
                </div>
                <p className="text-2xl font-cyber font-black matrix-text">${sampleTaxCalc.grossEarnings.toFixed(2)}</p>
              </div>
              
              <div className="cyber-card p-6 text-center border-cyber-red">
                <div className="flex items-center justify-center mb-3">
                  <Calculator className="w-5 h-5 text-cyber-red mr-2 animate-pulse" />
                  <span className="text-sm font-mono text-red-400 tracking-wider">
                    TAX_DEDUCTION
                  </span>
                </div>
                <p className="text-2xl font-cyber font-black text-cyber-red">${sampleTaxCalc.taxAmount.toFixed(2)}</p>
              </div>
              
              <div className="cyber-card p-6 text-center border-cyber-cyan">
                <div className="flex items-center justify-center mb-3">
                  <Shield className="w-5 h-5 text-cyber-cyan mr-2 animate-pulse" />
                  <span className="text-sm font-mono text-cyan-400 tracking-wider">
                    NET_EARNINGS
                  </span>
                </div>
                <p className="text-2xl font-cyber font-black neon-cyan">${sampleTaxCalc.netEarnings.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="terminal-window p-4 bg-terminal-black border-2 border-cyber-yellow">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-cyber-yellow mt-0.5 flex-shrink-0 animate-pulse" />
                <div className="text-sm font-mono">
                  <p className="font-bold neon-yellow mb-2 tracking-wider">
                    [WARNING] TAX_ESTIMATION_DISCLAIMER
                  </p>
                  <p className="text-yellow-300 leading-relaxed">
                    &gt; This is a simulation only. Actual tax calculations depend on total income, 
                    deductions, filing status, and jurisdictional tax protocols. 
                    Consult certified tax professional for accurate financial planning.
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