import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Code2, Search, ChevronLeft, Layout, BookOpen, Layers, Star, PlayCircle, CheckCircle2, Trophy, Loader2, ArrowRight, Trash2, Plus } from 'lucide-react'
import PageShell from '../../components/ui/PageShell'
import ProblemCard from '../../components/problems/ProblemCard'
import ProblemCardSkeleton from '../../components/problems/ProblemCardSkeleton'
import { problemService } from '../../services/problemService'
import { courseService } from '../../services/courseService'
import adminService from '../../services/adminService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function Prepare() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [problems, setProblems] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  
  // Pagination for problem view
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [probData, courseData] = await Promise.all([
          problemService.getProblems(),
          courseService.getAllCourses()
        ])
        setProblems(probData)
        setCourses(courseData)
      } catch (err) {
        console.error('Failed to fetch prepare data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Realtime Subscriptions
    const problemSubscription = problemService.subscribeToProblems(() => {
      console.log('REALTIME: Problems updated, re-fetching...');
      fetchData();
    });

    const courseSubscription = courseService.subscribeToCourses(() => {
      console.log('REALTIME: Courses updated, re-fetching...');
      fetchData();
    });

    return () => {
      problemSubscription.unsubscribe();
      courseSubscription.unsubscribe();
    }
  }, [])

  const handleDeleteProblem = async (id) => {
    if (window.confirm('Delete this problem permanently?')) {
      try {
        await adminService.deleteProblem(id);
        setProblems(prev => prev.filter(p => p.id !== id));
        toast.success('Problem deleted successfully');
      } catch (err) {
        toast.error('Failed to delete problem');
      }
    }
  };

  const handleDeleteCourse = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this track permanently?')) {
      try {
        await adminService.deleteCourse(id);
        setCourses(prev => prev.filter(c => c.id !== id));
        toast.success('Track deleted successfully');
      } catch (err) {
        toast.error('Failed to delete track');
      }
    }
  };

  // Derived data for Course Cards
  const enrichedCourses = courses.map(course => {
    const courseProblems = problems.filter(p => p.course === course.title || p.course === course.id)
    const solvedForCourse = courseProblems.filter(p => 
      (user?.solved_problems || []).some(sid => sid.toString() === (p.id)?.toString())
    ).length
    
    return {
      ...course,
      problemCount: courseProblems.length,
      solvedCount: solvedForCourse,
      progress: courseProblems.length > 0 ? Math.round((solvedForCourse / courseProblems.length) * 100) : 0
    }
  })

  // Filtering for Course Grid
  const filteredCourses = enrichedCourses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filtering for Problem View
  const filteredProblems = problems.filter((problem) => {
    const inCourse = !selectedCourse || problem.course === selectedCourse.title || problem.course === selectedCourse.id
    const titleMatch = (problem.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSearch = titleMatch
    const matchesDifficulty = difficultyFilter === 'All' || problem.difficulty === difficultyFilter
    return inCourse && matchesSearch && matchesDifficulty
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, difficultyFilter, selectedCourse])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredProblems.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage)

  if (loading) {
    return (
      <PageShell title="Prepare Library" icon={Code2}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={48} className="animate-spin text-brand-600" />
          <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Initializing curriculum...</p>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={selectedCourse ? selectedCourse.title : "Prepare Library"}
      subtitle={selectedCourse ? selectedCourse.description : "Select a specialized coding track to begin your journey to mastery."}
      icon={Code2}
    >
      <div className="space-y-12 animate-fade-in pb-32">
        {isAdmin && (
          <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-brand-50/50 border border-brand-100 mb-8 animate-slide-up">
            <div className="p-3 rounded-2xl bg-brand-600 text-white shadow-xl shadow-brand-500/20">
              <Trophy size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-black text-brand-900 uppercase tracking-widest leading-none mb-1">Administrator Console</h4>
              <p className="text-[10px] text-brand-600 font-bold uppercase tracking-tight opacity-70">Quickly manage courses, problems, and arena infrastructure.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/admin/practice')} className="px-5 py-2.5 bg-white border border-brand-200 text-brand-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-2">
                <Layers size={14} /> New Track
              </button>
              <button onClick={() => navigate('/admin/problems')} className="px-5 py-2.5 bg-white border border-brand-200 text-brand-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-2">
                <Plus size={14} /> New Problem
              </button>
            </div>
          </div>
        )}
        
        {/* Stage Header / Navigation */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-4 w-full md:w-auto">
            {selectedCourse && (
              <button 
                onClick={() => setSelectedCourse(null)}
                className="p-3 rounded-2xl bg-white border border-surface-700 text-surface-500 hover:text-brand-600 hover:border-brand-600 transition-all group"
              >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </button>
            )}
            <div className="relative flex-1 group w-full md:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 group-focus-within:text-brand-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder={selectedCourse ? `Search within ${selectedCourse.title}...` : "Search tracks (e.g. Python, Java)..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-surface-700
                  text-slate-900 text-sm font-bold placeholder:text-surface-600
                  focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500
                  transition-all duration-300 shadow-sm"
              />
            </div>
          </div>

          {selectedCourse && (
            <div className="flex bg-white rounded-xl sm:rounded-2xl p-1 sm:p-1.5 border border-surface-700 shadow-sm overflow-x-auto no-scrollbar max-w-full">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                    ${difficultyFilter === diff
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                      : 'text-surface-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- STAGE 1: Course Selection Grid --- */}
        {!selectedCourse && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCourses.map((course) => (
              <div 
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className="group relative p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] bg-white border border-surface-700 hover:border-brand-500/40 hover:shadow-2xl hover:shadow-brand-500/5 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full"
              >
                {/* Visual Flair */}
                <div 
                  className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 -mr-8 -mt-8"
                  style={{ color: course.color || '#6366f1' }}
                >
                  <Layout size={128} strokeWidth={2.5} />
                </div>

                <div className="relative z-10 space-y-6 flex-1">
                   {/* Icon & Category */}
                   <div className="flex items-start justify-between">
                      <div 
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500"
                        style={{ backgroundColor: `${course.color || '#6366f1'}15`, color: course.color || '#6366f1' }}
                      >
                         <BookOpen size={24} className="sm:w-8 sm:h-8" strokeWidth={2.5} />
                      </div>
                      <div className="flex items-center gap-2">
                        {user?.role === 'admin' && (
                          <button 
                            onClick={(e) => handleDeleteCourse(e, course.id)}
                            className="p-2.5 bg-white text-slate-400 hover:text-rose-600 rounded-xl border border-slate-200 hover:border-rose-100 transition-all shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <span className="text-[9px] font-black uppercase tracking-widest px-4 py-1.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-full">
                          {course.category}
                        </span>
                      </div>
                   </div>

                   {/* Content */}
                   <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase group-hover:text-brand-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-3">
                        {course.description}
                      </p>
                   </div>

                   {/* Stats / Progress */}
                   <div className="pt-4 space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                         <span>Level: {course.difficulty}</span>
                         <span className="text-brand-600">{course.progress}% Completed</span>
                      </div>
                      <div className="h-2 w-full bg-slate-50 rounded-full border border-slate-100 overflow-hidden">
                         <div 
                           className="h-full bg-brand-600 transition-all duration-1000 ease-out"
                           style={{ width: `${course.progress}%`, backgroundColor: course.color }}
                         />
                      </div>
                   </div>
                </div>

                {/* Footer Action */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-50 flex items-center justify-between group-hover:border-brand-100 transition-colors">
                   <div className="flex items-center gap-2">
                      <Layers size={12} className="text-slate-400 sm:w-3.5 sm:h-3.5" />
                      <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">{course.problemCount} Challenges</span>
                   </div>
                   <div className="flex items-center gap-2 text-brand-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                      Enter Track
                      <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform sm:w-3.5 sm:h-3.5" strokeWidth={3} />
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- STAGE 2: Problem Grid (Filtered) --- */}
        {selectedCourse && (
          <div className="space-y-10">
             <div className="flex items-center justify-between border-b border-surface-700 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center text-brand-600">
                    <Star size={20} fill="currentColor" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                    Available Challenges
                  </h4>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Showing {filteredProblems.length} results
                </span>
             </div>

             {filteredProblems.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                 {currentItems.map((problem) => {
                   const isSolved = (user?.solved_problems || []).some(sid => 
                     sid.toString() === (problem.id || '').toString()
                   )
                   return <ProblemCard key={problem.id} problem={problem} isSolved={isSolved} onDelete={handleDeleteProblem} />
                 })}
               </div>
             ) : (
               <div className="py-20 text-center space-y-4">
                 <Code2 size={64} className="mx-auto text-surface-600 mb-6 opacity-30" strokeWidth={1} />
                 <p className="text-surface-500 text-sm font-black uppercase tracking-widest">No matching challenges in this track</p>
                 <button
                   onClick={() => { setSearchTerm(''); setDifficultyFilter('All'); }}
                   className="mt-6 px-8 py-3 rounded-2xl bg-brand-600/5 text-brand-600 text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all"
                 >
                   Reset Track Filters
                 </button>
               </div>
             )}

             {/* Pagination UI */}
             {totalPages > 1 && (
               <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-8 border-t border-surface-700">
                 <span className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
                   Page {currentPage} of {totalPages}
                 </span>
                 <div className="flex items-center gap-3">
                   <button 
                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                     disabled={currentPage === 1}
                     className="px-6 py-2.5 rounded-xl bg-white border border-surface-200 text-slate-800 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
                   >
                     Prev
                   </button>
                   <button 
                     onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                     disabled={currentPage === totalPages}
                     className="px-6 py-2.5 rounded-xl bg-white border border-surface-200 text-slate-800 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
                   >
                     Next
                   </button>
                 </div>
               </div>
             )}
          </div>
        )}
      </div>
    </PageShell>
  )
}
