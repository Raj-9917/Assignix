import React, { useState } from 'react';
import { X, Send, Code2, Plus, Trash2, Info } from 'lucide-react';
import { problemService } from '../../services/problemService';
import { useToast } from '../../context/ToastContext';

export default function ProblemSubmissionModal({ isOpen, onClose }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    difficulty: 'Hard',
    category: 'Algorithms',
    description: '',
    tags: '',
    starterCode: { javascript: '// Write your starter code here' }
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Ensure slug is URL friendly
      const cleanData = {
        ...formData,
        id: formData.id.toLowerCase().replace(/\s+/g, '-'),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        isArenaProblem: true, // All user submissions are arena candidates
        isApproved: false // Explicitly land in Submission Registry
      };
      
      await problemService.createProblem(cleanData);
      toast.success('Challenge submitted for transmission! Awaiting Admin clearance.');
      onClose();
    } catch (_err) {
      toast.error(error.response?.data?.message || 'Transmission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-surface-950/80 backdrop-blur-md animate-in fade-in transition-all">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col border border-surface-700">
        
        {/* Header */}
        <div className="px-10 py-8 bg-surface-900 border-b border-surface-700 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Code2 className="text-brand-500" /> Challenge Forge
            </h2>
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">Submit high-level problems to the Global Arena</p>
          </div>
          <button onClick={onClose} className="p-3 bg-surface-800 text-surface-400 hover:text-white rounded-2xl transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
          
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest ml-1">Registry ID (Slug)</label>
              <input 
                type="text" 
                required
                value={formData.id}
                onChange={p => setFormData({...formData, id: p.target.value})}
                placeholder="e.g. quantum-sorting"
                className="w-full px-6 py-4 bg-slate-50 border border-surface-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest ml-1">Difficulty Intent</label>
              <select 
                value={formData.difficulty}
                onChange={p => setFormData({...formData, difficulty: p.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-surface-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
              >
                <option>Hard</option>
                <option>Medium</option>
                <option>Easy</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest ml-1">Challenge Designation (Title)</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={p => setFormData({...formData, title: p.target.value})}
              placeholder="e.g. Reverse a High-Density Stream"
              className="w-full px-6 py-4 bg-slate-50 border border-surface-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest ml-1">Specifications (Markdown)</label>
            <textarea 
              required
              value={formData.description}
              onChange={p => setFormData({...formData, description: p.target.value})}
              placeholder="Detailed description of the problem, constraints, and edge cases..."
              className="w-full px-6 py-4 bg-slate-50 border border-surface-700 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none h-40 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest ml-1">Domain (Category)</label>
              <input 
                type="text" 
                value={formData.category}
                onChange={p => setFormData({...formData, category: p.target.value})}
                placeholder="e.g. Cryptography"
                className="w-full px-6 py-4 bg-slate-50 border border-surface-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest ml-1">Metadata Tags (CSV)</label>
              <input 
                type="text" 
                value={formData.tags}
                onChange={p => setFormData({...formData, tags: p.target.value})}
                placeholder="Security, Performance, Logic"
                className="w-full px-6 py-4 bg-slate-50 border border-surface-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
              />
            </div>
          </div>

          <div className="p-6 rounded-[2rem] bg-amber-50 border border-amber-200 flex gap-4">
             <Info className="text-amber-600 shrink-0" size={20} />
             <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-tight">
                Submission Protocol: All contributions are encrypted and forwarded to System Admins. Upon verification, your challenge will be ranked by hardness and deployed to the Arena.
             </p>
          </div>

        </form>

        {/* Footer */}
        <div className="p-10 bg-slate-50 border-t border-surface-700 shrink-0">
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-5 bg-brand-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 hover:bg-brand-500 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? 'Encrypting...' : <><Send size={18} /> Transmit Challenge</>}
          </button>
        </div>

      </div>
    </div>
  );
}
