export default function ActivityFeed({ activities }) {
  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-surface-700 shadow-sm transition-all hover:shadow-xl hover:shadow-brand-500/5">
      <h3 className="text-xl font-black text-surface-300 mb-10 uppercase tracking-tight">Recent Activity</h3>
      <div className="space-y-10 relative ml-4 border-l-2 border-surface-700 pl-10">
        {activities.map((activity, idx) => (
          <div key={idx} className="relative transition-all duration-300 hover:translate-x-2">
            {/* Timeline Dot */}
            <div className={`absolute -left-[51px] top-1.5 w-5 h-5 rounded-full border-4 border-white shadow-sm
              ${activity.type === 'submission' ? 'bg-emerald-500' :
                activity.type === 'problem' ? 'bg-brand-500' :
                activity.type === 'system' ? 'bg-amber-500' : 'bg-surface-700'}`} />
            
            <div className="flex flex-col gap-2">
              <span className="text-sm font-black text-surface-300 uppercase tracking-tight">{activity.title}</span>
              <div className="flex items-center gap-2 text-[10px] font-bold text-surface-500 uppercase tracking-widest">
                <span className="text-brand-600 italic">@{activity.role || 'System'}</span>
                <span>•</span>
                <span>{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-12 py-5 text-[10px] font-black text-brand-600 hover:bg-brand-50 rounded-2xl transition-all uppercase tracking-[0.2em] border border-surface-700">
        View All Records
      </button>
    </div>
  )
}
