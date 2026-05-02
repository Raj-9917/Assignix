import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Trash2, 
  Search, 
  Users, 
  Calendar, 
  Clock, 
  ShieldAlert,
  Flame,
  Activity,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';

export default function AdminChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllChallenges();
      setChallenges(data);
    } catch (err) {
      console.error('Fetch challenges error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Terminate this arena room? This action is irreversible and will remove all participant data.')) {
      try {
        await adminService.deleteChallenge(id);
        setChallenges(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        console.error('Delete challenge error:', err);
        alert('Failed to terminate challenge: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleJoinInspection = (id) => {
    navigate(`/room/${id}`);
  };

  const filtered = challenges.filter(c => 
    c.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:items-start justify-between gap-2">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Arena Oversight</h1>
        <p className="text-sm font-medium text-slate-500 italic">Monitoring active competitive rooms and private sessions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Rooms</p>
            <p className="text-2xl font-black text-slate-900">{challenges.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Participants</p>
            <p className="text-2xl font-black text-slate-900">
              {challenges.reduce((acc, curr) => acc + (curr.participant_count || 0), 0)}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement Rate</p>
            <p className="text-2xl font-black text-slate-900">High</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm group">
        <Search className="ml-4 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Locate specific arena room by name or admin..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:ring-0 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-[2rem] animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="md:col-span-2 py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">No Active Arenas Detected</p>
          </div>
        ) : filtered.map((c) => (
          <div key={c.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-rose-500/5 hover:border-rose-100 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-16 -translate-y-16 group-hover:bg-rose-50 transition-colors" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-rose-600 group-hover:text-white group-hover:rotate-12 transition-all duration-500">
                    <Trophy size={26} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase leading-none mb-1">{c.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                        c.is_private ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {c.is_private ? 'Private' : 'Public'}
                      </span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                      {c.room_code && (
                        <>
                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                          <span className="text-[9px] font-black text-brand-600 uppercase tracking-widest">
                            CODE: {c.room_code}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(c.id)}
                  className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all relative z-10"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                    <div className="flex items-center gap-2 mb-1 text-slate-400">
                      <Users size={14} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Active Seats</span>
                    </div>
                    <p className="text-lg font-black text-slate-900">{c.participant_count || 0}</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                    <div className="flex items-center gap-2 mb-1 text-slate-400">
                      <Clock size={14} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Time Limit</span>
                    </div>
                    <p className="text-lg font-black text-slate-900">{c.time_limit}m</p>
                 </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold">
                 <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="uppercase tracking-widest">Live Tracking</span>
                 </div>
                 <button 
                  onClick={() => handleJoinInspection(c.id)}
                  className="flex items-center gap-1 text-brand-600 hover:translate-x-1 transition-transform uppercase tracking-widest"
                 >
                   Join Inspection <ChevronRight size={14} />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
