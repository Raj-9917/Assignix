import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color = 'brand' }) {
  const isPositive = trend === 'up'
  
  const colorClasses = {
    brand: 'bg-brand-50 text-brand-600 border-brand-100 shadow-brand-500/5',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/5',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/5',
    rose: 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-500/5',
  }

  const activeColor = colorClasses[color] || colorClasses.brand

  return (
    <div className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-brand-500/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-brand-500/5 active:scale-[0.98] overflow-hidden relative">
      {/* Decorative subtle gradient */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-slate-50 to-transparent pointer-events-none" />
      
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:rotate-3 ${activeColor}`}>
          <Icon size={28} strokeWidth={1.5} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm
            ${isPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
            {isPositive ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
            {trendValue}
          </div>
        )}
      </div>
      
      <div className="space-y-1 relative z-10">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
        <p className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">
          {value}
        </p>
        <div className="h-1 w-8 bg-slate-900 rounded-full group-hover:w-16 transition-all duration-500 mt-2" />
      </div>
    </div>
  )
}
