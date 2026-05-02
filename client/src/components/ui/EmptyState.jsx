import React from 'react';
import { PackageOpen, ArrowRight } from 'lucide-react';

export default function EmptyState(props) {
  const { 
    icon = PackageOpen, 
    title = "No Data Found", 
    description = "There is currently no data available in this view.",
    actionText,
    onAction,
    className = ""
  } = props;
  const Icon = icon;
  return (
    <div className={`w-full py-16 sm:py-24 px-6 flex flex-col items-center justify-center text-center bg-white rounded-[2.5rem] border border-slate-200 border-dashed ${className}`}>
      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
        <Icon size={32} className="text-slate-300" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">
        {title}
      </h3>
      
      <p className="text-sm font-medium text-slate-500 max-w-sm leading-relaxed mb-8">
        {description}
      </p>

      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="group flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-brand-600 hover:shadow-brand-500/20 active:scale-95 transition-all duration-300"
        >
          {actionText}
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
}
