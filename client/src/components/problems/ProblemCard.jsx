import { Link } from 'react-router-dom'
import { ChevronRight, Code2, CheckCircle2, Trash2 } from 'lucide-react'
import DifficultyBadge from '../ui/DifficultyBadge'
import { useAuth } from '../../context/AuthContext'

export default function ProblemCard({ problem, isSolved, onDelete }) {
  const { user } = useAuth()
  return (
    <Link
      to={`/prepare/${problem.id}`}
      className="group block p-6 rounded-3xl border border-slate-200 bg-white hover:border-brand-500/30 transition-all duration-500 hover:translate-x-1 shadow-sm hover:shadow-2xl hover:shadow-brand-500/5 relative overflow-hidden"
    >
      {/* Subtle indicator */}
      <div className="absolute top-0 right-0 w-1 bg-slate-900 h-0 group-hover:h-full transition-all duration-500" />
      
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white group-hover:bg-brand-600 transition-all duration-500 shadow-xl shrink-0">
            <Code2 size={24} strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-600 transition-colors uppercase tracking-tight line-clamp-1 leading-none">
              {problem.title}
            </h3>
             <div className="flex flex-wrap items-center gap-3">
              <DifficultyBadge difficulty={problem.difficulty} />
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                {problem.category}
              </span>
              {isSolved && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">
                    Solved
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 shrink-0">
          {user?.role === 'admin' && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                onDelete?.(problem.id);
              }}
              className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all relative z-20"
              title="Delete Problem"
            >
              <Trash2 size={18} />
            </button>
          )}
          <div className="text-slate-300 group-hover:text-brand-600 transition-all duration-300">
            <ChevronRight size={20} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-slate-50 group-hover:border-slate-100 transition-colors relative z-10">
        {(problem.tags || []).slice(0, 3).map((tag, idx) => (
          <span key={idx} className="px-3 py-1.5 rounded-full bg-slate-50 text-[10px] text-slate-500 font-black uppercase tracking-[0.1em] border border-slate-100 group-hover:bg-brand-50 group-hover:text-brand-700 transition-all shadow-sm">
            #{tag}
          </span>
        ))}
      </div>
    </Link>
  )
}
