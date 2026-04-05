import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Clock, CheckCircle, AlertCircle, PlayCircle, BarChart3, ListTodo, Calendar } from 'lucide-react'
import PageShell from '../../components/ui/PageShell'
import StatCard from '../../components/dashboard/StatCard'
import { initialAssignments } from '../../data/assignments'

export default function Assignments() {
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    // 1. Check for stored statuses from IDE submissions
    const storedStatus = JSON.parse(localStorage.getItem('assignmentStatus') || '{}')
    
    // 2. Map initial data with current localStorage status
    const updated = initialAssignments.map(a => ({
      ...a,
      status: storedStatus[a.id] || a.status
    }))

    setAssignments(updated)
  }, [])

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'Pending').length,
    submitted: assignments.filter(a => a.status === 'Submitted').length,
  }

  const getStatusBadge = (assignment) => {
    const isLate = new Date(assignment.deadline) < new Date() && assignment.status === 'Pending'
    
    if (assignment.status === 'Submitted') {
      return (
        <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
          <CheckCircle size={14} strokeWidth={2.5} />
          Submitted
        </span>
      )
    }

    if (isLate) {
      return (
        <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-widest border border-rose-100 shadow-sm">
          <AlertCircle size={14} strokeWidth={2.5} />
          Past Due
        </span>
      )
    }

    return (
      <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-800 text-surface-400 text-[10px] font-black uppercase tracking-widest border border-surface-700 shadow-sm">
        <Clock size={14} strokeWidth={2.5} />
        Not Started
      </span>
    )
  }

  return (
    <PageShell
      title="Assignments"
      subtitle="Keep track of your coding assignments and deadlines."
      icon={ClipboardList}
    >
      <div className="space-y-10">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Assigned" value={stats.total} icon={ListTodo} color="brand" />
          <StatCard title="Pending" value={stats.pending} icon={Clock} color="amber" />
          <StatCard title="Submitted" value={stats.submitted} icon={BarChart3} color="emerald" />
        </div>

        {/* Assignment List */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-surface-700 pb-8">
            <h3 className="text-xl font-black text-surface-300 flex items-center gap-4 uppercase tracking-tight">
              <Calendar size={24} className="text-brand-600" strokeWidth={2.5} />
              Current Assignments
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="group relative bg-white border border-surface-700 rounded-[2.5rem] p-10 hover:border-brand-500/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-2 h-full bg-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex justify-between items-start mb-6">
                  <span className="px-3 py-1 rounded-xl bg-surface-800 text-surface-500 text-[9px] font-black uppercase tracking-widest border border-surface-700 shadow-sm transition-colors group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-100">
                    {assignment.category}
                  </span>
                  {getStatusBadge(assignment)}
                </div>

                <h4 className="text-2xl font-black text-surface-300 mb-3 group-hover:text-brand-600 transition-colors uppercase tracking-tight">
                  {assignment.title}
                </h4>
                <p className="text-sm text-surface-500 mb-10 leading-relaxed font-medium uppercase tracking-widest text-[11px]">
                  {assignment.description}
                </p>

                <div className="flex items-center justify-between pt-8 border-t border-surface-700">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-surface-600 uppercase tracking-[0.2em]">Due Date</p>
                    <p className="text-xs text-surface-300 font-bold uppercase tabular-nums">
                      {new Date(assignment.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <Link
                    to={`/problem/${assignment.problemId}?assignmentId=${assignment.id}`}
                    className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-surface-800 text-surface-300 text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 hover:text-white hover:shadow-xl hover:shadow-brand-500/20 active:scale-95 transition-all duration-300 border border-surface-700 group-hover:border-transparent"
                  >
                    <PlayCircle size={18} />
                    {assignment.status === 'Submitted' ? 'View Solution' : 'Start Assignment'}
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
