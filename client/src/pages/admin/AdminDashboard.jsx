import { useState, useEffect } from 'react'
import { 
  Users, 
  ShieldCheck, 
  Trophy, 
  Activity, 
  ArrowUpRight, 
  Users2,
  BookOpen,
  Code2,
  Plus
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import adminService from '../../services/adminService'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState([
    { label: 'Total Users', val: '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Classes', val: '0', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Challenges', val: '0', icon: Code2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total XP', val: '0', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' }
  ])

  const [recentUsers, setRecentUsers] = useState([])
  const [, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await adminService.getAdminStats()
        
        setStats(prev => {
          const next = [...prev]
          next[0].val = (data.total_users || 0).toString()
          next[1].val = (data.active_classes || 0).toString()
          next[2].val = (data.challenges_count || 0).toString()
          next[3].val = ((data.total_xp || 0) / 1000).toFixed(1) + 'K'
          return next
        })

        setRecentUsers(data.recent_users || [])
      } catch (err) {
        console.error('Failed to fetch admin stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Command Overview</h1>
          <p className="text-sm font-medium text-slate-500">System metrics and real-time environment status.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">System Online</span>
          </div>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-500/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon size={22} strokeWidth={2.5} />
              </div>
              <div className="px-2 py-1 bg-slate-50 rounded text-[10px] font-bold text-slate-400">REALTIME</div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.val}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Activity size={18} className="text-brand-600" />
              Latest Enrollments
            </h3>
            <button className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">User Identity</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(recentUsers || []).map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-600 text-xs">
                          {u.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium lowercase italic">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        u.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                        u.role === 'teacher' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Active</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-brand-600 p-8 rounded-[2.5rem] shadow-xl shadow-brand-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 group-hover:scale-110 transition-transform">
              <Users2 size={120} strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Grow the Network</h3>
              <p className="text-brand-100 text-xs font-medium mb-6">Manually provision new educators or system admins.</p>
              <button 
                onClick={() => navigate('/admin/users')}
                className="w-full py-4 bg-white text-brand-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-brand-50 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} strokeWidth={3} /> Create User Account
              </button>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform">
              <ShieldCheck size={120} strokeWidth={1} />
            </div>
            <div className="relative z-10 text-white">
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">System Guard</h3>
              <p className="text-slate-400 text-xs font-medium mb-6">Sensitive administrative tools and global clear functionality.</p>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/admin/settings')}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  Audit Access Logs
                </button>
                <button className="w-full py-3 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/20 text-rose-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                  Emergency Lockout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

