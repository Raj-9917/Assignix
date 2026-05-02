import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Swords, Clock, Trophy, ChevronLeft, Users, Zap, Target, PlayCircle, Loader2, Crown, Medal, Award, RefreshCw, UserPlus, CheckCircle2, AlertCircle, ArrowUpRight, Share2, Copy, Check } from 'lucide-react'
import PageShell from '../../components/ui/PageShell'
import { useAuth } from '../../context/AuthContext'
import { challengeService } from '../../services/challengeService'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../config/supabaseClient'

export default function Room() {
  const { id } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const [challenge, setChallenge] = useState(null)
  const [leaderboard, setLeaderboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [challengeData, leaderboardData] = await Promise.all([
        challengeService.getChallengeById(id),
        challengeService.getLeaderboard(id)
      ])
      setChallenge(challengeData)
      setLeaderboard(leaderboardData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchData()

      const channel = supabase.channel(`room_${id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'challenge_participants',
          filter: `challenge_id=eq.${id}`
        }, () => {
          fetchData()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [id, fetchData])

  useEffect(() => {
    if (!challenge || challenge.status !== 'active') return

    const calculateTime = () => {
      const start = new Date(challenge.created_at || challenge.start_date).getTime()
      const limit = (challenge.time_limit || 30) * 60 * 1000
      const now = new Date().getTime()
      const diff = (start + limit) - now

      if (diff <= 0) {
        setTimeLeft(0)
        return
      }
      setTimeLeft(Math.floor(diff / 1000))
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [challenge])

  const formatCountdown = (totalSeconds) => {
    if (totalSeconds === null) return 'Calculating...'
    if (totalSeconds <= 0) return 'MATCH CLOSED'
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const leaderboardData = await challengeService.getLeaderboard(id)
      setLeaderboard(leaderboardData)
    } catch (err) {
      console.error('Refresh failed:', err)
    } finally {
      setRefreshing(false)
    }
  }

  const handleJoin = async () => {
    try {
      setJoining(true)
      await challengeService.joinChallenge(id)
      await fetchData()
      toast.success('Success! You have joined the challenge.')
    } catch (err) {
      toast.error(err.message || 'Failed to join challenge')
    } finally {
      setJoining(false)
    }
  }

  const copyToClipboard = () => {
    if (!challenge?.room_code) return
    navigator.clipboard.writeText(challenge.room_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hasJoined = challenge?.participants?.some(
    p => (p.users?.id || p.user_id) === user?.id
  )

  const myParticipant = challenge?.participants?.find(
    p => (p.users?.id || p.user_id) === user?.id
  )

  const getDifficultyColor = (d) => {
    if (d === 'Easy') return 'text-emerald-700 border-emerald-200 bg-emerald-50'
    if (d === 'Medium') return 'text-amber-700 border-amber-200 bg-amber-50'
    return 'text-rose-700 border-rose-200 bg-rose-50'
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={20} className="text-amber-500" strokeWidth={2.5} />
    if (rank === 2) return <Medal size={20} className="text-slate-400" strokeWidth={2.5} />
    if (rank === 3) return <Award size={20} className="text-amber-700" strokeWidth={2.5} />
    return <span className="text-sm font-black text-surface-500 w-5 text-center">{rank}</span>
  }

  const formatTime = (seconds) => {
    if (!seconds) return '—'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  if (loading) {
    return (
      <PageShell title="Loading..." icon={Swords}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={48} className="animate-spin text-brand-600" />
          <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Loading challenge...</p>
        </div>
      </PageShell>
    )
  }

  if (error || !challenge) {
    return (
      <PageShell title="Error" icon={Swords}>
        <div className="py-20 text-center space-y-4">
          <AlertCircle size={48} className="mx-auto text-rose-500" />
          <p className="text-sm text-rose-500 font-bold">{error || 'Challenge not found.'}</p>
          <Link to="/challenge" className="inline-block text-brand-600 text-xs font-bold uppercase tracking-widest hover:underline">← Back to Challenges</Link>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={challenge.title}
      subtitle={challenge.is_private ? `Private Match created by ${challenge.created_by?.name}` : `Global Challenge by ${challenge.created_by?.name || 'Admin'}`}
      icon={Swords}
      breadcrumbs={[
        { label: 'Challenge Hub', path: '/challenge' },
        { label: challenge.title }
      ]}
    >
      <div className="space-y-10 pb-20">
        {/* Breadcrumb */}
        <Link to="/challenge" className="flex items-center gap-2 text-surface-500 hover:text-brand-400 transition-colors group w-fit">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest leading-none">Challenge Hub</span>
        </Link>

        {/* Private Room Invite Header (if private) */}
        {challenge.is_private && (
          <div className="flex flex-col md:flex-row items-center justify-between p-8 rounded-[2.5rem] bg-brand-600 shadow-xl shadow-brand-500/10 gap-6">
             <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
                   <Share2 size={28} />
                </div>
                <div className="text-white">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Invite your friends</p>
                   <h4 className="text-xl font-black uppercase tracking-tight">Private Room Active</h4>
                </div>
             </div>
             <div className="flex items-center gap-4 bg-white/10 p-2 rounded-2xl border border-white/20">
                <div className="px-6 py-2.5">
                    <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Room Code</p>
                   <p className="text-lg font-black text-white tracking-[0.3em]">{challenge.room_code}</p>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="p-4 rounded-xl bg-white text-brand-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                   {copied ? <Check size={18} strokeWidth={3} /> : <Copy size={18} strokeWidth={3} />}
                   <span className="text-[10px] font-black uppercase tracking-widest">{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
             </div>
          </div>
        )}

        {/* Challenge Info Header */}
        <div className="p-6 sm:p-10 rounded-[2rem] sm:rounded-[3.5rem] bg-white border border-surface-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-1000 rotate-12">
            <Trophy size={180} className="text-brand-600" strokeWidth={2} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start gap-10">
            <div className="w-24 h-24 rounded-[2rem] bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-xl shadow-brand-500/10 shrink-0">
              <Swords size={48} strokeWidth={2} />
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-4 flex-wrap">
                  {challenge.is_private && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-brand-200 bg-brand-50 text-brand-600 flex items-center gap-2">
                       <Zap size={12} fill="currentColor" /> Private Match
                    </span>
                  )}
                  <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                    challenge.status === 'active' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-surface-500 bg-surface-100 border-surface-300'
                  }`}>
                    <span className="inline-block w-2 h-2 rounded-full bg-current mr-2 animate-pulse" />
                    {challenge.status}
                  </span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-surface-300 uppercase tracking-tight">{challenge.title}</h2>
                {challenge.description && (
                  <p className="text-sm text-surface-500 font-medium max-w-2xl">{challenge.description}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-[10px] font-black text-surface-500 uppercase tracking-widest">
                <span className="flex items-center gap-2"><Users size={16} className="text-brand-600" />{challenge.participants?.length || 0} Participants</span>
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 rounded-xl border border-surface-700">
                  <Clock size={16} className={timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-brand-600'} />
                  <span className={timeLeft < 300 ? 'text-rose-500 font-black' : 'text-slate-200'}>
                    {formatCountdown(timeLeft)}
                  </span>
                </div>
                <span className="flex items-center gap-2"><Target size={16} className="text-brand-600" />{challenge.problem_ids?.length || 0} {challenge.problem_ids?.length === 1 ? 'Problem' : 'Problems'}</span>
              </div>

              {/* Join / Status */}
              <div className="flex items-center gap-4 pt-2">
                {hasJoined ? (
                  <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle2 size={18} strokeWidth={3} /> You're In! Score: {myParticipant?.score || 0} pts
                  </div>
                ) : (
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:bg-brand-500 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {joining ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={18} strokeWidth={2.5} />}
                    {joining ? 'Joining...' : 'Join Room'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-black text-surface-400 uppercase tracking-widest flex items-center gap-3">
              <Target size={18} className="text-brand-500" /> Challenge Problems
            </h3>
            <div className="space-y-4">
               {(challenge.problems_details || []).map((problem, idx) => (
                <Link
                  key={problem.id}
                  to={`/prepare/${problem.id}?arenaId=${challenge.id}`}
                  className="flex items-center gap-5 p-6 rounded-[2rem] bg-white border border-surface-700 hover:border-brand-500/30 transition-all group shadow-sm hover:shadow-xl hover:shadow-brand-500/5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center text-surface-400 font-black text-lg group-hover:bg-brand-600 group-hover:text-white group-hover:border-transparent transition-all duration-500">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-surface-300 uppercase tracking-tight group-hover:text-brand-500 transition-colors">{problem.title}</p>
                    <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">{problem.category}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                  <ArrowUpRight size={18} className="text-surface-600 group-hover:text-brand-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-surface-400 uppercase tracking-widest flex items-center gap-3">
                <Trophy size={18} className="text-amber-500" /> Live Leaderboard
              </h3>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-900 border border-surface-800 text-surface-500 text-[10px] font-black uppercase tracking-widest hover:text-brand-400 hover:border-brand-500/30 transition-all disabled:opacity-50"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            <div className="rounded-[2rem] sm:rounded-[3rem] bg-white border border-surface-700 overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-8 py-4 sm:py-5 bg-slate-50 border-b border-surface-700">
                <span className="col-span-1 text-[9px] font-black text-surface-500 uppercase tracking-widest">#</span>
                <span className="col-span-4 sm:col-span-4 text-[9px] font-black text-surface-500 uppercase tracking-widest">Player</span>
                <span className="col-span-3 sm:col-span-2 text-[9px] font-black text-surface-500 uppercase tracking-widest text-center">Score</span>
                <span className="col-span-2 text-[9px] font-black text-surface-500 uppercase tracking-widest text-center hidden sm:block">Solved</span>
                <span className="col-span-4 sm:col-span-3 text-[9px] font-black text-surface-500 uppercase tracking-widest text-right">Time</span>
              </div>

              {leaderboard?.leaderboard?.length > 0 ? (
                <div className="divide-y divide-surface-700/50">
                  {leaderboard.leaderboard.map((entry) => {
                    const isMe = entry.user?.id === user?.id
                    return (
                      <div
                        key={entry.user?.id || entry.rank}
                        className={`grid grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-8 py-4 sm:py-5 items-center transition-colors ${
                          isMe ? 'bg-brand-50/50' : 'hover:bg-slate-50'
                        } ${entry.rank <= 3 ? 'font-bold' : ''}`}
                      >
                        <div className="col-span-1 flex items-center">
                          {getRankIcon(entry.rank)}
                        </div>
                        <div className="col-span-4 sm:col-span-4 flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm font-black border shadow-sm ${
                            entry.rank === 1 ? 'bg-amber-500 text-white border-amber-400 shadow-amber-500/20' :
                            entry.rank === 2 ? 'bg-slate-300 text-white border-slate-300' :
                            entry.rank === 3 ? 'bg-amber-700 text-white border-amber-600' :
                            'bg-surface-800 text-surface-400 border-surface-700'
                          }`}>
                            {entry.user?.name?.charAt(0) || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs sm:text-sm font-black uppercase tracking-tight truncate ${isMe ? 'text-brand-600' : 'text-surface-300'}`}>
                              {entry.user?.name || 'Unknown'} {isMe && <span className="text-[8px] text-brand-500 normal-case">(You)</span>}
                            </p>
                            <p className="text-[9px] font-bold text-surface-500 lowercase truncate hidden sm:block">@{entry.user?.username || '—'}</p>
                          </div>
                        </div>
                        <div className="col-span-3 sm:col-span-2 text-center">
                          <span className={`text-base sm:text-lg font-black ${entry.rank <= 3 ? 'text-brand-600' : 'text-surface-300'}`}>
                            {entry.score}
                          </span>
                          <p className="text-[8px] font-black text-surface-500 uppercase tracking-widest">pts</p>
                        </div>
                        <div className="col-span-2 text-center hidden sm:block">
                          <span className="text-sm font-black text-surface-400">
                            {entry.solved_count}/{leaderboard.totalProblems}
                          </span>
                        </div>
                        <div className="col-span-4 sm:col-span-3 text-right">
                          <span className="text-sm font-bold text-surface-500 tabular-nums">
                            {formatTime(entry.total_time)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-16 text-center space-y-3">
                  <Trophy size={40} className="mx-auto text-surface-700" strokeWidth={1} />
                  <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest italic">No participants yet. Share the code to invite friends!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
