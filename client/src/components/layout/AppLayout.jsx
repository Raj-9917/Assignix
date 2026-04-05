import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import FriendsPanel from './FriendsPanel'

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isFriendsOpen, setIsFriendsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface-950 text-surface-300 overflow-x-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content area */}
      <div
        className="transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: sidebarCollapsed ? 72 : 250,
          marginRight: isFriendsOpen ? 320 : 0
        }}
      >
        <Navbar onToggleFriends={() => setIsFriendsOpen(!isFriendsOpen)} isFriendsOpen={isFriendsOpen} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Friends Sidebar (Right) */}
      <FriendsPanel isOpen={isFriendsOpen} onClose={() => setIsFriendsOpen(false)} />
    </div>
  )
}
