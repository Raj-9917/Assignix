import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Code2, 
  Trash2, 
  Edit2, 
  ChevronRight, 
  Database,
  Tag,
  Layers,
  Braces,
  CheckCircle,
  MessageSquare,
  ListChecks,
  AlertCircle as AlertIcon
} from 'lucide-react';
import Editor from '@monaco-editor/react';

import adminService from '../../services/adminService';
import { problemService } from '../../services/problemService';

export default function AdminPrepare() {
  const [problems, setProblems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'pending' | 'arena'
  const [approvingProblem, setApprovingProblem] = useState(null);
  const [approveScore, setApproveScore] = useState('50');
  const itemsPerPage = 8;

  const initialForm = {
    id: '',
    title: '',
    difficulty: 'Easy',
    category: 'Algorithms',
    course: 'General',
    is_practice: true,
    description: '',
    tags: '',
    starter_code: { javascript: '// Your code here' },
    test_cases: [
      { input: '1, 2', expected: '3', isHidden: false },
      { input: '10, 20', expected: '30', isHidden: true }
    ],
    is_arena_problem: false,
    hardness_score: 50,
    examples: [
      { input: '1, 2', output: '3', explanation: '1 + 2 = 3' }
    ],
    constraints: ['Input will be positive integers']
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      if (filterMode === 'pending') {
        data = await problemService.getUnapprovedProblems();
      } else if (filterMode === 'arena') {
        data = await problemService.getArenaProblems();
      } else {
        data = await adminService.getAllProblems();
      }
      setProblems(data);
    } catch (err) {
      console.error('Fetch problems error:', err);
    } finally {
      setLoading(false);
    }
  }, [filterMode]);

  const fetchCourses = useCallback(async () => {
    try {
      const data = await adminService.getAllCourses();
      setCourses(data);
    } catch (err) {
      console.error('Fetch courses error:', err);
    }
  }, []);

  useEffect(() => {
    fetchProblems();
    fetchCourses();
  }, [fetchProblems, fetchCourses]);

  const handleApprove = (p) => {
    setApprovingProblem(p);
    setApproveScore('50');
  };

  const handleApproveConfirm = async () => {
    try {
      await adminService.approveProblem(approvingProblem.id, {
        is_arena_problem: true,
        hardness_score: parseInt(approveScore)
      });
      setApprovingProblem(null);
      fetchProblems();
    } catch (err) {
      alert('Approval failed: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : formData.tags
      };

      if (editingProblem) {
        await adminService.updateProblem(editingProblem.id, dataToSubmit);
      } else {
        // Map the 'id' field from form to 'slug' for the backend
        const { id, ...createData } = dataToSubmit;
        await adminService.createProblem({ ...createData, slug: id });
      }
      
      setShowModal(false);
      setEditingProblem(null);
      setFormData(initialForm);
      fetchProblems();
    } catch (err) {
      alert('Operation failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (p) => {
    setEditingProblem(p);
    setFormData({
      id: p.slug || p.id,
      title: p.title,
      difficulty: p.difficulty,
      category: p.category,
      course: p.course || 'General',
      is_practice: p.is_practice !== undefined ? p.is_practice : (p.isPractice !== undefined ? p.isPractice : true),
      description: p.description || '',
      tags: p.tags?.join(', ') || '',
      starter_code: p.starter_code || p.starterCode || { javascript: '// Your code here' },
      test_cases: p.test_cases || p.testCases || [],
      is_arena_problem: p.is_arena_problem || p.isArenaProblem || false,
      hardness_score: p.hardness_score || p.hardnessScore || 0,
      examples: p.examples || [],
      constraints: p.constraints || []
    });

    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this problem permanently from the registry? This will also remove all associated student submissions.')) {
      try {
        await adminService.deleteProblem(id);
        setProblems(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        console.error('Delete problem error:', err);
        alert('Deletion failed: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const filtered = (problems || []).filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Core Repository</h1>
          <div className="flex items-center gap-6 mt-2">
            <button 
              onClick={() => setFilterMode('all')}
              className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-all ${filterMode === 'all' ? 'text-brand-600 border-brand-600' : 'text-slate-400 border-transparent'}`}
            >
              Master Library
            </button>
            <button 
              onClick={() => setFilterMode('pending')}
              className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-all ${filterMode === 'pending' ? 'text-brand-600 border-brand-600' : 'text-slate-400 border-transparent'}`}
            >
              Submission Registry
            </button>
            <button 
              onClick={() => setFilterMode('arena')}
              className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-all ${filterMode === 'arena' ? 'text-brand-600 border-brand-600' : 'text-slate-400 border-transparent'}`}
            >
              Arena Track
            </button>
          </div>
        </div>
        <button 
          onClick={() => { setEditingProblem(null); setFormData(initialForm); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-100 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={16} strokeWidth={3} /> Inject New Challenge
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm relative group">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Filter by problem title, slug or tag..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Designation</th>
                <th className="px-8 py-5">Complexity</th>
                <th className="px-8 py-5">Classification</th>
                <th className="px-8 py-5">Tags</th>
                <th className="px-8 py-5 text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-8 py-10 animate-pulse bg-slate-50/30"></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-black uppercase text-sm tracking-widest opacity-30">Null Result</td></tr>
              ) : currentItems.map((p) => (
                <tr key={p.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-all">
                          <Code2 size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900 tracking-tight uppercase leading-none mb-1">{p.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SLUG: {p.slug || p.id}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        p.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        p.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {p.difficulty}
                      </span>
                      {p.is_arena_problem && (
                        <span className="px-2 py-1 bg-brand-50 text-brand-600 border border-brand-100 rounded-md text-[8px] font-black uppercase tracking-widest">
                          Arena: #{p.hardness_score}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{p.category}</span>
                      {p.creator && <span className="text-[7px] font-bold text-slate-400">BY: {p.creator.username}</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1">
                      {p.tags?.slice(0, 3).map((t, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-[8px] font-black text-slate-500 rounded-md uppercase">
                          {t}
                        </span>
                      ))}
                      {p.tags?.length > 3 && <span className="text-[8px] font-black text-slate-400">+{p.tags.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                       {filterMode === 'pending' && (
                         <button 
                          onClick={() => handleApprove(p)}
                          title="Approve Submission"
                          className="p-3 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                         >
                           <CheckCircle size={16} />
                         </button>
                       )}
                       <button 
                        onClick={() => handleEdit(p)}
                        className="p-3 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                       >
                         <Edit2 size={16} />
                       </button>
                       <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Permanently"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-8 py-4 bg-slate-50 border-t border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest disabled:opacity-50 hover:bg-slate-50 transition-colors"
              >
                Prev
              </button>
              <div className="flex items-center justify-center min-w-[32px] text-[10px] font-black text-slate-400">
                {currentPage} / {totalPages}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest disabled:opacity-50 hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in transition-all">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">
              {editingProblem ? 'Modify Challenge' : 'Repository Injection'}
            </h2>
            <p className="text-xs font-medium text-slate-500 mb-8 lowercase italic">Configuring challenge parameters for the platform environment.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Database ID / Slug</label>
                  <input 
                    type="text" 
                    required
                    disabled={!!editingProblem}
                    value={formData.id}
                    onChange={e => setFormData({...formData, id: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none disabled:opacity-50"
                    placeholder="e.g. two-sum"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Complexity Level</label>
                  <select 
                    value={formData.difficulty}
                    onChange={e => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Associated Course Track</label>
                  <select 
                    value={formData.course}
                    onChange={e => setFormData({...formData, course: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                  >
                    <option value="General">General (No Track)</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.title}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arena Promotion</label>
                  <div className="flex items-center justify-between gap-4 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl">
                     <div className="flex items-center gap-4">
                        <input 
                           type="checkbox"
                           checked={formData.is_arena_problem}
                           onChange={e => setFormData({...formData, is_arena_problem: e.target.checked})}
                           className="w-5 h-5 accent-brand-600 rounded-lg cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Active in Arena</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase">Hardness:</label>
                        <input 
                          type="number"
                          value={formData.hardness_score}
                          onChange={e => setFormData({...formData, hardness_score: parseInt(e.target.value)})}
                          className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none"
                          min="0"
                          max="100"
                        />
                     </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Challenge Designation (Title)</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                  placeholder="e.g. Reverse Linked List"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification (Category)</label>
                <input 
                  type="text" 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                  placeholder="e.g. Data Structures"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specifications (Markdown Description)</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none h-32 resize-none"
                  placeholder="Describe the problem, constraints and expected behavior..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Keywords (Tags - comma separated)</label>
                <input 
                  type="text" 
                  value={formData.tags}
                  onChange={e => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                  placeholder="e.g. Array, String, Two Pointers"
                />
              </div>

              {/* Starter Code Editor */}
              <div className="space-y-3 p-6 bg-slate-50 border border-slate-200 rounded-[2rem]">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Braces size={14} className="text-brand-500" /> Starter Code (JS/Default)
                  </label>
                </div>
                <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    theme="vs"
                    value={typeof formData.starter_code === 'string' ? formData.starter_code : formData.starter_code?.javascript || ''}
                    onChange={(val) => setFormData({
                      ...formData, 
                      starter_code: { ...formData.starter_code, javascript: val }
                    })}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 12,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>

              {/* Test Cases (JSON) */}
              <div className="space-y-3 p-6 bg-slate-50 border border-slate-200 rounded-[2rem]">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ListChecks size={14} className="text-emerald-500" /> Verification Suite (Test Cases JSON)
                  </label>
                </div>
                <textarea 
                  value={JSON.stringify(formData.test_cases, null, 2)}
                  onChange={e => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setFormData({...formData, test_cases: parsed});
                    } catch (err) {
                      // Allow typing invalid JSON temporarily
                      setFormData({...formData, test_cases_raw: e.target.value});
                    }
                  }}
                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-mono focus:ring-4 focus:ring-brand-500/10 transition-all outline-none h-48 resize-none shadow-inner"
                  placeholder='[{"input": "...", "expected": "...", "isHidden": false}]'
                />
              </div>

              {/* Examples & Constraints (Simple list editor) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Constraints (New line per item)</label>
                  <textarea 
                    value={Array.isArray(formData.constraints) ? formData.constraints.join('\n') : ''}
                    onChange={e => setFormData({...formData, constraints: e.target.value.split('\n').filter(l => l.trim())})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none h-32 resize-none"
                    placeholder="e.g. 1 <= nums.length <= 10^5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Examples (Simple JSON Array)</label>
                  <textarea 
                    value={JSON.stringify(formData.examples, null, 2)}
                    onChange={e => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setFormData({...formData, examples: parsed});
                      } catch (err) {}
                    }}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-mono focus:ring-4 focus:ring-brand-500/10 transition-all outline-none h-32 resize-none"
                    placeholder='[{"input": "...", "output": "...", "explanation": "..."}]'
                  />
                </div>
              </div>


              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                >
                  Abort
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-brand-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 hover:bg-brand-500 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {editingProblem ? 'Update Registry' : 'Confirm Injection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {approvingProblem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in transition-all">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Promote to Arena</h2>
            <p className="text-xs font-medium text-slate-500 mb-8">
              You are approving <span className="text-slate-900 font-bold">"{approvingProblem.title}"</span>. 
              Assign a hardness rank to determine its weight in the arena.
            </p>
            
            <div className="space-y-4 mb-8">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hardness Rank (0-100)</label>
              <input 
                type="number"
                min="0"
                max="100"
                value={approveScore}
                onChange={e => setApproveScore(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-center focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleApproveConfirm()}
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setApprovingProblem(null)}
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleApproveConfirm}
                className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-all"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
