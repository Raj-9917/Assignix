import { useState } from 'react'
import { X, Save, Code, Brackets, Type, BarChart, Layers, Tag as TagIcon, Plus, Trash2, Check, ExternalLink } from 'lucide-react'

export default function ProblemEditor({ problem, courses, onSave, onClose }) {
  const [formData, setFormData] = useState(problem ? {
    id: problem.id || '',
    title: problem.title || '',
    difficulty: problem.difficulty || 'Easy',
    category: problem.category || 'Array',
    course: problem.course || (courses[0]?.id || 'General'),
    tags: problem.tags || [],
    description: problem.description || '',
    examples: problem.examples || [{ input: '', output: '', explanation: '' }],
    constraints: problem.constraints || [''],
    testCases: problem.testCases || [{ input: '', expectedOutput: '', isHidden: false }],
    starterCode: problem.starterCode || {
      python: 'def solution():\n    pass',
      javascript: 'function solution() {\n    \n}',
      java: 'class Solution {\n    public void solve() {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    void solve() {\n        \n    }\n};'
    }
  } : {
    id: '',
    title: '',
    difficulty: 'Easy',
    category: 'Array',
    course: courses[0]?.id || 'General',
    tags: [],
    description: '',
    examples: [{ input: '', output: '', explanation: '' }],
    constraints: [''],
    testCases: [{ input: '', expectedOutput: '', isHidden: false }],
    starterCode: {
      python: 'def solution():\n    pass',
      javascript: 'function solution() {\n    \n}',
      java: 'class Solution {\n    public void solve() {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    void solve() {\n        \n    }\n};'
    }
  })


  const [activeTab, setActiveTab] = useState('Metadata') // Metadata, Examples, Tests, Code

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const addExample = () => setFormData({ ...formData, examples: [...formData.examples, { input: '', output: '', explanation: '' }] })
  const removeExample = (idx) => setFormData({ ...formData, examples: formData.examples.filter((_, i) => i !== idx) })

  const addConstraint = () => setFormData({ ...formData, constraints: [...formData.constraints, ''] })
  const removeConstraint = (idx) => setFormData({ ...formData, constraints: formData.constraints.filter((_, i) => i !== idx) })

  const addTestCase = () => setFormData({ ...formData, testCases: [...formData.testCases, { input: '', expectedOutput: '', isHidden: false }] })
  const removeTestCase = (idx) => setFormData({ ...formData, testCases: formData.testCases.filter((_, i) => i !== idx) })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-900 border border-surface-700 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <div className="px-10 py-8 border-b border-surface-700 flex items-center justify-between bg-surface-800/50">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Code size={24} strokeWidth={2.5} />
             </div>
             <div>
                <h3 className="text-xl font-black text-surface-300 uppercase tracking-tight">
                  {formData.id ? 'Update Challenge' : 'Architect Challenge'}
                </h3>
                <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest opacity-60">Design a high-fidelity coding problem.</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-surface-700 text-surface-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form Tabs */}
        <div className="px-10 py-4 flex items-center gap-8 border-b border-surface-700 bg-surface-900 overflow-x-auto scrollbar-none">
           {['Metadata', 'Examples', 'Tests', 'Code'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`text-[10px] font-black uppercase tracking-widest py-2 border-b-2 transition-all ${
                 activeTab === tab ? 'border-brand-600 text-brand-600' : 'border-transparent text-surface-500 hover:text-surface-300'
               }`}
             >
               {tab}
             </button>
           ))}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0">
          <div className="p-10 space-y-12">
            
            {activeTab === 'Metadata' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest px-1">Problem Title</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-surface-800 border border-surface-700 text-surface-300 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all placeholder:text-surface-600"
                        placeholder="e.g. Invert a Binary Tree"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest px-1">Problem ID (Slug)</label>
                      <input
                        type="text"
                        required
                        disabled={!!problem}
                        value={formData.id}
                        onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        className="w-full px-6 py-4 rounded-2xl bg-surface-800 border border-surface-700 text-surface-300 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all disabled:opacity-50"
                        placeholder="e.g. invert-binary-tree"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest px-1">Difficulty Level</label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-surface-800 border border-surface-700 text-surface-300 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all appearance-none"
                      >
                         <option>Easy</option>
                         <option>Medium</option>
                         <option>Hard</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest px-1">Content Category</label>
                      <input
                        type="text"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-surface-800 border border-surface-700 text-surface-300 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all"
                        placeholder="e.g. Algorithms"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest px-1">Assigned Course</label>
                      <select
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-surface-800 border border-surface-700 text-surface-300 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all appearance-none"
                      >
                         <option value="General">General Platform</option>
                         {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest px-1">Problem Specification</label>
                   <textarea
                     rows={6}
                     value={formData.description}
                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                     className="w-full px-6 py-4 rounded-2xl bg-surface-800 border border-surface-700 text-surface-300 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all resize-none"
                     placeholder="Define the technical challenge in clear, professional language..."
                   />
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest px-1">Operational Constraints</label>
                      <button type="button" onClick={addConstraint} className="p-2 rounded-lg bg-surface-800 text-brand-600 hover:bg-surface-700 transition-colors">
                        <Plus size={16} strokeWidth={3} />
                      </button>
                   </div>
                   <div className="space-y-3">
                      {formData.constraints.map((c, i) => (
                        <div key={i} className="flex gap-3">
                           <input
                             value={c}
                             onChange={(e) => {
                               const newConstraints = [...formData.constraints];
                               newConstraints[i] = e.target.value;
                               setFormData({ ...formData, constraints: newConstraints });
                             }}
                             className="flex-1 px-6 py-3 rounded-xl bg-surface-800 border border-surface-700 text-surface-300 text-sm font-bold focus:border-brand-600 transition-all"
                             placeholder="e.g. 1 <= nums.length <= 10^4"
                           />
                           <button type="button" onClick={() => removeConstraint(i)} className="p-3 text-surface-600 hover:text-red-500 transition-colors">
                             <Trash2 size={18} />
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'Examples' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-surface-500 uppercase tracking-widest px-1">Public Proof Cases</h4>
                    <button type="button" onClick={addExample} className="px-5 py-2 rounded-xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand-500 transition-all">
                       <Plus size={14} strokeWidth={3} /> Add Proof
                    </button>
                 </div>
                 <div className="space-y-6">
                    {formData.examples.map((ex, i) => (
                      <div key={i} className="p-8 rounded-[2rem] bg-surface-800 border border-surface-700 space-y-6 relative group">
                        <button type="button" onClick={() => removeExample(i)} className="absolute top-6 right-6 p-2 text-surface-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                           <Trash2 size={18} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Input Vector</label>
                             <input
                               value={ex.input}
                               onChange={(e) => {
                                 const newExamples = [...formData.examples];
                                 newExamples[i].input = e.target.value;
                                 setFormData({ ...formData, examples: newExamples });
                               }}
                               className="w-full px-5 py-3 rounded-xl bg-surface-900 border border-surface-700 text-surface-300 font-mono text-sm"
                             />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Target Output</label>
                             <input
                               value={ex.output}
                               onChange={(e) => {
                                 const newExamples = [...formData.examples];
                                 newExamples[i].output = e.target.value;
                                 setFormData({ ...formData, examples: newExamples });
                               }}
                               className="w-full px-5 py-3 rounded-xl bg-surface-900 border border-surface-700 text-surface-300 font-mono text-sm"
                             />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Logic Explanation</label>
                           <textarea
                             rows={2}
                             value={ex.explanation}
                             onChange={(e) => {
                               const newExamples = [...formData.examples];
                               newExamples[i].explanation = e.target.value;
                               setFormData({ ...formData, examples: newExamples });
                             }}
                             className="w-full px-5 py-3 rounded-xl bg-surface-900 border border-surface-700 text-surface-300 text-sm font-bold resize-none"
                           />
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'Tests' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-surface-500 uppercase tracking-widest px-1">Validation Test Suite</h4>
                    <button type="button" onClick={addTestCase} className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-500 transition-all">
                       <Brackets size={14} strokeWidth={3} /> Add Validation
                    </button>
                 </div>
                 <div className="space-y-4">
                    {formData.testCases.map((tc, i) => (
                      <div key={i} className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-surface-800 border border-surface-700 group">
                         <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              placeholder="Test Input"
                              value={tc.input}
                              onChange={(e) => {
                                const newTests = [...formData.testCases];
                                newTests[i].input = e.target.value;
                                setFormData({ ...formData, testCases: newTests });
                              }}
                              className="px-4 py-2 rounded-xl bg-surface-900 border border-surface-700 text-surface-300 font-mono text-xs"
                            />
                            <input
                              placeholder="Expected Output"
                              value={tc.expectedOutput}
                              onChange={(e) => {
                                const newTests = [...formData.testCases];
                                newTests[i].expectedOutput = e.target.value;
                                setFormData({ ...formData, testCases: newTests });
                              }}
                              className="px-4 py-2 rounded-xl bg-surface-900 border border-surface-700 text-surface-300 font-mono text-xs"
                            />
                         </div>
                         <div className="flex items-center gap-2 px-3 border-l border-surface-700">
                             <input
                               type="checkbox"
                               checked={tc.isHidden}
                               onChange={(e) => {
                                 const newTests = [...formData.testCases];
                                 newTests[i].isHidden = e.target.checked;
                                 setFormData({ ...formData, testCases: newTests });
                               }}
                               className="w-4 h-4 text-brand-600 bg-surface-900 border-surface-700 rounded focus:ring-brand-500"
                             />
                             <span className="text-[9px] font-black uppercase text-surface-500">Hidden</span>
                         </div>
                         <button type="button" onClick={() => removeTestCase(i)} className="p-2 text-surface-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                             <Trash2 size={16} />
                         </button>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'Code' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="space-y-6">
                    {Object.keys(formData.starterCode).map(lang => (
                      <div key={lang} className="space-y-2">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center text-brand-600">
                               <Code size={14} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-surface-300">{lang} Starter Boilerplate</span>
                         </div>
                         <textarea
                           rows={6}
                           value={formData.starterCode[lang]}
                           onChange={(e) => {
                             const newCode = { ...formData.starterCode };
                             newCode[lang] = e.target.value;
                             setFormData({ ...formData, starterCode: newCode });
                           }}
                           className="w-full px-6 py-4 rounded-[2rem] bg-surface-800 border border-surface-700 text-surface-300 font-mono text-sm leading-relaxed focus:border-brand-600 transition-all resize-none shadow-inner"
                         />
                      </div>
                    ))}
                 </div>
              </div>
            )}

          </div>
        </form>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-surface-700 bg-surface-800/50 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-8 py-4 rounded-2xl bg-surface-700 text-surface-300 text-[10px] font-black uppercase tracking-widest hover:bg-surface-600 transition-all"
          >
            Cancel Design
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-4 rounded-2xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-500 transition-all flex items-center gap-2 shadow-xl shadow-brand-500/20"
          >
            <Check size={16} strokeWidth={3} />
            Publish Challenge
          </button>
        </div>
      </div>
    </div>
  )
}
