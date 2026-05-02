export default function ActivityFeed({ activities }) {
  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm transition-all hover:shadow-2xl hover:shadow-brand-500/5 group">
      <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-12 uppercase tracking-tight">Recent Activity</h3>
      
      <div className="space-y-10 relative ml-4 border-l-2 border-slate-100 pl-10 h-full">
        {activities.map((activity, idx) => (
          <div key={idx} className="relative transition-all duration-300 hover:translate-x-2 group/item">
            {/* Timeline Dot */}
            <div className={`absolute -left-[51px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-md transition-transform group-hover/item:scale-125
              ${activity.type === 'submission' ? 'bg-emerald-500' :
                activity.type === 'problem' ? 'bg-brand-500' :
                activity.type === 'system' ? 'bg-amber-500' : 'bg-slate-300'}`} />
            
            <div className="flex flex-col gap-2">
              <span className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover/item:text-brand-600 transition-colors">{activity.title}</span>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="text-brand-600 italic">@{activity.role || 'System'}</span>
                <span className="opacity-30">•</span>
                <span className="tabular-nums">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-12 py-5 text-[10px] font-black text-slate-900 hover:bg-slate-50 hover:text-brand-600 rounded-2xl transition-all uppercase tracking-[0.2em] border border-slate-200 shadow-sm active:scale-95">
        View All Records
      </button>
    </div>
  )
}
