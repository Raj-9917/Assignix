import React from 'react';
import { ShieldAlert, X, AlertTriangle, Loader2 } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  variant = 'danger',
  loading = false
}) {
  if (!isOpen) return null;

  const variants = {
    danger: {
      bg: 'bg-rose-500',
      text: 'text-rose-500',
      border: 'border-rose-500/20',
      hover: 'hover:bg-rose-600',
      light: 'bg-rose-50',
      icon: <AlertTriangle className="text-white" size={28} />
    },
    brand: {
      bg: 'bg-brand-600',
      text: 'text-brand-600',
      border: 'border-brand-500/20',
      hover: 'hover:bg-brand-500',
      light: 'bg-brand-50',
      icon: <ShieldAlert className="text-white" size={28} />
    }
  };

  const currentVariant = variants[variant] || variants.danger;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fade-in" 
        onClick={!loading ? onClose : undefined} 
      />
      
      {/* Modal Card */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl relative z-10 animate-zoom-in overflow-hidden border border-slate-100">
        {/* Header Visual */}
        <div className={`h-2 ${currentVariant.bg} opacity-80`} />
        
        <div className="p-8 sm:p-10 space-y-8">
          <div className="text-center space-y-4">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 ${currentVariant.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl ${variant === 'danger' ? 'shadow-rose-500/20' : 'shadow-brand-500/20'} animate-bounce-subtle`}>
              {currentVariant.icon}
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">
              {title}
            </h3>
            
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4">
              {message}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={`flex-[2] py-4 rounded-2xl ${currentVariant.bg} text-white text-[10px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 ${currentVariant.hover}`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>

        {/* Action Close */}
        <button 
          onClick={onClose} 
          disabled={loading}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-all"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
