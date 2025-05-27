import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-500',
          confirmButton: 'bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white'
        };
      case 'warning':
        return {
          icon: 'text-amber-500',
          confirmButton: 'bg-gradient-warning text-white'
        };
      default:
        return {
          icon: 'text-blue-500',
          confirmButton: 'bg-gradient-primary text-white'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onCancel}
      ></div>
      
      {/* Dialog */}
      <div className="relative glass rounded-3xl shadow-glass p-8 max-w-md w-full animate-scale-in border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl bg-opacity-20 ${styles.icon}`}>
              <AlertTriangle size={24} className={styles.icon} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-2 glass rounded-xl text-slate-500 hover:text-slate-700 transition-all duration-300 hover:scale-110"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Message */}
        <p className="text-slate-600 mb-8 leading-relaxed">
          {message}
        </p>
        
        {/* Actions */}
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-3 glass hover:shadow-soft text-slate-700 hover:text-slate-900 rounded-2xl transition-all duration-300 transform hover:scale-105 font-semibold"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-3 hover:shadow-elevated rounded-2xl transition-all duration-300 transform hover:scale-105 font-semibold ${styles.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;