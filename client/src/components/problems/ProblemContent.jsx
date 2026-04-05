import { useState } from 'react'
import { ChevronDown, ChevronRight, Info, Lightbulb, ListChecks } from 'lucide-react'
import DifficultyBadge from '../ui/DifficultyBadge'

export default function ProblemContent({ problem }) {
  const [showHint, setShowHint] = useState(false)

  return (
    <div className="h-full flex flex-col bg-slate-50 border-r border-surface-700 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center gap-5">
            <DifficultyBadge difficulty={problem.difficulty} />
            <span className="text-[10px] text-brand-600 uppercase tracking-[0.2em] font-black">
              {problem.category}
            </span>
          </div>
          <h1 className="text-3xl font-black text-surface-300 tracking-tight leading-tight uppercase">
            {problem.title}
          </h1>
          <div className="flex flex-wrap gap-2 pt-2">
            {problem.tags.map((tag, idx) => (
              <span key={idx} className="px-3 py-1 rounded-xl bg-white text-[10px] text-surface-500 font-black uppercase tracking-widest border border-surface-700 shadow-sm">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-brand-600">
            <Info size={18} strokeWidth={2.5} />
            <h3 className="text-xs font-black uppercase tracking-widest">Problem Statement</h3>
          </div>
          <p className="text-surface-500 text-sm leading-relaxed whitespace-pre-line font-medium">
            {problem.description}
          </p>
        </div>

        {/* Examples */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-emerald-600">
            <ListChecks size={18} strokeWidth={2.5} />
            <h3 className="text-xs font-black uppercase tracking-widest">Sample Examples</h3>
          </div>
          <div className="space-y-5">
            {problem.examples.map((ex, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-white border border-surface-700 space-y-4 shadow-sm">
                <div className="flex items-start gap-4 text-xs font-mono">
                  <span className="text-surface-600 shrink-0 font-black uppercase tracking-tighter">Input:</span>
                  <code className="text-surface-300 bg-surface-800 px-2 py-0.5 rounded border border-surface-700 break-all">{ex.input}</code>
                </div>
                <div className="flex items-start gap-4 text-xs font-mono">
                  <span className="text-brand-600 shrink-0 font-black uppercase tracking-tighter">Output:</span>
                  <code className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 break-all font-black">{ex.output}</code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Constraints */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-amber-600">
            <Info size={18} strokeWidth={2.5} />
            <h3 className="text-xs font-black uppercase tracking-widest">Constraints</h3>
          </div>
          <ul className="space-y-3">
            {problem.constraints.map((constraint, idx) => (
              <li key={idx} className="flex items-start gap-4 text-[11px] text-surface-500 font-bold font-mono group">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1 opacity-40 group-hover:opacity-100 transition-opacity" />
                {constraint}
              </li>
            ))}
          </ul>
        </div>

        {/* Hints (Collapsible) */}
        <div className="pt-6 pb-12 border-t border-surface-700">
          <button
            onClick={() => setShowHint(!showHint)}
            className={`w-full flex items-center justify-between p-6 rounded-3xl border transition-all duration-300 shadow-sm
              ${showHint ? 'bg-brand-50 border-brand-200' : 'bg-white border-surface-700 hover:border-brand-500/30'}`}
          >
            <div className="flex items-center gap-4">
              <Lightbulb size={20} className={showHint ? 'text-brand-600' : 'text-surface-500'} />
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${showHint ? 'text-brand-600' : 'text-surface-500'}`}>
                Strategy Hint
              </span>
            </div>
            {showHint ? <ChevronDown size={20} className="text-brand-600" /> : <ChevronRight size={20} className="text-surface-500" />}
          </button>
          
          {showHint && (
            <div className="mt-4 p-6 rounded-[2rem] bg-brand-50/50 border border-brand-200/50 text-[11px] text-surface-500 font-bold leading-relaxed italic animate-fade-in shadow-inner">
               <span className="text-brand-600 font-black not-italic block mb-1 uppercase tracking-widest">Strategy Tip:</span>
               Try thinking about time complexity. Can you optimize this to O(n) using a supplementary hash map or frequency array?
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
