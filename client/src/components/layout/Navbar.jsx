import { NavLink, useLocation, Link } from 'react-router-dom'
import { 
  Bell, Search, User, LogOut, ChevronDown, Users, BookOpen, Code, Trophy, Clock,
  LayoutDashboard, School, Code2, ClipboardList, Swords, TrendingUp, Shield, Sparkles,
  Menu, X
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../config/supabaseClient'

const navItems = [
  { label: 'Dashboard',    path: '/dashboard',    icon: LayoutDashboard },
  { label: 'Classrooms',   path: '/classrooms',   icon: School },
  { label: 'Prepare',      path: '/prepare',      icon: Code2 },
  { label: 'Assignments',  path: '/assignments',  icon: ClipboardList },
  { label: 'Training Grounds', path: '/practice',     icon: Swords },
  { label: 'Friends',      path: '/friends',      icon: Users },
  { label: 'Challenges',   path: '/challenge',    icon: Swords },
  { label: 'Progress',     path: '/progress',     icon: TrendingUp },
]

export default function Navbar({ onToggleFriends, isFriendsOpen }) {
  const location = useLocation()
  const { user, token, logout, notifications, fetchNotifications, markAllNotificationsRead } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({ courses: [], problems: [] })
  
  const searchRef = useRef(null)
  const notifRef = useRef(null)
  const dropdownRef = useRef(null)

  const isAdmin = user?.role === 'admin'
  const finalNavItems = [...navItems]
  if (isAdmin) {
    finalNavItems.push({ label: 'Admin', path: '/admin', icon: Shield })
  }

  const userInitials = (user?.name || user?.username || user?.email)?.charAt(0).toUpperCase() || 'U'
  const unreadCount = notifications.filter(n => !n.read).length

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    // Small delay to prevent synchronous state update during render/effect cycle
    const timer = setTimeout(() => setShowMobileMenu(false), 0);
    return () => clearTimeout(timer);
  }, [location.pathname])

  // Global search logic
  useEffect(() => {
    const searchTransmissions = async () => {
      if (searchQuery.length < 2) {
        setSearchResults({ courses: [], problems: [] });
        return;
      }
      try {
        const [courseRes, problemRes] = await Promise.all([
          supabase.from('courses').select('*').ilike('title', `%${searchQuery}%`).limit(5),
          supabase.from('problems').select('*').ilike('title', `%${searchQuery}%`).limit(5)
        ]);
        
        setSearchResults({
          courses: courseRes.data || [],
          problems: problemRes.data || []
        });
      } catch (err) {
        console.error('Search error:', err);
      }
    };

    const timer = setTimeout(searchTransmissions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Refresh notifications on open
  useEffect(() => {
    if (showNotifications && token) {
      fetchNotifications();
    }
  }, [showNotifications, token, fetchNotifications]);

  return (
    <header
      id="navbar"
      className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
    >
      <div className="h-14 sm:h-16 flex items-center justify-between px-6 max-w-[1920px] mx-auto">
        
        {/* ── Left: Brand + Nav ── */}
        <div className="flex items-center gap-1 lg:gap-2">
          {/* Brand */}
          <Link to="/dashboard" className="flex items-center gap-3 mr-4 lg:mr-6 shrink-0 group">
            <img 
              src="/logo.png" 
              alt="Assignix Logo" 
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            {/* Fallback if logo.png is missing */}
            <div className="hidden w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 items-center justify-center shrink-0 glow-brand group-hover:scale-110 transition-transform duration-300">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800 hidden sm:inline uppercase">
              Assignix
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {finalNavItems.map((item) => {
              const { label, path } = item;
              const Icon = item.icon;
              const isActive = location.pathname === path || location.pathname.startsWith(path + '/')
              return (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) => `relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold tracking-tight transition-all duration-300
                    ${isActive
                      ? 'text-brand-600 bg-brand-50/50'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <Icon size={14} className={`shrink-0 ${isActive ? 'text-brand-500' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">{label}</span>
                </NavLink>
              )
            })}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 rounded-xl text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-all"
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* ── Right: Actions ── */}
        <div className="flex items-center gap-2 lg:gap-3">
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
              className={`p-2 rounded-lg transition-all duration-300 ${
                showSearch ? 'text-brand-600 bg-slate-100' : 'text-slate-400 hover:text-brand-600 hover:bg-slate-50'
              }`}
              aria-label="Search"
            >
              <Search size={16} />
            </button>

            {showSearch && (
              <div className="absolute right-0 mt-3 w-80 sm:w-[420px] bg-white rounded-[2rem] shadow-2xl border border-slate-200 p-6 animate-scale-entry">
                <div className="relative mb-6">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    autoFocus
                    placeholder="Search mission parameters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all placeholder:text-slate-300"
                  />
                </div>

                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                  {searchQuery.length < 2 ? (
                    <div className="text-center py-6">
                      <p className="text-[10px] font-black uppercase text-surface-500 tracking-widest italic opacity-50">Global Search</p>
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
                            <Link key={p.id} to={`/prepare/${p.id}`} onClick={() => setShowSearch(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-800 transition-all group">
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Code size={14} />
                              </div>
                              <div>
                                  <p className="text-sm font-bold text-surface-300">{p.title}</p>
                                  <p className="text-[10px] font-black text-surface-500 uppercase">{p.difficulty}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                      {(searchResults?.courses || []).length === 0 && (searchResults?.problems || []).length === 0 && (
                        <div className="text-center py-6 italic text-surface-600 text-sm">No results found.</div>
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
              className={`relative p-2 rounded-lg transition-all duration-300 ${
                showNotifications ? 'text-brand-600 bg-slate-100' : 'text-slate-400 hover:text-brand-600 hover:bg-slate-50'
              }`}
              aria-label="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                 <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-brand-500 ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 glass rounded-[2rem] shadow-2xl border border-surface-700/50 overflow-hidden animate-scale-in">
                  <div className="px-6 py-4 border-b border-surface-700/50 bg-surface-800/50 flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-surface-300">Notifications</h4>
                      <button onClick={markAllNotificationsRead} className="text-[9px] font-black uppercase text-brand-600 hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto no-scrollbar py-2">
                      {(notifications || []).length > 0 ? (
                         (notifications || []).map((n, idx) => (
                          <div key={n.id || `notif-${idx}`} className={`px-6 py-4 hover:bg-slate-50 transition-all cursor-pointer relative group ${!n.read ? 'bg-brand-50/50' : ''}`}>
                              <div className="flex gap-4">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                   n.title.includes('Friend') ? 'bg-amber-100 text-amber-600' :
                                   n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
                                   'bg-brand-100 text-brand-600'
                                 }`}>
                                    {n.title.includes('Friend') ? <Users size={16} /> :
                                     n.type === 'success' ? <Trophy size={16} /> : 
                                     <Sparkles size={16} />}
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight leading-snug">{n.title}</p>
                                    <p className="text-[10px] font-bold text-slate-500 mt-1 line-clamp-2 leading-relaxed italic">{n.message}</p>
                                    <div className="flex items-center gap-1.5 mt-2 text-slate-400">
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
                           <p className="text-xs font-bold text-surface-600 italic">No notifications yet.</p>
                        </div>
                      )}
                  </div>
              </div>
            )}
          </div>

          <div className="h-6 w-[1px] bg-surface-700 hidden sm:block" />

          {/* User Profile & Role */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="navbar-user-menu"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl
                hover:bg-slate-50 transition-all duration-200 group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate max-w-[120px]">
                  {user?.username || user?.name || user?.email}
                </p>
                <p className="text-[8px] font-black text-brand-600 uppercase tracking-[0.2em] mt-0.5">
                  {user?.role || 'Guest'}
                </p>
              </div>

              <div className="w-8 h-8 rounded-lg bg-slate-900
                flex items-center justify-center text-white font-black text-[10px]
                shadow-lg group-hover:bg-brand-600 transition-all duration-300">
                {userInitials}
              </div>

              <ChevronDown size={12} className={`text-slate-300 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
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
      </div>

      {/* ── Mobile Navigation Dropdown ── */}
      {showMobileMenu && (
        <nav className="lg:hidden border-t border-surface-700 bg-surface-900/95 backdrop-blur-xl animate-fade-in px-4 py-3">
          <div className="grid grid-cols-2 gap-1">
            {finalNavItems.map((item) => {
              const { label, path } = item;
              const Icon = item.icon;
              const isActive = location.pathname === path || location.pathname.startsWith(path + '/')
              return (
                <NavLink
                  key={path}
                  to={path}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all
                    ${isActive
                      ? 'text-brand-600 bg-brand-50/10'
                      : 'text-surface-500 hover:text-surface-200 hover:bg-surface-800'
                    }`}
                >
                  <Icon size={16} className={isActive ? 'text-brand-500' : 'text-slate-400'} />
                  {label}
                </NavLink>
              )
            })}
          </div>
        </nav>
      )}
    </header>
  )
}
