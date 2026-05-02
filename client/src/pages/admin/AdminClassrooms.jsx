import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Users, 
  ChevronRight, 
  Trash2, 
  ExternalLink,
  Users2,
  Calendar,
  Lock,
  Globe,
  Settings2
} from 'lucide-react';
import classroomService from '../../services/classroomService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/ui/EmptyState';

export default function AdminClassrooms() {
  const { token } = useAuth();
  const toast = useToast();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', is_public: true });

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const data = await classroomService.getMyClassrooms();
      setClassrooms(data);
    } catch (err) {
      console.error('Failed to fetch classrooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await classroomService.createClassroom(formData);
      setShowModal(false);
      setFormData({ name: '', description: '', is_public: true });
      fetchClassrooms();
      toast.success('Learning node successfully deployed.');
    } catch (err) {
      toast.error('Deployment failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Erase this classroom and all its associated data?')) {
      try {
        await classroomService.deleteClassroom(id);
        setClassrooms(prev => prev.filter(c => c.id !== id));
        toast.info('Learning node decommissioned.');
      } catch (_err) {
        toast.error('Failed to terminate node.');
      }
    }
  };

  const filtered = classrooms.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Classroom Command</h1>
          <p className="text-sm font-medium text-slate-500">Manage learning spaces and enrollment pipelines.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-100 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={16} strokeWidth={3} /> Launch New Space
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in transition-all">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Initialize Terminal</h2>
            <p className="text-xs font-medium text-slate-500 mb-8 lowercase italic">Deploy a new learning node to the platform infrastructure.</p>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Network Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none"
                  placeholder="e.g. Advanced Bio-Engineering"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Configuration Parameters (Desc)</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none h-32 resize-none"
                  placeholder="Specify the learning objectives..."
                />
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.is_public ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                  {formData.is_public ? <Globe size={20} /> : <Lock size={20} />}
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Public Visibility</p>
                   <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Allow students to discover and self-join this node.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, is_public: !formData.is_public})}
                  className={`w-12 h-6 rounded-full transition-all relative ${formData.is_public ? 'bg-brand-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_public ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                >
                  Abort
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] flex justify-center py-4 bg-brand-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 hover:bg-brand-500 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Deploying...' : 'Deploy Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm relative group">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Filter by classroom name or join code..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-[2.5rem] animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="lg:col-span-2">
            <EmptyState 
              icon={BookOpen}
              title="No Active Spaces Found" 
              description="There are no learning nodes matching your criteria. Try adjusting your filters or deploy a new node." 
            />
          </div>
        ) : filtered.map((c) => (
          <div key={c.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-500/20 transition-all group flex flex-col h-full">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <BookOpen size={26} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase leading-none mb-1">{c.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.code}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                  <Settings2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(c.id)}
                  className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                    <Users2 size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Students</p>
                    <p className="text-sm font-black text-slate-900">{c.students?.length || 0}</p>
                  </div>
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Assignments</p>
                    <p className="text-sm font-black text-slate-900">{c.assignments?.length || 0}</p>
                  </div>
               </div>
            </div>

            <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100">
               <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${c.is_public ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                    {c.is_public ? 'Public Access' : 'Private Space'}
                  </span>
               </div>
               <button className="flex items-center gap-2 text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">
                  Enter Detail <ChevronRight size={14} strokeWidth={3} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
