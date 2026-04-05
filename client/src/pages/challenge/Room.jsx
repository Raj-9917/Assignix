import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Swords, Clock, Trophy, ChevronLeft, User, Terminal, CheckCircle2, Timer, Zap, Play, Award, ListChecks } from 'lucide-react'
import { problems } from '../../data/problems'
import { mockParticipants } from '../../data/challenges'
import ProblemDetail from '../problems/ProblemDetail'

export default function Room() {
  const { id } = useParams()
  const [participants, setParticipants] = useState(mockParticipants)
  const [timeLeft, setTimeLeft] = useState(900) // 15:00 minutes
  const [matchStarted, setMatchStarted] = useState(false)

  // Find the problem for this room (mock room-101 uses two-sum)
  const problemId = id === 'room-101' ? 'two-sum' : 'palindrome-number'
  const problem = problems.find(p => p.id === problemId)

  if (!problem) return <Navigate to="/challenge" replace />

  useEffect(() => {
    if (!matchStarted) return
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [matchStarted])

  // Simulate opponent activity
  useEffect(() => {
    if (!matchStarted) return
    const interval = setInterval(() => {
      setParticipants(prev => prev.map(p => {
        if (p.id === 'u1' && timeLeft < 850 && p.status === 'Coding') {
          return { ...p, status: 'Running Tests', progress: 40 }
        }
        if (p.id === 'u2' && timeLeft < 820 && p.status === 'Running Tests') {
          return { ...p, status: 'Solved', progress: 100, time: '02:45' }
        }
        return p
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [matchStarted, timeLeft])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* High-Impact Battle Header */}
      <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-surface-700 z-50 shadow-sm relative">
         <div className="flex items-center gap-8">
            <Link to="/challenge" className="p-3 rounded-2xl bg-white text-surface-500 hover:text-brand-600 border border-surface-700 transition-all hover:-translate-x-1 shadow-sm">
               <ChevronLeft size={20} strokeWidth={2.5} />
            </Link>
            <div className="flex flex-col">
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] leading-none">Room ID: {id}</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
               </div>
               <h3 className="text-lg font-black text-surface-300 uppercase tracking-tight">{problem.title}</h3>
            </div>
         </div>

         {/* Centered Timer HUD */}
         <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 py-3 rounded-full bg-white border border-surface-700 shadow-xl shadow-brand-500/5 group">
            <div className="flex items-center gap-3 text-brand-600">
               <Clock size={20} className="group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
               <span className="text-2xl font-black tabular-nums tracking-tighter">
                  {formatTime(timeLeft)}
               </span>
            </div>
            <div className="h-6 w-[1px] bg-surface-700" />
            <span className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em]">Time Left</span>
         </div>

         <div className="flex items-center gap-4">
            {!matchStarted ? (
                <button 
                   onClick={() => setMatchStarted(true)}
                   className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                >
                    Start Challenge
                </button>
             ) : (
                <div className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                   <Zap size={18} fill="currentColor" strokeWidth={2.5} /> Active Match
                </div>
            )}
         </div>
      </header>

      {/* Main Duel View: Dual-Pane Scoreboard + IDE */}
      <div className="flex flex-1 overflow-hidden">
         {/* Live Scoreboard Sidebar */}
         <aside className="w-80 bg-white border-r border-surface-700 flex flex-col p-6 space-y-6 shadow-sm relative z-40 overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-surface-700 pb-5">
               <h4 className="text-[10px] font-black text-surface-300 uppercase tracking-[0.2em] flex items-center gap-3">
                  <Award size={18} className="text-brand-600" strokeWidth={2.5} /> Leaderboard
               </h4>
               <span className="text-[9px] font-black text-surface-500 uppercase tracking-widest opacity-60">4 People Online</span>
            </div>

            <div className="space-y-5">
               {participants.map((p, idx) => (
                  <div key={p.id} className="p-6 rounded-[2rem] bg-slate-50 border border-surface-700 hover:border-brand-500/30 group transition-all shadow-inner relative overflow-hidden">
                     {/* Visual rank accent */}
                     {idx === 0 && <div className="absolute top-0 right-0 w-8 h-8 bg-brand-600/5 rotate-45 translate-x-4 -translate-y-4" />}
                     
                     <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border shadow-sm ${
                              idx === 0 ? 'bg-brand-600 text-white border-brand-500 shadow-brand-500/20' : 'bg-white text-surface-300 border-surface-700 shadow-sm'
                           }`}>
                              {idx + 1}
                           </div>
                           <div className="flex flex-col">
                              <span className="text-xs font-black text-surface-300 uppercase tracking-tight">{p.name}</span>
                              <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                                 p.status === 'Solved' ? 'text-emerald-600' : p.status === 'Running Tests' ? 'text-brand-600' : 'text-surface-500 opacity-60'
                              }`}>
                                 {p.status}
                              </span>
                           </div>
                        </div>
                        {p.status === 'Solved' && <CheckCircle2 size={18} className="text-emerald-600" strokeWidth={3} />}
                     </div>

                     {/* Progress Visual */}
                     <div className="space-y-2">
                        <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-surface-700 p-0.5">
                           <div 
                              className={`h-full rounded-full transition-all duration-1000 shadow-lg ${
                                 p.status === 'Solved' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-brand-500 shadow-brand-500/20'
                              }`} 
                              style={{ width: `${p.progress}%` }}
                           />
                        </div>
                        <div className="flex justify-between items-center text-[8px] font-black text-surface-500 uppercase tracking-[0.2em]">
                           <span>{p.progress}% Completed</span>
                           {p.time && <span className="text-emerald-600 font-bold">{p.time}s</span>}
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            <div className="mt-auto p-6 rounded-[2rem] bg-brand-50 border border-brand-100 shadow-sm">
               <div className="flex items-center gap-4 text-brand-600">
                  <Terminal size={22} strokeWidth={2.5} />
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Your Status</span>
                     <span className="text-xl font-black italic tracking-tighter">READY TO START</span>
                  </div>
               </div>
            </div>
         </aside>

         {/* Integrated Problem Detail (IDE) */}
         <div className="flex-1 overflow-hidden relative">
            {!matchStarted && (
               <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md flex items-center justify-center">
                  <div className="text-center space-y-8 max-w-md p-12">
                     <div className="w-24 h-24 rounded-[2rem] bg-brand-50 border border-brand-100 mx-auto flex items-center justify-center text-brand-600 shadow-xl shadow-brand-500/10 animate-bounce-slow">
                        <Swords size={48} strokeWidth={2.5} />
                     </div>
                     <div className="space-y-3">
                        <h4 className="text-3xl font-black text-surface-300 uppercase tracking-tighter">Enter Match</h4>
                        <p className="text-sm font-bold text-surface-500 uppercase tracking-widest opacity-60 leading-relaxed italic">The challenge starts when you are ready. Write your best solution to win.</p>
                     </div>
                     <button 
                        onClick={() => setMatchStarted(true)}
                        className="w-full px-10 py-5 rounded-2xl bg-brand-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-500/20 hover:bg-brand-500 hover:-translate-y-1 active:scale-95 transition-all"
                     >
                        Start Coding
                     </button>
                  </div>
               </div>
            )}
            <ProblemDetail challengeRoomId={id} />
         </div>
      </div>
    </div>
  )
}
