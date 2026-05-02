import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  School,
  Code2,
  ClipboardList,
  Zap,
  Users,
  Trophy,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { label: 'Dashboard',   path: '/dashboard',   icon: LayoutDashboard },
  { label: 'Classrooms',  path: '/classrooms',  icon: School },
  { label: 'Prepare',    path: '/prepare',    icon: Code2 },
  { label: 'Assignments', path: '/assignments', icon: ClipboardList },
  { label: 'Training Grounds', path: '/practice',    icon: Zap },
  { label: 'Friends',     path: '/friends',     icon: Users },
  { label: 'Challenges',  path: '/challenge',   icon: Trophy },
  { label: 'Progress',    path: '/progress',    icon: TrendingUp },
]

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation()
  const { user } = useAuth()

  // Add Admin Panel to navItems if user is admin
  const finalNavItems = [...navItems]
  if (user?.role === 'admin') {
    finalNavItems.push({ label: 'Admin Panel', path: '/admin', icon: Shield })
  }

  return (
    <aside
      id="sidebar"
      className={`fixed top-0 left-0 z-40 h-screen flex flex-col
        bg-surface-900 border-r border-surface-700
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[250px]'}`}
    >
      {/* ── Brand ────────────────────────────── */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-surface-700 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center shrink-0 glow-brand">
          <Sparkles size={18} className="text-white" />
        </div>
        <span
          className={`text-lg font-bold tracking-tight text-surface-300 whitespace-nowrap
            transition-all duration-300 overflow-hidden
            ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}
        >
          Assignix
        </span>
      </div>

      {/* ── Navigation ───────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {finalNavItems.map((item) => {
          const { label, path } = item;
          const Icon = item.icon;
          const isActive = location.pathname === path || location.pathname.startsWith(path + '/')
          return (
            <NavLink
              key={path}
              to={path}
              id={`sidebar-${label.toLowerCase()}`}
              title={collapsed ? label : undefined}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-sm font-semibold transition-all duration-200
                ${isActive
                  ? 'bg-brand-50/10 text-brand-600 shadow-sm shadow-brand-500/5'
                  : 'text-surface-500 hover:text-brand-600 hover:bg-surface-800'
                }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-brand-500" />
              )}
              <Icon
                size={20}
                className={`shrink-0 transition-colors duration-200
                  ${isActive ? 'text-brand-400' : 'text-gray-500 group-hover:text-gray-300'}`}
              />
              <span
                className={`whitespace-nowrap transition-all duration-300 overflow-hidden
                  ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}
              >
                {label}
              </span>
            </NavLink>
          )
        })}
      </nav>

      {/* ── Collapse Toggle ──────────────────── */}
      <div className="p-3 border-t border-surface-700 shrink-0">
        <button
          id="sidebar-toggle"
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl
            text-surface-500 hover:text-brand-600 hover:bg-slate-50
            transition-all duration-200 text-sm font-semibold cursor-pointer"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <span
            className={`whitespace-nowrap transition-all duration-300 overflow-hidden
              ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}
          >
            Collapse
          </span>
        </button>
      </div>
    </aside>
  )
}
