import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  ExternalLink,
  Users2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import classroomService from '../../services/classroomService';

export default function AdminAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const classrooms = await classroomService.getMyClassrooms();
      let globalList = [];
      classrooms.forEach(c => {
        if (c.assignments) {
          c.assignments.forEach(a => {
            globalList.push({ 
              ...a, 
              classroomId: c.id, 
              classroomName: c.name 
            });
          });
        }
      });
      // Sort by newest
      globalList.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
      setAssignments(globalList);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = assignments.filter(a => 
    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.classroomName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Assignment Oversight</h1>
          <p className="text-sm font-medium text-slate-500">Track and manage coding tasks across the platform.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
             Export Report
           </button>
            <button 
              onClick={() => navigate('/admin/classrooms')}
              className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-100 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Plus size={16} strokeWidth={3} /> New Deployment
            </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 gap-4">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Filter assignments or classrooms..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 shadow-sm transition-all">
            <Filter size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Challenge Detail</th>
                <th className="px-8 py-5">Target Environment</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Deadlines</th>
                <th className="px-8 py-5 text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-8 py-6 animate-pulse bg-slate-50/30"></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-black uppercase text-xs tracking-widest">No Active Assignments</td></tr>
              ) : filtered.map((a) => (
                <tr key={a.id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                          <FileText size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{a.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{(a.problem_ids || []).length} Challenges</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                          <Users2 size={12} />
                       </div>
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{a.classroomName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${
                      new Date(a.due_date) < new Date() 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {new Date(a.due_date) < new Date() ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                      {new Date(a.due_date) < new Date() ? 'Past Due' : 'Active'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-400">
                       <Clock size={14} />
                       <span className="text-[10px] font-black uppercase tracking-widest">{new Date(a.due_date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                       <button className="p-3 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                       <button className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                       <button className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
