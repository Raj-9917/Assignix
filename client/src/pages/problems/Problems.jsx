import { useState } from 'react'
import { Code2, Search, Filter } from 'lucide-react'
import PageShell from '../../components/ui/PageShell'
import ProblemCard from '../../components/problems/ProblemCard'
import { problems } from '../../data/problems'

export default function Problems() {
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('All')

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = difficultyFilter === 'All' || problem.difficulty === difficultyFilter
    return matchesSearch && matchesDifficulty
  })

  return (
    <PageShell
      title="Problem Library"
      subtitle="Explore our curated collection of coding problems, sorted by difficulty and tags."
      icon={Code2}
    >
      <div className="space-y-10 animate-fade-in pb-20">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
          <div className="relative flex-1 group w-full md:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 group-focus-within:text-brand-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-surface-700
                text-slate-900 text-sm font-bold placeholder:text-surface-600
                focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500
                transition-all duration-300 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto">
            <div className="flex bg-white rounded-2xl p-1.5 border border-surface-700 shadow-sm">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${difficultyFilter === diff
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                      : 'text-surface-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 px-2 pb-2 border-b border-surface-700">
          <span>Found {filteredProblems.length} Results</span>
          {difficultyFilter !== 'All' && (
            <span className="text-brand-600">Filtered by {difficultyFilter}</span>
          )}
        </div>

        {/* Problems Grouped by Course */}
        {filteredProblems.length > 0 ? (
          Object.entries(
            filteredProblems.reduce((acc, problem) => {
              const course = problem.course || 'Shared';
              if (!acc[course]) acc[course] = [];
              acc[course].push(problem);
              return acc;
            }, {})
          ).map(([course, courseProblems]) => (
            <div key={course} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-8 w-1 bg-brand-500 rounded-full" />
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{course} Course</h3>
                <span className="text-[10px] font-black text-surface-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">{courseProblems.length} Problems</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courseProblems.map((problem) => (
                  <ProblemCard key={problem.id} problem={problem} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center space-y-4">
            <Code2 size={64} className="mx-auto text-surface-600 mb-6 opacity-30" strokeWidth={1} />
            <p className="text-surface-500 text-sm font-black uppercase tracking-widest">No matching problems found</p>
            <button
              onClick={() => { setSearchTerm(''); setDifficultyFilter('All'); }}
              className="mt-6 px-8 py-3 rounded-2xl bg-brand-600/5 text-brand-600 text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </PageShell>
  )
}
