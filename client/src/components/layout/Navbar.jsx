import { useLocation, Link } from 'react-router-dom'
import { Bell, Search, User, LogOut, ChevronDown, Users, Settings as SettingsIcon, X, BookOpen, Code, Trophy, Clock } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import API_URL from '../../config/api'

const routeTitles = {
  '/dashboard':   'Dashboard',
  '/classrooms':  'Classrooms',
  '/problems':    'Problems',
  '/assignments': 'Assignments',
  '/practice':    'Practice',
  '/friends':     'Friends',
  '/challenge':   'Challenges',
  '/progress':    'Progress',
  '/settings':    'Settings',
  '/login':       'Login',
}

function getPageTitle(pathname) {
  if (routeTitles[pathname]) return routeTitles[pathname]
  if (pathname.startsWith('/classroom/')) return 'Classroom'
  if (pathname.startsWith('/problem/'))   return 'Problem'
  if (pathname.startsWith('/room/'))      return 'Room'
  return 'Assignix'
}

export default function Navbar({ onToggleFriends, isFriendsOpen }) {
  const location = useLocation()
  const title = getPageTitle(location.pathname)
  const { user, token, logout, notifications, fetchNotifications, markAllNotificationsRead } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({ courses: [], problems: [] })
  const [isSearching, setIsSearching] = useState(false)
  
  const searchRef = useRef(null)
  const notifRef = useRef(null)

  // Use the email part as initials for the avatar if role is student or teacher
  const userInitials = user?.email?.charAt(0).toUpperCase() || 'U'
  const unreadCount = notifications.filter(n => !n.read).length

  // Global search logic
  useEffect(() => {
    const searchTransmissions = async () => {
      if (searchQuery.length < 2) {
        setSearchResults({ courses: [], problems: [] });
        return;
      }
      if (!token) return;
      setIsSearching(true);
      try {
        const response = await fetch(`${API_URL}/search?query=${searchQuery}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSearchResults({
            courses: Array.isArray(data.courses) ? data.courses : [],
            problems: Array.isArray(data.problems) ? data.problems : []
          });
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchTransmissions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, token]);

  // Refresh notifications on open
  useEffect(() => {
    if (showNotifications && token) {
      fetchNotifications();
    }
  }, [showNotifications, token, fetchNotifications]);

  return (
    <header
      id="navbar"
      className="sticky top-0 z-30 h-16 flex items-center justify-between
        px-6 bg-surface-900/80 backdrop-blur-xl
        border-b border-surface-700"
    >
      {/* Left — Page Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-surface-300 tracking-tight uppercase">
          {title}
        </h1>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-4">
        {/* Friends Toggle */}
        <button
          onClick={onToggleFriends}
          className={`p-2 rounded-xl transition-all duration-200 
            ${isFriendsOpen 
              ? 'text-brand-600 bg-brand-50/10 border border-brand-100 shadow-sm' 
              : 'text-surface-500 hover:text-brand-600 hover:bg-surface-800 border border-transparent'}`}
          aria-label="Friends"
        >
          <Users size={18} />
        </button>

        {/* Search */}
        <div className="relative" ref={searchRef}>
          <button
            id="navbar-search"
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2 rounded-xl transition-all duration-200 ${
              showSearch ? 'text-brand-600 bg-surface-800' : 'text-surface-500 hover:text-brand-600 hover:bg-surface-800'
            }`}
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {showSearch && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 glass rounded-[2rem] shadow-2xl border border-surface-700/50 p-6 animate-scale-in">
              <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
                <input 
                  autoFocus
                  placeholder="Find courses, problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-700 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-surface-200 focus:outline-none focus:border-brand-600 transition-all"
                />
              </div>

              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-none">
                {searchQuery.length < 2 ? (
                  <div className="text-center py-6">
                    <p className="text-[10px] font-black uppercase text-surface-500 tracking-widest italic opacity-50">Global Search Core</p>
                    <p className="text-xs font-bold text-surface-600 mt-2 italic">Type to discover content...</p>
                  </div>
                ) : (
                  <>
                    {(searchResults?.courses || []).length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-600 px-1">Courses</h4>
                        {searchResults.courses.map(c => (
                          <Link key={c.id} to={`/practice/topic/${c.id}`} onClick={() => setShowSearch(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-800 transition-all group">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <BookOpen size={14} />
                            </div>
                            <span className="text-sm font-bold text-surface-300">{c.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                    {(searchResults?.problems || []).length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 px-1">Problems</h4>
                        {searchResults.problems.map(p => (
                          <Link key={p.id} to={`/problem/${p.id}`} onClick={() => setShowSearch(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-800 transition-all group">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Code size={14} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-surface-300">{p.title}</p>
                                <p className="text-[10px] font-black text-surface-500 uppercase">{p.diff}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    {(searchResults?.courses || []).length === 0 && (searchResults?.problems || []).length === 0 && (
                      <div className="text-center py-6 italic text-surface-600 text-sm">No transmissions found.</div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            id="navbar-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-xl transition-all duration-200 ${
              showNotifications ? 'text-brand-600 bg-surface-800' : 'text-surface-500 hover:text-brand-600 hover:bg-surface-800'
            }`}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
               <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-surface-900 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass rounded-[2rem] shadow-2xl border border-surface-700/50 overflow-hidden animate-scale-in">
                <div className="px-6 py-4 border-b border-surface-700/50 bg-surface-800/50 flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-surface-300">Hub Notifications</h4>
                    <button onClick={markAllNotificationsRead} className="text-[9px] font-black uppercase text-brand-600 hover:underline">Mark all read</button>
                </div>
                <div className="max-h-[350px] overflow-y-auto no-scrollbar py-2">
                    {(notifications || []).length > 0 ? (
                      (notifications || []).map((n, idx) => (
                        <div key={n._id || n.id || `notif-${idx}`} className={`px-6 py-4 hover:bg-surface-800/50 transition-all cursor-pointer relative group ${!n.read ? 'bg-brand-500/5' : ''}`}>
                            <div className="flex gap-4">
                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                 n.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-500/10 text-brand-500'
                               }`}>
                                  {n.type === 'success' ? <Trophy size={16} /> : <BookOpen size={16} />}
                               </div>
                               <div className="min-w-0">
                                  <p className="text-xs font-black text-surface-200 uppercase tracking-tight leading-snug">{n.title}</p>
                                  <p className="text-[10px] font-bold text-surface-500 mt-1 line-clamp-2 leading-relaxed italic">{n.message}</p>
                                  <div className="flex items-center gap-1.5 mt-2 text-surface-600">
                                     <Clock size={10} />
                                     <span className="text-[9px] font-black uppercase tracking-widest">{n.time}</span>
                                  </div>
                               </div>
                            </div>
                            {!n.read && <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-1 h-8 rounded-full bg-brand-500 scale-y-0 group-hover:scale-y-100 transition-transform" />}
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-12 text-center">
                         <p className="text-xs font-bold text-surface-600 italic">Static silence. No updates.</p>
                      </div>
                    )}
                </div>
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-surface-700 hidden sm:block" />

        {/* User Profile & Role */}
        <div className="relative">
          <button
            id="navbar-user-menu"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl
              hover:bg-surface-800 transition-all duration-200 group"
          >
            <div className="text-right hidden sm:block font-sans">
              <p className="text-[10px] font-bold text-surface-300 uppercase tracking-tight truncate max-w-[120px]">
                {user?.email}
              </p>
              <p className="text-[9px] font-bold text-brand-600 uppercase tracking-[0.2em] mt-0.5">
                {user?.role?.toUpperCase()} ACCESS
              </p>
            </div>

            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700
              flex items-center justify-center text-white font-black text-xs
              shadow-lg shadow-brand-500/10 group-hover:scale-105 transition-all duration-200">
              {userInitials}
            </div>

            <ChevronDown size={14} className={`text-surface-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 glass rounded-2xl shadow-xl py-2 border border-surface-700/50 animate-fade-in z-50">
              <div className="px-4 py-2 border-b border-surface-700/50 mb-1 sm:hidden">
                <p className="text-xs font-semibold text-gray-100 truncate">{user?.email}</p>
                <p className="text-[10px] font-medium text-brand-400 uppercase">{user?.role}</p>
              </div>

              <Link 
                to="/settings"
                onClick={() => setShowDropdown(false)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-surface-700/50 hover:text-white transition-colors"
              >
                <User size={16} />
                Settings
              </Link>

              <button
                id="navbar-logout"
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
