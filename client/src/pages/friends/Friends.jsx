import { useState, useEffect } from 'react'
import { Users, Search, PlayCircle, Trophy, UserMinus, ShieldCheck, Mail, Sparkles, UserPlus, Loader2, AlertCircle } from 'lucide-react'
import PageShell from '../../components/ui/PageShell'
import { useAuth } from '../../context/AuthContext'
import API_URL from '../../config/api'

export default function Friends() {
  const { user, updateProfile } = useAuth()
  const [friends, setFriends] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [filter, setFilter] = useState('All')
  const [activeInvite, setActiveInvite] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch current friends on mount
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem('assignix_token');
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setFriends(data.friends || []);
        }
      } catch (error) {
        console.error('Failed to fetch friends:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

  // Debounced search for users
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        try {
          const token = localStorage.getItem('assignix_token');
          const response = await fetch(`${API_URL}/auth/search?query=${searchTerm}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data);
          }
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleAddFriend = async (friendId) => {
    try {
      const token = localStorage.getItem('assignix_token');
      const response = await fetch(`${API_URL}/auth/friends/add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ friendId })
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh friends list
        const profileRes = await fetch(`${API_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        setFriends(profileData.friends || []);
        setSearchResults(searchResults.filter(u => u._id !== friendId));
        
        setActiveInvite({ name: 'User', type: 'Friend Request' });
        setTimeout(() => setActiveInvite(null), 3000);
      }
    } catch (error) {
      console.error('Add friend failed:', error);
    }
  };

  const handleAction = (friendName, type) => {
    setActiveInvite({ name: friendName, type })
    setTimeout(() => setActiveInvite(null), 3000)
  }

  const removeFriend = (id) => {
    // This would ideally be a DELETE call to the backend
    setFriends(friends.filter(f => f._id !== id))
  }

  const stats = [
    { label: 'Total Friends', val: friends.length, icon: Users, color: 'text-brand-600' },
    { label: 'Network Points', val: friends.reduce((acc, f) => acc + (f.xp || 0), 0), icon: Trophy, color: 'text-emerald-600' },
    { label: 'Global Rank', val: '#42', icon: ShieldCheck, color: 'text-amber-600' }
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
            <div className="px-8 py-5 rounded-[2rem] bg-surface-900/90 backdrop-blur-xl text-white shadow-2xl flex items-center gap-4 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Sparkles size={20} fill="white" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{activeInvite.type} Sent</p>
                <p className="text-xs font-bold uppercase tracking-tight">Success: {activeInvite.name} notified!</p>
              </div>
            </div>
          </div>
        )}

        {/* Search Results Section */}
        {searchResults.length > 0 && (
          <div className="space-y-6 animate-fade-in-up">
             <div className="flex items-center gap-3 ml-2">
                <Sparkles size={18} className="text-brand-600" />
                <h4 className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Global Search Results</h4>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {searchResults.map((user) => (
                  <div key={user._id} className="p-8 rounded-[3rem] bg-surface-900 border border-brand-500/20 shadow-xl shadow-brand-500/5 flex items-center justify-between gap-6 transition-all hover:border-brand-500/40">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-black text-surface-300 uppercase tracking-tight">{user.name}</h4>
                        <p className="text-[10px] font-black text-brand-600 lowercase tracking-tight opacity-60">@{user.username}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddFriend(user._id)}
                      className="p-4 rounded-2xl bg-brand-600 text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/20 active:scale-95"
                    >
                      <UserPlus size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Friends Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 ml-2">
             <Users size={18} className="text-surface-500" />
             <h4 className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Your Professional Network</h4>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {loading ? (
              <div className="col-span-full py-20 flex flex-col items-center gap-4">
                 <Loader2 size={48} className="animate-spin text-brand-600 opacity-20" />
                 <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Syncing connection hub...</p>
              </div>
            ) : friends.length > 0 ? (
              friends.map((friend) => (
                <div key={friend._id || friend.id} className="group p-8 rounded-[3rem] bg-surface-900 border border-surface-700 hover:border-brand-500/30 transition-all shadow-sm hover:shadow-xl hover:shadow-brand-500/5 relative overflow-hidden">
                  <div className="flex items-start justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-surface-800 border border-surface-700 flex items-center justify-center text-surface-300 font-black text-xl shadow-inner group-hover:bg-brand-600 group-hover:text-white transition-all duration-500">
                          {friend.avatar || friend.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-surface-900 bg-emerald-500 shadow-sm" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xl font-black text-surface-300 uppercase tracking-tight">{friend.name}</h4>
                        <p className="text-[10px] font-black text-brand-600 lowercase tracking-tight opacity-60">@{friend.username}</p>
                        <div className="flex items-center gap-2 pt-2">
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50/10 px-2.5 py-1 rounded-full border border-emerald-100 shadow-sm">
                            {friend.role || 'Member'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => handleAction(friend.name, 'Practice')}
                        className="flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-500 transition-all active:scale-95"
                      >
                        <PlayCircle size={16} />
                        Practice
                      </button>
                      <button 
                        onClick={() => handleAction(friend.name, 'Challenge')}
                        className="flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-surface-800 border border-surface-700 text-surface-300 text-[10px] font-black uppercase tracking-widest hover:bg-surface-700 transition-all active:scale-95 shadow-sm"
                      >
                        <Trophy size={16} className="text-amber-600" />
                        Challenge
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-surface-700 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all">
                    <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest italic">Connection Active</span>
                    <button 
                      onClick={() => removeFriend(friend._id || friend.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50/10 text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      <UserMinus size={14} />
                      Unfriend
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center space-y-6">
                <div className="w-24 h-24 rounded-[2.5rem] bg-surface-800 border border-surface-700 flex items-center justify-center mx-auto opacity-30">
                  <Users size={48} className="text-surface-500" strokeWidth={1} />
                </div>
                <div className="space-y-2">
                   <p className="text-surface-300 text-lg font-black uppercase tracking-tighter">Your network is empty</p>
                   <p className="text-surface-500 text-xs font-black uppercase tracking-widest opacity-60">Search for @usernames above to start connecting.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
