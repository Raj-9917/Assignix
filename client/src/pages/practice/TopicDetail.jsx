import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Dumbbell, ChevronLeft, Target, Award, ListChecks, PlayCircle, Star } from 'lucide-react'
import PageShell from '../../components/ui/PageShell'
import ProblemCard from '../../components/problems/ProblemCard'
import { problems } from '../../data/problems'

export default function TopicDetail() {
  const { topic } = useParams()
  const [solvedProblems, setSolvedProblems] = useState([])

  useEffect(() => {
    const solved = JSON.parse(localStorage.getItem('solved_problems') || '[]')
    setSolvedProblems(solved)
  }, [])

  // Find all problems in this category (case-insensitive)
  const topicProblems = problems.filter(p => p.category.toLowerCase() === topic?.toLowerCase())

  if (topicProblems.length === 0) return <Navigate to="/practice" replace />

  const total = topicProblems.length
  const solvedCount = topicProblems.filter(p => solvedProblems.includes(p.id)).length
  const progress = Math.round((solvedCount / total) * 100)

  return (
    <PageShell
      title={`${topic.charAt(0).toUpperCase() + topic.slice(1)} Drills`}
      subtitle={`Focus your training on essential ${topic.toLowerCase()} algorithms.`}
      icon={Dumbbell}
    >
      <div className="space-y-8">
        {/* Topic Header & Progress Summary */}
        <div className="flex flex-col md:flex-row items-center justify-between p-8 rounded-[40px] bg-surface-900/50 border border-surface-800 shadow-2xl gap-8">
          <div className="flex items-center gap-6">
            <Link to="/practice" className="p-3 rounded-2xl bg-surface-800 text-surface-500 hover:text-brand-400 transition-all group border border-surface-700">
               <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-gray-100 uppercase tracking-tight">{topic} Progression</h3>
              <div className="flex items-center gap-3 text-xs text-surface-500 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><ListChecks size={14} className="text-emerald-400" /> {solvedCount} / {total} Solved</span>
                <span className="text-surface-700">|</span>
                <span className="flex items-center gap-1.5"><Award size={14} className="text-brand-400" /> Level 2 Skilled</span>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-md w-full space-y-3">
             <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest leading-none">Curriculum Progress</span>
                <span className="text-lg font-black text-brand-400 leading-none">{progress}%</span>
             </div>
             <div className="h-3 w-full bg-surface-800 rounded-full border border-surface-700 p-0.5 shadow-inner">
                <div 
                   className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(37,99,235,0.3)]"
                   style={{ width: `${progress}%` }}
                />
             </div>
          </div>
        </div>

        {/* Challenge List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-surface-800 pb-4">
             <h4 className="flex items-center gap-2 text-sm font-bold text-surface-400 uppercase tracking-widest">
                <Target size={18} className="text-brand-400" /> 
                {topic} Curriculum
             </h4>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {topicProblems.map((problem) => {
               const isSolved = solvedProblems.includes(problem.id)
               return (
                  <div key={problem.id} className="group relative">
                     <ProblemCard problem={problem} />
                     {isSolved && (
                        <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest z-10 flex items-center gap-1.5 pointer-events-none group-hover:scale-105 transition-all">
                           <Award size={12} fill="currentColor" /> Mastered
                        </div>
                     )}
                  </div>
               )
            })}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
