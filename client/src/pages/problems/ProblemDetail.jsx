import { useState, useEffect } from 'react'
import { useParams, Navigate, Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, Layout, Share2, Star, Clock, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { problemService } from '../../services/problemService'
import { submissionService } from '../../services/submissionService'
import codeExecutionService from '../../services/codeExecution'
import ProblemContent from '../../components/problems/ProblemContent'
import CodeEditor from '../../components/problems/CodeEditor'
import OutputConsole from '../../components/problems/OutputConsole'
import { useToast } from '../../context/ToastContext'

export default function ProblemDetail({ challengeRoomId }) {
  const { id: routeId } = useParams()
  const { user, refreshUser } = useAuth()
  const toast = useToast()
  const id = routeId || challengeRoomId; // Use route ID primarily, fallback to prop if embedded

  const [searchParams] = useSearchParams()
  const assignmentId = searchParams.get('assignmentId')
  const classroomId = searchParams.get('classroomId')
  const dueDate = searchParams.get('due_date')
  
  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorStatus, setErrorStatus] = useState('')
  const [solveStartTime] = useState(Date.now())
  const arenaId = searchParams.get('arenaId')

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true)
        const data = await problemService.getProblemById(id)
        setProblem(data)
      } catch (err) {
        console.error('Failed to fetch problem:', err)
        setErrorStatus(err.message || 'Problem not found')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchProblem()
  }, [id])

  // Helper to map problem course to editor language
  const getInitialLanguage = (p) => {
    if (!p) return 'python'
    const course = p.course?.toLowerCase() || ''
    if (course.includes('python')) return 'python'
    if (course.includes('java')) return 'java'
    if (course.includes('web') || course.includes('javascript')) return 'javascript'
    if (course.includes('c++') || course.includes('cpp')) return 'cpp'
    return 'python'
  }

  const [language, setLanguage] = useState('python')
  const [codes, setCodes] = useState({})
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [isAutoRun, setIsAutoRun] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Update language when problem loads
  useEffect(() => {
    if (problem) {
      setLanguage(getInitialLanguage(problem))
    }
  }, [problem])

  const code = codes[language] || ''

  const setCode = (val) => {
    setCodes(prev => ({ ...prev, [language]: val }))
  }

  // Auto-run logic (Debounced)
  useEffect(() => {
    if (!isAutoRun || !code || isRunning) return

    const timeoutId = setTimeout(() => {
      handleRun()
    }, 1000) // 1 second debounce

    return () => clearTimeout(timeoutId)
  }, [code, language, isAutoRun])

  useEffect(() => {
    if (problem && !codes[language]) {
      const starter = (problem.starterCode?.[language] || problem.starter_code?.[language]) || ''
      setCodes(prev => ({
        ...prev,
        [language]: starter
      }))
    }
  }, [problem, language])

  // Check if problem is already solved by user
  useEffect(() => {
    if (user && problem) {
      const solvedList = user.solved_problems || []
      const isActuallySolved = solvedList.some(sid => 
        sid.toString() === (problem.id || '').toString()
      )
      if (isActuallySolved) {
        setIsSubmitted(true)
      }
    }
  }, [user, problem])

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-surface-950 gap-4">
       <Loader2 size={48} className="animate-spin text-brand-600" />
       <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Bootstrapping development environment...</p>
    </div>
  )

  if (errorStatus || !problem) {
    return <Navigate to="/prepare" replace />
  }

  const handleRun = async () => {
    setIsRunning(true)
    setOutput('')
    setError('')
    setStatus(null)
    setMetrics(null)
    
    try {
      const result = await codeExecutionService.executeCode(code, language)
      setIsRunning(false)
      setStatus(result.status)
      setMetrics({ time: result.time, memory: result.memory })

      if (result.success) {
        setOutput(result.stdout)
        setError(result.stderr)
      } else {
        setError(result.stderr || 'Execution failed.')
        setOutput(result.stdout)
      }
    } catch (_err) {
      setIsRunning(false)
      setError('Internal Error: Could not connect to the API.')
    }
  }

  const handleSubmit = async () => {
    try {
      setIsRunning(true)
      // 1. Execute code first (local check for immediate feedback)
      const executionResult = await codeExecutionService.executeCode(code, language)
      
      // 2. Submit to backend (Source of Truth)
      // Even if executionResult fails locally, we can still submit, 
      // but usually, we only submit if it passes local tests to save resources.
      const data = await submissionService.submitCode({
        problemId: problem.id,
        classroomId: classroomId,
        code,
        language,
        status: executionResult.success ? 'Accepted' : 'Failed', // Hint for backend
        difficulty: problem.difficulty,
        assignmentId: assignmentId
      })

      const submission = data.submission;
      const user_stats = data.user_stats;

      setIsRunning(false)

      if (submission && submission.status === 'Accepted') {
        setIsSubmitted(true)
        
        // 4. Refresh user profile immediately with data from backend
        if (refreshUser && user_stats) {
          refreshUser(user_stats); // Assuming refreshUser can take data or we just call it
        }
        
        toast.success(arenaId ? 'Arena Challenge Solved!' : 'Challenge Solved! Your progress and XP have been updated.')
      } else {
        toast.error(`Solution Rejected: ${submission?.status || 'Incorrect'}`)
      }
    } catch (err) {
      setIsRunning(false)
      console.error('Submission failed:', err)
      toast.error(err.message || 'Failed to submit solution')
    }
  }

  return (
    <div className={`${challengeRoomId ? 'h-full' : 'h-screen'} flex flex-col bg-surface-950 overflow-hidden`}>
      {/* Dynamic Header — Hidden in Challenge Mode */}
      {!challengeRoomId && (
         <header className="h-14 flex items-center justify-between px-3 sm:px-6 border-b border-surface-700 bg-white z-30 shrink-0">
         <div className="flex items-center gap-6">
            <Link to={arenaId ? `/room/${arenaId}` : (assignmentId ? "/assignments" : "/prepare")} className="flex items-center gap-2 text-surface-500 hover:text-brand-600 transition-colors group">
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {arenaId ? "Arena Room" : (assignmentId ? "Assignments" : "Prepare List")}
              </span>
            </Link>
           <div className="h-4 w-px bg-surface-700" />
           <div className="flex items-center gap-3">
             <h2 className="text-xs sm:text-sm font-black text-surface-300 uppercase tracking-tight truncate max-w-[150px] sm:max-w-none">
               {problem.title}
             </h2>
             {isSubmitted && (
               <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-black uppercase tracking-widest">
                 <ShieldCheck size={10} />
                 Submitted
               </span>
             )}
           </div>
         </div>
 
         {dueDate && (
           <div className="flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600">
             <Clock size={14} className="animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest">
               Deadline: {new Date(dueDate).toLocaleDateString()}
             </span>
           </div>
         )}
 
         <div className="flex items-center gap-4">
           <div className="flex gap-1">
             <button className="p-2 rounded-xl text-surface-500 hover:bg-surface-800 transition-all duration-200">
               <Star size={16} />
             </button>
             <button className="p-2 rounded-xl text-surface-500 hover:bg-surface-800 transition-all duration-200">
               <Share2 size={16} />
             </button>
           </div>
         </div>
       </header>
      )}

      {/* IDE Layout */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-[40%] md:min-w-[300px] md:max-w-[600px] h-[40vh] md:h-auto overflow-y-auto">
          <ProblemContent problem={problem} />
        </div>

        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex-1 min-h-[200px] md:min-h-0 relative">
            <CodeEditor
              language={language}
              setLanguage={setLanguage}
              code={code}
              setCode={setCode}
              onRun={handleRun}
              onSubmit={handleSubmit}
              isAutoRun={isAutoRun}
              setIsAutoRun={setIsAutoRun}
            />
          </div>
          <div className="h-[30%] min-h-[150px] border-l border-surface-800">
            <OutputConsole output={output} isRunning={isRunning} error={error} status={status} metrics={metrics} />
          </div>
        </div>
      </main>
    </div>
  )
}

