import { Link } from 'react-router-dom'
import { ChevronRight, Code2 } from 'lucide-react'
import DifficultyBadge from '../ui/DifficultyBadge'

export default function ProblemCard({ problem }) {
  return (
    <Link
      to={`/problem/${problem.id}`}
      className="glass group block p-6 rounded-[2.5rem] border border-surface-700 hover:border-brand-500/30 transition-all duration-300 hover:translate-x-1 shadow-sm hover:shadow-xl hover:shadow-brand-500/5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-surface-700 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500 shadow-inner">
            <Code2 size={24} strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 group-hover:text-brand-600 transition-colors uppercase tracking-tight">
              {problem.title}
            </h3>
            <div className="flex items-center gap-3">
              <DifficultyBadge difficulty={problem.difficulty} />
              <span className="text-[10px] text-surface-500 font-black uppercase tracking-widest opacity-60">
                {problem.category}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 text-surface-400 group-hover:text-brand-600 transition-all duration-300">
          <ChevronRight size={24} strokeWidth={3} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 pt-6 border-t border-surface-700 group-hover:border-brand-100 transition-colors">
        {problem.tags.slice(0, 3).map((tag, idx) => (
          <span key={idx} className="px-3 py-1.5 rounded-full bg-slate-50 text-[9px] text-surface-600 font-black uppercase tracking-widest border border-surface-700 group-hover:border-surface-700 transition-colors shadow-sm">
            #{tag}
          </span>
        ))}
      </div>
    </Link>
  )
}
