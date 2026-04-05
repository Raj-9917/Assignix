import Editor from '@monaco-editor/react'
import { useState } from 'react'
import { Play, Send, Settings, RotateCcw, Zap, ZapOff } from 'lucide-react'

export default function CodeEditor({ language, setLanguage, code, setCode, onRun, onSubmit, isAutoRun, setIsAutoRun }) {
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false)

  const handleEditorDidMount = () => {
    setIsEditorReady(true)
  }

  const languages = [
    { id: 'python', label: 'Python 3', icon: '🐍' },
    { id: 'javascript', label: 'JavaScript', icon: '🟨' },
    { id: 'java', label: 'Java', icon: '☕' },
    { id: 'cpp', label: 'C++', icon: '🔵' },
  ]

  const activeLang = languages.find(l => l.id === language) || languages[0]

  const handleLangSelect = (langId) => {
    setLanguage(langId)
    setIsLangDropdownOpen(false)
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Tool Bar */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-surface-700 bg-white shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 shadow-sm
                ${isLangDropdownOpen ? 'bg-surface-800 border-brand-500/50 ring-2 ring-brand-500/10' : 'bg-surface-800 border-surface-700 hover:border-surface-600'}`}
            >
              <span className="text-xs">{activeLang.icon}</span>
              <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">{activeLang.label}</span>
            </button>
            
            {/* Real React Dropdown */}
            {isLangDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsLangDropdownOpen(false)} 
                />
                <div className="absolute top-full left-0 mt-2 w-48 z-50 bg-white rounded-2xl border border-surface-700 p-1 shadow-2xl animate-in fade-in slide-in-from-top-2">
                  {languages.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => handleLangSelect(lang.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors
                        ${language === lang.id ? 'bg-brand-50 text-brand-600' : 'text-surface-500 hover:bg-surface-800 hover:text-surface-300'}`}
                    >
                      <span>{lang.icon}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <div className="h-4 w-px bg-surface-700 mx-1" />

          <button
            onClick={() => setIsAutoRun(!isAutoRun)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 shadow-sm
              ${isAutoRun 
                ? 'bg-amber-50 border-amber-200 text-amber-600' 
                : 'bg-surface-800 border-surface-700 text-surface-500 hover:text-surface-300 hover:border-surface-600'}`}
            title={isAutoRun ? "Disable Real-time Execution" : "Enable Real-time Execution (Auto-run)"}
          >
            {isAutoRun ? <Zap size={14} className="animate-pulse fill-current" /> : <ZapOff size={14} />}
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
              {isAutoRun ? "Live" : "Real-time"}
            </span>
          </button>

          <button
            onClick={() => setCode('// Resetting code...')}
            className="p-2 rounded-xl text-surface-500 hover:bg-surface-800 hover:text-brand-600 transition-all duration-200"
            title="Reset Code"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onRun}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-surface-800 border border-surface-700 text-surface-300 font-black text-[10px] uppercase tracking-widest hover:border-brand-500/50 hover:bg-white transition-all duration-200 shadow-sm"
          >
            <Play size={14} fill="currentColor" />
            Run
          </button>
          <button
            onClick={onSubmit}
            className="flex items-center gap-2 px-8 py-2 rounded-xl bg-brand-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-500 active:scale-95 transition-all duration-200"
          >
            <Send size={14} fill="currentColor" />
            Submit
          </button>
          <button className="p-2 rounded-xl text-surface-500 hover:bg-surface-800 transition-all duration-200">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          theme="vs"
          language={language === 'cpp' ? 'cpp' : language}
          value={code}
          onChange={(val) => setCode(val)}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: false,
            cursorStyle: 'line',
            automaticLayout: true,
            padding: { top: 20, bottom: 20 },
            fontFamily: 'JetBrains Mono, Menlo, Courier New, monospace',
          }}
        />
        {!isEditorReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 text-surface-300">
            <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
