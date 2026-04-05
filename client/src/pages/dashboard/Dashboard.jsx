import { LayoutDashboard, Users, BookOpen, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import PageShell from '../../components/ui/PageShell'
import StatCard from '../../components/dashboard/StatCard'
import ActivityFeed from '../../components/dashboard/ActivityFeed'
import ProgressCard from '../../components/dashboard/ProgressCard'

export default function Dashboard() {
  const { user } = useAuth()
  const isTeacher = user?.role === 'teacher'

  const studentStats = [
    { title: 'Problems Solved', value: '42', icon: CheckCircle, trend: 'up', trendValue: '+5 this week', color: 'emerald' },
    { title: 'Pending Assignments', value: '3', icon: Clock, trend: 'down', trendValue: '-2 from yesterday', color: 'amber' },
    { title: 'Accuracy Rate', value: '88%', icon: LayoutDashboard, trend: 'up', trendValue: '+2%', color: 'brand' },
  ]

  const teacherStats = [
    { title: 'Total Students', value: '128', icon: Users, trend: 'up', trendValue: '+12 this month', color: 'brand' },
    { title: 'Assignments Created', value: '15', icon: BookOpen, trend: 'up', trendValue: '+3 this week', color: 'emerald' },
    { title: 'New Submissions', value: '45', icon: Clock, trend: 'up', trendValue: '20 pending', color: 'amber' },
  ]

  const studentActivity = [
    { title: 'Solved "Two Sum" in 5 mins', time: '2 hours ago', type: 'problem', role: 'Student' },
    { title: 'Submitted "React Hooks" assignment', time: '5 hours ago', type: 'submission', role: 'Assignment' },
    { title: 'Course "Data Structures" 80% complete', time: '1 day ago', type: 'system', role: 'Progress' },
    { title: 'Joined "Advanced JavaScript" classroom', time: '2 days ago', type: 'system', role: 'Classroom' },
  ]

  const teacherActivity = [
    { title: '20 new submissions for "Python Basics"', time: '1 hour ago', type: 'submission', role: 'Grading' },
    { title: 'New student joined "Advanced JS"', time: '3 hours ago', type: 'system', role: 'Classroom' },
    { title: 'Published "Algorithm Analysis" assignment', time: '1 day ago', type: 'problem', role: 'Assignment' },
    { title: 'Average grade for "React Fundamentals" is B+', time: '2 days ago', type: 'system', role: 'Report' },
  ]

  const activeStats = isTeacher ? teacherStats : studentStats
  const activeActivity = isTeacher ? teacherActivity : studentActivity

  return (
    <PageShell
      title={`${isTeacher ? 'Teacher' : 'Student'} Dashboard`}
      subtitle={`Welcome back, ${user?.email?.split('@')[0]}. Here is your current performance overview.`}
      icon={LayoutDashboard}
    >
      <div className="space-y-10 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeStats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content (Left/Center) */}
          <div className="lg:col-span-2 space-y-10">
            <ProgressCard
              title={isTeacher ? "Classroom Performance" : "Your Mastery Progress"}
              percentage={isTeacher ? 78 : 65}
              stats={isTeacher ? [
                { label: 'Avg Attendance', value: '92%' },
                { label: 'Pass Rate', value: '85%' },
                { label: 'Submissions', value: '450+' },
                { label: 'Avg Grade', value: 'B+' },
              ] : [
                { label: 'Total XP', value: '12,450' },
                { label: 'Current Streak', value: '7 Days' },
                { label: 'Rank', value: 'Gold III' },
                { label: 'Badges', value: '12' },
              ]}
            />
            
            {/* Quick Actions / Featured Card */}
            <div className="rounded-[2.5rem] p-10 border border-surface-700 bg-white relative overflow-hidden group shadow-sm transition-all hover:shadow-xl hover:shadow-brand-500/5">
              <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-brand-500/5 blur-[100px] pointer-events-none group-hover:bg-brand-500/10 transition-all duration-700" />
              <div className="relative z-10 space-y-6">
                 <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-brand-600 uppercase tracking-[0.3em]">{isTeacher ? "Pending Grading" : "Current Goal"}</h3>
                    <p className="text-2xl font-black text-surface-300 uppercase tracking-tight max-w-md">
                      {isTeacher ? "Grade 'Python Basics' Submissions" : "Solve 'Valid Parentheses'"}
                    </p>
                 </div>
                 <p className="text-surface-500 text-xs font-bold leading-relaxed max-w-sm uppercase tracking-widest">
                   {isTeacher 
                     ? "You have 20 new submissions that need to be graded and reviewed."
                     : "Solve this problem to keep your 7-day streak alive and earn 500 XP."}
                 </p>
                 <button className="px-10 py-4 rounded-2xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-500 hover:shadow-xl hover:shadow-brand-500/20 active:scale-95 transition-all duration-300 shadow-md">
                   {isTeacher ? "Start Grading" : "Start Problem"}
                 </button>
              </div>
            </div>
          </div>

          {/* Sidebar (Activity Feed) */}
          <div className="lg:col-span-1">
            <ActivityFeed activities={activeActivity} />
          </div>
        </div>
      </div>
    </PageShell>
  )
}
