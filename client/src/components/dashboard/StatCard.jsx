import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color = 'brand' }) {
  const isPositive = trend === 'up'
  
  const colorClasses = {
    brand: 'bg-brand-50 text-brand-600 border-brand-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  }

  const activeColor = colorClasses[color] || colorClasses.brand

  return (
    <div className="group bg-white rounded-3xl p-6 border border-surface-700 hover:border-brand-500/30 transition-all duration-300 shadow-sm">
      <div className="flex items-start justify-between mb-5">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${activeColor}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm
            ${isPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
            {isPositive ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
            {trendValue}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-[10px] font-black text-surface-500 uppercase tracking-widest">{title}</h3>
        <p className="text-3xl font-black text-surface-300 tabular-nums tracking-tighter">
          {value}
        </p>
      </div>
    </div>
  )
}
