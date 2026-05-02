import { SwatchBook } from 'lucide-react'

export default function ProgressCard({ title, percentage, stats }) {
  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm transition-all hover:shadow-2xl hover:shadow-brand-500/5 relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-brand-50/50" />
      
      <div className="flex items-center gap-6 mb-12 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-xl shadow-slate-200 shrink-0 transition-transform group-hover:rotate-6">
          <SwatchBook size={32} strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">{title}</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Aggregate Core Performance</p>
        </div>
      </div>

      <div className="relative pt-1 space-y-4 relative z-10">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[9px] font-black inline-block py-2 px-4 uppercase rounded-lg text-slate-900 bg-slate-100 border border-slate-200 shadow-sm tracking-widest">
            OPERATIONAL STATUS: ACTIVE
          </span>
          <div className="text-right shrink-0">
            <span className="text-[11px] font-black text-brand-600 tabular-nums uppercase tracking-widest">
              {percentage}% VELOCITY
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-4 rounded-full bg-slate-100 border border-slate-200 p-1 shadow-inner">
          <div style={{ width: `${percentage}%` }}
               className="h-full rounded-full bg-gradient-to-r from-slate-900 via-brand-600 to-brand-500 transition-all duration-1000 shadow-lg shadow-brand-500/10"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-12 pt-10 border-t border-slate-100 relative z-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="space-y-2 group/stat">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover/stat:text-brand-600 transition-colors truncate">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 tabular-nums uppercase tracking-tighter transition-transform group-hover/stat:translate-x-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
