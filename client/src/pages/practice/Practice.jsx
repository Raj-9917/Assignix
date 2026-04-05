import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Dumbbell, Target, Layers, Cpu, Hash, Brackets, ChevronRight, Zap, Trophy, Play } from 'lucide-react'
import PageShell from '../../components/ui/PageShell'
import StatCard from '../../components/dashboard/StatCard'
import { problems } from '../../data/problems'

export default function Practice() {
  const [solvedProblems, setSolvedProblems] = useState([])

  useEffect(() => {
    const solved = JSON.parse(localStorage.getItem('solved_problems') || '[]')
    setSolvedProblems(solved)
  }, [])

  // Dynamic Topics based on categories in problems.js
  const categories = [...new Set(problems.map(p => p.category))]
  
  const topics = categories.map(cat => {
    const totalInCat = problems.filter(p => p.category === cat).length
    const solvedInCat = problems.filter(p => p.category === cat && solvedProblems.includes(p.id)).length
    
    return {
      name: cat,
      total: totalInCat,
      solved: solvedInCat,
      progress: Math.round((solvedInCat / totalInCat) * 100),
      icon: cat === 'Array' ? Layers : cat === 'String' ? Hash : cat === 'Math' ? Brackets : Cpu
    }
  })

  const dailyChallenge = problems[0] // Mock daily challenge

  return (
    <PageShell
      title="Practice"
      subtitle="Master specific data structures and algorithms through focused drills."
      icon={Dumbbell}
    >
      <div className="space-y-10 pb-12">
        {/* Daily Challenge Highlight */}
        <section className="relative p-12 rounded-[3.5rem] bg-white border border-surface-700 overflow-hidden group shadow-sm hover:shadow-2xl hover:shadow-brand-500/5 transition-all duration-700">
          <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0">
            <Trophy size={200} className="text-brand-600" strokeWidth={2.5} />
          </div>
          
          <div className="relative z-10 space-y-8 max-w-3xl">
            <div className="flex items-center gap-4">
               <span className="flex items-center gap-2 px-5 py-2 rounded-full bg-brand-600 text-white text-[10px] font-black uppercase tracking-[0.2em] leading-none shadow-lg shadow-brand-500/20">
                <Zap size={14} fill="currentColor" strokeWidth={3} />
                Daily Coding Challenge
              </span>
               <span className="text-[10px] text-surface-500 font-black uppercase tracking-widest opacity-60">Maintain your daily streak</span>
            </div>

            <div className="space-y-4">
              <h3 className="text-4xl font-black text-surface-300 tracking-tight uppercase leading-none">{dailyChallenge.title}</h3>
              <p className="text-surface-500 text-sm leading-relaxed font-medium uppercase tracking-widest text-[11px] opacity-80">
                {dailyChallenge.description.substring(0, 150)}...
              </p>
            </div>

            <div className="flex items-center gap-6 pt-6">
              <Link
                to={`/problem/${dailyChallenge.id}`}
                className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-brand-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 hover:bg-brand-500 hover:-translate-y-1 active:scale-95 transition-all duration-300"
              >
                <Play size={20} fill="currentColor" strokeWidth={3} />
                Start Challenge
              </Link>
            </div>
          </div>
        </section>

        {/* Topic Grid */}
        <div className="space-y-10">
          <div className="flex items-center justify-between border-b border-surface-700 pb-8">
            <h4 className="text-2xl font-black text-surface-300 flex items-center gap-4 uppercase tracking-tight">
              <Target size={28} className="text-brand-600" strokeWidth={2.5} />
              Practice by Topic
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {topics.map((topic) => (
              <div
                key={topic.name}
                className="group p-10 rounded-[3rem] bg-white border border-surface-700 hover:border-brand-500/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-2 h-full bg-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-brand-600 mb-10 border border-surface-700 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  <topic.icon size={32} strokeWidth={2.5} />
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h5 className="text-xl font-black text-surface-300 group-hover:text-brand-600 transition-colors uppercase tracking-tight">
                      {topic.name}s
                    </h5>
                    <p className="text-[10px] text-surface-500 font-black uppercase tracking-widest opacity-60">
                      {topic.solved} / {topic.total} Problems Solved
                    </p>
                  </div>

                  {/* Progressive Bar */}
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-surface-700 p-0.5 shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full transition-all duration-1000 shadow-lg shadow-brand-500/20"
                        style={{ width: `${topic.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-surface-600 opacity-80">
                      <span>{topic.progress}% Completed</span>
                    </div>
                  </div>

                  <Link
                    to={`/practice/topic/${topic.name.toLowerCase()}`}
                    className="flex items-center justify-between w-full pt-8 text-[10px] font-black text-brand-600 hover:text-brand-500 transition-all border-t border-surface-700 group-hover:border-brand-100 uppercase tracking-widest"
                  >
                    Start Training
                    <ChevronRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
