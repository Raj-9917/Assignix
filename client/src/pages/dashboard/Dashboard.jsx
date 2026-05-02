import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Users, BookOpen, CheckCircle, Clock, Award, Zap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import PageShell from '../../components/ui/PageShell'
import StatCard from '../../components/dashboard/StatCard'
import ActivityFeed from '../../components/dashboard/ActivityFeed'
import ProgressCard from '../../components/dashboard/ProgressCard'
import { ActivityFeedSkeleton, ProgressCardSkeleton } from '../../components/dashboard/DashboardSkeletons'
import { submissionService } from '../../services/submissionService'

export default function Dashboard() {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const isTeacher = user?.role === 'teacher'

  useEffect(() => {
    if (!user?.id) return

    const fetchSubmissions = async () => {
      try {
        const submissions = await submissionService.getUserSubmissions();
        const activityList = submissions.slice(0, 5).map(sub => ({
          title: `${sub.status === 'Accepted' ? 'Solved' : 'Attempted'} ${sub.problems?.title || 'a problem'}`,
          role: user.username,
          time: sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'Just now',
          type: sub.status === 'Accepted' ? 'submission' : 'system'
        }))
        setActivities(activityList)
      } catch (_err) {
        console.error('Failed to fetch dashboard activity:', _err);
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [user])

  const studentStats = [
    { title: 'Problems Solved', value: user?.problems_solved || '0', icon: CheckCircle, trend: 'up', trendValue: 'Ready', color: 'emerald' },
    { title: 'Experience Points', value: user?.xp || '0', icon: Award, trend: 'up', trendValue: 'Active', color: 'amber' },
    { title: 'Current Streak', value: `${user?.streak || 0} Days`, icon: Zap, trend: 'up', trendValue: '🔥', color: 'brand' },
  ]

  // For teachers, we'll need to subscribe to classroom stats later
  const teacherStats = [
    { title: 'Total Students', value: '...', icon: Users, trend: 'neutral', trendValue: '0', color: 'brand' },
    { title: 'Active Classrooms', value: '...', icon: BookOpen, trend: 'up', trendValue: '+0', color: 'emerald' },
    { title: 'New Submissions', value: '...', icon: Clock, trend: 'neutral', trendValue: '0', color: 'amber' },
  ]

  const activeStats = isTeacher ? teacherStats : studentStats

  return (
    <PageShell
      title={`${isTeacher ? 'Teacher' : 'Student'} Dashboard`}
      subtitle={`Welcome back, ${user?.name || user?.username || 'Learner'}. Your real-time performance command center.`}
      icon={LayoutDashboard}
    >
      <div className="space-y-6 sm:space-y-10 animate-entry pb-12 sm:pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading ? (
             Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-40 bg-surface-800/50 rounded-[2rem] animate-pulse" />
             ))
          ) : (
            activeStats.map((stat, idx) => (
              <StatCard key={idx} {...stat} />
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          <div className="lg:col-span-2 space-y-6 sm:space-y-10">
            {loading ? (
              <ProgressCardSkeleton />
            ) : (
              <ProgressCard
                title={isTeacher ? "Platform Overview" : "Your Mastery Progress"}
                percentage={isTeacher ? 0 : Math.min((user?.xp || 0) / 10, 100)} 
                stats={isTeacher ? [
                  { label: 'Avg Attendance', value: '100%' },
                  { label: 'Pass Rate', value: '98%' },
                  { label: 'Total Classrooms', value: '...' },
                  { label: 'System Guard', value: 'Shielded' },
                ] : [
                  { label: 'Total XP', value: user?.xp || '0' },
                  { label: 'Current Streak', value: `${user?.streak || 0} Days` },
                  { label: 'Rank', value: (user?.xp || 0) > 500 ? 'Pro' : 'Novice' },
                  { label: 'Status', value: 'Online' },
                ]}
              />
            )}
            
            <div className="rounded-[2.5rem] p-10 border border-slate-200 bg-white relative overflow-hidden group shadow-sm hover:shadow-2xl hover:shadow-brand-500/5 transition-all duration-500">
              <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-brand-500/10 transition-all duration-700" />
              <div className="relative z-10 space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-brand-600 uppercase tracking-[0.4em]">{isTeacher ? "Operations" : "Core Mission"}</h3>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight max-w-lg leading-tight">
                      {isTeacher ? "Initialize A Professional Space" : "Continue Your Engineering Grind"}
                    </p>
                 </div>
                 <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-md">
                   {isTeacher 
                     ? "Launch professional classrooms to coordinate assignments, monitor student velocity, and curate high-impact coding curriculum."
                     : "New algorithms and system design challenges are available in the repository. Keep solving to maintain your rank on the secure leaderboard."}
                 </p>
                 <Link to={isTeacher ? "/classrooms" : "/prepare"} className="inline-flex items-center px-10 py-5 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-brand-600 hover:shadow-2xl hover:shadow-brand-500/20 active:scale-95 transition-all duration-500 group/btn">
                   {isTeacher ? "Manage Classrooms" : "Access Repository"}
                   <Zap size={14} className="ml-3 group-hover/btn:scale-125 group-hover/btn:rotate-12 transition-all" />
                 </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {loading ? (
              <ActivityFeedSkeleton />
            ) : (
              <ActivityFeed activities={activities} />
            )}
          </div>
        </div>
      </div>
    </PageShell>
  )
}

