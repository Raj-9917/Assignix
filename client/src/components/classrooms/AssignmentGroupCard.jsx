import { useState } from 'react'
import { ChevronDown, ChevronUp, BookOpen, Clock, Code2, ArrowRight, Trash2, Edit3, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import DifficultyBadge from '../ui/DifficultyBadge'

export default function AssignmentGroupCard({ assignment, classroomId, isTeacher, onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false)
  const problemCount = (assignment.problem_ids || []).length
  const rawDate = assignment.due_date
  const dueDate = rawDate ? new Date(rawDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : 'No due date'

  return (
    <div className={`glass overflow-hidden rounded-[2.5rem] border transition-all duration-500 ${
      isOpen ? 'border-brand-500/50 shadow-2xl shadow-brand-500/10' : 'border-surface-700 hover:border-brand-500/30 shadow-sm'
    }`}>
      {/* Header - Always visible */}
      <div 
        className="p-8 cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner ${
              isOpen ? 'bg-brand-600 text-white animate-pulse' : 'bg-slate-50 text-brand-600 group-hover:bg-brand-50'
            }`}>
              <BookOpen size={28} strokeWidth={2} />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none group-hover:text-brand-600 transition-colors">
                {assignment.title}
              </h3>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[10px] font-black text-surface-500 uppercase tracking-widest">
                  <Code2 size={12} className="text-brand-500" />
                  {problemCount} {problemCount === 1 ? 'Problem' : 'Problems'}
                </span>
                <span className="w-1 h-1 rounded-full bg-surface-700" />
                <span className="flex items-center gap-1.5 text-[10px] font-black text-surface-500 uppercase tracking-widest">
                  <Clock size={12} className="text-amber-500" />
                  Due {dueDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {isTeacher && (
               <div className="flex items-center gap-2 mr-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(assignment);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-90 border border-transparent hover:border-brand-100"
                    title="Edit Assignment"
                  >
                    <Settings size={18} strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(assignment.id, assignment.title);
                    }}
                    className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:text-white hover:bg-rose-500 transition-all active:scale-90 border border-rose-100/50 hover:border-transparent"
                    title="Delete Assignment"
                  >
                    <Trash2 size={18} strokeWidth={2.5} />
                  </button>
               </div>
             )}
             <div className={`p-3 rounded-2xl transition-all duration-300 ${
               isOpen ? 'bg-brand-50 text-brand-600' : 'text-surface-400 group-hover:text-brand-600'
             }`}>
               {isOpen ? <ChevronUp size={24} strokeWidth={3} /> : <ChevronDown size={24} strokeWidth={3} />}
             </div>
          </div>
        </div>
      </div>

      {/* Problem List - Expanded */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isOpen ? 'max-h-[1000px] opacity-100 border-t border-surface-700 bg-surface-950/20' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-6 space-y-3">
          <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest px-2 mb-4">Curriculum Details</p>
          {(assignment.problem_ids || []).map((problem, idx) => (
            <Link 
              key={problem?.id || problem || idx}
              to={`/prepare/${problem?.id || problem}?classroomId=${assignment.classroomId || classroomId}&assignmentId=${assignment.id}&due_date=${rawDate}`}
              className="flex items-center justify-between p-5 rounded-2xl bg-white/50 border border-surface-700 hover:border-brand-500/30 hover:bg-white hover:translate-x-1 transition-all duration-300 group/item shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-surface-700 flex items-center justify-center text-surface-400 group-hover/item:text-brand-600 group-hover/item:bg-brand-50 transition-colors">
                  <span className="text-xs font-black">{idx + 1}</span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">{problem?.title || 'Launch Challenge'}</p>
                  <div className="flex items-center gap-2">
                    {problem?.difficulty && <DifficultyBadge difficulty={problem.difficulty} />}
                    <span className="text-[9px] font-black text-surface-500 uppercase tracking-widest">{problem?.category || 'Task'}</span>
                  </div>
                </div>
              </div>
              <ArrowRight size={16} className="text-surface-300 group-hover/item:text-brand-500 group-hover/item:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
