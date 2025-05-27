import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface NotificationProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  isOpen,
  title,
  message,
  type,
  onClose
}) => {
  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-500',
          bgGradient: 'bg-gradient-success',
          borderColor: 'border-green-200'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-500',
          bgGradient: 'bg-gradient-warning',
          borderColor: 'border-amber-200'
        };
      case 'error':
        return {
          icon: XCircle,
          iconColor: 'text-red-500',
          bgGradient: 'bg-gradient-to-br from-red-500 to-rose-600',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: Info,
          iconColor: 'text-blue-500',
          bgGradient: 'bg-gradient-primary',
          borderColor: 'border-blue-200'
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Notification */}
      <div className="relative glass rounded-3xl shadow-glass p-8 max-w-md w-full animate-scale-in border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl bg-opacity-20 ${config.iconColor}`}>
              <IconComponent size={24} className={config.iconColor} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 glass rounded-xl text-slate-500 hover:text-slate-700 transition-all duration-300 hover:scale-110"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Message */}
        <p className="text-slate-600 mb-6 leading-relaxed">
          {message}
        </p>
        
        {/* Action */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-3 hover:shadow-elevated text-white rounded-2xl transition-all duration-300 transform hover:scale-105 font-semibold ${config.bgGradient}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;