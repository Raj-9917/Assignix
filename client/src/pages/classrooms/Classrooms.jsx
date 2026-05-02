import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { School, Users, Code, ChevronRight, PlusCircle, LayoutDashboard, Search, Hash, Copy, CheckCircle2, Trash2, ShieldAlert, Loader2, LogOut } from 'lucide-react'
import PageShell from '../../components/ui/PageShell'
import StatCard from '../../components/dashboard/StatCard'
import ClassroomCardSkeleton from '../../components/classrooms/ClassroomCardSkeleton'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { classroomService } from '../../services/classroomService'
import { useAuth } from '../../context/AuthContext'

export default function Classrooms() {
  const { user } = useAuth()
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomDesc, setNewRoomDesc] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [copiedCode, setCopiedCode] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  
  // Edit State
  const [editingRoom, setEditingRoom] = useState(null)
  
  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    type: '', 
    id: null, 
    title: '', 
    message: '' 
  })

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin'

  const refreshClassrooms = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const data = await classroomService.getMyClassrooms()
      setClassrooms(data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch classrooms:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshClassrooms()
  }, [user?.id])

  const handleCreateRoom = async (e) => {
    if (e) e.preventDefault()
    if (!newRoomName.trim()) return
    try {
      setActionLoading(true)
      if (editingRoom) {
        await classroomService.updateClassroom(editingRoom.id, {
          name: newRoomName,
          description: newRoomDesc
        })
      } else {
        await classroomService.createClassroom({ 
          name: newRoomName, 
          description: newRoomDesc 
        })
      }
      setNewRoomName('')
      setNewRoomDesc('')
      setEditingRoom(null)
      setShowCreateModal(false)
      refreshClassrooms()
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleJoinRoom = async (e) => {
    if (e) e.preventDefault()
    if (!joinCode.trim()) return
    try {
      setActionLoading(true)
      await classroomService.joinClassroom(joinCode.toUpperCase())
      setJoinCode('')
      setShowJoinModal(false)
      refreshClassrooms()
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to authorize access'
      alert(message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteRoom = async () => {
    try {
       setActionLoading(true)
       await classroomService.deleteClassroom(confirmModal.id)
       setConfirmModal({ ...confirmModal, isOpen: false })
       refreshClassrooms()
    } catch (err) {
       alert(err.message)
    } finally {
       setActionLoading(false)
    }
  }

  const handleLeaveRoom = async () => {
    try {
      setActionLoading(true)
      await classroomService.leaveClassroom(confirmModal.id)
      setConfirmModal({ ...confirmModal, isOpen: false })
      refreshClassrooms()
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const openDeleteConfirm = (id, name) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      id,
      title: 'Decommission Terminal',
      message: `Are you sure you want to permanently delete "${name}"? This action will purge all student links and assignment logs.`
    })
  }

  const openLeaveConfirm = (id, name) => {
    setConfirmModal({
      isOpen: true,
      type: 'leave',
      id,
      title: 'Disconnect from Node',
      message: `Do you want to leave the classroom "${name}"? You will lose access to all assignments in this network.`
    })
  }

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const filteredClassrooms = classrooms.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.teacher?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.teacher?.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <PageShell
      title="Classrooms"
      subtitle={isTeacher ? "Manage your student groups and classroom activities." : "Enhance your skills with classmates and peers."}
      icon={School}
    >
      <div className="space-y-10">
        {/* Quick Stats Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading ? (
             <>
                <div className="h-40 bg-surface-800/50 rounded-[2.5rem] animate-pulse" />
                <div className="h-40 bg-surface-800/50 rounded-[2.5rem] animate-pulse" />
                <div className="h-40 bg-surface-800/50 rounded-[2.5rem] animate-pulse" />
             </>
          ) : (
             <>
                <StatCard title="Active Classes" value={filteredClassrooms.length} icon={School} color="brand" />
                <StatCard title="Student Network" value={filteredClassrooms.reduce((acc, c) => acc + (c.students?.length || 0), 0)} icon={Users} color="emerald" />
                <StatCard title="Total Problems" value={filteredClassrooms.reduce((acc, c) => acc + (c.assignments?.length || 0), 0)} icon={Code} color="amber" />
             </>
          )}
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
            className="w-full md:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-brand-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 hover:bg-brand-500 hover:-translate-y-1 active:scale-95 transition-all duration-300"
          >
            <PlusCircle size={20} />
            {isTeacher ? 'Create New Classroom' : 'Join Classroom'}
          </button>
        </div>

        {/* Classroom Grid */}
        {loading ? (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(4)].map((_, idx) => (
                 <ClassroomCardSkeleton key={idx} />
              ))}
           </div>
        ) : filteredClassrooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {filteredClassrooms.map((room) => (

              <div key={room.id} className="group relative bg-white border border-surface-700 rounded-[2.5rem] overflow-hidden hover:border-brand-500/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-brand-500/5">
                {/* Visual Accent */}
                <div className="h-2 bg-gradient-to-r from-brand-600 to-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                
                <div className="p-6 sm:p-10">
                  <div className="flex justify-between items-start mb-6 sm:mb-8">
                    <div className="space-y-1">
                      <h4 className="text-2xl font-black text-surface-300 group-hover:text-brand-600 transition-colors uppercase tracking-tight">
                        {room.name}
                      </h4>
                      <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
                        Taught by <span className="text-brand-600 italic">@{room.teacher?.username || 'teacher'}</span>
                      </p>
                    </div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-surface-800 flex items-center justify-center text-brand-600 border border-surface-700 group-hover:bg-brand-50 transition-colors shadow-sm">
                      <School size={24} className="sm:w-7 sm:h-7" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-5 mb-8 sm:mb-10">
                    <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50 border border-surface-700 space-y-1 sm:space-y-2 group-hover:border-emerald-500/20 transition-all flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-emerald-600 mb-0.5 sm:mb-1">
                        <Users size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Students</span>
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-slate-800 tabular-nums">{room.students?.length || 0}</p>
                    </div>
                    
                    {(isTeacher && (room.teacher_id === user?.id)) ? (
                       <button 
                        onClick={() => copyToClipboard(room.code)}
                        className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-brand-50 border border-brand-100 space-y-0.5 sm:space-y-1 text-left group/copy transition-all hover:bg-brand-100"
                      >
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2 text-brand-600">
                             <Hash size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />
                             <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Join Code</span>
                           </div>
                           {copiedCode === room.code ? <CheckCircle2 size={12} className="text-emerald-600 sm:w-3.5 sm:h-3.5" /> : <Copy size={12} className="text-brand-400 group-hover/copy:text-brand-600 sm:w-3.5 sm:h-3.5" />}
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-brand-700 tabular-nums uppercase tracking-tighter">{room.code}</p>
                      </button>
                    ) : (
                      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50 border border-surface-700 space-y-1 sm:space-y-2 group-hover:border-brand-500/20 transition-all">
                        <div className="flex items-center gap-2 text-brand-600 mb-0.5 sm:mb-1">
                          <Code size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />
                          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Assignments</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-slate-800 tabular-nums">{room.assignments?.length || 0}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Link
                      to={`/classroom/${room.id}`}
                      className="flex-[4] flex items-center justify-center gap-2 sm:gap-3 py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-white text-brand-600 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-600 hover:text-white hover:shadow-xl hover:shadow-brand-500/20 active:scale-95 transition-all duration-300 border-2 border-brand-500/20"
                    >
                      <LayoutDashboard size={16} className="sm:w-[18px] sm:h-[18px]" />
                      Enter Terminal
                      <ChevronRight size={16} className="ml-1 sm:w-[18px] sm:h-[18px]" />
                    </Link>
                    
                    {isTeacher && (room.teacher_id === user?.id) ? (
                      <div className="flex gap-2">
                         <button
                           onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             setEditingRoom(room);
                             setNewRoomName(room.name);
                             setNewRoomDesc(room.description || '');
                             setShowCreateModal(true);
                           }}
                           className="flex-1 flex items-center justify-center rounded-xl sm:rounded-2xl bg-slate-50 text-slate-500 border-2 border-slate-100 hover:bg-brand-500 hover:text-white hover:border-transparent transition-all duration-300 active:scale-90 shadow-sm px-4 cursor-pointer"
                           title="Edit Classroom"
                         >
                           <PlusCircle size={18} className="sm:w-5 sm:h-5 rotate-45" />
                         </button>
                         <button
                           onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             openDeleteConfirm(room.id, room.name);
                           }}
                           className="flex-1 flex items-center justify-center rounded-xl sm:rounded-2xl bg-rose-50 text-rose-500 border-2 border-rose-100 hover:bg-rose-500 hover:text-white hover:border-transparent transition-all duration-300 active:scale-90 shadow-sm px-4 cursor-pointer"
                           title="Delete Classroom"
                         >
                           <Trash2 size={18} className="sm:w-5 sm:h-5" />
                         </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openLeaveConfirm(room.id, room.name);
                        }}
                        className="flex-1 flex items-center justify-center rounded-xl sm:rounded-2xl bg-slate-50 text-surface-400 border-2 border-surface-700/10 hover:bg-rose-500 hover:text-white hover:border-transparent transition-all duration-300 active:scale-90 shadow-sm px-4 cursor-pointer"
                        title="Leave Classroom"
                      >
                        <LogOut size={18} className="sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 rounded-[3.5rem] border-4 border-dashed border-slate-100 bg-white">
             <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-300 mb-8 shadow-inner">
                <School size={48} />
             </div>
             <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">No Active Networks</h3>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-10 max-w-sm text-center leading-relaxed">
                {isTeacher ? "Initialize your first learning node to begin routing assignments." : "Acquire a join code from your supervisor to gain access."}
             </p>
             <button 
               onClick={() => isTeacher ? setShowCreateModal(true) : setShowJoinModal(true)}
               className="flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-brand-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-500/30 hover:bg-brand-500 transition-all hover:-translate-y-1"
             >
               <PlusCircle size={20} />
               {isTeacher ? 'Create Classroom' : 'Join Classroom'}
             </button>
          </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-fade-in" onClick={() => {
            setShowCreateModal(false)
            setEditingRoom(null)
            setNewRoomName('')
            setNewRoomDesc('')
          }} />
          <form 
            onSubmit={handleCreateRoom}
            className="w-full max-w-xl bg-white rounded-[2rem] sm:rounded-[3.5rem] shadow-2xl p-8 sm:p-14 space-y-8 sm:space-y-12 relative z-10 animate-zoom-in max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center space-y-2 sm:space-y-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-600 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl shadow-brand-500/20">
                 <PlusCircle size={28} className="text-white sm:w-9 sm:h-9" />
              </div>
              <h3 className="text-2xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight italic">
                {editingRoom ? 'Update' : 'Initialize'} <span className="text-brand-600">Terminal</span>
              </h3>
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Configuration</p>
            </div>
            
            <div className="space-y-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Network Name</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="e.g. Advanced System Design"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] py-5 px-8 text-sm text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-8 focus:ring-brand-500/5 focus:border-brand-500 transition-all shadow-inner"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">System Description</label>
                    <textarea
                      placeholder="Define the curriculum parameters..."
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.2rem] sm:rounded-[1.5rem] py-4 sm:py-5 px-6 sm:px-8 text-xs sm:text-sm text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-8 focus:ring-brand-500/5 focus:border-brand-500 transition-all shadow-inner min-h-[100px] sm:min-h-[120px] resize-none"
                      value={newRoomDesc}
                      onChange={(e) => setNewRoomDesc(e.target.value)}
                    />
                 </div>
              </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-6 rounded-[2rem] bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
              >
                Abort
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-[2] py-6 rounded-[2rem] bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-brand-500/30 hover:bg-brand-500 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
                {actionLoading ? 'Initializing...' : (editingRoom ? 'Update Network' : 'Deploy Network')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.type === 'delete' ? handleDeleteRoom : handleLeaveRoom}
        title={confirmModal.title}
        message={confirmModal.message}
        loading={actionLoading}
        variant={confirmModal.type === 'delete' ? 'danger' : 'brand'}
        confirmText={confirmModal.type === 'delete' ? 'Delete' : 'Leave'}
      />

      {/* JOIN MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-fade-in" onClick={() => setShowJoinModal(false)} />
          <form 
            onSubmit={handleJoinRoom}
            className="w-full max-w-md bg-white rounded-[2rem] sm:rounded-[3.5rem] shadow-2xl p-8 sm:p-14 space-y-8 sm:space-y-12 relative z-10 animate-zoom-in max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center space-y-2 sm:space-y-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-600 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl shadow-emerald-500/20">
                 <ShieldAlert size={28} className="text-white sm:w-9 sm:h-9" />
              </div>
              <h3 className="text-2xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight italic">Access <span className="text-emerald-600">Node</span></h3>
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authentication Required</p>
            </div>
            
            <div className="space-y-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Access Code</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    placeholder="XXXXXX"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] py-6 px-6 text-3xl text-center text-emerald-600 font-black placeholder:text-slate-200 focus:outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-inner tracking-[0.4em] uppercase"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                  />
               </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                className="flex-1 py-6 rounded-[2rem] bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
              >
                Abort
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-[2] py-6 rounded-[2rem] bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/30 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 font-sans"
              >
                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                {actionLoading ? 'Verifying...' : 'Authorize Access'}
              </button>
            </div>
          </form>
        </div>
      )}
    </PageShell>
  )
}
