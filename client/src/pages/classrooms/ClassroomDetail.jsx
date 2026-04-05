import { useState } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { School, Users, Code, ChevronLeft, PlusCircle, Search, Mail, Filter, BookOpen } from 'lucide-react'
import PageShell from '../../components/ui/PageShell'
import { initialClassrooms } from '../../data/classrooms'
import { problems } from '../../data/problems'
import ProblemCard from '../../components/problems/ProblemCard'
import { useAuth } from '../../context/AuthContext'

export default function ClassroomDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('tasks')
  const [searchTerm, setSearchTerm] = useState('')

  const classroom = initialClassrooms.find(c => c.id === id)
  const isTeacher = user?.role === 'teacher' && classroom?.teacherId === user?.email

  if (!classroom) return <Navigate to="/classrooms" replace />

  const assignedProblems = problems.filter(p => classroom.problemIds.includes(p.id))

  const tabs = [
    { id: 'tasks', label: 'Assigned Tasks', icon: Code, count: assignedProblems.length },
    { id: 'people', label: 'Students', icon: Users, count: classroom.studentCount },
  ]

  return (
    <PageShell
      title={classroom.name}
      subtitle={`Managed by ${classroom.teacher}`}
      icon={School}
    >
      <div className="space-y-8">
        {/* Breadcrumb & Quick Actions */}
        <div className="flex items-center justify-between pb-4">
          <Link to="/classrooms" className="flex items-center gap-2 text-surface-500 hover:text-brand-400 transition-colors group">
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest leading-none">All Classrooms</span>
          </Link>

          {isTeacher && (
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-600/10 text-brand-400 text-xs font-bold uppercase tracking-widest border border-brand-500/20 hover:bg-brand-600 hover:text-white transition-all duration-300">
              <PlusCircle size={16} />
              Assign New Problem
            </button>
          )}
        </div>

        {/* Classroom Header Summary */}
        <div className="p-8 rounded-[40px] bg-surface-900/50 border border-surface-800 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-brand-500/10 flex items-center justify-center text-brand-400 border border-brand-500/20 shadow-lg shadow-brand-500/10">
            <BookOpen size={40} />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h3 className="text-2xl font-bold text-gray-100">{classroom.name}</h3>
            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-surface-500">
              <span className="flex items-center gap-1.5 leading-none">
                <Users size={14} className="text-emerald-400" />
                {classroom.studentCount} Students
              </span>
              <span className="text-surface-700">|</span>
              <span className="flex items-center gap-1.5 leading-none">
                <Code size={14} className="text-amber-400" />
                {assignedProblems.length} Tasks
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-8 border-b border-surface-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-12 flex items-center gap-2.5 px-2 text-xs font-bold uppercase tracking-widest transition-all duration-200 border-b-2
                ${activeTab === tab.id
                  ? 'text-brand-400 border-brand-500'
                  : 'text-gray-500 border-transparent hover:text-gray-300'}`}
            >
              <tab.icon size={16} />
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-lg text-[10px] ${activeTab === tab.id ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-800 text-surface-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active Curriculum</h4>
                <div className="flex gap-2">
                  <button className="p-2 rounded-xl bg-surface-900 border border-surface-800 text-surface-500 hover:text-brand-400 transition-colors">
                    <Filter size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assignedProblems.map(problem => (
                  <ProblemCard key={problem.id} problem={problem} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'people' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Participant Directory</h4>
                <div className="relative w-64">
                   <input
                    type="text"
                    placeholder="Find student..."
                    className="w-full bg-surface-900 border border-surface-800 rounded-xl py-2 pl-4 pr-10 text-xs text-gray-200 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-600" size={14} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classroom.members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(member => (
                  <div key={member.id} className="p-4 rounded-3xl bg-surface-900/50 border border-surface-800 flex items-center justify-between group hover:border-brand-500/30 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-surface-800 flex items-center justify-center text-surface-400 group-hover:bg-brand-500/10 group-hover:text-brand-400 transition-colors">
                        <Users size={20} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-gray-200">{member.name}</p>
                        <p className="text-[10px] text-surface-500 tracking-tight">{member.email}</p>
                      </div>
                    </div>
                    <button className="p-2 rounded-xl text-surface-600 hover:text-brand-400 transition-colors">
                      <Mail size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
