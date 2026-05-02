import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { School, Users, Code, ChevronLeft, PlusCircle, Search, Mail, Filter, BookOpen, Loader2, Calendar, X, Check, ArrowRight, Sparkles, LayoutDashboard, Terminal, History, Eye } from 'lucide-react'
import Editor from '@monaco-editor/react'
import PageShell from '../../components/ui/PageShell'
import AssignmentGroupCard from '../../components/classrooms/AssignmentGroupCard'
import ProblemForm from '../../components/problems/ProblemForm'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { useAuth } from '../../context/AuthContext'
import { classroomService } from '../../services/classroomService'
import { problemService } from '../../services/problemService'

export default function ClassroomDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [classroom, setClassroom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tasks')
  const [searchTerm, setSearchTerm] = useState('')
  const [reports, setReports] = useState([])
  

  // Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isCreatingProblem, setIsCreatingProblem] = useState(false)
  const [allProblems, setAllProblems] = useState([])
  const [selectedProblemIds, setSelectedProblemIds] = useState([])
  const [assignmentTitle, setAssignmentTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [creating, setCreating] = useState(false)
  
  // Edit Assignment State
  const [editingAssignment, setEditingAssignment] = useState(null)
  
  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    id: null, 
    title: '', 
    message: '' 
  })

  // Code Viewer State
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false)
  
  // Get unique courses
  const courses = useMemo(() => {
    return [...new Set(allProblems.map(p => p.course || 'General'))].sort();
  }, [allProblems]);

  // Group problems by course for easier selection
  const groupedProblems = useMemo(() => {
    return allProblems.reduce((acc, p) => {
      const course = p.course || 'General';
      if (!acc[course]) acc[course] = [];
      acc[course].push(p);
      return acc;
    }, {});
  }, [allProblems]);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await classroomService.getClassroomDetail(id)
      setClassroom(data)
      
      const isTeacher = user?.role === 'admin' || (user?.role === 'teacher' && data.teacher_id === user?.id)
      
      // If teacher, also fetch all problems and reports
      if (isTeacher) {
        const [problems, reportData] = await Promise.all([
          problemService.getAllProblems(),
          classroomService.getClassroomReports(id)
        ])
        setAllProblems(problems)
        setReports(reportData)
      }
    } catch (err) {
      console.error('Failed to fetch classroom detail:', err)
    } finally {
      setLoading(false)
    }
  }, [id, user])

  useEffect(() => {
    if (id && user) {
      refreshData()
    }
  }, [id, user, refreshData])

  if (loading) return (
    <PageShell title="Loading..." icon={School}>
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 size={48} className="animate-spin text-brand-600" />
        <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Fetching classroom data...</p>
      </div>
    </PageShell>
  )

  if (!classroom) return <Navigate to="/classrooms" replace />

  const isTeacher = user?.role === 'admin' || (user?.role === 'teacher' && classroom?.teacher_id === user?.id)

  const handleAssign = async (e) => {
    if (e) e.preventDefault()
    if (!assignmentTitle || selectedProblemIds.length === 0 || !dueDate) return

    try {
      setAssigning(true)
      if (editingAssignment) {
        await classroomService.updateAssignment(id, editingAssignment.id, {
          title: assignmentTitle,
          due_date: dueDate
        })
      } else {
        await classroomService.assignProblem(id, { 
          title: assignmentTitle, 
          problem_ids: selectedProblemIds, 
          due_date: dueDate 
        })
      }
      setIsAssignModalOpen(false)
      setEditingAssignment(null)
      setSelectedProblemIds([])
      setAssignmentTitle('')
      setDueDate('')
      setSelectedCourse('')
      refreshData()
    } catch (err) {
      console.error('Failed to manage assignment:', err)
      alert(err.message || 'Failed to manage assignment')
    } finally {
      setAssigning(false)
    }
  }

  const handleDeleteAssignment = async () => {
    try {
      setAssigning(true)
      await classroomService.deleteAssignment(id, confirmModal.id)
      setConfirmModal({ ...confirmModal, isOpen: false })
      refreshData()
    } catch (err) {
      console.error('Failed to delete assignment:', err)
      alert(err.message || 'Failed to delete assignment')
    } finally {
      setAssigning(false)
    }
  }

  const openAssignmentDeleteConfirm = (assignmentId, title) => {
    setConfirmModal({
      isOpen: true,
      id: assignmentId,
      title: 'Remove Assignment',
      message: `Are you sure you want to delete "${title}"? This will remove the assignment group and associated student metrics from this classroom.`
    })
  }

  const openAssignmentEdit = (assignment) => {
    setEditingAssignment(assignment)
    setAssignmentTitle(assignment.title)
    const rawDate = assignment.due_date;
    setDueDate(rawDate ? new Date(rawDate).toISOString().split('T')[0] : '')
    setSelectedProblemIds(assignment.problem_ids || [])
    setIsAssignModalOpen(true)
  }

  const toggleProblemSelection = (pid) => {
    if (!pid) return;
    setSelectedProblemIds(prev => 
      prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
    )
  }

  const handleCreateProblem = async (problemData) => {
    try {
      setCreating(true)
      const newProblem = await problemService.createProblem(problemData)
      setAllProblems(prev => [newProblem, ...prev])
      setSelectedProblemIds(prev => [...prev, newProblem.id])
      setIsCreatingProblem(false)
      alert('Problem created and added to selection!')
    } catch (err) {
      console.error('Failed to create problem:', err)
      alert(err.message || 'Failed to create problem')
    } finally {
      setCreating(false)
    }
  }

  const activeAssignments = classroom.assignments || []

  const tabs = [
    { id: 'tasks', label: 'Assigned Tasks', icon: Code, count: activeAssignments.length },
    { id: 'people', label: 'Students', icon: Users, count: classroom.students?.length || 0 },
  ]

  if (isTeacher) {
    tabs.push({ id: 'reports', label: 'Submissions', icon: History, count: reports.length })
  }

  return (
    <PageShell
      title={classroom.name}
      subtitle={`Managed by ${classroom.teacherId?.name || 'Teacher'}`}
      icon={School}
    >
      <div className="space-y-8 relative">
        {/* Breadcrumb & Quick Actions */}
        <div className="flex items-center justify-between pb-4">
          <Link to="/classrooms" className="flex items-center gap-2 text-surface-500 hover:text-brand-400 transition-colors group">
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest leading-none">All Classrooms</span>
          </Link>

          {isTeacher && (
            <button 
              onClick={() => {
                setIsCreatingProblem(false)
                setIsAssignModalOpen(true)
                setSelectedProblemIds([])
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-600/10 text-brand-400 text-xs font-bold uppercase tracking-widest border border-brand-500/20 hover:bg-brand-600 hover:text-white transition-all duration-300 shadow-lg shadow-brand-500/5 active:scale-95"
            >
              <PlusCircle size={16} />
              Manage Assignments
            </button>
          )}
        </div>

        {/* Classroom Header Summary */}
        <div className="p-8 rounded-[40px] bg-surface-900/50 border border-surface-800 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-600/10 transition-colors" />
          <div className="w-20 h-20 rounded-3xl bg-brand-500/10 flex items-center justify-center text-brand-400 border border-brand-500/20 shadow-lg shadow-brand-500/10 relative z-10 transition-transform group-hover:scale-110">
            <BookOpen size={40} />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2 relative z-10">
            <div className="flex items-center justify-center md:justify-start gap-4">
               <h3 className="text-2xl font-bold text-gray-100">{classroom.name}</h3>
               <span className="px-3 py-1 rounded-lg bg-surface-800 text-brand-500 text-[10px] font-black uppercase tracking-widest border border-surface-700 shadow-sm">CODE: {classroom.code}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-surface-500">
              <span className="flex items-center gap-1.5 leading-none">
                <Users size={14} className="text-emerald-400" />
                {classroom.students?.length || 0} Students
              </span>
              <span className="text-surface-700">|</span>
              <span className="flex items-center gap-1.5 leading-none">
                <Code size={14} className="text-amber-400" />
                {activeAssignments.length} Assignments
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
        <div className="animate-fade-in pb-20">
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <Code size={16} className="text-brand-500" />
                   Active Curriculum
                </h4>
              </div>

              {activeAssignments.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {activeAssignments.map(assignment => (
                    <AssignmentGroupCard 
                      key={assignment.id} 
                      assignment={assignment} 
                      classroomId={id} 
                      isTeacher={isTeacher}
                      onEdit={openAssignmentEdit}
                      onDelete={openAssignmentDeleteConfirm}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center space-y-4 rounded-[40px] bg-surface-900/30 border-2 border-dashed border-surface-800">
                   <Code size={48} className="mx-auto text-surface-700 mb-4" strokeWidth={1} />
                   <p className="text-surface-500 text-xs font-black uppercase tracking-widest italic">No tasks assigned yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'people' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 text-emerald-500">
                   <Users size={16} />
                   Participant Directory
                </h4>
                <div className="relative w-64 group">
                   <input
                    type="text"
                    placeholder="Find student..."
                    className="w-full bg-surface-900 border border-surface-800 rounded-xl py-3 pl-10 pr-4 text-xs text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all shadow-inner"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-600 group-focus-within:text-brand-500 transition-all" size={14} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(classroom.students || []).filter(m => (m.name || m.username || '').toLowerCase().includes(searchTerm.toLowerCase())).map(member => (
                   <div key={member.id} className="p-5 rounded-3xl bg-surface-900/50 border border-surface-800 flex items-center justify-between group hover:border-brand-500/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-brand-500/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center text-surface-400 group-hover:bg-brand-600 group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-inner overflow-hidden">
                        {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : member.name?.charAt(0).toUpperCase() || member.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-gray-200 group-hover:text-brand-400 transition-colors">{member.name || member.username}</p>
                        <p className="text-[10px] font-black text-surface-500 tracking-tight lowercase">@{member.username}</p>
                      </div>
                    </div>
                    <button className="p-2.5 rounded-xl text-surface-600 hover:text-brand-400 hover:bg-brand-500/10 transition-all active:scale-95">
                      <Mail size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 text-brand-500">
                   <History size={16} />
                   Submission Registry
                </h4>
              </div>

              {reports.length > 0 ? (
                <div className="overflow-hidden rounded-[40px] border border-surface-800 bg-surface-900/50 backdrop-blur-sm">
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-surface-800 bg-surface-950/50">
                          <th className="px-8 py-6 text-[10px] font-black text-surface-500 uppercase tracking-widest">Student</th>
                          <th className="px-8 py-6 text-[10px] font-black text-surface-500 uppercase tracking-widest">Problem</th>
                          <th className="px-8 py-6 text-[10px] font-black text-surface-500 uppercase tracking-widest text-center">Result</th>
                          <th className="px-8 py-6 text-[10px] font-black text-surface-500 uppercase tracking-widest text-center">Score</th>
                          <th className="px-8 py-6 text-[10px] font-black text-surface-500 uppercase tracking-widest text-right">Review</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-800">
                        {reports.map((sub) => (
                          <tr key={sub.id} className="group hover:bg-surface-800/30 transition-colors">
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center text-[10px] font-black text-surface-400 group-hover:text-brand-400 transition-colors overflow-hidden">
                                      {sub.userId?.avatar ? <img src={sub.userId.avatar} className="w-full h-full object-cover" /> : sub.userId?.name?.charAt(0).toUpperCase()}
                                   </div>
                                   <div className="space-y-0.5">
                                      <p className="text-xs font-bold text-gray-200">{sub.userId?.name || 'Student'}</p>
                                      <p className="text-[9px] font-black text-surface-600 uppercase tracking-widest lowercase">@{sub.userId?.username}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-5">
                                <div className="space-y-0.5">
                                   <p className="text-xs font-bold text-gray-200">{sub.problemId?.title || 'Unknown Problem'}</p>
                                   <p className="text-[9px] font-black text-brand-600/70 uppercase tracking-widest">{sub.problemId?.category}</p>
                                </div>
                             </td>
                             <td className="px-8 py-5 text-center">
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                  sub.status === 'Accepted' 
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                }`}>
                                   {sub.status}
                                </span>
                             </td>
                             <td className="px-8 py-5 text-center">
                                <span className="text-xs font-black text-gray-400 tabular-nums">
                                   {sub.testCasesPassed || 0} / {sub.totalTestCases || 0}
                                </span>
                             </td>
                             <td className="px-8 py-5 text-right">
                                <button 
                                  onClick={() => {
                                    setSelectedSubmission(sub)
                                    setIsCodeModalOpen(true)
                                  }}
                                  className="p-2.5 rounded-xl bg-surface-800 text-surface-400 hover:text-white hover:bg-brand-600 transition-all active:scale-95 shadow-lg group-hover:shadow-brand-500/10"
                                >
                                   <Eye size={16} />
                                </button>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              ) : (
                <div className="py-20 text-center space-y-4 rounded-[40px] bg-surface-900/30 border-2 border-dashed border-surface-800">
                   <LayoutDashboard size={48} className="mx-auto text-surface-700 mb-4" strokeWidth={1} />
                   <p className="text-surface-500 text-xs font-black uppercase tracking-widest italic">No submissions recorded yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Code Viewer Modal */}
        {isCodeModalOpen && selectedSubmission && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl animate-fade-in" onClick={() => setIsCodeModalOpen(false)} />
              <div className="bg-surface-950 border border-surface-800 rounded-[3rem] w-full max-w-5xl h-[85vh] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-zoom-in">
                {/* Header */}
                <div className="p-8 border-b border-surface-800 flex items-center justify-between shrink-0 bg-surface-900/40 backdrop-blur-md">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-400 border border-brand-500/20 shadow-lg shadow-brand-500/5">
                         <Terminal size={28} />
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black text-gray-100 uppercase tracking-tight italic">Submission <span className="text-brand-500">Trace</span></h3>
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                              selectedSubmission.status === 'Accepted' 
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            }`}>
                              {selectedSubmission.status}
                            </span>
                         </div>
                         <div className="flex items-center gap-4 text-[10px] font-bold text-surface-500 uppercase tracking-widest">
                            <span className="text-brand-400">@{selectedSubmission.userId?.username}</span>
                            <span className="w-1 h-1 rounded-full bg-surface-700" />
                            <span>{selectedSubmission.problemId?.title}</span>
                            <span className="w-1 h-1 rounded-full bg-surface-700" />
                            <span>{new Date(selectedSubmission.createdAt).toLocaleString()}</span>
                         </div>
                      </div>
                   </div>
                   <button onClick={() => setIsCodeModalOpen(false)} className="p-3 rounded-2xl bg-surface-900 text-surface-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all active:scale-95">
                      <X size={24} />
                   </button>
                </div>

                {/* Editor Body */}
                <div className="flex-1 min-h-0 relative bg-[#1e1e1e]">
                   <Editor
                     height="100%"
                     defaultLanguage={selectedSubmission.language || 'javascript'}
                     value={selectedSubmission.code}
                     theme="vs-dark"
                     options={{
                       readOnly: true,
                       minimap: { enabled: false },
                       fontSize: 14,
                       fontFamily: 'JetBrains Mono, Fira Code, monospace',
                       padding: { top: 30, bottom: 20 },
                       scrollBeyondLastLine: false,
                       smoothScrolling: true,
                       cursorStyle: 'block',
                       renderLineHighlight: 'all',
                       lineNumbers: 'on',
                       folding: true,
                       scrollbar: {
                         vertical: 'hidden',
                         horizontal: 'hidden'
                       }
                     }}
                   />
                </div>

                {/* Stats Footer */}
                <div className="p-8 bg-surface-900/60 border-t border-surface-800 flex items-center justify-between gap-6 overflow-x-auto backdrop-blur-md">
                   <div className="flex items-center gap-10">
                      <div className="space-y-1.5">
                         <p className="text-[10px] font-black text-surface-600 uppercase tracking-widest leading-none">Validation</p>
                         <p className="text-sm font-bold text-gray-200 tabular-nums leading-none">
                            <span className="text-emerald-500">{selectedSubmission.testCasesPassed}</span> / {selectedSubmission.totalTestCases} Passed
                         </p>
                      </div>
                      <div className="space-y-1.5 border-l border-surface-800 pl-10">
                         <p className="text-[10px] font-black text-surface-600 uppercase tracking-widest leading-none">Memory</p>
                         <p className="text-sm font-bold text-gray-200 tabular-nums leading-none">{selectedSubmission.memory || 0} KB</p>
                      </div>
                      <div className="space-y-1.5 border-l border-surface-800 pl-10">
                         <p className="text-[10px] font-black text-surface-600 uppercase tracking-widest leading-none">Runtime</p>
                         <p className="text-sm font-bold text-gray-200 tabular-nums leading-none">{selectedSubmission.runtime || 0} ms</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-4">
                      <button className="px-8 py-3.5 rounded-2xl bg-surface-800 text-surface-400 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-surface-700 transition-all border border-surface-700 active:scale-95 shadow-lg">
                         Download Binary
                      </button>
                      <button className="px-8 py-3.5 rounded-2xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-brand-500/20 hover:bg-brand-500 active:scale-95 transition-all">
                         Accept Solution
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Multi-Assign Modal (Remains same) */}
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-fade-in" onClick={() => setIsAssignModalOpen(false)} />
             
             <div className={`bg-white border border-surface-700 rounded-[3rem] w-full ${isCreatingProblem ? 'max-w-4xl max-h-[90vh]' : 'max-w-xl'} shadow-2xl relative z-10 overflow-hidden animate-zoom-in transition-all duration-500`}>
                {isCreatingProblem ? (
                  <div className="h-full flex flex-col">
                    <div className="p-10 pb-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Question Designer</p>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Create New Problem</h3>
                      </div>
                      <button 
                        onClick={() => setIsCreatingProblem(false)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                      >
                         Back to Selection
                      </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <ProblemForm 
                        onSubmit={handleCreateProblem} 
                        onCancel={() => setIsCreatingProblem(false)} 
                        loading={creating} 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-10 space-y-10">
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Teacher Panel</p>
                          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">
                            {editingAssignment ? 'Update' : 'Manage'} <span className="text-brand-600">Curriculum</span>
                          </h3>
                        </div>
                        <button onClick={() => {
                          setIsAssignModalOpen(false)
                          setEditingAssignment(null)
                          setAssignmentTitle('')
                          setDueDate('')
                          setSelectedCourse('')
                          setSelectedProblemIds([])
                        }} className="p-3 rounded-2xl bg-slate-100 text-surface-500 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-95">
                          <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-8 text-slate-900">
                        {/* Selected Problems List */}
                        {selectedProblemIds.length > 0 && (
                          <div className="space-y-4">
                             <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Selection Queue ({selectedProblemIds.length})</label>
                                <button onClick={() => setSelectedProblemIds([])} className="text-[9px] font-bold text-red-500 uppercase hover:underline">Clear all</button>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {selectedProblemIds.map(pid => {
                                  const p = allProblems.find(x => x.id === pid);
                                  return (
                                    <div key={pid} className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 text-[10px] font-bold">
                                      {p?.title || 'Unknown Problem'}
                                      <button onClick={() => toggleProblemSelection(pid)} className="p-1 rounded-md hover:bg-brand-200 transition-colors">
                                        <X size={12} />
                                      </button>
                                    </div>
                                  )
                                })}
                             </div>
                          </div>
                        )}

                        <div className="space-y-6">
                          <div className="space-y-4">
                              <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest ml-1">Assignment Title</label>
                              <input 
                                type="text"
                                placeholder="e.g. Recursion & Loops Lab #1"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all shadow-sm"
                                value={assignmentTitle}
                                onChange={(e) => setAssignmentTitle(e.target.value)}
                                required
                              />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest ml-1">1. Select Course</label>
                                <div className="relative">
                                  <select 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all appearance-none cursor-pointer"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                  >
                                      <option value="">Choose Course...</option>
                                      {courses.map(course => (
                                        <option key={course} value={course}>{course}</option>
                                      ))}
                                  </select>
                                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-surface-500">
                                      <BookOpen size={18} />
                                  </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest ml-1">2. Add Problems</label>
                                <div className="relative">
                                  <select 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all appearance-none cursor-pointer disabled:opacity-50"
                                    value=""
                                    disabled={!selectedCourse}
                                    onChange={(e) => toggleProblemSelection(e.target.value)}
                                  >
                                      <option value="" disabled>{selectedCourse ? 'Choose problem...' : 'Select course first'}</option>
                                      {selectedCourse && (groupedProblems[selectedCourse] || [])
                                        .filter(p => !selectedProblemIds.includes(p.id))
                                        .map(p => (
                                          <option key={p.id} value={p.id}>
                                            {p.title} ({p.difficulty})
                                          </option>
                                        ))
                                      }
                                  </select>
                                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-surface-500">
                                      <PlusCircle size={18} />
                                  </div>
                                </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest ml-1">Due Date (Applies to all)</label>
                              <div className="relative">
                                <input 
                                  type="date"
                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all cursor-pointer"
                                  value={dueDate}
                                  onChange={(e) => setDueDate(e.target.value)}
                                  required
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-surface-500">
                                    <Calendar size={18} />
                                </div>
                              </div>
                          </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAssignModalOpen(false)
                              setEditingAssignment(null)
                              setAssignmentTitle('')
                              setDueDate('')
                              setSelectedCourse('')
                              setSelectedProblemIds([])
                            }}
                            className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all font-bold active:scale-95"
                          >
                              Abort
                          </button>
                          <button
                            onClick={handleAssign}
                            disabled={assigning || (editingAssignment ? !assignmentTitle : selectedProblemIds.length === 0) || !dueDate}
                            className="flex-[2] py-4 rounded-2xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:bg-brand-500 disabled:opacity-50 transition-all flex items-center justify-center gap-3 font-bold active:scale-95"
                          >
                              {assigning ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={3} />}
                              {assigning ? 'Finalizing...' : (editingAssignment ? 'Update Assignment' : `Finalize ${selectedProblemIds.length} Assignments`)}
                          </button>
                        </div>
                    </div>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* CONFIRM MODAL for Assignments */}
        <ConfirmModal 
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={handleDeleteAssignment}
          title={confirmModal.title}
          message={confirmModal.message}
          loading={assigning}
          variant="danger"
          confirmText="Remove"
        />

      </div>
    </PageShell>
  )
}
