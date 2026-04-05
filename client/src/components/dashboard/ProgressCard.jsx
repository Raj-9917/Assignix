import { SwatchBook } from 'lucide-react'

export default function ProgressCard({ title, percentage, goals, stats }) {
  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-surface-700 shadow-sm transition-all hover:shadow-xl hover:shadow-brand-500/5">
      <div className="flex items-center gap-6 mb-10">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm">
          <SwatchBook size={32} strokeWidth={2.5} />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-surface-300 uppercase tracking-tight">{title}</h3>
          <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Aggregate Performance Metric</p>
        </div>
      </div>

      <div className="relative pt-1 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black inline-block py-2 px-4 uppercase rounded-full text-brand-700 bg-brand-50 border border-brand-100 shadow-sm tracking-widest">
            Operational Status: Active
          </span>
          <div className="text-right">
            <span className="text-xs font-black text-brand-600 tabular-nums uppercase tracking-widest">
              {percentage}% Velocity
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-4 rounded-full bg-slate-100 border border-surface-700 p-0.5 shadow-inner">
          <div style={{ width: `${percentage}%` }}
               className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-1000 shadow-lg shadow-brand-500/20"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-10 border-t border-surface-700">
        {stats.map((stat, idx) => (
          <div key={idx} className="space-y-2 group">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-surface-500 group-hover:text-brand-600 transition-colors">{stat.label}</p>
            <p className="text-2xl font-black text-surface-300 tabular-nums uppercase tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
