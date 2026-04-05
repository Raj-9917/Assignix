import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { School, Users, Code, ChevronRight, PlusCircle, LayoutDashboard, Search, Hash, Copy, CheckCircle2 } from 'lucide-react'
import PageShell from '../../components/ui/PageShell'
import StatCard from '../../components/dashboard/StatCard'
import { classroomService } from '../../services/classroomPersistence'
import { useAuth } from '../../context/AuthContext'

export default function Classrooms() {
  const { user } = useAuth()
  const [classrooms, setClassrooms] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [copiedCode, setCopiedCode] = useState(null)

  const isTeacher = user?.role === 'teacher'

  useEffect(() => {
    refreshClassrooms()
  }, [user])

  const refreshClassrooms = () => {
    if (isTeacher) {
      setClassrooms(classroomService.getTeacherRooms(user.id))
    } else {
      setClassrooms(classroomService.getStudentRooms(user.id))
    }
  }

  const handleCreateRoom = (e) => {
    e.preventDefault()
    if (!newRoomName.trim()) return
    classroomService.createClassroom(newRoomName, user.email.split('@')[0], user.id)
    setNewRoomName('')
    setShowCreateModal(false)
    refreshClassrooms()
  }

  const handleJoinRoom = (e) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    try {
      classroomService.joinClassroom(joinCode.toUpperCase(), user.id)
      setJoinCode('')
      setShowJoinModal(false)
      refreshClassrooms()
    } catch (err) {
      alert(err.message)
    }
  }

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const filteredClassrooms = classrooms.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <PageShell
      title="Classrooms"
      subtitle={isTeacher ? "Manage your student groups and classroom activities." : "Enhance your skills with classmates and peers."}
      icon={School}
    >
      <div className="space-y-10">
        {/* Quick Stats Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Active Classes" value={filteredClassrooms.length} icon={School} color="brand" />
          <StatCard title="Student Network" value="2,482" icon={Users} color="emerald" />
          <StatCard title="Problems Solved" value="48" icon={Code} color="amber" />
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-b border-surface-700 pb-10">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-500" size={20} />
            <input
              type="text"
              placeholder="Search by class or teacher..."
              className="w-full bg-white border border-surface-700 rounded-2xl py-4 pl-14 pr-6 text-sm text-surface-300 font-bold placeholder:text-surface-600 focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all duration-300 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => isTeacher ? setShowCreateModal(true) : setShowJoinModal(true)}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 hover:bg-brand-500 hover:-translate-y-1 active:scale-95 transition-all duration-300"
          >
            <PlusCircle size={20} />
            {isTeacher ? 'Create New Classroom' : 'Join Classroom'}
          </button>
        </div>

        {/* Classroom Grid */}
        {filteredClassrooms.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredClassrooms.map((room) => (
              <div key={room.id} className="group relative bg-white border border-surface-700 rounded-[2.5rem] overflow-hidden hover:border-brand-500/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-brand-500/5">
                {/* Visual Accent */}
                <div className="h-2 bg-gradient-to-r from-brand-600 to-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                
                <div className="p-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <h4 className="text-2xl font-black text-surface-300 group-hover:text-brand-600 transition-colors uppercase tracking-tight">
                        {room.name}
                      </h4>
                      <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
                        Taught by <span className="text-brand-600 italic">@{room.teacher}</span>
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-surface-800 flex items-center justify-center text-brand-600 border border-surface-700 group-hover:bg-brand-50 transition-colors shadow-sm">
                      <School size={28} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5 mb-10">
                    <div className="p-5 rounded-3xl bg-slate-50 border border-surface-700 space-y-2 group-hover:border-emerald-500/20 transition-all">
                      <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <Users size={16} strokeWidth={3} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Students</span>
                      </div>
                      <p className="text-2xl font-black text-surface-300 tabular-nums">{room.studentCount}</p>
                    </div>
                    
                    {isTeacher ? (
                      <button 
                        onClick={() => copyToClipboard(room.code)}
                        className="p-5 rounded-3xl bg-brand-50 border border-brand-100 space-y-1 text-left group/copy transition-all hover:bg-brand-100"
                      >
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2 text-brand-600">
                             <Hash size={16} strokeWidth={3} />
                             <span className="text-[9px] font-black uppercase tracking-widest">Join Code</span>
                           </div>
                           {copiedCode === room.code ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} className="text-brand-400 group-hover/copy:text-brand-600" />}
                        </div>
                        <p className="text-2xl font-black text-brand-700 tabular-nums uppercase tracking-tighter">{room.code}</p>
                      </button>
                    ) : (
                      <div className="p-5 rounded-3xl bg-slate-50 border border-surface-700 space-y-2 group-hover:border-brand-500/20 transition-all">
                        <div className="flex items-center gap-2 text-brand-600 mb-1">
                          <Code size={16} strokeWidth={3} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Problems</span>
                        </div>
                        <p className="text-2xl font-black text-surface-300 tabular-nums">{room.problemIds.length}</p>
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/classroom/${room.id}`}
                    className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-surface-800 text-surface-300 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-600 hover:text-white hover:shadow-xl hover:shadow-brand-500/20 active:scale-95 transition-all duration-300 border border-surface-700"
                  >
                    <LayoutDashboard size={18} />
                    View Classroom
                    <ChevronRight size={18} className="ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 rounded-[3rem] border-4 border-dashed border-surface-700 bg-white">
             <div className="w-20 h-20 rounded-[2rem] bg-surface-800 flex items-center justify-center text-surface-600 mb-6">
                <School size={40} />
             </div>
             <h3 className="text-xl font-black text-surface-300 uppercase tracking-tight mb-2">No Active Classrooms</h3>
             <p className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-8">
                {isTeacher ? "Create your first classroom to get started." : "Get an access code from your teacher to join."}
             </p>
             <button 
               onClick={() => isTeacher ? setShowCreateModal(true) : setShowJoinModal(true)}
               className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20"
             >
               <PlusCircle size={18} />
               {isTeacher ? 'Create Classroom' : 'Join Classroom'}
             </button>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-surface-300/20 backdrop-blur-md animate-fade-in">
          <form 
            onSubmit={handleCreateRoom}
            className="w-full max-w-md bg-white rounded-[2.5rem] border border-surface-700 shadow-2xl p-10 space-y-8"
          >
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-surface-300 uppercase tracking-tight">Create Classroom</h3>
              <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">Set the details for your new classroom.</p>
            </div>
            
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Classroom Name</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Advanced System Design"
                    className="w-full bg-slate-50 border border-surface-700 rounded-2xl py-4 px-6 text-sm text-surface-300 font-bold placeholder:text-surface-600 focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all shadow-inner"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                  />
               </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-4 rounded-2xl bg-surface-800 text-surface-400 text-[10px] font-black uppercase tracking-widest border border-surface-700 hover:bg-slate-100 transition-all font-sans"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-4 rounded-2xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:bg-brand-500 transition-all"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* JOIN MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-surface-300/20 backdrop-blur-md animate-fade-in">
          <form 
            onSubmit={handleJoinRoom}
            className="w-full max-w-md bg-white rounded-[2.5rem] border border-surface-700 shadow-2xl p-10 space-y-8"
          >
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-surface-300 uppercase tracking-tight">Enter Code</h3>
              <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">Enter the 6-digit access code.</p>
            </div>
            
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Access Code</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    placeholder="XXXXXX"
                    className="w-full bg-slate-50 border border-surface-700 rounded-2xl py-5 px-6 text-2xl text-center text-brand-600 font-black placeholder:text-surface-700 focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all shadow-inner tracking-[0.3em] uppercase"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                  />
               </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                className="flex-1 py-4 rounded-2xl bg-surface-800 text-surface-400 text-[10px] font-black uppercase tracking-widest border border-surface-700 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-4 rounded-2xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:bg-brand-500 transition-all font-sans"
              >
                Join Now
              </button>
            </div>
          </form>
        </div>
      )}
    </PageShell>
  )
}
