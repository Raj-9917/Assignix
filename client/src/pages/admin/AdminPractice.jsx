import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Layers, 
  Settings2, 
  Trash2, 
  Edit2, 
  ChevronRight,
  Layout,
  Palette,
  ExternalLink
} from 'lucide-react';
import adminService from '../../services/adminService';

export default function AdminPractice() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const initialForm = {
    id: '',
    title: '',
    description: '',
    category: 'Algorithms',
    thumbnail: '',
    color: '#6366f1',
    difficulty: 'Easy'
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllCourses();
      setCourses(data);
    } catch (err) {
      console.error('Fetch courses error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await adminService.updateCourse(editingCourse.id, formData);
      } else {
        const { id, ...createData } = formData;
        await adminService.createCourse({ ...createData, slug: id });
      }
      setShowModal(false);
      setEditingCourse(null);
      setFormData(initialForm);
      fetchCourses();
    } catch (err) {
      alert('Operation failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (c) => {
    setEditingCourse(c);
    setFormData({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      thumbnail: c.thumbnail || '',
      color: c.color || '#6366f1',
      difficulty: c.difficulty || 'Easy'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this learning track? This will remove the track and its metadata. Problems linked via slug will remain in the registry.')) {
      try {
        await adminService.deleteCourse(id);
        setCourses(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        console.error('Delete course error:', err);
        alert('Failed to delete course: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const filtered = courses.filter(c => 
    c.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Training Grounds Hub</h1>
          <p className="text-sm font-medium text-slate-500">Curate tracks and warriors for the Training Grounds ecosystem.</p>
        </div>
        <button 
          onClick={() => { setEditingCourse(null); setFormData(initialForm); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-100 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={16} strokeWidth={3} /> Launch New Track
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm group">
        <Search className="ml-4 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Search learning tracks by title or category..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:ring-0 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-[2.5rem] animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="md:col-span-3 py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">No tracks detected in the hub</p>
          </div>
        ) : filtered.map((c) => (
          <div key={c.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col">
             <div className="h-32 relative overflow-hidden bg-slate-100">
                <div 
                  className="absolute inset-0 opacity-20 group-hover:scale-110 transition-transform duration-700"
                  style={{ backgroundColor: c.color }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Layout size={48} className="text-slate-400 group-hover:text-slate-900 transition-colors" opacity={0.2} />
                </div>
                <div className="absolute top-6 right-6 flex gap-2">
                   <button 
                    onClick={() => handleEdit(c)}
                    className="p-2.5 bg-white/90 backdrop-blur rounded-xl text-slate-600 hover:text-brand-600 hover:bg-white transition-all shadow-sm"
                   >
                      <Edit2 size={16} />
                   </button>
                   <button 
                    onClick={() => handleDelete(c.id)}
                    className="p-2.5 bg-white/90 backdrop-blur rounded-xl text-slate-600 hover:text-rose-600 hover:bg-white transition-all shadow-sm"
                   >
                      <Trash2 size={16} />
                   </button>
                </div>
             </div>
             <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                   <span className="px-2 py-0.5 bg-slate-100 text-[8px] font-black text-slate-500 uppercase rounded-md tracking-widest">{c.category}</span>
                   <span className="w-1 h-1 bg-slate-300 rounded-full" />
                   <span className="text-[8px] font-black text-brand-600 uppercase tracking-widest italic">{c.difficulty}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2 leading-tight group-hover:text-brand-600 transition-colors">{c.title}</h3>
                <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-6 lowercase">{c.description}</p>
                
                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                   <div className="flex -space-x-2">
                      {[1,2,3].map(v => (
                         <div key={v} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                      ))}
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[7px] font-black text-slate-400">+12</div>
                   </div>
                   <span className="text-[10px] font-black uppercase text-slate-400">{c.problem_count || 0} Challenges</span>
                </div>
             </div>
          </div>
        ))}
      </div>

       {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in transition-all">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">
              {editingCourse ? 'Configure Track' : 'Establish New Course'}
            </h2>
            <p className="text-xs font-medium text-slate-500 mb-8 lowercase italic">Defining the curriculum and visual identity for the hub.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unique Key (ID)</label>
                  <input 
                    type="text" 
                    required
                    disabled={!!editingCourse}
                    value={formData.id}
                    onChange={e => setFormData({...formData, id: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none disabled:opacity-50"
                    placeholder="e.g. ds-algo"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Theme Color</label>
                  <div className="flex gap-4">
                     <input 
                      type="color" 
                      value={formData.color}
                      onChange={e => setFormData({...formData, color: e.target.value})}
                      className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={formData.color}
                      onChange={e => setFormData({...formData, color: e.target.value})}
                      className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Track Designation (Title)</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                  placeholder="e.g. Master the Algorithmic Logic"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification</label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                    placeholder="e.g. Logic Labs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Skill</label>
                  <select 
                    value={formData.difficulty}
                    onChange={e => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none ring-offset-0 focus:ring-4 focus:ring-brand-500/10 transition-all"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Syllabus Overview (Description)</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none h-24 resize-none"
                  placeholder="Summary of learning outcomes and modules..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-brand-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 hover:bg-brand-500 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {editingCourse ? 'Save Specs' : 'Deploy Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
