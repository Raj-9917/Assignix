import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Swords, Target, Layers, Cpu, Hash, Brackets, ChevronRight, Zap, Trophy, Play, Users, Medal, Star, Flame, Loader2, CheckCircle2, Plus, Settings } from 'lucide-react'
import PageShell from '../../components/ui/PageShell'
import { problemService } from '../../services/problemService'
import { arenaService } from '../../services/arenaService'
import adminService from '../../services/adminService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

import ProblemSubmissionModal from '../../components/modals/ProblemSubmissionModal'

export default function Practice() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const [problems, setProblems] = useState([])
  const [arenaProblems, setArenaProblems] = useState([])
  const [solved_problems, setSolved_problems] = useState([])
  const [arenaStats, setArenaStats] = useState({})
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [registeringId, setRegisteringId] = useState(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const results = await Promise.allSettled([
        problemService.getAllProblems(),
        problemService.getArenaProblems(),
        arenaService.getStats(),
        arenaService.getLeaderboard()
      ]);

      const [problemRes, arenaPromRes, statsRes, leaderboardRes] = results;

      if (problemRes.status === 'fulfilled') {
        const practiceOnly = problemRes.value.filter(p => p.is_practice !== false);
        setProblems(practiceOnly);
      } else {
        console.error('Problem Service Failure:', problemRes.reason);
      }

      if (arenaPromRes.status === 'fulfilled') {
        setArenaProblems(arenaPromRes.value);
      } else {
        console.error('Arena Problems Failure:', arenaPromRes.reason);
      }

      if (statsRes.status === 'fulfilled') {
        setArenaStats(statsRes.value);
      } else {
        console.error('Arena Stats Failure:', statsRes.reason);
      }

      if (leaderboardRes.status === 'fulfilled') {
        setLeaderboard(leaderboardRes.value);
      } else {
        console.error('Leaderboard Failure:', leaderboardRes.reason);
      }

      setSolved_problems(user?.solved_problems || []);

      // If all critical services failed, show a toast
      if (results.every(r => r.status === 'rejected')) {
        toast.error('Failed to sync Training Grounds: All services offline');
      }
    } catch (err) {
      console.error('Critical sync failure:', err);
      toast.error('Failed to sync Training Grounds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData()
  }, [user])

  const handleRegister = async (problemId) => {
    try {
      setRegisteringId(problemId)
      await arenaService.register(problemId)
      // Refresh stats
      const newStats = await arenaService.getStats()
      setArenaStats(newStats)
      toast.success('Battle Registered! You are now ranked for this problem.')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setRegisteringId(null)
    }
  }

  const handleDeleteProblem = async (id) => {
    if (window.confirm('Delete this arena problem permanently?')) {
      try {
        await adminService.deleteProblem(id);
        setArenaProblems(prev => prev.filter(p => p.id !== id));
        toast.success('Problem deleted successfully');
      } catch (err) {
        toast.error('Failed to delete problem');
      }
    }
  };

  // Categories
  const categories = [...new Set(problems.map(p => p.category))]
  
  const topics = categories.map(cat => {
    const problemsInCat = problems.filter(p => p.category === cat)
    const totalInCat = problemsInCat.length
    const solvedInCat = problemsInCat.filter(p => (solved_problems || []).includes(p.id)).length
    
    return {
      name: cat,
      total: totalInCat,
      solved: solvedInCat,
      progress: totalInCat > 0 ? Math.round((solvedInCat / totalInCat) * 100) : 0,
      icon: cat.includes('Array') ? Layers : cat.includes('Logic') ? Target : cat.includes('General') ? Cpu : Hash,
      hasHard: problemsInCat.some(p => p.difficulty === 'Hard')
    }
  })

  // Filter for Hardest Arena problems
  const priorityBattles = arenaProblems.slice(0, 3)

  if (loading) {
    return (
      <PageShell title="Training Grounds" icon={Swords}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={48} className="animate-spin text-brand-600" />
          <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Entering the Arena...</p>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Training Grounds"
      subtitle="The ultimate training ground. Register for elite matches and climb the global hacker rankings."
      icon={Swords}
      breadcrumbs={[
        { label: 'Platform', path: '/dashboard' },
        { label: 'Training Grounds' }
      ]}
    >
      <div className="space-y-12 pb-20">
        <ProblemSubmissionModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} />
        
        {isAdmin && (
          <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-indigo-50/50 border border-indigo-100 animate-slide-up">
            <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20">
              <Settings size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest leading-none mb-1">Combat Operations Console</h4>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-tight opacity-70">Oversee active battles, monitor leaderboards, and manage the arena.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/admin/challenges')} className="px-5 py-2.5 bg-white border border-indigo-200 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-2">
                <Swords size={14} /> Manage Arena
              </button>
              <button onClick={() => navigate('/admin')} className="px-5 py-2.5 bg-white border border-indigo-200 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-2">
                <Trophy size={14} /> System Stats
              </button>
            </div>
          </div>
        )}
        
        {/* Top Feature: Elite Ranking Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <section className="lg:col-span-2 relative p-12 rounded-[3.5rem] bg-brand-600 border border-brand-500 overflow-hidden shadow-2xl shadow-brand-500/20 group">
            <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:scale-110 transition-transform duration-1000 rotate-12">
              <Swords size={220} className="text-white" strokeWidth={2.5} />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <span className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-brand-600 text-[10px] font-black uppercase tracking-[0.2em] leading-none shadow-lg">
                    <Flame size={14} fill="currentColor" />
                    Live Battlefield
                  </span>
                   <span className="text-[10px] text-white/70 font-black uppercase tracking-widest">Hacker Points active</span>
                </div>
                <button 
                  onClick={() => setShowSubmitModal(true)}
                  className="px-6 py-2 rounded-full border border-white/30 text-white text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-brand-600 transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Contribute Challenge
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-4xl font-black text-white tracking-tight uppercase leading-none">The Warrior's Path</h3>
                <p className="text-white/80 text-sm leading-relaxed font-medium max-w-xl">
                  Registering for unsolved or hard problems places you in the global rankings. Each problem solved in the arena grants 100 Hacker Points.
                </p>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {leaderboard.slice(0, 5).map((hacker, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-brand-600 bg-white flex items-center justify-center text-[10px] font-black text-brand-600 shadow-md">
                      {hacker.name?.charAt(0) || hacker.username?.charAt(0) || '?'}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">
                  {leaderboard.length} Warriors competing right now
                </p>
              </div>
            </div>
          </section>

          {/* Quick Stats Sidebar */}
          <div className="rounded-[3rem] bg-white border border-surface-700 p-8 flex flex-col justify-center gap-8 shadow-sm">
             <div className="space-y-2">
                <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest flex items-center gap-2">
                   <Target size={14} className="text-brand-600" /> Solved Mastery
                </p>
                <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-black text-brand-600">{(solved_problems || []).length}</span>
                   <span className="text-xs font-bold text-surface-500">/ {problems.length}</span>
                </div>
             </div>
             <div className="h-px bg-surface-700/50" />
             <div className="space-y-2">
                <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest flex items-center gap-2">
                   <Trophy size={14} className="text-amber-500" /> Global Rank
                </p>
                <div className="flex items-baseline gap-2">
                   <span className="text-3xl font-black text-surface-300">#12</span>
                   <span className="text-[10px] font-black text-amber-600 uppercase">Master Hacker</span>
                </div>
             </div>
          </div>
        </div>

        {/* Elite Challenges (Training Grounds / Hardest) */}
        {priorityBattles.length > 0 && (
          <div className="space-y-8">
            <h4 className="text-sm font-black text-surface-400 flex items-center gap-3 uppercase tracking-widest">
              <Zap size={18} className="text-amber-500" fill="currentColor" /> Global Arena: Hardest Battles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {priorityBattles.map(p => (
                <div key={p.id} className="p-8 rounded-[2.5rem] bg-white border border-surface-700 hover:border-brand-500/40 transition-all group relative overflow-hidden shadow-sm">
                   <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-surface-700 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500">
                        <Swords size={24} />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[8px] font-black px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-full uppercase tracking-tighter">Rank #{p.hardnessScore || 0} Hard</span>
                        {p.creator && <span className="text-[7px] font-bold text-surface-500 uppercase">By {p.creator.username}</span>}
                        {user?.role === 'admin' && (
                          <button 
                            onClick={() => handleDeleteProblem(p.id)}
                            className="mt-2 p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Problem"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                   </div>
                   <h5 className="text-lg font-black text-surface-300 uppercase tracking-tight mb-2 truncate">{p.title}</h5>
                   <p className="text-[9px] font-bold text-surface-500 uppercase tracking-widest mb-6">{p.category} • {arenaStats[p.id] || 0} Registered</p>
                   
                   <div className="flex gap-2">
                      <button 
                        onClick={() => handleRegister(p.id)}
                        disabled={registeringId === p.id || (solved_problems || []).some(sp => sp === p.id)}
                        className="flex-1 py-3 rounded-xl bg-surface-900 border border-surface-700 text-surface-300 text-[10px] font-black uppercase tracking-widest hover:border-brand-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                         {(solved_problems || []).some(sp => sp === p.id) ? (
                           <CheckCircle2 size={14} className="text-emerald-500" />
                         ) : registeringId === p.id ? (
                           <Loader2 size={12} className="animate-spin" />
                         ) : (
                           <Users size={14} />
                         )}
                         {(solved_problems || []).some(sp => sp === p.id) ? 'Defeated' : 'Register'}
                      </button>
                      <Link 
                        to={`/prepare/${p.id}`}
                        className="p-3 rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 transition-all"
                      >
                         <Play size={14} fill="currentColor" />
                      </Link>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topic Grid */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-surface-700 pb-8">
            <h4 className="text-lg font-black text-surface-300 flex items-center gap-4 uppercase tracking-tight">
              <Layers size={24} className="text-brand-600" strokeWidth={2.5} />
              Training Tracks
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {topics.map((topic) => (
              <div
                key={topic.name}
                className="group p-8 rounded-[2.5rem] bg-white border border-surface-700 hover:border-brand-500/30 transition-all duration-300 shadow-sm relative overflow-hidden"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-brand-600 mb-8 border border-surface-700 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-inner">
                  <topic.icon size={28} strokeWidth={2.5} />
                </div>

                <div className="space-y-6">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                       <h5 className="text-lg font-black text-surface-300 group-hover:text-brand-600 transition-colors uppercase tracking-tight">
                        {topic.name}
                       </h5>
                       {topic.hasHard && <Zap size={14} className="text-amber-500" fill="currentColor" />}
                    </div>
                    <p className="text-[9px] text-surface-500 font-black uppercase tracking-widest opacity-60">
                      {topic.solved} / {topic.total} Mastered
                    </p>
                  </div>

                  {/* Progressive Bar */}
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-surface-700 shadow-inner">
                      <div
                        className="h-full bg-brand-600 rounded-full transition-all duration-1000"
                        style={{ width: `${topic.progress}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    to={`/practice/topic/${topic.name.toLowerCase()}`}
                    className="flex items-center justify-between w-full pt-6 text-[9px] font-black text-brand-600 hover:text-brand-500 transition-all border-t border-surface-700 group-hover:border-brand-100 uppercase tracking-widest"
                  >
                    Enter Wing
                    <ChevronRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hacker Leaderboard Section */}
        <div className="space-y-8">
           <h4 className="text-sm font-black text-surface-400 flex items-center gap-3 uppercase tracking-widest">
              <Medal size={18} className="text-brand-600" /> Arena Leaderboard
           </h4>
           <div className="rounded-[2.5rem] bg-white border border-surface-700 overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 gap-4 px-10 py-5 bg-slate-50 border-b border-surface-700 items-center">
                 <span className="col-span-1 text-[8px] font-black text-surface-500 uppercase tracking-widest">Rank</span>
                 <span className="col-span-4 text-[8px] font-black text-surface-500 uppercase tracking-widest">Hacker</span>
                 <span className="col-span-2 text-[8px] font-black text-surface-500 uppercase tracking-widest text-center">Active Battle</span>
                 <span className="col-span-2 text-[8px] font-black text-surface-500 uppercase tracking-widest text-center">Solves</span>
                 <span className="col-span-3 text-[8px] font-black text-surface-500 uppercase tracking-widest text-right">Points</span>
              </div>
              <div className="divide-y divide-surface-700/50">
                 {leaderboard.length > 0 ? leaderboard.map((hacker, idx) => (
                    <div key={hacker.id} className={`grid grid-cols-12 gap-4 px-10 py-5 items-center hover:bg-slate-50 transition-colors ${hacker.id === user?.id ? 'bg-brand-50/50' : ''}`}>
                       <span className="col-span-1 text-sm font-black text-surface-400">#{idx + 1}</span>
                       <div className="col-span-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-surface-900 border border-surface-700 flex items-center justify-center text-brand-400 font-black text-xs uppercase">
                             {hacker.name?.charAt(0)}
                          </div>
                          <div>
                             <p className="text-sm font-black text-surface-300 uppercase tracking-tight">{hacker.username}</p>
                             <p className="text-[8px] font-bold text-surface-500 uppercase tracking-widest">{hacker.xp} Total XP</p>
                          </div>
                       </div>
                       <div className="col-span-2 text-center text-[10px] font-black text-amber-600">{hacker.arenaActive}</div>
                       <div className="col-span-2 text-center text-[10px] font-black text-surface-300 underline decoration-brand-600/30">{hacker.arenaSolves}</div>
                       <div className="col-span-3 text-right">
                          <span className="px-5 py-2 rounded-xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/10">
                             {hacker.arenaScore} pts
                          </span>
                       </div>
                    </div>
                 )) : (
                    <div className="py-20 text-center text-[10px] font-black text-surface-500 uppercase tracking-widest opacity-40">
                       No warriors in the arena yet...
                    </div>
                 )}
              </div>
           </div>
        </div>

      </div>
    </PageShell>
  )
}
