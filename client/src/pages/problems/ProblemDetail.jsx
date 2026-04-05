import { useState, useEffect } from 'react'
import { useParams, Navigate, Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, Layout, Share2, Star, Clock, AlertTriangle, ShieldCheck } from 'lucide-react'
import { problems } from '../../data/problems'
import { initialAssignments } from '../../data/assignments'
import codeExecutionService from '../../services/codeExecution'
import ProblemContent from '../../components/problems/ProblemContent'
import CodeEditor from '../../components/problems/CodeEditor'
import OutputConsole from '../../components/problems/OutputConsole'

export default function ProblemDetail({ challengeRoomId }) {
  const { id: routeId } = useParams()
  const id = challengeRoomId ? 
    (challengeRoomId === 'room-101' ? 'two-sum' : 'palindrome-number') : 
    routeId

  const [searchParams] = useSearchParams()
  const assignmentId = searchParams.get('assignmentId')
  
  const problem = problems.find((p) => p.id === id)
  const assignment = assignmentId ? initialAssignments.find(a => a.id === assignmentId) : null

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

  const [language, setLanguage] = useState(() => getInitialLanguage(problem))
  const [codes, setCodes] = useState({})
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [isAutoRun, setIsAutoRun] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

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

  const defaultSnippets = {
    python: 'def solution(nums, target):\n    # Write your code here\n    pass\n\n# Example Test\nprint(solution([2, 7, 11, 15], 9))',
    javascript: 'function solution(nums, target) {\n    // Write your code here\n}\n\n// Example Test\nconsole.log(solution([2, 7, 11, 15], 9));',
    java: 'public class Solution {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from C++!" << endl;\n    return 0;\n}',
  }

  useEffect(() => {
    if (problem && !codes[language]) {
      setCodes(prev => ({
        ...prev,
        [language]: defaultSnippets[language] || ''
      }))
    }
    
    // Check if assignment is already submitted
    if (assignmentId) {
      const stored = JSON.parse(localStorage.getItem('assignmentStatus') || '{}')
      if (stored[assignmentId] === 'Submitted') {
        setIsSubmitted(true)
      }
    }
  }, [problem, language, assignmentId])

  if (!problem) {
    return <Navigate to="/problems" replace />
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
    } catch (e) {
      setIsRunning(false)
      setError('Internal Error: Could not connect to the API.')
    }
  }

  const handleSubmit = async () => {
    setIsRunning(true)
    const result = await codeExecutionService.executeCode(code, language)
    
    setIsRunning(false)
    if (result.success) {
      // 1. Mark as solved globally for Practice progress
      const solved = JSON.parse(localStorage.getItem('solved_problems') || '[]')
      if (!solved.includes(id)) {
        localStorage.setItem('solved_problems', JSON.stringify([...solved, id]))
      }

      if (assignmentId) {
        // 2. Save status for the specific assignment
        const stored = JSON.parse(localStorage.getItem('assignmentStatus') || '{}')
        stored[assignmentId] = 'Submitted'
        localStorage.setItem('assignmentStatus', JSON.stringify(stored))
        setIsSubmitted(true)
        alert('Assignment Submitted Successfully!')
      } else if (challengeRoomId) {
         alert('Challenge Submission Received! Check your rank on the leaderboard!')
      } else {
        alert(`Accepted! Time: ${result.time}s, Memory: ${result.memory}MB`)
      }
    } else {
      alert(`Failed: ${result.status?.description || 'Unknown error'}`)
    }
  }

  return (
    <div className={`${challengeRoomId ? 'h-full' : 'h-screen'} flex flex-col bg-surface-950 overflow-hidden`}>
      {/* Dynamic Header — Hidden in Challenge Mode */}
      {!challengeRoomId && (
         <header className="h-14 flex items-center justify-between px-6 border-b border-surface-700 bg-white z-30 shrink-0">
         <div className="flex items-center gap-6">
           <Link to={assignmentId ? "/assignments" : "/problems"} className="flex items-center gap-2 text-surface-500 hover:text-brand-600 transition-colors group">
             <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">
               {assignmentId ? "Assignments" : "Problem List"}
             </span>
           </Link>
           <div className="h-4 w-px bg-surface-700" />
           <div className="flex items-center gap-3">
             <h2 className="text-sm font-black text-surface-300 uppercase tracking-tight">
               {assignment ? assignment.title : problem.title}
             </h2>
             {isSubmitted && (
               <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-black uppercase tracking-widest">
                 <ShieldCheck size={10} />
                 Submitted
               </span>
             )}
           </div>
         </div>
 
         {assignment && (
           <div className="flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600">
             <Clock size={14} className="animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest">
               Deadline: {new Date(assignment.deadline).toLocaleDateString()}
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
      <main className="flex-1 flex overflow-hidden">
        <div className="w-[40%] min-w-[300px] max-w-[600px]">
          <ProblemContent problem={problem} />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0 relative">
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

