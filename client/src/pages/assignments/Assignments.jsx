import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Clock, CheckCircle, AlertCircle, PlayCircle, BarChart3, ListTodo, Calendar, BookOpen } from 'lucide-react'
import PageShell from '../../components/ui/PageShell'
import StatCard from '../../components/dashboard/StatCard'
import AssignmentGroupCard from '../../components/classrooms/AssignmentGroupCard'
import { classroomService } from '../../services/classroomService'
import { useAuth } from '../../context/AuthContext'

export default function Assignments() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true)
        const classrooms = await classroomService.getMyClassrooms()
        
        // Extract grouped assignments from all joined classrooms
        const allAssignments = classrooms.reduce((acc, room) => {
          const roomAssignments = (room.assignments || []).map(group => {
            const pIds = group.problem_ids || [];
            // Check if all problems in this group are solved
            const solvedCount = pIds.filter(pid => 
              user?.solved_problems?.includes(pid)
            ).length;
            
            const isCompleted = solvedCount === pIds.length && pIds.length > 0;

            return {
              ...group,
              id: group.id,
              classroomId: room.id,
              classroomName: room.name,
              isCompleted,
              solvedCount,
              totalCount: pIds.length,
              deadline: group.due_date,
              status: isCompleted ? 'Submitted' : 'Pending'
            };
          })
          return [...acc, ...roomAssignments]
        }, [])

        // Sort by deadline (closest first)
        const sorted = allAssignments.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        setAssignments(sorted)
      } catch (err) {
        console.error('Failed to fetch assignments:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchAssignments()
    }
  }, [user])

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'Pending').length,
    submitted: assignments.filter(a => a.status === 'Submitted').length,
  }

  return (
    <PageShell
      title="Global Assignments"
      subtitle="Your unified curriculum across all joined classrooms."
      icon={ClipboardList}
    >
      <div className="space-y-10">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Labs" value={stats.total} icon={ListTodo} color="brand" />
          <StatCard title="In Progress" value={stats.pending} icon={Clock} color="amber" />
          <StatCard title="Completed" value={stats.submitted} icon={BarChart3} color="emerald" />
        </div>

        {/* Assignment List */}
        <div className="space-y-8 pb-20">
          <div className="flex items-center justify-between border-b border-surface-700 pb-8">
            <h3 className="text-xl font-black text-surface-300 flex items-center gap-4 uppercase tracking-tight">
              <Calendar size={24} className="text-brand-600" strokeWidth={2.5} />
              Current Curriculum
            </h3>
          </div>

          {assignments.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="relative group">
                  <AssignmentGroupCard assignment={assignment} />
                  {/* Classroom Origin Badge */}
                  <div className="absolute top-4 right-20 pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-slate-50 border border-surface-700 text-[8px] font-black text-surface-500 uppercase tracking-widest shadow-sm group-hover:border-brand-500/20 transition-colors">
                      {assignment.classroomName}
                    </span>
                  </div>
                  {/* Status Overlay for Completion */}
                  {assignment.isCompleted && (
                    <div className="absolute top-4 right-12 text-emerald-500">
                      <CheckCircle size={20} strokeWidth={3} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center rounded-[3rem] bg-surface-950/30 border-2 border-dashed border-surface-900">
               <BookOpen size={64} className="mx-auto text-surface-800 mb-6" strokeWidth={1} />
               <p className="text-surface-500 text-xs font-black uppercase tracking-[0.2em] italic">No active assignments found.</p>
               <p className="text-surface-700 text-[10px] mt-2 font-bold">Join a classroom to see your curriculum here.</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
