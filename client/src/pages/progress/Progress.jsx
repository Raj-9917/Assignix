import { useState, useEffect, useMemo } from 'react'
import { TrendingUp, Flame, Target, Award, Rocket, CheckCircle2, AlertCircle, Zap, Swords, Loader2 } from 'lucide-react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import PageShell from '../../components/ui/PageShell'
import { mockMilestones } from '../../data/progress'
import { useAuth } from '../../context/AuthContext'
import { submissionService } from '../../services/submissionService'
import { problemService } from '../../services/problemService'
import { supabase } from '../../config/supabaseClient'

export default function Progress() {
  const { user, refreshUser } = useAuth()
  const [dbStats, setDbStats] = useState(null)
  const [allProblems, setAllProblems] = useState([])
  const [activityHistory, setActivityHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const solvedIds = useMemo(() => {
    if (!dbStats?.solvedIds) return []
    return dbStats.solvedIds.map(id => id.toString())
  }, [dbStats?.solvedIds])

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true)
        const [statsData, problemsData, historyData] = await Promise.all([
          submissionService.getStats(),
          problemService.getAllProblems(),
          submissionService.getActivityHistory()
        ])
        
        const { data: userSubmissions } = await supabase
          .from('submissions')
          .select('problem_id')
          .eq('user_id', user.id)
          .eq('status', 'Accepted');
          
        const solvedIds = [...new Set((userSubmissions || []).map(s => s.problem_id))];
        
        setDbStats({ ...statsData, solvedIds });
        setAllProblems(problemsData)
        setActivityHistory(historyData)
      } catch (err) {
        console.error('Failed to fetch progress data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user?.id, refreshUser]) // Now safe to depend on refreshUser

  // 1. Calculate Category Mastery (Radar Chart)
  const categoryMastery = useMemo(() => {
    if (!allProblems || allProblems.length === 0) return []
    const categories = [...new Set(allProblems.map(p => p.category))]
    return categories.map(cat => {
      const total = allProblems.filter(p => p.category === cat).length
      const solved = allProblems.filter(p => p.category === cat && solvedIds.includes(p.id)).length
      return { 
        subject: cat, 
        A: total > 0 ? Math.round((solved / total) * 100) : 0,
        fullMark: 100 
      }
    })
  }, [allProblems, solvedIds])

  // 2. Identify Weak Areas (< 30% completion)
  const weakAreas = categoryMastery
    .filter(m => m.A < 40) // Raised threshold to 40%
    .sort((a, b) => a.A - b.A)
    .slice(0, 3)

  // 3. Stats Aggregation
  const totalSolved = solvedIds.length
  const accuracy = dbStats?.accuracyRate || 0
  const currentStreak = user?.streak || 0
  const xp = user?.xp || 0

  return (
    <PageShell
      title="Performance Dashboard"
      subtitle="Track your coding practice and achievements."
      icon={TrendingUp}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-60 gap-4">
           <Loader2 size={64} className="animate-spin text-brand-600 opacity-20" />
           <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest leading-none">Fetching performance metrics...</p>
        </div>
      ) : (
        <div className="space-y-10 pb-20">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
              { label: 'Total Solved', val: totalSolved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Accuracy Rate', val: `${accuracy}%`, icon: Target, color: 'text-brand-600', bg: 'bg-brand-50' },
              { label: 'Current Streak', val: `${currentStreak} Days`, icon: Flame, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Global Rank', val: 'Unranked', icon: Swords, color: 'text-purple-600', bg: 'bg-purple-50' }
           ].map((stat, i) => (
              <div key={i} className="p-8 rounded-[2.5rem] bg-white border border-surface-700 shadow-sm group hover:border-brand-500/30 transition-all hover:shadow-xl hover:shadow-brand-500/5">
                 <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-8 shadow-sm border border-black/5`}>
                    <stat.icon size={28} strokeWidth={2.5} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] leading-none">{stat.label}</p>
                    <h3 className="text-3xl font-black text-surface-300 tracking-tight leading-none pt-2 uppercase">{stat.val}</h3>
                 </div>
              </div>
           ))}
        </div>

        {/* Charts & Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Activity History Area Chart */}
           <div className="lg:col-span-8 p-6 sm:p-12 rounded-[2rem] sm:rounded-[3.5rem] bg-white border border-surface-700 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-brand-500/5 transition-all">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-4">
                 <div className="space-y-2">
                    <h4 className="text-2xl font-black text-surface-300 uppercase tracking-tight">Your Activity</h4>
                    <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest italic">Historical problem solving activity</p>
                 </div>
                 <div className="flex gap-3 px-4 py-2 bg-brand-50 rounded-full border border-brand-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-pulse" />
                    <span className="text-[10px] font-black text-brand-700 uppercase tracking-widest leading-none">Live Sync Active</span>
                 </div>
              </div>
              <div className="h-80 w-full">
                 {activityHistory && activityHistory.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityHistory}>
                       <defs>
                          <linearGradient id="colorSolves" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                             <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                       <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(str) => str.split('-')[2]} tick={{fontWeight: '900', fill: '#64748b'}} />
                       <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tick={{fontWeight: '900', fill: '#64748b'}} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', fontSize: '10px', color: '#0f172a', fontWeight: '900', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ color: '#2563eb', fontWeight: '900', textTransform: 'uppercase' }}
                       />
                       <Area 
                          type="monotone" 
                          dataKey="solves" 
                          stroke="#2563eb" 
                          strokeWidth={6} 
                          fillOpacity={1} 
                          fill="url(#colorSolves)" 
                          animationDuration={2000}
                       />
                    </AreaChart>
                 </ResponsiveContainer>
                 ) : (
                    <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-surface-200 rounded-3xl">
                       <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest text-center">No activity data to display.<br/>Start solving problems to populate chart.</p>
                    </div>
                 )}
              </div>
           </div>

           {/* Category Mastery Radar Chart */}
           <div className="lg:col-span-4 p-6 sm:p-12 rounded-[2rem] sm:rounded-[3.5rem] bg-white border border-surface-700 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition-all">
              <div className="space-y-2 mb-8 sm:mb-12">
                 <h4 className="text-xl sm:text-2xl font-black text-surface-300 uppercase tracking-tight">Skills Breakdown</h4>
                 <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest italic">Proficiency by category</p>
              </div>
              <div className="h-80 w-full">
                 {categoryMastery && categoryMastery.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryMastery}>
                       <PolarGrid stroke="#e2e8f0" />
                       <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} tick={{fontWeight: '900', textTransform: 'uppercase'}} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                       <Radar 
                          name="Mastery" 
                          dataKey="A" 
                          stroke="#2563eb" 
                          fill="#3b82f6" 
                          fillOpacity={0.2} 
                       />
                    </RadarChart>
                 </ResponsiveContainer>
                 ) : (
                    <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-surface-200 rounded-3xl">
                       <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest text-center">No skills data available.<br/>Complete challenges to see breakdown.</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Areas for Improvement & Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Areas for Improvement List */}
           <div className="p-10 rounded-[3rem] bg-white border border-surface-700 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                 <AlertCircle size={28} className="text-amber-600" strokeWidth={2.5} />
                 <h4 className="text-2xl font-black text-surface-300 uppercase tracking-tight">Areas for Improvement</h4>
              </div>
              <div className="space-y-5">
                 {weakAreas.length > 0 ? weakAreas.map((area, i) => (
                    <div key={i} className="flex flex-col gap-3 p-6 rounded-[2rem] bg-slate-50 border border-surface-700 shadow-inner group">
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-surface-300 uppercase tracking-widest">{area.subject}</span>
                          <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 shadow-sm">High Priority</span>
                       </div>
                       <div className="h-3 w-full bg-white rounded-full overflow-hidden border border-surface-700 p-0.5">
                          <div className="h-full bg-amber-500 rounded-full transition-all duration-1000 shadow-lg shadow-amber-500/20" style={{ width: `${area.A}%` }} />
                       </div>
                       <p className="text-[10px] text-surface-500 italic font-black uppercase tracking-widest opacity-60">Focus on {area.subject.toLowerCase()} practice.</p>
                    </div>
                 )) : (
                    <div className="text-center py-12 text-surface-500 font-black uppercase tracking-widest text-sm opacity-40">No weak areas identified. Performance optimized.</div>
                 )}
              </div>
           </div>

           {/* Achievements / Milestones */}
           <div className="p-10 rounded-[3rem] bg-white border border-surface-700 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                 <Award size={28} className="text-brand-600" strokeWidth={2.5} />
                 <h4 className="text-2xl font-black text-surface-300 uppercase tracking-tight">Achievements</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                 {mockMilestones.length > 0 ? mockMilestones.map((milestone) => (
                    <div key={milestone.id} className={`p-5 rounded-[2rem] border transition-all ${
                       milestone.status === 'unlocked' 
                       ? 'bg-brand-50 border-brand-200' 
                       : 'bg-slate-50 border-surface-700 opacity-40 grayscale'
                    }`}>
                       <div className="flex items-start justify-between mb-5">
                          <div className={`p-3 rounded-2xl border ${
                             milestone.status === 'unlocked' ? 'bg-brand-600 text-white border-brand-400 shadow-lg shadow-brand-500/20' : 'bg-white text-surface-600 border-surface-700 shadow-sm'
                          }`}>
                             {milestone.icon === 'Rocket' ? <Rocket size={18} /> : milestone.icon === 'Flame' ? <Flame size={18} /> : milestone.icon === 'Award' ? <Award size={18} /> : <Swords size={18} />}
                          </div>
                          {milestone.status === 'unlocked' && <CheckCircle2 size={16} className="text-emerald-600" />}
                       </div>
                       <div className="space-y-1">
                          <h5 className="text-[11px] font-black text-surface-300 uppercase tracking-widest leading-tight">{milestone.title}</h5>
                          <p className="text-[10px] text-surface-500 font-bold leading-relaxed pt-1 uppercase opacity-60 tracking-tighter">{milestone.description}</p>
                       </div>
                    </div>
                 )) : (
                    <div className="col-span-2 py-12 text-center text-surface-500 font-black uppercase tracking-widest text-[10px] opacity-40 italic">
                       No achievements recorded yet.
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
      )}
    </PageShell>
  )
}
