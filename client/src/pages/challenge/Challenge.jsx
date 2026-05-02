import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../../components/ui/PageShell'
import { 
  Trophy, 
  Users, 
  Calendar, 
  ChevronRight, 
  BarChart3, 
  Plus, 
  Swords, 
  Zap, 
  Target, 
  Clock, 
  X, 
  PlayCircle, 
  Loader2, 
  Filter,
  Trash2,
  Lock,
  Globe,
  Check,
  Code,
  Key,
  Gamepad2,
  Sparkles,
  BookOpen,
  ArrowRight,
  RefreshCcw
} from 'lucide-react'
import { challengeService } from '../../services/challengeService'
import { problemService } from '../../services/problemService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../config/supabaseClient'

export default function Challenge() {
  const { user } = useAuth()
  const toast = useToast()
  const isAdmin = user?.role === 'admin'
  const navigate = useNavigate()
  
  const [challenges, setChallenges] = useState([])
  const [allProblems, setAllProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingProblems, setLoadingProblems] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPrivateModal, setShowPrivateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [joiningChallengeId, setJoiningChallengeId] = useState(null)
  const [activeTab, setActiveTab] = useState('Global')
  const [refreshing, setRefreshing] = useState(false)

  // Student Match Creation State
  const [privateFormData, setPrivateFormData] = useState({ 
    title: '', 
    difficulty: 'Medium', 
    time_limit: 30, 
    problem_ids: [], 
    is_private: true 
  })
  const [isCreatingCustomPrivate, setIsCreatingCustomPrivate] = useState(false)
  const [customPrivateProblem, setCustomPrivateProblem] = useState({
    title: '',
    description: '',
    difficulty: 'Medium',
    category: 'Logic'
  })
  const [privateSelectedCourse, setPrivateSelectedCourse] = useState('All')
  
  // Join by Code State
  const [joinCode, setJoinCode] = useState('')
  const [isJoiningCode, setIsJoiningCode] = useState(false)

  // Admin Modal State (Global/Official)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Medium',
    time_limit: 30,
    problem_ids: [],
    start_date: '',
    end_date: ''
  })
  const [isCreatingCustom, setIsCreatingCustom] = useState(false)
  const [customProblem, setCustomProblem] = useState({
    title: '',
    description: '',
    difficulty: 'Medium',
    category: 'General',
    course: 'General'
  })
  const [selectedCourse, setSelectedCourse] = useState('All')

  const courses = [
    { id: '1', title: 'C Programming' },
    { id: '2', title: 'Data Structures' },
    { id: '3', title: 'Algorithms' },
    { id: '4', title: 'Java Core' }
  ]

  const fetchProblems = useCallback(async () => {
    try {
      setLoadingProblems(true)
      const data = await problemService.getProblems()
      setAllProblems(data || [])
    } catch (err) {
      console.error('Problem Library Sync Error:', err)
      toast.error('Failed to load problem library')
    } finally {
      setLoadingProblems(false)
    }
  }, [toast])

  const fetchChallenges = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const data = await challengeService.getChallenges()
      setChallenges(data)
    } catch (err) {
      console.error('Challenge Sync Error:', err)
      toast.error('Failed to load challenges')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchChallenges()
    fetchProblems()

    const channel = supabase.channel('challenges_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'challenges'
      }, () => {
        fetchChallenges()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchChallenges, fetchProblems])

  const handleManualRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        fetchChallenges(true),
        fetchProblems()
      ])
      toast.success('Arena synchronized')
    } catch (err) {
      toast.error('Sync failed')
    } finally {
      setTimeout(() => setRefreshing(false), 500)
    }
  }

  const openPrivateModal = async () => {
    setShowPrivateModal(true)
    try {
      const problems = await problemService.getAllProblems()
      setAllProblems(problems)
    } catch (err) {
      console.error('Failed to fetch problems:', err)
    }
  }

  const toggleProblem = (id, isGlobal = false) => {
    if (isGlobal) {
      setFormData(prev => {
        const ids = [...(prev.problem_ids || [])]
        const index = ids.indexOf(id)
        if (index === -1) {
          ids.push(id)
        } else {
          ids.splice(index, 1)
        }
        return { ...prev, problem_ids: ids }
      })
    } else {
      setPrivateFormData(prev => {
        const ids = [...(prev.problem_ids || [])]
        const index = ids.indexOf(id)
        if (index === -1) {
          ids.push(id)
        } else {
          ids.splice(index, 1)
        }
        return { ...prev, problem_ids: ids }
      })
    }
  }

  const handleCreatePrivate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      let final_problem_ids = [...privateFormData.problem_ids]

      if (isCreatingCustomPrivate) {
        if (!customPrivateProblem.title) {
          toast.error('Custom Problem Title is Required')
          setCreating(false)
          return
        }
        const newProblem = await problemService.createProblem({
          ...customPrivateProblem,
          course: 'General',
          is_arena_problem: true,
          is_approved: false
        })
        final_problem_ids.push(newProblem.id)
      }

      if (final_problem_ids.length === 0) {
        toast.error('Please select at least one problem')
        setCreating(false)
        return
      }

      const matchData = {
        ...privateFormData,
        problem_ids: final_problem_ids
      }

      const response = await challengeService.createPrivateRoom(matchData)
      toast.success(privateFormData.is_private ? 'Private Room Ready!' : 'Public Match Published!')
      setShowPrivateModal(false)
      fetchChallenges()
      navigate(`/room/${response.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create match')
    } finally {
      setCreating(false)
    }
  }

  const handleCreate = async (e) => {
    if (e) e.preventDefault()
    if (!isAdmin) return
    
    if (!formData.title.trim()) {
      toast.error('Challenge title is required')
      return
    }

    setCreating(true)

    try {
      let final_problem_ids = [...formData.problem_ids]

      if (isCreatingCustom) {
        if (!customProblem.title) {
          toast.error('Custom Problem Title is Required')
          setCreating(false)
          return
        }
        const newProblem = await problemService.createProblem({
          ...customProblem,
          is_arena_problem: true,
          is_approved: true // Admins can auto-approve their own global problems
        })
        final_problem_ids.push(newProblem.id)
      }

      if (final_problem_ids.length === 0) {
        toast.error('Select at least one problem')
        setCreating(false)
        return
      }

      // Format dates or set defaults to avoid empty string database errors
      const submissionData = {
        ...formData,
        problem_ids: final_problem_ids,
        start_date: formData.start_date || new Date().toISOString(),
        end_date: formData.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Default 1 week
      }

      await challengeService.createChallenge(submissionData)

      toast.success('Global Challenge Created!')
      setShowCreateModal(false)
      
      // Reset State
      setFormData({
        title: '',
        description: '',
        difficulty: 'Medium',
        time_limit: 30,
        problem_ids: [],
        start_date: '',
        end_date: ''
      })
      setCustomProblem({
        title: '',
        description: '',
        difficulty: 'Medium',
        category: 'General',
        course: 'General'
      })
      setIsCreatingCustom(false)
      
      fetchChallenges()
    } catch (err) {
      toast.error(err.message || 'Failed to create global challenge')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) return
    try {
      await challengeService.deleteChallenge(id)
      toast.success('Challenge deleted')
      fetchChallenges()
    } catch (_err) {
      toast.error('Failed to delete')
    }
  }

  const handleJoinAndNavigate = async (challengeId) => {
    setJoiningChallengeId(challengeId)
    try {
      await challengeService.joinChallenge(challengeId)
      navigate(`/room/${challengeId}`)
    } catch (err) {
      if (err.message?.includes('already joined')) {
        navigate(`/room/${challengeId}`)
      } else {
        toast.error(err.message || 'Failed to join')
      }
    } finally {
      setJoiningChallengeId(null)
    }
  }

  const handleJoinByCode = async (e) => {
    e.preventDefault()
    if (!joinCode || joinCode.length < 6) {
      toast.error('Enter a valid 6-character code')
      return
    }

    setIsJoiningCode(true)
    try {
      const challenge = await challengeService.getChallengeByCode(joinCode)
      try {
        await challengeService.joinChallenge(challenge.id)
      } catch (_err) {
        // Ignore
      }
      toast.success('Joined successfully!')
      navigate(`/room/${challenge.id}`)
    } catch (err) {
      toast.error(err.message || 'Invalid or expired code')
    } finally {
      setIsJoiningCode(false)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white'
      case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white'
      case 'hard': return 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white'
      default: return 'bg-slate-50 text-slate-600 border-slate-100'
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-brand-50 text-brand-600 border-brand-100'
      case 'ended': return 'bg-slate-100 text-slate-500 border-slate-200'
      default: return 'bg-indigo-50 text-indigo-600 border-indigo-100'
    }
  }

  const filteredChallenges = () => {
    if (activeTab === 'Global') {
      return challenges.filter(c => c.created_by?.role === 'admin')
    }
    return challenges.filter(c => c.created_by?.role !== 'admin' && !c.is_private)
  }

  return (
    <PageShell 
      title="Hacker Arena" 
      subtitle="Dominate the leaderboard by solving complex algorithmic challenges. Join official tournaments or create your own custom practice hubs."
      icon={Swords}
      centered={true}
      actions={
        <>
           <button 
              onClick={openPrivateModal}
              className="group flex items-center gap-3 px-6 py-3 bg-white border border-surface-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-surface-500 hover:border-brand-500 hover:text-brand-600 transition-all shadow-sm active:scale-95"
           >
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              Create Match
           </button>
           {isAdmin && (
             <button 
                onClick={() => {
                  setShowCreateModal(true)
                  fetchProblems()
                }}
                className="flex items-center gap-3 px-6 py-3 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 active:scale-95"
             >
                <Trophy size={16} />
                Host Global
             </button>
           )}
        </>
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">

        {/* ── Tabs & Stats ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-10 mb-12">
          <div className="lg:col-span-3">
             <div className="flex items-center gap-8 mb-10 border-b border-surface-700 pb-1">
                <button 
                   onClick={() => setActiveTab('Global')}
                   className={`pb-4 px-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'Global' ? 'text-brand-600' : 'text-surface-500 hover:text-surface-300'}`}
                >
                   {activeTab === 'Global' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-600 rounded-full" />}
                   Official Tournaments
                </button>
                <button 
                   onClick={() => setActiveTab('Community')}
                   className={`pb-4 px-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'Community' ? 'text-indigo-500' : 'text-surface-500 hover:text-surface-300'}`}
                >
                   {activeTab === 'Community' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 rounded-full" />}
                   Community Matches
                </button>

                <div className="flex-1" />

                <button 
                   onClick={handleManualRefresh}
                   disabled={refreshing}
                   className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-surface-700 text-[10px] font-black uppercase tracking-widest transition-all ${refreshing ? 'text-brand-600 bg-brand-50/50' : 'text-surface-500 hover:text-brand-600 hover:bg-slate-50'}`}
                   title="Sync Arena Data"
                >
                   <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
                   {refreshing ? 'Syncing...' : 'Sync'}
                </button>
             </div>

             {/* ── Challenge Grid ── */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {loading ? (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
                     <Loader2 size={48} className="animate-spin text-brand-600" />
                     <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Gathering Arenas...</p>
                  </div>
                ) : filteredChallenges().length === 0 ? (
                  <div className="col-span-full py-20 bg-white border border-surface-700 rounded-[3.5rem] flex flex-col items-center justify-center gap-6 shadow-sm">
                     <div className="p-6 bg-slate-50 rounded-full border border-slate-100">
                        <Trophy size={48} className="text-slate-200" />
                     </div>
                     <div className="text-center space-y-2">
                        <h3 className="text-xl font-black text-surface-300 uppercase">No Matches Found</h3>
                        <p className="text-xs text-surface-500 font-medium">Be the first to launch a challenge in this category!</p>
                     </div>
                     <button onClick={openPrivateModal} className="px-8 py-3 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20">
                        Start Now
                     </button>
                  </div>
                ) : (
                  filteredChallenges().map(challenge => (
                    <ChallengeCard 
                      key={challenge.id}
                      challenge={challenge}
                      isAdmin={isAdmin}
                      handleDelete={handleDelete}
                      handleJoinAndNavigate={handleJoinAndNavigate}
                      joiningChallengeId={joiningChallengeId}
                      getDifficultyColor={getDifficultyColor}
                      getStatusColor={getStatusColor}
                    />
                  ))
                )}
             </div>
          </div>

          {/* ── Sidebar Stats ── */}
          <aside className="space-y-8">
           <div className="p-8 rounded-[2.5rem] bg-surface-900 border border-surface-700 shadow-xl overflow-hidden relative group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl group-hover:bg-brand-500/10 transition-all duration-1000" />
                <div className="relative z-10 space-y-4 text-left">
                   <h3 className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] ml-1">Join Private Match</h3>
                   <form onSubmit={handleJoinByCode} className="space-y-3">
                      <div className="relative">
                         <input 
                            type="text"
                            placeholder="ENTER CODE"
                            maxLength={6}
                            className="w-full bg-surface-950 border border-surface-700 rounded-xl py-3.5 px-4 text-surface-300 placeholder:text-surface-600 text-xs font-black tracking-[0.3em] focus:outline-none focus:border-brand-500 transition-all uppercase"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                         />
                         <button 
                            type="submit"
                            disabled={isJoiningCode || joinCode.length < 6}
                            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-surface-800 text-brand-600 hover:bg-brand-600 hover:text-white transition-all disabled:opacity-30 flex items-center justify-center border border-surface-700 shadow-inner"
                         >
                            {isJoiningCode ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={16} strokeWidth={3} />}
                         </button>
                      </div>
                      <p className="text-[8px] font-bold text-surface-600 uppercase tracking-widest text-center italic">Encryption Key Required</p>
                   </form>
                </div>
             </div>

             <div className="p-8 rounded-[2.5rem] bg-white border border-surface-700 shadow-sm text-left relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 blur-2xl rounded-full -mr-12 -mt-12 transition-all group-hover:bg-brand-500/10" />
                <div className="flex items-center gap-3 mb-8 relative z-10">
                   <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center shadow-sm transition-transform group-hover:scale-110">
                      <BarChart3 size={20} />
                   </div>
                   <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Arena Stats</h3>
                </div>
                
                <div className="space-y-6 relative z-10">
                   <div className="flex justify-between items-center group/item hover:translate-x-1 transition-transform">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Matches Won</span>
                        <div className="h-0.5 w-4 bg-brand-600 rounded-full mt-0.5" />
                      </div>
                      <span className="text-lg font-black text-slate-900 tabular-nums">--</span>
                   </div>
                   <div className="flex justify-between items-center group/item hover:translate-x-1 transition-transform">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Total Points</span>
                        <div className="h-0.5 w-4 bg-indigo-500 rounded-full mt-0.5" />
                      </div>
                      <span className="text-lg font-black text-slate-900 tabular-nums">--</span>
                   </div>
                   <div className="flex justify-between items-center group/item hover:translate-x-1 transition-transform">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Global Rank</span>
                        <div className="h-0.5 w-4 bg-amber-500 rounded-full mt-0.5" />
                      </div>
                      <span className="text-lg font-black text-amber-600 tabular-nums">#--</span>
                   </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50 relative z-10">
                   <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-brand-500/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-600 border border-slate-200 transition-all active:scale-95">
                      Operational Profile <ChevronRight size={14} className="text-brand-600" strokeWidth={3} />
                   </button>
                </div>
             </div>

             <section className="p-8 rounded-[2.5rem] bg-surface-900 border border-surface-700 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 group-hover:text-brand-500 transition-all duration-700">
                   <Sparkles size={80} />
                </div>
                <div className="relative z-10 space-y-4">
                   <h4 className="text-[10px] font-black text-surface-500 uppercase tracking-widest">System Reward</h4>
                   <h3 className="text-xl font-black text-surface-300 uppercase leading-tight pr-8">Earn <span className="text-brand-600 italic">500 XP</span> this week</h3>
                   <p className="text-[10px] text-surface-600 font-bold uppercase tracking-tight">Active mission: Official Tournaments participation</p>
                   <button className="px-5 py-2.5 bg-surface-800 text-surface-300 border border-surface-700 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-brand-500 transition-all active:scale-95">
                      Mission Brief
                   </button>
                </div>
             </section>
          </aside>
        </div>
      </div>

      {/* ── Private Room Modal ── */}
      {showPrivateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-fade-in" onClick={() => setShowPrivateModal(false)} />
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden animate-zoom-in flex flex-col max-h-[90vh]">
             <div className="p-10 pb-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Custom Match Assembly</p>
                   <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Create Room</h3>
                </div>
                <button onClick={() => setShowPrivateModal(false)} className="p-3 rounded-2xl bg-slate-100 text-surface-500 hover:text-rose-500 transition-all">
                  <X size={24} />
                </button>
             </div>

             <form onSubmit={handleCreatePrivate} className="flex-1 overflow-y-auto p-10 space-y-8">
                <div className="space-y-2 text-left">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Match Name *</label>
                   <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-xs font-bold focus:outline-none focus:border-brand-600 transition-all shadow-sm"
                      value={privateFormData.title}
                      onChange={(e) => setPrivateFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Give your match a name..."
                      required
                   />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Time Limit (min)</label>
                      <input
                         type="number"
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-xs font-bold focus:outline-none focus:border-brand-600 transition-all shadow-sm"
                         value={privateFormData.time_limit}
                         onChange={(e) => setPrivateFormData(prev => ({ ...prev, time_limit: parseInt(e.target.value) || 30 }))}
                      />
                   </div>
                   <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Difficulty</label>
                      <select
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:border-brand-600 transition-all shadow-sm"
                         value={privateFormData.difficulty}
                         onChange={(e) => setPrivateFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                      >
                         <option value="Easy">Easy</option>
                         <option value="Medium">Medium</option>
                         <option value="Hard">Hard</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-4 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Room Visibility</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setPrivateFormData(prev => ({ ...prev, is_private: false }))}
                      className={`p-5 rounded-2xl border transition-all text-left flex items-center gap-3 ${!privateFormData.is_private ? 'bg-brand-50 border-brand-300 ring-2 ring-brand-500/10' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!privateFormData.is_private ? 'bg-brand-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                        <Users size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase">Public</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Listed in Hub</p>
                      </div>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPrivateFormData(prev => ({ ...prev, is_private: true }))}
                      className={`p-5 rounded-2xl border transition-all text-left flex items-center gap-3 ${privateFormData.is_private ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/10' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${privateFormData.is_private ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                        <Key size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase">Private</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Code required</p>
                      </div>
                    </button>
                  </div>
                </div>

                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{isCreatingCustomPrivate ? 'Design Custom Problem' : 'Assemble Match Problems'}</label>
                       <button 
                         type="button"
                         onClick={() => setIsCreatingCustomPrivate(!isCreatingCustomPrivate)}
                         className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${isCreatingCustomPrivate ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-indigo-50'}`}
                       >
                         {isCreatingCustomPrivate ? '✕ Return to Library' : '+ Design New Problem'}
                       </button>
                    </div>

                    {isCreatingCustomPrivate && (
                      <div className="p-8 rounded-[2.5rem] bg-indigo-50/50 border-2 border-dashed border-indigo-200 space-y-4 mb-6 animate-zoom-in text-left">
                        <div className="flex items-center gap-3 text-indigo-600 mb-2">
                           <Code size={18} strokeWidth={2.5} />
                           <h5 className="text-[10px] font-black uppercase tracking-widest">Problem Designer</h5>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <input
                             type="text"
                             placeholder="Problem Title..."
                             className="w-full bg-white border border-indigo-100 rounded-xl py-3 px-4 text-xs font-bold"
                             value={customPrivateProblem.title}
                             onChange={(e) => setCustomPrivateProblem(prev => ({ ...prev, title: e.target.value }))}
                           />
                           <select
                             className="w-full bg-white border border-indigo-100 rounded-xl py-3 px-4 text-xs font-bold"
                             value={customPrivateProblem.difficulty}
                             onChange={(e) => setCustomPrivateProblem(prev => ({ ...prev, difficulty: e.target.value }))}
                           >
                             <option value="Easy">Easy</option>
                             <option value="Medium">Medium</option>
                             <option value="Hard">Hard</option>
                           </select>
                        </div>
                        <textarea
                          placeholder="What's the challenge? Explain the logic/problem..."
                          rows={2}
                          className="w-full bg-white border border-indigo-100 rounded-xl py-4 px-5 text-sm font-medium"
                          value={customPrivateProblem.description}
                          onChange={(e) => setCustomPrivateProblem(prev => ({ ...prev, description: e.target.value }))}
                        />
                        <input
                           type="text"
                           placeholder="Category (e.g. Logic, Math)..."
                           className="w-full bg-white border border-indigo-100 rounded-xl py-3 px-4 text-xs font-bold"
                           value={customPrivateProblem.category}
                           onChange={(e) => setCustomPrivateProblem(prev => ({ ...prev, category: e.target.value }))}
                        />
                      </div>
                    )}

                    {!isCreatingCustomPrivate && (
                      <>
                        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
                           <button
                             type="button"
                             onClick={() => setPrivateSelectedCourse('All')}
                             className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${privateSelectedCourse === 'All' ? 'bg-surface-800 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                           >
                             All Tracks
                           </button>
                           {courses.map(course => (
                             <button
                               key={course.id}
                               type="button"
                               onClick={() => setPrivateSelectedCourse(course.id)}
                               className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${privateSelectedCourse === course.id ? 'bg-surface-800 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                             >
                               {course.title}
                             </button>
                           ))}
                        </div>

                        <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-2">
                           {loadingProblems ? (
                             <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <Loader2 size={24} className="animate-spin text-brand-600" />
                                <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Loading problems...</p>
                             </div>
                           ) : allProblems.length === 0 ? (
                             <div className="py-10 text-center space-y-2 border border-dashed border-slate-300 rounded-[2rem]">
                               <BookOpen size={30} className="mx-auto text-slate-300" />
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Problem Library Empty</p>
                             </div>
                           ) : (
                             allProblems
                               .filter(p => privateSelectedCourse === 'All' || p.course === privateSelectedCourse)
                               .map(p => {
                                 const isSelected = privateFormData.problem_ids.includes(p.id)
                                 return (
                                   <button
                                       key={p.id}
                                       type="button"
                                       onClick={() => {
                                         setPrivateFormData(prev => ({
                                           ...prev,
                                           problem_ids: isSelected 
                                             ? prev.problem_ids.filter(id => id !== p.id)
                                             : [...prev.problem_ids, p.id]
                                         }))
                                       }}
                                       className={`flex items-center justify-between p-5 rounded-2xl border transition-all text-left ${
                                         isSelected ? 'bg-brand-50 border-brand-300 shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                       }`}
                                   >
                                       <div>
                                         <p className="text-sm font-bold text-slate-900">{p.title}</p>
                                         <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{p.category || 'General'} • {p.difficulty}</p>
                                       </div>
                                       <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-brand-600 text-white' : 'bg-white border-2 border-slate-200'}`}>
                                           {isSelected && <Check size={14} strokeWidth={4} />}
                                       </div>
                                   </button>
                                 )
                               })
                           )}
                           {allProblems.filter(p => privateSelectedCourse === 'All' || p.course === privateSelectedCourse).length === 0 && (
                             <div className="py-10 text-center space-y-2 border border-dashed border-slate-300 rounded-[2rem]">
                               <BookOpen size={30} className="mx-auto text-slate-300" />
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No problems in this track.</p>
                             </div>
                           )}
                        </div>
                      </>
                    )}
                 </div>

                 <div className="pt-6 border-t border-slate-100 sticky bottom-0 bg-white">
                    <div className="flex items-center justify-between mb-4 px-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selection Summary</span>
                       <span className="flex items-center gap-2"><Target size={16} className="text-brand-600" />{privateFormData.problem_ids.length + (isCreatingCustomPrivate ? 1 : 0)} Problems</span>
                    </div>
                    <button
                       type="submit"
                       disabled={creating || !privateFormData.title.trim() || (privateFormData.problem_ids.length === 0 && !isCreatingCustomPrivate)}
                       className="w-full py-4 rounded-2xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:bg-brand-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:grayscale"
                    >
                       {creating ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={18} strokeWidth={2.5} />}
                       {creating ? 'DEPLOYING ARENA...' : privateFormData.is_private ? 'LAUNCH PRIVATE ROOM' : 'LAUNCH PUBLIC MATCH'}
                    </button>
                 </div>
             </form>
          </div>
        </div>
      )}

      {/* ── Global Challenge Modal (Admin Only) ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-fade-in" onClick={() => setShowCreateModal(false)} />

          <div className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[90vh] shadow-2xl relative z-10 overflow-hidden animate-zoom-in flex flex-col">
            <div className="p-10 pb-6 border-b border-slate-100 shrink-0">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Admin Panel</p>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Create Global Challenge</h3>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-3 rounded-2xl bg-slate-100 text-surface-500 hover:text-rose-500 transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex items-center gap-4 mt-8 overflow-x-auto pb-2 no-scrollbar">
                <button 
                  onClick={() => setSelectedCourse('All')}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${selectedCourse === 'All' ? 'bg-brand-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  All Problems
                </button>
                {courses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course.id)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${selectedCourse === course.id ? 'bg-brand-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    {course.title}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Challenge Title *</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 text-sm text-slate-900 font-bold focus:outline-none focus:border-brand-600 transition-all shadow-sm"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                    <textarea
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 text-sm text-slate-900 font-medium focus:outline-none focus:border-brand-600 transition-all shadow-sm"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Time (min)</label>
                      <input
                        type="number"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold"
                        value={formData.time_limit}
                        onChange={(e) => setFormData(prev => ({ ...prev, time_limit: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Difficulty</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold"
                        value={formData.difficulty}
                        onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Start Date</label>
                      <input
                        type="datetime-local"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-[10px] font-bold"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">End Date</label>
                      <input
                        type="datetime-local"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-[10px] font-bold"
                        value={formData.end_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Problem Library</label>
                     <button
                        type="button"
                        onClick={() => setIsCreatingCustom(!isCreatingCustom)}
                        className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${isCreatingCustom ? 'bg-brand-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}
                     >
                        {isCreatingCustom ? '✕ Back' : '+ Create New'}
                     </button>
                   </div>

                   {!isCreatingCustom ? (
                     <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                       {allProblems
                         .filter(p => selectedCourse === 'All' || p.course === selectedCourse)
                         .map(problem => (
                           <button
                             key={problem.id}
                             type="button"
                             onClick={() => toggleProblem(problem.id, true)}
                             className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${formData.problem_ids.includes(problem.id) ? 'bg-brand-50 border-brand-300 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                           >
                             <div className="flex items-center gap-4">
                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.problem_ids.includes(problem.id) ? 'bg-brand-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                 <Plus size={16} className={formData.problem_ids.includes(problem.id) ? 'rotate-45' : ''} />
                               </div>
                               <div>
                                 <p className="text-xs font-bold text-slate-900 leading-tight">{problem.title}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{problem.category} • {problem.difficulty}</p>
                               </div>
                             </div>
                             {formData.problem_ids.includes(problem.id) && (
                               <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center">
                                 <Check size={14} strokeWidth={4} />
                               </div>
                             )}
                           </button>
                         ))}
                     </div>
                   ) : (
                     <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 animate-zoom-in">
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                           <input
                             type="text"
                             className="w-full bg-white border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold"
                             value={customProblem.title}
                             onChange={(e) => setCustomProblem(prev => ({ ...prev, title: e.target.value }))}
                           />
                         </div>
                         <div className="space-y-1">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Difficulty</label>
                           <select
                             className="w-full bg-white border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold"
                             value={customProblem.difficulty}
                             onChange={(e) => setCustomProblem(prev => ({ ...prev, difficulty: e.target.value }))}
                           >
                             <option value="Easy">Easy</option>
                             <option value="Medium">Medium</option>
                             <option value="Hard">Hard</option>
                           </select>
                         </div>
                       </div>
                       <div className="space-y-1">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                         <textarea
                           className="w-full bg-white border border-slate-100 rounded-xl py-3 px-4 text-xs font-medium"
                           rows={2}
                           value={customProblem.description}
                           onChange={(e) => setCustomProblem(prev => ({ ...prev, description: e.target.value }))}
                         />
                       </div>
                     </div>
                   )}
                </div>
              </div>
            </form>

            <div className="p-10 pt-6 border-t border-slate-100 flex gap-4 shrink-0 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-4 rounded-2xl bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-[2] py-4 rounded-2xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                {creating ? <Loader2 size={16} className="animate-spin" /> : <Swords size={16} strokeWidth={3} />}
                {creating ? 'DEPLOYING CHALLENGE...' : 'LAUNCH GLOBAL CHALLENGE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}

function ChallengeCard({ challenge, isAdmin, handleDelete, handleJoinAndNavigate, joiningChallengeId, getDifficultyColor, getStatusColor }) {
  const isOfficial = challenge.created_by?.role === 'admin'

  return (
    <div className="group p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] bg-white border border-surface-700 hover:border-brand-500/40 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-brand-500/10 relative overflow-hidden flex flex-col h-full active:scale-[0.98]">
       {/* High-end marker */}
       <div className={`absolute top-0 left-0 w-1.5 h-full ${isOfficial ? 'bg-gradient-to-b from-brand-600 to-indigo-600' : 'bg-gradient-to-b from-indigo-500 to-sky-500'} opacity-0 group-hover:opacity-100 transition-all duration-500`} />

       <div className="flex items-start justify-between mb-8">
          <div className="space-y-3 flex-1">
             <div className="flex items-center gap-2 flex-wrap">
               <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border shadow-sm transition-colors ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty}
               </span>
               <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border transition-colors ${getStatusColor(challenge.status)}`}>
                  {challenge.status}
               </span>
               {!isOfficial && (
                 <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg">
                    Community
                 </span>
               )}
             </div>
             <h4 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight pt-1 transition-colors group-hover:text-brand-600">
                {challenge.title}
             </h4>
             <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                   <Users size={10} className="text-slate-400" />
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic group-hover:text-slate-600 transition-colors">
                   Operated by <span className="text-brand-600">@{challenge.created_by?.name || 'system'}</span>
                </p>
             </div>
          </div>
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl border border-surface-700 flex items-center justify-center transition-all duration-500 shadow-inner shrink-0 ${isOfficial ? 'bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
             {isOfficial ? <Zap size={28} fill="currentColor" className="group-hover:scale-110 transition-transform" /> : <Swords size={28} className="group-hover:scale-110 transition-transform" />}
          </div>
       </div>

       {challenge.description && (
         <p className="text-xs text-slate-500 font-medium mb-8 line-clamp-2 leading-relaxed">
           {challenge.description}
         </p>
       )}

       <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="p-4 rounded-3xl bg-slate-50/50 border border-surface-700 flex flex-col items-center gap-2 shadow-inner group/stat hover:bg-white transition-all">
             <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm text-emerald-600 group-hover/stat:bg-emerald-600 group-hover/stat:text-white transition-all">
                <Users size={14} strokeWidth={3} />
             </div>
             <div className="text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Squad</p>
                <p className="text-base sm:text-lg font-black text-slate-900 tabular-nums">
                   {challenge.participant_count?.[0]?.count || 0}
                </p>
             </div>
          </div>
          <div className="p-4 rounded-3xl bg-slate-50/50 border border-surface-700 flex flex-col items-center gap-2 shadow-inner group/stat hover:bg-white transition-all">
             <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm text-brand-600 group-hover/stat:bg-brand-600 group-hover/stat:text-white transition-all">
                <Clock size={14} strokeWidth={3} />
             </div>
             <div className="text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Window</p>
                <p className="text-base sm:text-lg font-black text-slate-900 tabular-nums">
                   {challenge.time_limit || 0}<span className="text-[10px] ml-0.5">m</span>
                </p>
             </div>
          </div>
          <div className="p-4 rounded-3xl bg-slate-50/50 border border-surface-700 flex flex-col items-center gap-2 shadow-inner group/stat hover:bg-white transition-all">
             <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm text-indigo-600 group-hover/stat:bg-indigo-600 group-hover/stat:text-white transition-all">
                <Target size={14} strokeWidth={3} />
             </div>
             <div className="text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Nodes</p>
                <p className="text-base sm:text-lg font-black text-slate-900 tabular-nums">
                   {challenge.problem_ids?.length || 0}
                </p>
             </div>
          </div>
       </div>

       <div className="mt-auto flex gap-3">
         <button
           onClick={() => handleJoinAndNavigate(challenge.id)}
           disabled={joiningChallengeId === challenge.id}
           className="flex-1 flex items-center justify-between px-6 py-5 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-50 group/btn overflow-hidden relative"
         >
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
           <span className="flex items-center gap-3 relative z-10">
             {joiningChallengeId === challenge.id ? <Loader2 size={16} className="animate-spin text-brand-500" /> : (isOfficial ? <PlayCircle size={18} strokeWidth={2.5} /> : <Zap size={18} strokeWidth={2.5} />)}
             {joiningChallengeId === challenge.id ? 'Establishing...' : 'Initialize Match'}
           </span>
           <ArrowRight size={16} strokeWidth={4} className="group-hover:translate-x-2 transition-transform relative z-10" />
         </button>
         {(isAdmin || challenge.isOwner) && (
           <button
             onClick={() => handleDelete(challenge.id)}
             className="p-5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-[0.85] shadow-sm flex items-center justify-center shrink-0"
           >
             <Trash2 size={18} />
           </button>
         )}
       </div>
    </div>
  )
}
