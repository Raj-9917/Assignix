import { useState, useEffect } from 'react'
import { Users, X, PlayCircle, Trophy, Circle, MoreHorizontal, Search, UserPlus, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import API_URL from '../../config/api'

export default function FriendsPanel({ isOpen, onClose }) {
  const { friends, token, addFriend } = useAuth()
  const [activeInvite, setActiveInvite] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [view, setView] = useState('Online') // Online, All, Discovery

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-emerald-500 fill-emerald-500';
      case 'away':   return 'text-amber-500 fill-amber-500';
      default:       return 'text-surface-600 fill-surface-600';
    }
  };

  const handleInvite = (friendName, type) => {
    setActiveInvite({ friend: friendName, type });
    setTimeout(() => setActiveInvite(null), 2000);
  };

  // Mock user discovery logic (in real app, this calls /api/auth/search)
  useEffect(() => {
    const searchPeers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      if (!token) return;
      setIsSearching(true);
      try {
        const response = await fetch(`${API_URL}/auth/search?query=${searchQuery}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const results = Array.isArray(data) ? data : [];
          // Filter out existing friends and self
          setSearchResults(results.filter(u => !(friends || []).some(f => f._id === u._id)));
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchPeers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, friends, token, setIsSearching]);

  const handleAddFriend = async (userId) => {
    const result = await addFriend(userId);
    if (result.success) {
      setSearchResults(prev => prev.filter(u => u._id !== userId));
    }
  };

  return (
    <aside
      className={`fixed top-0 right-0 h-full w-80 glass border-l border-surface-700 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-surface-700 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 border border-brand-500/20">
            <Users size={18} />
          </div>
          <h2 className="text-sm font-black text-surface-200 uppercase tracking-widest">Peers</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-surface-500 hover:text-brand-600 hover:bg-surface-800 transition-all font-bold"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4 border-b border-surface-700 shrink-0">
         <div className="flex items-center gap-6 text-[10px] font-black text-surface-500 uppercase tracking-widest overflow-x-auto no-scrollbar">
            {['Online', 'All', 'Discovery'].map(t => (
              <button 
                key={t} 
                onClick={() => setView(t)}
                className={`whitespace-nowrap transition-all pb-1 border-b-2 ${
                  view === t ? 'text-brand-600 border-brand-600' : 'border-transparent hover:text-surface-200'
                }`}
              >
                {t} {t === 'Online' && `(${(friends || []).filter(f => f.status === 'online').length})`}
              </button>
            ))}
         </div>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {view === 'Discovery' ? (
          <div className="space-y-6">
             <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
                <input 
                  placeholder="Find peers by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-surface-200 focus:outline-none focus:border-brand-600 transition-all"
                />
             </div>

             <div className="space-y-2">
                {isSearching ? (
                  <div className="text-center py-8">
                     <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                     <p className="text-[10px] font-black uppercase text-surface-500 tracking-widest">Scanning Network...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user, idx) => (
                    <div key={user._id || user.id || `search-${idx}`} className="flex items-center justify-between p-3 rounded-2xl bg-surface-800/50 border border-surface-700 shadow-sm group hover:border-brand-600 transition-all animate-fade-in">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-black text-sm uppercase">
                             {user.username.charAt(0)}
                          </div>
                          <div>
                             <p className="text-xs font-black text-surface-200 uppercase tracking-tight">{user.username}</p>
                             <p className="text-[9px] font-bold text-surface-500 uppercase">{user.name}</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => handleAddFriend(user._id)}
                         className="p-2.5 rounded-lg bg-brand-500/10 text-brand-500 hover:bg-brand-600 hover:text-white transition-all shadow-sm"
                         title="Add Friend"
                       >
                         <UserPlus size={16} />
                       </button>
                    </div>
                  ))
                ) : searchQuery.length >= 2 ? (
                  <div className="text-center py-8">
                     <p className="text-xs font-bold text-surface-500 italic">No peers found with that handle.</p>
                  </div>
                ) : (
                  <div className="text-center py-12 px-6">
                     <div className="w-12 h-12 bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-surface-600">
                        <Users size={24} />
                     </div>
                     <p className="text-[10px] font-black uppercase text-surface-300 tracking-widest mb-1 italic opacity-60">Expand your collective</p>
                     <p className="text-[9px] font-bold text-surface-500 uppercase leading-relaxed">Search for other students to compare progress and challenge them.</p>
                  </div>
                )}
             </div>
          </div>
        ) : (
          <div className="space-y-2">
            {(friends || []).length > 0 ? (
              (friends || [])
                .filter(f => view === 'All' || f.status === 'online')
                .map((friend, idx) => (
                <div
                  key={friend._id || friend.id || `friend-${idx}`}
                  className="group relative p-3 rounded-2xl bg-surface-800/50 hover:bg-surface-800 transition-all duration-200 border border-surface-700 shadow-sm animate-fade-in"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-2xl bg-surface-900 flex items-center justify-center text-surface-200 font-black text-sm border border-surface-700 group-hover:bg-brand-600 group-hover:text-white transition-all">
                        {friend.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-surface-900 bg-surface-900 flex items-center justify-center`}>
                        <Circle className={getStatusColor(friend.status || 'offline')} size={10} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-surface-200 truncate tracking-tight uppercase">{friend.username}</p>
                      <p className="text-[10px] text-surface-500 font-black tracking-tight truncate uppercase opacity-60">{friend.status || 'Offline'}</p>
                    </div>
                    <button className="p-2 rounded-lg text-surface-600 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-all">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-surface-900/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-2xl px-4">
                      <button 
                        onClick={() => handleInvite(friend.username, 'practice')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm ${
                          activeInvite?.friend === friend.username && activeInvite?.type === 'practice'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-brand-500/10 text-brand-500 border-brand-500/20 hover:bg-brand-600 hover:text-white'
                        }`}
                      >
                        {activeInvite?.friend === friend.username && activeInvite?.type === 'practice' ? 'Sent ✓' : <><PlayCircle size={14} /> Practice</>}
                      </button>
                      <button 
                        onClick={() => handleInvite(friend.username, 'challenge')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm ${
                          activeInvite?.friend === friend.username && activeInvite?.type === 'challenge'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white'
                        }`}
                      >
                        {activeInvite?.friend === friend.username && activeInvite?.type === 'challenge' ? 'Sent ✓' : <><Trophy size={14} /> Challenge</>}
                      </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 px-6">
                <p className="text-[10px] font-black uppercase text-surface-300 tracking-widest mb-1 italic opacity-60">The void is silent</p>
                <p className="text-[9px] font-bold text-surface-500 uppercase leading-relaxed">Head to Discovery track down your peers.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* My Status */}
      <div className="p-6 bg-surface-950/50 border-t border-surface-700 shrink-0">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               </div>
               <div className="space-y-0.5 font-sans">
                  <p className="text-[10px] font-black text-surface-200 uppercase tracking-widest">Transmitting</p>
                  <p className="text-[9px] font-bold text-surface-500 uppercase">Status: Online</p>
               </div>
            </div>
         </div>
      </div>
    </aside>
  );
}
