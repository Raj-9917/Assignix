import { useState, useEffect } from 'react'
import { 
  Users, ShieldCheck, Trophy, Search, UserMinus, UserPlus, Cpu, Zap, Activity, Globe, Layout, Shield, Mail, 
  ArrowUpRight, ArrowDownRight, MoreVertical, Plus, BookOpen, Code, Edit2, Trash2, Check, X, Filter
} from 'lucide-react'
import PageShell from '../../components/ui/PageShell'
import { useAuth } from '../../context/AuthContext'
import CourseEditor from '../../components/admin/CourseEditor'
import ProblemEditor from '../../components/admin/ProblemEditor'
import API_URL from '../../config/api'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Community') // Community, Courses, Problems
  
  // Stats state
  const [stats, setStats] = useState([
    { label: 'Total Users', val: '0', growth: '...', icon: Users, color: 'text-brand-600', trend: 'up' },
    { label: 'Active Teachers', val: '0', growth: '...', icon: ShieldCheck, color: 'text-emerald-600', trend: 'up' },
    { label: 'Platform XP', val: '0', growth: '...', icon: Trophy, color: 'text-amber-600', trend: 'up' },
    { label: 'System Uptime', val: '99.9%', growth: 'Stable', icon: Activity, color: 'text-indigo-600', trend: 'up' }
  ])

  // Data states
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Editor states
  const [showCourseEditor, setShowCourseEditor] = useState(false)
  const [showProblemEditor, setShowProblemEditor] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [editingProblem, setEditingProblem] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('assignix_token');
      const [uRes, cRes, pRes] = await Promise.all([
        fetch(`${API_URL}/auth/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/courses`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/problems`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setUsers(uData);
        // Stats
        const teachers = uData.filter(u => u.role === 'teacher').length;
        const totalXp = uData.reduce((acc, u) => acc + (u.xp || 0), 0);
        setStats(prev => [
          { ...prev[0], val: uData.length.toString() },
          { ...prev[1], val: teachers.toString() },
          { ...prev[2], val: (totalXp / 1000).toFixed(1) + 'K' },
          prev[3]
        ]);
      }
      if (cRes.ok) setCourses(await cRes.json());
      if (pRes.ok) setProblems(await pRes.json());
    } catch (error) {
      console.error('Fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData() }, []);

  // Handler: Courses
  const handleSaveCourse = async (courseData) => {
    const url = `${API_URL}/courses` + (editingCourse ? `/${courseData.id}` : '');
    const method = editingCourse ? 'PUT' : 'POST';
    const token = localStorage.getItem('assignix_token');

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(courseData)
      });
      if (res.ok) {
        fetchData();
        setShowCourseEditor(false);
        setEditingCourse(null);
      }
    } catch (err) { console.error('Course save failed:', err); }
  }

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course and all associated metadata?')) return;
    const token = localStorage.getItem('assignix_token');
    try {
      await fetch(`http://localhost:5000/api/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) { console.error('Course delete failed:', err); }
  }

  // Handler: Problems
  const handleSaveProblem = async (problemData) => {
    const url = `${API_URL}/problems` + (editingProblem ? `/${problemData.id}` : '');
    const method = editingProblem ? 'PUT' : 'POST';
    const token = localStorage.getItem('assignix_token');

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(problemData)
      });
      if (res.ok) {
        fetchData();
        setShowProblemEditor(false);
        setEditingProblem(null);
      }
    } catch (err) { console.error('Problem save failed:', err); }
  }

  const handleDeleteProblem = async (id) => {
    if (!window.confirm('Erase this coding challenge from the platform?')) return;
    const token = localStorage.getItem('assignix_token');
    try {
      await fetch(`http://localhost:5000/api/problems/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) { console.error('Problem delete failed:', err); }
  }

  return (
    <PageShell
      title="Admin Control Panel"
      subtitle="Full administrative oversight and content design workshop."
      icon={Shield}
    >
      <div className="space-y-12 pb-20 animate-fade-in">
        {/* Command Center Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="p-8 rounded-[2.5rem] bg-surface-900 border border-surface-700 shadow-sm flex flex-col gap-6 group hover:border-brand-500/30 transition-all">
              <div className="flex items-center justify-between">
                <div className={`w-14 h-14 rounded-2xl bg-surface-800 ${stat.color} flex items-center justify-center border border-surface-700 shadow-inner group-hover:scale-110 transition-transform`}>
                  <stat.icon size={26} strokeWidth={2.5} />
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  stat.trend === 'up' ? 'bg-emerald-50/10 text-emerald-500' : 'bg-red-50/10 text-red-500'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {stat.growth}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest leading-none">{stat.label}</p>
                <h3 className="text-3xl font-black text-surface-300 tracking-tight leading-none pt-2 uppercase">{stat.val}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-12 border-b border-surface-700 px-2 overflow-x-auto scrollbar-none">
           {['Community', 'Courses', 'Problems'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`text-[11px] font-black uppercase tracking-[0.2em] py-6 border-b-2 transition-all relative ${
                 activeTab === tab ? 'border-brand-600 text-brand-600' : 'border-transparent text-surface-500 hover:text-surface-300'
               }`}
             >
               {activeTab === tab && <div className="absolute inset-0 bg-brand-500/5 blur-xl -z-10 rounded-full" />}
               {tab}
             </button>
           ))}
        </div>

        {/* Content Modules */}
        <div className="animate-fade-in">
           {/* ── Community Module ────────────────────── */}
           {activeTab === 'Community' && (
             <div className="space-y-8">
               <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-600/10 text-brand-600 flex items-center justify-center border border-brand-500/20">
                       <Globe size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                       <h4 className="text-xl font-black text-surface-300 uppercase tracking-tight tracking-widest">Community Hub</h4>
                       <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest opacity-60 italic">Manage regional system access.</p>
                    </div>
                 </div>
                 <div className="relative group w-full md:w-96">
                   <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 group-focus-within:text-brand-600 transition-colors" size={20} />
                   <input
                     type="text"
                     placeholder="ID search..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-14 pr-6 py-4 rounded-2xl bg-surface-900 border border-surface-700 text-surface-300 text-sm font-bold placeholder:text-surface-600 focus:outline-none focus:border-brand-600 transition-all shadow-sm"
                   />
                 </div>
               </div>

               <div className="rounded-[3rem] bg-surface-900 border border-surface-700 overflow-hidden shadow-sm">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="bg-surface-800 border-b border-surface-700">
                         <th className="px-8 py-6 text-[10px] font-black text-surface-500 uppercase tracking-widest">Identity</th>
                         <th className="px-8 py-6 text-[10px] font-black text-surface-500 uppercase tracking-widest">Role</th>
                         <th className="px-8 py-6 text-[10px] font-black text-surface-500 uppercase tracking-widest text-right">Ops</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-surface-700">
                       {users.map((u) => (
                         <tr key={u.id} className="group hover:bg-surface-800 transition-colors">
                           <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg ${
                                 u.role === 'admin' ? 'bg-brand-600 shadow-lg shadow-brand-500/20' : u.role === 'teacher' ? 'bg-emerald-600 shadow-lg shadow-emerald-500/20' : 'bg-surface-700'
                               }`}>
                                 {u.name.charAt(0)}
                               </div>
                               <div>
                                 <p className="text-sm font-black text-surface-300 uppercase tracking-tight">{u.name}</p>
                                 <p className="text-[10px] font-black text-surface-500 lowercase tracking-tight opacity-40">@{u.username}</p>
                               </div>
                             </div>
                           </td>
                           <td className="px-8 py-6">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                               u.role === 'admin' ? 'bg-brand-50/10 text-brand-600 border-brand-200' :
                               u.role === 'teacher' ? 'bg-emerald-50/10 text-emerald-600 border-emerald-100' :
                               'text-surface-500 border-surface-700'
                             }`}>
                               {u.role}
                             </span>
                           </td>
                           <td className="px-8 py-6 text-right">
                             <button className="p-3 rounded-xl bg-surface-800 border border-surface-700 text-surface-500 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                               <UserMinus size={16} strokeWidth={3} />
                             </button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
             </div>
           )}

           {/* ── Courses Module ─────────────────────── */}
           {activeTab === 'Courses' && (
             <div className="space-y-8">
               <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-600/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                       <BookOpen size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                       <h4 className="text-xl font-black text-surface-300 uppercase tracking-tight tracking-widest">Course Management</h4>
                       <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest opacity-60 italic">Architect learning paths.</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => { setEditingCourse(null); setShowCourseEditor(true); }}
                  className="px-8 py-4 rounded-2xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
                   <Plus size={18} strokeWidth={3} /> Launch Track
                 </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courses.map(course => (
                    <div key={course.id} className="group p-8 rounded-[3rem] bg-surface-900 border border-surface-700 shadow-sm hover:border-brand-500/30 transition-all flex flex-col gap-6 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:scale-110 transition-transform">
                          <BookOpen size={100} strokeWidth={1} style={{ color: course.color }} />
                       </div>
                       <div className="flex items-center justify-between relative z-10">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg`} style={{ backgroundColor: course.color }}>
                             {course.title.charAt(0)}
                          </div>
                           <div className="flex gap-2 relative z-20">
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation();
                                  setEditingProblem({ course: course.id }); 
                                  setShowProblemEditor(true); 
                                }} 
                                title="Draft Challenge for this Track"
                                className="p-3 rounded-xl bg-brand-600/10 text-brand-600 hover:bg-brand-600 hover:text-white transition-all"
                              >
                                <Plus size={16} strokeWidth={3} />
                              </button>
                              <button onClick={() => { setEditingCourse(course); setShowCourseEditor(true); }} className="p-3 rounded-xl bg-surface-800 text-surface-500 hover:text-brand-600 transition-all"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeleteCourse(course.id)} className="p-3 rounded-xl bg-surface-800 text-surface-500 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                           </div>
                       </div>
                       <div className="relative z-10">
                          <h5 className="text-lg font-black text-surface-300 uppercase tracking-tight">{course.title}</h5>
                          <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest pt-1">{course.category} • {course.difficulty}</p>
                       </div>
                       <p className="text-xs font-bold text-surface-500 leading-relaxed line-clamp-2 relative z-10">{course.description}</p>
                    </div>
                  ))}
               </div>
             </div>
           )}

           {/* ── Problems Module ────────────────────── */}
           {activeTab === 'Problems' && (
             <div className="space-y-8">
               <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center border border-indigo-500/20">
                       <Code size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                       <h4 className="text-xl font-black text-surface-300 uppercase tracking-tight tracking-widest">Problem Design Lab</h4>
                       <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest opacity-60 italic">Architect coding challenges.</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => { setEditingProblem(null); setShowProblemEditor(true); }}
                  className="px-8 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all flex items-center gap-3">
                   <Plus size={18} strokeWidth={3} /> New Challenge
                 </button>
               </div>

               <div className="rounded-[3rem] bg-surface-900 border border-surface-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left order-collapse">
                       <thead>
                         <tr className="bg-surface-800 border-b border-surface-700">
                           <th className="px-8 py-6 text-[10px] font-black text-surface-500 uppercase tracking-widest">Title</th>
                           <th className="px-8 py-6 text-[10px] font-black text-surface-500 uppercase tracking-widest">Context</th>
                           <th className="px-8 py-6 text-[10px] font-black text-surface-500 uppercase tracking-widest">Difficulty</th>
                           <th className="px-8 py-6 text-[10px] font-black text-surface-500 uppercase tracking-widest text-right">Ops</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-surface-700">
                          {problems.map(prob => (
                            <tr key={prob.id} className="group hover:bg-surface-800 transition-colors">
                               <td className="px-8 py-6">
                                  <p className="text-sm font-black text-surface-300 uppercase tracking-tight">{prob.title}</p>
                                  <p className="text-[10px] font-black text-surface-500 italic opacity-40">#{prob.id}</p>
                               </td>
                               <td className="px-8 py-6">
                                  <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">{prob.course}</p>
                               </td>
                               <td className="px-8 py-6">
                                  <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                    prob.difficulty === 'Easy' ? 'bg-emerald-50/10 text-emerald-500' :
                                    prob.difficulty === 'Medium' ? 'bg-amber-50/10 text-amber-500' :
                                    'bg-red-50/10 text-red-500'
                                  }`}>
                                    {prob.difficulty}
                                  </span>
                               </td>
                               <td className="px-8 py-6 text-right">
                                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => { setEditingProblem(prob); setShowProblemEditor(true); }} className="p-3 rounded-xl bg-surface-800 text-surface-500 hover:text-brand-600"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDeleteProblem(prob.id)} className="p-3 rounded-xl bg-surface-800 text-surface-500 hover:text-red-500"><Trash2 size={16} /></button>
                                  </div>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
               </div>
             </div>
           )}
        </div>
      </div>

      {/* Editors */}
      {showCourseEditor && (
        <CourseEditor 
          course={editingCourse} 
          onSave={handleSaveCourse} 
          onClose={() => setShowCourseEditor(false)} 
        />
      )}
      
      {showProblemEditor && (
        <ProblemEditor 
          problem={editingProblem} 
          courses={courses}
          onSave={handleSaveProblem} 
          onClose={() => setShowProblemEditor(false)} 
        />
      )}
    </PageShell>
  )
}
