import { useState, useEffect } from 'react'
import { Users, X, PlayCircle, Trophy, Circle, MoreHorizontal, Search, UserPlus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../config/supabaseClient'

export default function FriendsPanel({ isOpen, onClose }) {
  const { user, friends, sendFriendRequest, friendRequests } = useAuth()
  const [activeInvite, setActiveInvite] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [discoveryResults, setDiscoveryResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
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

  // Fetch Discovery Users (Suggestions)
  useEffect(() => {
    const fetchDiscovery = async () => {
      if (view !== 'Discovery' || searchQuery.length > 0) return;
      setIsLoading(true);
      try {
        const friendIds = (friends || []).map(f => f.id);
        const excludeIds = [user?.id, ...friendIds].filter(Boolean);
        
        let query = supabase.from('users').select('*');
        if (excludeIds.length > 0) {
          query = query.not('id', 'in', `(${excludeIds.join(',')})`);
        }
        
        const { data, error } = await query.limit(10);
        if (error) throw error;
        setDiscoveryResults(data || []);
      } catch (err) {
        console.error('Discovery fetch failed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDiscovery();
  }, [view, searchQuery, friends, user]);

  // Search logic
  useEffect(() => {
    const searchPeers = async () => {
      if (searchQuery.length < 1) {
        setSearchResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .or(`username.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
          .limit(10);
          
        if (error) throw error;
        
        // Filter out existing friends and self
        const results = data || [];
        setSearchResults(results.filter(u => 
          u.id !== (user?.id) && 
          !(friends || []).some(f => f.id === u.id)
        ));
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(searchPeers, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, friends, user]);

  const handleAddFriend = async (userId) => {
    const result = await sendFriendRequest(userId);
    if (result.success) {
      // Refresh user data is handled by sendFriendRequest calling fetchUserProfile in real scenario, 
      // but here we just update UI state for immediate feedback
      setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, requestSent: true } : u));
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

             <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-12">
                     <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                     <p className="text-[10px] font-black uppercase text-surface-500 tracking-widest animate-pulse">Syncing Network...</p>
                  </div>
                ) : (searchQuery.length > 0 ? searchResults : discoveryResults).length > 0 ? (
                   (searchQuery.length > 0 ? searchResults : discoveryResults).map((searchUser, idx) => {
                    const isFriend = friends.some(f => f.id === searchUser.id);
                    const hasSent = friendRequests?.some(r => r.from_id === user?.id && r.to_id === searchUser.id) || searchUser.requestSent;
                    const hasIncoming = friendRequests?.some(r => r.to_id === user?.id && r.from_id === searchUser.id);

                    return (
                      <div key={searchUser.id || `search-${idx}`} className="flex items-center justify-between p-4 rounded-3xl bg-surface-900 border border-surface-700 shadow-sm group hover:border-brand-500 transition-all duration-300 animate-fade-in relative overflow-hidden">
                         {/* Subtle Background Accent */}
                         <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-brand-500/10 transition-all" />
                         
                         <div className="flex items-center gap-4 relative z-10">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-surface-800 to-surface-900 border border-surface-700 text-brand-500 flex items-center justify-center font-black text-sm uppercase group-hover:border-brand-500/30 transition-all overflow-hidden">
                                {searchUser.avatar ? (
                                  <img src={searchUser.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  searchUser.username?.charAt(0).toUpperCase() || 'U'
                                )}
                              </div>
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-surface-950" />
                            </div>

                            <div className="min-w-0">
                               <div className="flex items-center gap-2">
                                 <p className="text-[11px] font-black text-surface-200 uppercase tracking-tight truncate transition-colors group-hover:text-white">@{searchUser.username}</p>
                                 <div className="w-1 h-1 rounded-full bg-brand-500/40" />
                                 <p className="text-[8px] font-black text-brand-500 uppercase tracking-widest">{searchUser.xp || 0}XP</p>
                               </div>
                               <p className="text-[9px] font-bold text-surface-500 uppercase tracking-wide truncate mt-0.5">{searchUser.name || 'Incognito User'}</p>
                            </div>
                         </div>

                         <div className="relative z-10 flex flex-col gap-1.5 shrink-0">
                           {isFriend ? (
                             <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                               <Circle size={16} className="fill-emerald-500" />
                             </div>
                           ) : hasSent ? (
                             <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
                               <Loader2 size={16} className="animate-spin" />
                             </div>
                           ) : hasIncoming ? (
                             <button className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all">
                               <UserPlus size={18} />
                             </button>
                           ) : (
                             <button 
                               onClick={() => handleAddFriend(searchUser.id)}
                               className="w-10 h-10 rounded-xl bg-surface-950 border border-surface-700 text-surface-400 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all shadow-lg flex items-center justify-center group/btn"
                               title="Add Friend"
                             >
                               <UserPlus size={18} className="group-hover/btn:scale-110 transition-transform" />
                             </button>
                           )}
                         </div>
                      </div>
                    );
                   })
                ) : searchQuery.length >= 1 ? (
                  <div className="text-center py-12 px-6">
                     <div className="w-12 h-12 bg-surface-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-surface-600 border border-surface-700">
                        <X size={20} />
                     </div>
                     <p className="text-[10px] font-black uppercase text-surface-400 tracking-widest mb-1">Signal Lost</p>
                     <p className="text-[9px] font-bold text-surface-500 uppercase">No peers found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="text-center py-16 px-8 bg-surface-900/20 rounded-3xl border border-dashed border-surface-700/50">
                     <div className="w-14 h-14 bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-5 text-surface-600 shadow-inner">
                        <Users size={28} />
                     </div>
                     <p className="text-[11px] font-black uppercase text-surface-200 tracking-[0.2em] mb-2 opacity-80">Collective Void</p>
                     <p className="text-[9px] font-bold text-surface-500 uppercase leading-relaxed tracking-wider">Expand your network to unlock collaborative features and peer challenges.</p>
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
                  key={friend.id || `friend-${idx}`}
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
      <div className="p-6 bg-surface-950/80 backdrop-blur-xl border-t border-surface-700 shrink-0">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-surface-900 border border-surface-700 flex items-center justify-center text-xs font-black text-brand-500 overflow-hidden shadow-inner">
                     {user?.user_metadata?.avatar || user?.avatar ? (
                       <img src={user.user_metadata?.avatar || user.avatar} alt="" className="w-full h-full object-cover" />
                     ) : (
                       user?.user_metadata?.username?.charAt(0).toUpperCase() || 'U'
                     )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-surface-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               </div>
               <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-surface-200 uppercase tracking-[0.2em]">{user?.user_metadata?.username || 'Pilot'}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active Signal</p>
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </aside>
  );
}
