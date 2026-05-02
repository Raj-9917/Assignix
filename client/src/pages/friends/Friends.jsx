import { useState, useEffect } from 'react'
import { Users, Search, PlayCircle, Trophy, UserMinus, ShieldCheck, Mail, Sparkles, UserPlus, Loader2, AlertCircle, Check, X, Circle } from 'lucide-react'
import PageShell from '../../components/ui/PageShell'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../config/supabaseClient'
export default function Friends() {
  const { user, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend: unfriendLogic, refreshUser } = useAuth()
  const toast = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [filter, setFilter] = useState('All')
  const [activeInvite, setActiveInvite] = useState(null)
  const [loading, setLoading] = useState(false)
  const [discoveryResults, setDiscoveryResults] = useState([])
  const [isDiscoveryLoading, setIsDiscoveryLoading] = useState(false)
  const [requestLoading, setRequestLoading] = useState({})

  // Derived data from context - ensures sync
  const friends = user?.friends || []
  const friendRequests = user?.friendRequests || []

  // Refresh user data on mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Fetch discovery users (suggested connections)
  useEffect(() => {
    const fetchDiscovery = async () => {
      if (!user?.id) return;
      setIsDiscoveryLoading(true);
      try {
        // Exclude self and current friends
        const friendIds = friends.map(f => f.id || f);
        const excludeIds = [user.id, ...friendIds];
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .not('id', 'in', excludeIds)
          .limit(6);
          
        if (error) throw error;
        setDiscoveryResults(data || []);
      } catch (error) {
        console.error('Discovery failed:', error);
      } finally {
        setIsDiscoveryLoading(false);
      }
    };

    if (user?.id) fetchDiscovery();
  }, [user?.id, friends.length]); // Using friends.length to re-trigger on change

  // Debounced search for users using the global search API
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 1) {
        setIsSearching(true);
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .or(`username.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
            .limit(20);
            
          if (error) throw error;
          setSearchResults(data || []);
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSendRequest = async (friendId) => {
    setRequestLoading(prev => ({ ...prev, [friendId]: true }));
    // Find name from search/discovery results for the toast
    const targetUser = [...searchResults, ...discoveryResults].find(u => u.id === friendId);
    const result = await sendFriendRequest(friendId);
    if (result.success) {
      setActiveInvite({ name: targetUser?.name || 'User', type: 'Friend Request' });
      setTimeout(() => setActiveInvite(null), 3000);
      // Remove from search/discovery results to reflect "Sent" state
      setSearchResults(prev => prev.filter(u => u.id !== friendId));
      setDiscoveryResults(prev => prev.filter(u => u.id !== friendId));
    } else {
      toast.error(result.message || 'Failed to send request');
    }
    setRequestLoading(prev => ({ ...prev, [friendId]: false }));
  };

  const handleAccept = async (requestId) => {
    const result = await acceptFriendRequest(requestId);
    if (result.success) {
      toast.success('Connection established successfully!');
      refreshUser();
    } else {
      toast.error(result.message || 'Failed to accept request');
    }
  };

  const handleReject = async (requestId) => {
    const result = await rejectFriendRequest(requestId);
    if (result.success) {
      toast.info('Connection request declined');
      refreshUser();
    } else {
      toast.error(result.message || 'Failed to reject request');
    }
  };

  const handleRemoveFriend = async (id) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      const result = await unfriendLogic(id);
      if (result.success) {
        toast.info('Friend removed from your network');
        refreshUser();
      } else {
        toast.error(result.message || 'Failed to remove friend');
      }
    }
  }

  const handleAction = (friendName, type) => {
    setActiveInvite({ name: friendName, type })
    setTimeout(() => setActiveInvite(null), 3000)
  }

  // Filter friends based on UI selection
  const filteredFriends = friends.filter(friend => {
    if (filter === 'All') return true;
    if (filter === 'Active') return true; // Could add online status check here if needed
    return false;
  });

  const incomingRequests = friendRequests.filter(r => r.to_id === user?.id && r.status === 'pending');
  const outgoingRequests = friendRequests.filter(r => r.from_id === user?.id && r.status === 'pending');

  const stats = [
    { label: 'Total Friends', val: friends.length, icon: Users, color: 'text-brand-600' },
    { label: 'Network Points', val: friends.reduce((acc, f) => acc + (f.xp || 0), 0), icon: Trophy, color: 'text-emerald-600' },
    { label: 'Member Type', val: user?.role || 'Student', icon: ShieldCheck, color: 'text-amber-600' }
  ]

  return (
    <PageShell
      title="Friends"
      subtitle="Connect with peers, collaborate on problems, and build your professional network."
      icon={Users}
    >
      <div className="space-y-12 pb-20 animate-fade-in">
        {/* Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {stats.map((stat, i) => (
              <div key={i} className="p-8 rounded-[2.5rem] bg-surface-900 border border-surface-700 shadow-sm flex items-center gap-6 group hover:border-brand-500/30 transition-all">
                 <div className={`w-14 h-14 rounded-2xl bg-surface-800 ${stat.color} flex items-center justify-center border border-surface-700 shadow-inner group-hover:scale-110 transition-transform`}>
                    <stat.icon size={26} strokeWidth={2.5} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest leading-none">{stat.label}</p>
                    <h3 className="text-2xl font-black text-surface-300 tracking-tight leading-none pt-2 uppercase">{stat.val}</h3>
                 </div>
              </div>
           ))}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative group w-full md:w-96">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 group-focus-within:text-brand-600 transition-colors">
              {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
            </div>
            <input
              type="text"
              placeholder="Search users by @username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-surface-900 border border-surface-700
                text-surface-300 text-sm font-bold placeholder:text-surface-600
                focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500
                transition-all duration-300 shadow-sm"
            />
          </div>

          <div className="flex bg-surface-900 rounded-2xl p-1.5 border border-surface-700 shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar">
            {['All', 'Active', 'Pending'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                  ${filter === f
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                    : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Toast Notification */}
        {activeInvite && (
          <div className="fixed bottom-10 right-10 z-[100] animate-slide-up">
            <div className="px-10 py-6 rounded-[2.5rem] bg-surface-900 border border-brand-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl flex items-center gap-6 min-w-[320px]">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Sparkles size={24} className="text-white" fill="white" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500">{activeInvite.type} Dispatched</p>
                <p className="text-sm font-bold text-surface-100 tracking-tight">
                  Signal sent to <span className="text-brand-400">@{activeInvite.name}</span> successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Discovery & Search Results Section */}
        {(searchResults.length > 0 || (searchTerm === '' && discoveryResults.length > 0 && filter === 'All')) && (
          <div className="space-y-6 animate-fade-in-up">
             <div className="flex items-center gap-3 ml-2">
                <Sparkles size={18} className="text-brand-600" />
                <h4 className="text-[10px] font-black text-surface-400 uppercase tracking-widest">
                  {searchTerm === '' ? 'Discover New Connections' : 'Global Search Results'}
                </h4>
             </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {(searchTerm === '' ? discoveryResults : searchResults).map((searchUser) => {
                  const isFriend = friends.some(f => (f.id || f) === searchUser.id);
                  const hasIncoming = incomingRequests.some(r => r.from_id === searchUser.id);
                  const hasOutgoing = outgoingRequests.some(r => r.to_id === searchUser.id);
                  
                  return (
                    <div key={searchUser.id} className="rounded-[3rem] bg-surface-900 border border-brand-500/20 shadow-xl shadow-brand-500/5 group hover:border-brand-500/40 transition-all overflow-hidden">
                      {searchUser.id === user?.id ? (
                        <div className="p-10 flex items-center justify-center">
                          <div className="px-8 py-3 bg-surface-800 text-surface-500 border border-surface-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em]">
                            Local Origin (You)
                          </div>
                        </div>
                      ) : (
                        <div className="p-8">
                          <div className="flex items-center justify-between gap-8">
                            {/* Left: Profile Info */}
                            <div className="flex items-center gap-6">
                              <div className="relative group/avatar">
                                <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-surface-800 to-surface-900 border border-surface-700 flex items-center justify-center text-3xl font-black text-brand-500 shadow-2xl group-hover/avatar:border-brand-500 transition-all overflow-hidden relative">
                                  <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                                  {searchUser.avatar ? (
                                    <img src={searchUser.avatar} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    searchUser.username?.charAt(0).toUpperCase() || 'U'
                                  )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-surface-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-xl font-black text-surface-200 tracking-tight uppercase transition-colors">
                                    @{searchUser.username}
                                  </h3>
                                  <div className="px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full text-[9px] font-black text-brand-500 uppercase tracking-widest shadow-sm">
                                    {searchUser.role || 'Student'}
                                  </div>
                                </div>
                                <p className="text-sm font-bold text-surface-500 uppercase tracking-wide">
                                  {searchUser.name || 'Anonymous Coder'}
                                </p>
                                <div className="flex items-center gap-4 pt-1">
                                  <div className="flex items-center gap-1.5">
                                    <Trophy size={14} className="text-amber-500" />
                                    <span className="text-[10px] font-black text-surface-400 uppercase tracking-tighter">{searchUser.xp || 0} XP</span>
                                  </div>
                                  <div className="w-1 h-1 rounded-full bg-surface-700" />
                                  <div className="flex items-center gap-1.5">
                                    <Circle size={14} className="text-brand-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                                    <span className="text-[10px] font-black text-surface-400 uppercase tracking-tighter">{searchUser.streak || 0} Streak</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex flex-col gap-3 min-w-[180px]">
                              {isFriend ? (
                                <>
                                  <button className="w-full py-3.5 bg-brand-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <PlayCircle size={16} /> Practice
                                  </button>
                                  <button className="w-full py-3.5 bg-surface-800 text-surface-200 border border-surface-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-surface-700 transition-all flex items-center justify-center gap-2">
                                    <Trophy size={16} className="text-amber-500" /> Challenge
                                  </button>
                                </>
                              ) : hasOutgoing ? (
                                <div className="w-full py-4.5 bg-brand-500/10 text-brand-500 border border-brand-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                                  <Loader2 size={16} className="animate-spin" /> Pending Approval
                                </div>
                              ) : hasIncoming ? (
                                <button className="w-full py-4.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                                  <UserPlus size={16} /> Accept Invite
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSendRequest(searchUser.id)}
                                  disabled={requestLoading[searchUser.id]}
                                  className="w-full py-4.5 bg-surface-950 text-surface-200 border border-surface-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:border-brand-600 hover:text-brand-500 transition-all group/btn relative overflow-hidden flex items-center justify-center gap-3"
                                >
                                  {requestLoading[searchUser.id] ? (
                                    <Loader2 size={16} className="animate-spin" />
                                  ) : (
                                    <>
                                      <div className="absolute inset-0 bg-brand-600 opacity-0 group-hover/btn:opacity-10 transition-opacity" />
                                      <UserPlus size={16} className="group-hover/btn:scale-110 transition-transform" /> 
                                      Connect Now
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
          </div>
        )}

         {/* Active Requests section */}
         {filter !== 'Pending' && incomingRequests.length > 0 && (
            <div className="space-y-6 animate-fade-in">
               <div className="flex items-center gap-3 ml-2">
                  <Mail size={18} className="text-amber-500" />
                  <h4 className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Incoming Requests</h4>
               </div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {incomingRequests.map((request) => (
                     <div key={request.id} className="p-8 rounded-[3rem] bg-surface-900 border-2 border-amber-500/20 shadow-xl flex items-center justify-between gap-6 transition-all">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
                              {request.sender?.avatar || request.sender?.name?.charAt(0).toUpperCase()}
                           </div>
                           <div className="space-y-1">
                              <h4 className="text-lg font-black text-surface-300 uppercase tracking-tight">{request.sender?.name}</h4>
                              <p className="text-[10px] font-black text-amber-600 lowercase tracking-tight opacity-60">@{request.sender?.username}</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => handleAccept(request.id)}
                             className="p-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-md active:scale-95"
                             title="Accept"
                           >
                              <Check size={20} strokeWidth={3} />
                           </button>
                           <button 
                             onClick={() => handleReject(request.id)}
                             className="p-3 rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-all shadow-md active:scale-95"
                             title="Reject"
                           >
                              <X size={20} strokeWidth={3} />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

        {/* Primary Data Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 ml-2">
             {filter === 'Pending' ? (
               <Mail size={18} className="text-amber-500" />
             ) : (
               <Users size={18} className="text-surface-500" />
             )}
             <h4 className="text-[10px] font-black text-surface-400 uppercase tracking-widest">
               {filter === 'Pending' ? 'Pending Connection Requests' : 'Your Professional Network'}
             </h4>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {loading ? (
              <div className="col-span-full py-20 flex flex-col items-center gap-4">
                 <Loader2 size={48} className="animate-spin text-brand-600 opacity-20" />
                 <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Syncing connection hub...</p>
              </div>
            ) : filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <div key={friend.id} className="group p-10 rounded-[3.5rem] bg-surface-900 border border-surface-700/50 hover:border-brand-500 transition-all shadow-2xl relative overflow-hidden">
                  {/* Background Aura */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/5 blur-[100px] group-hover:bg-brand-500/10 transition-all" />
                  
                  <div className="flex items-center justify-between gap-10 relative z-10">
                    <div className="flex items-center gap-8">
                      <div className="relative group/avatar">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-surface-800 to-surface-950 border border-surface-700 flex items-center justify-center text-4xl font-black text-brand-500 shadow-2xl group-hover:border-brand-500/50 transition-all overflow-hidden relative">
                          <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {friend.avatar ? (
                            <img src={friend.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            friend.username?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-surface-950 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h4 className="text-2xl font-black text-surface-200 uppercase tracking-tight transition-colors group-hover:text-white">@{friend.username}</h4>
                          <div className="px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full text-[9px] font-black text-brand-500 uppercase tracking-widest shadow-sm">
                            {friend.role || 'Member'}
                          </div>
                        </div>
                        <p className="text-sm font-bold text-surface-500 uppercase tracking-wide">
                          {friend.name || 'Anonymous Coder'}
                        </p>
                        <div className="flex items-center gap-5 pt-2">
                          <div className="flex items-center gap-2">
                            <Trophy size={14} className="text-amber-500" />
                            <span className="text-[11px] font-black text-surface-400 uppercase tracking-widest">{friend.xp || 0} XP</span>
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-surface-800" />
                          <div className="flex items-center gap-2">
                            <Circle size={14} className="text-brand-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                            <span className="text-[11px] font-black text-surface-400 uppercase tracking-widest">{friend.streak || 0} STREAK</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 min-w-[200px]">
                      <button 
                        onClick={() => handleAction(friend.username, 'Practice')}
                        className="w-full py-4 bg-brand-600 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.25em] shadow-xl shadow-brand-600/20 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        <PlayCircle size={18} /> Practice
                      </button>
                      <button 
                        onClick={() => handleAction(friend.username, 'Challenge')}
                        className="w-full py-4 bg-surface-950 text-surface-300 border border-surface-700 rounded-3xl text-[11px] font-black uppercase tracking-[0.25em] hover:border-brand-500 hover:text-brand-500 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-3"
                      >
                        <Trophy size={18} className="text-amber-500" /> Challenge
                      </button>
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-surface-800 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] italic">Established Connection</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-transparent hover:border-rose-500/20"
                    >
                      <UserMinus size={16} /> Disconnect
                    </button>
                  </div>
                </div>
              ))
            ) : filter === 'Pending' ? (
              <div className="col-span-full space-y-12">
                 {/* Incoming Section */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-amber-500" />
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500">Awaiting Your Approval ({incomingRequests.length})</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {incomingRequests.map((request) => (
                        <div key={request.id} className="p-8 rounded-[3rem] bg-surface-900 border border-amber-500/10 shadow-2xl flex items-center justify-between gap-6 transition-all hover:border-amber-500/30 group/req">
                           <div className="flex items-center gap-6">
                              <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-surface-800 to-surface-950 border border-surface-700 flex items-center justify-center text-2xl font-black text-amber-500 shadow-xl group-hover/req:border-amber-500/50 transition-all overflow-hidden relative">
                                  {request.sender?.avatar ? (
                                    <img src={request.sender.avatar} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    request.sender?.username?.charAt(0).toUpperCase() || 'U'
                                  )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-surface-950 shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
                              </div>
                              <div className="space-y-1">
                                 <h4 className="text-lg font-black text-surface-200 uppercase tracking-tight">@{request.sender?.username}</h4>
                                 <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">{request.sender?.name || 'Inbound User'}</p>
                              </div>
                           </div>
                           <div className="flex gap-3">
                              <button 
                                onClick={() => handleAccept(request.id)}
                                className="p-4 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center"
                                title="Accept Invitation"
                              >
                                 <Check size={20} strokeWidth={3} />
                              </button>
                              <button 
                                onClick={() => handleReject(request.id)}
                                className="p-4 rounded-2xl bg-surface-800 text-surface-400 hover:text-rose-500 border border-surface-700 transition-all shadow-md active:scale-95 flex items-center justify-center"
                                title="Reject"
                              >
                                 <X size={20} strokeWidth={3} />
                              </button>
                           </div>
                        </div>
                      ))}
                      {incomingRequests.length === 0 && (
                        <div className="col-span-full py-16 border border-dashed border-surface-800 rounded-[3rem] flex flex-col items-center justify-center gap-4 text-surface-600">
                          <Mail size={32} className="opacity-20" />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em]">No incoming transmissions detected.</p>
                        </div>
                      )}
                    </div>
                 </div>

                 {/* Outgoing Section */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-brand-500" />
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500">Sent Outgoing Signals ({outgoingRequests.length})</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {outgoingRequests.map((request) => (
                        <div key={request.id} className="p-8 rounded-[3rem] bg-surface-900 border border-surface-700 shadow-sm flex items-center justify-between gap-6 transition-all hover:bg-surface-800/50 group/req">
                           <div className="flex items-center gap-6">
                              <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-surface-800 to-surface-950 border border-surface-700 flex items-center justify-center text-2xl font-black text-brand-500 shadow-xl group-hover/req:border-brand-500/50 transition-all overflow-hidden relative">
                                  {request.receiver?.avatar ? (
                                    <img src={request.receiver.avatar} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    request.receiver?.username?.charAt(0).toUpperCase() || 'U'
                                  )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-500 border-2 border-surface-950 shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
                              </div>
                              <div className="space-y-1">
                                 <h4 className="text-lg font-black text-surface-200 uppercase tracking-tight">@{request.receiver?.username}</h4>
                                 <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Awaiting Response</p>
                              </div>
                           </div>
                           <button 
                             onClick={() => handleReject(request.id)}
                             className="px-6 py-3 rounded-2xl bg-surface-800 text-surface-400 hover:text-rose-500 border border-surface-700 transition-all text-[10px] font-black uppercase tracking-[0.2em] active:scale-95"
                           >
                              Withdraw
                           </button>
                        </div>
                      ))}
                      {outgoingRequests.length === 0 && (
                        <div className="col-span-full py-12 border-2 border-dashed border-surface-800 rounded-[3rem] flex items-center justify-center italic text-surface-600 text-sm">
                          No outgoing signals detected.
                        </div>
                      )}
                    </div>
                 </div>
              </div>
            ) : (
              <div className="col-span-full py-24 text-center space-y-6">
                <div className="w-24 h-24 rounded-[2.5rem] bg-surface-800 border border-surface-700 flex items-center justify-center mx-auto opacity-30">
                  <AlertCircle size={48} className="text-surface-500" strokeWidth={1} />
                </div>
                <div className="space-y-2">
                   <p className="text-surface-300 text-lg font-black uppercase tracking-tighter">
                     {filter === 'Pending' ? 'No pending requests found' : 'Your network is empty'}
                   </p>
                   <p className="text-surface-500 text-xs font-black uppercase tracking-widest opacity-60">
                     {filter === 'Pending' ? 'You have cleared all incoming connection transmissions.' : 'Search for @usernames above to start connecting.'}
                   </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
