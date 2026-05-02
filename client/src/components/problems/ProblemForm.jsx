import { useState } from 'react'
import { X, Plus, Trash2, Code2, Beaker, FileText, Settings2, Check, Loader2 } from 'lucide-react'

const LANGUAGES = [
  { id: 'python', label: 'Python 3' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' }
]

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

export default function ProblemForm({ onSubmit, onCancel, initialData = null, loading = false }) {
  const [activeTab, setActiveTab] = useState('general')
  const [formData, setFormData] = useState(initialData || {
    id: '',
    title: '',
    difficulty: 'Easy',
    category: 'Algorithms',
    course: 'General',
    description: '',
    tags: [],
    examples: [{ input: '', output: '', explanation: '' }],
    constraints: [''],
    testCases: [{ input: '', expectedOutput: '', isHidden: false }],
    starterCode: {
      python: 'class Solution:\n    def solve(self, input):\n        pass',
      javascript: 'class Solution {\n    solve(input) {\n        \n    }\n}',
      java: 'class Solution {\n    public Object solve(Object input) {\n        return null;\n    }\n}',
      cpp: 'class Solution {\npublic:\n    void solve() {\n        \n    }\n};'
    }
  })

  const [activeLang, setActiveLang] = useState('python')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle nested array changes
  const handleArrayChange = (field, index, subfield, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]]
      if (typeof newArray[index] === 'object') {
        newArray[index] = { ...newArray[index], [subfield]: value }
      } else {
        newArray[index] = value
      }
      return { ...prev, [field]: newArray }
    })
  }

  const addArrayItem = (field, defaultValue) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], defaultValue] }))
  }

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simple validation
    if (!formData.title || !formData.id || !formData.description) {
      alert('Please fill in required fields (Title, ID, Description)')
      return
    }
    onSubmit(formData)
  }

  const tabs = [
    { id: 'general', label: 'General Info', icon: FileText },
    { id: 'code', label: 'Starter Code', icon: Code2 },
    { id: 'tests', label: 'Test Cases', icon: Beaker },
  ]

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tab Navigation */}
      <div className="flex items-center gap-6 px-8 border-b border-slate-100 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`h-14 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 
              ${activeTab === tab.id ? 'text-brand-600 border-brand-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <form id="problem-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
        {activeTab === 'general' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Problem Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Two Sum"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all shadow-sm"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Problem ID / Slug *</label>
                <input
                  type="text"
                  name="id"
                  placeholder="e.g., two-sum"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all shadow-sm"
                  value={formData.id}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
               <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Difficulty</label>
                <select
                  name="difficulty"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all shadow-sm appearance-none cursor-pointer"
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                <input
                  type="text"
                  name="category"
                  placeholder="e.g., Arrays"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all shadow-sm"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Course context</label>
                <input
                  type="text"
                  name="course"
                  placeholder="e.g., DSA 101"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all shadow-sm"
                  value={formData.course}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Problem Description *</label>
              <textarea
                name="description"
                rows={6}
                placeholder="Write the problem description here (supports Markdown)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all shadow-sm resize-none"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Constraints</label>
                <button
                  type="button"
                  onClick={() => addArrayItem('constraints', '')}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="space-y-3">
                {formData.constraints.map((c, i) => (
                  <div key={i} className="flex gap-3">
                    <input
                      type="text"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-5 text-xs text-slate-800 font-medium focus:outline-none focus:border-brand-600 transition-all"
                      value={c}
                      onChange={(e) => handleArrayChange('constraints', i, null, e.target.value)}
                      placeholder="e.g., 1 <= nums.length <= 10^4"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('constraints', i)}
                      className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
           <div className="space-y-8 animate-fade-in">
              <div className="flex items-center gap-3 p-1.5 bg-slate-100 rounded-2xl w-fit">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setActiveLang(lang.id)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                      ${activeLang === lang.id ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{LANGUAGES.find(l => l.id === activeLang).label} Starter Code</label>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                       <Settings2 size={12} />
                       Code will be formatted automatically
                    </div>
                 </div>
                 <textarea
                   className="w-full h-80 bg-slate-900 text-slate-100 font-mono text-sm p-8 rounded-3xl border border-slate-800 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all shadow-inner resize-none"
                   value={formData.starterCode[activeLang]}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     starterCode: { ...prev.starterCode, [activeLang]: e.target.value }
                   }))}
                 />
              </div>
           </div>
        )}

        {activeTab === 'tests' && (
           <div className="space-y-12 animate-fade-in">
              {/* Examples */}
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Public Examples</h4>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Visible to students in the problem description</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addArrayItem('examples', { input: '', output: '', explanation: '' })}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm"
                    >
                      <Plus size={14} /> Add Example
                    </button>
                 </div>
                 
                 <div className="space-y-6">
                    {formData.examples.map((ex, i) => (
                      <div key={i} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 space-y-4 relative group">
                        <button
                          type="button"
                          onClick={() => removeArrayItem('examples', i)}
                          className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Input</label>
                              <input
                                type="text"
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-mono text-slate-900"
                                value={ex.input}
                                onChange={(e) => handleArrayChange('examples', i, 'input', e.target.value)}
                                placeholder="nums = [2,7], target = 9"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Output</label>
                              <input
                                type="text"
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-mono text-slate-900"
                                value={ex.output}
                                onChange={(e) => handleArrayChange('examples', i, 'output', e.target.value)}
                                placeholder="[0,1]"
                              />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Explanation</label>
                           <input
                             type="text"
                             className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-900"
                             value={ex.explanation}
                             onChange={(e) => handleArrayChange('examples', i, 'explanation', e.target.value)}
                             placeholder="Because nums[0] + nums[1] == 9..."
                           />
                        </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Secret Test Cases */}
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Validation Test Cases</h4>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Used by the grading engine. Hidden from students.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addArrayItem('testCases', { input: '', expectedOutput: '', isHidden: true })}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm"
                    >
                      <Plus size={14} /> Add Test Case
                    </button>
                 </div>

                 <div className="space-y-4">
                    {formData.testCases.map((tc, i) => (
                      <div key={i} className="flex gap-4 items-center p-5 rounded-[2rem] border border-slate-100 bg-white group hover:border-brand-500/20 transition-all">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                           <input
                             type="text"
                             className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-5 text-xs font-mono text-slate-900 focus:outline-none focus:border-brand-600 transition-all"
                             value={tc.input}
                             onChange={(e) => handleArrayChange('testCases', i, 'input', e.target.value)}
                             placeholder="Input..."
                           />
                           <input
                             type="text"
                             className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-5 text-xs font-mono text-slate-900 focus:outline-none focus:border-brand-600 transition-all"
                             value={tc.expectedOutput}
                             onChange={(e) => handleArrayChange('testCases', i, 'expectedOutput', e.target.value)}
                             placeholder="Expected Output..."
                           />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeArrayItem('testCases', i)}
                          className="p-3 text-slate-200 hover:text-rose-500 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        )}
      </form>

      {/* Footer Actions */}
      <div className="p-8 border-t border-slate-100 flex gap-4 shrink-0 bg-slate-50/50">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 rounded-2xl bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
        >
          Discard Changes
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-[2] py-4 rounded-2xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={3} />}
          {initialData ? 'Update Question' : 'Create & Save Question'}
        </button>
      </div>
    </div>
  )
}
