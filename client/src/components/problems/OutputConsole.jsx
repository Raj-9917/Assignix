import { useState, useEffect } from 'react'
import { Terminal, Bug, FlaskConical, CircleCheck, CircleX, Zap, Activity } from 'lucide-react'

export default function OutputConsole({ output, isRunning, error, status, metrics }) {
  const [activeTab, setActiveTab] = useState('output')

  useEffect(() => {
    if (error && !output) {
      setActiveTab('errors')
    }
  }, [error, output])

  const tabs = [
    { id: 'output', label: 'Output', icon: Terminal },
    { id: 'errors', label: 'Errors', icon: Bug },
    { id: 'testcases', label: 'Test Cases', icon: FlaskConical },
  ]

  const getStatusColor = (description) => {
    if (!description) return 'text-surface-500'
    if (description === 'Accepted') return 'text-emerald-600'
    if (description.includes('Error') || description.includes('Failed')) return 'text-rose-600'
    return 'text-amber-600'
  }

  return (
    <div className="h-full flex flex-col bg-white border-t border-surface-700">
      {/* Console Header / Status Bar */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-surface-700 bg-white shadow-sm z-10">
        <div className="flex items-center gap-1 h-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-full flex items-center gap-2 px-4 text-[10px] font-black uppercase tracking-widest transition-all duration-200 border-b-2
                ${activeTab === tab.id
                  ? 'text-brand-600 border-brand-600 bg-brand-50'
                  : 'text-surface-500 border-transparent hover:text-surface-300 hover:bg-surface-800'}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Metrics */}
        {(status || metrics || isRunning) && (
          <div className="flex items-center gap-4 pr-4 animate-fade-in">
            {isRunning ? (
              <div className="flex items-center gap-2 text-[10px] font-black text-surface-500 uppercase tracking-widest italic animate-pulse">
                <Activity size={12} className="animate-spin text-brand-500" />
                Executing...
              </div>
            ) : (
              <>
                {status && (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800 border border-surface-700 text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(status.description)}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    {status.description}
                  </div>
                )}
                {metrics && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-surface-500 uppercase tracking-tight">
                      <Zap size={12} className="text-amber-500" />
                      <span className="text-surface-300">{metrics.time}</span>s
                    </div>
                    <div className="w-px h-3 bg-surface-700" />
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-surface-500 uppercase tracking-tight">
                      <Activity size={12} className="text-brand-500" />
                      <span className="text-surface-300">{metrics.memory}</span>MB
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 font-mono text-sm custom-scrollbar bg-slate-50/50">
        {isRunning ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40 text-surface-500 text-xs gap-4">
            <Activity size={40} className="animate-spin text-brand-500" />
            <span className="font-black uppercase tracking-widest">Preparing execution...</span>
          </div>
        ) : (
          <>
            {activeTab === 'output' && (
              <div className="space-y-2">
                {(output || error) ? (
                  <div className="space-y-4">
                    {output && <pre className="text-surface-300 whitespace-pre-wrap p-4 bg-white rounded-2xl border border-surface-700 shadow-sm leading-relaxed">{output}</pre>}
                    {error && (
                       <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 shadow-sm">
                          <p className="font-black text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                             <CircleX size={14} /> Runtime Error
                          </p>
                          <pre className="whitespace-pre-wrap text-xs">{error}</pre>
                       </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 opacity-30 text-surface-500 text-xs gap-4">
                    <Terminal size={40} />
                    <span className="font-black uppercase tracking-widest">Ready for results.</span>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'errors' && (
              <div className="space-y-2 h-full">
                {error ? (
                  <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 shadow-sm">
                    <p className="font-black flex items-center gap-2 mb-3 uppercase tracking-widest text-[10px]">
                      <Bug size={14} /> Error Details
                    </p>
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">{error}</pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 opacity-30 text-surface-500 text-xs gap-4">
                    <FlaskConical size={40} />
                    <span className="font-black uppercase tracking-widest">No errors found.</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'testcases' && (
              <div className="space-y-4">
                {[1, 2].map(idx => (
                  <div key={idx} className="p-5 rounded-2xl bg-white border border-surface-700 flex items-center justify-between group shadow-sm hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 group-hover:bg-emerald-100 transition-colors shadow-sm">
                        <CircleCheck size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-surface-300 uppercase tracking-widest">Test Case {idx}</p>
                        <p className="text-[11px] text-surface-500 font-bold italic mt-0.5">Input: nums = [2, 7, 11, 15], target = 9</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest shadow-sm">
                      Passed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
