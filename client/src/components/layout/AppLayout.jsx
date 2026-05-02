import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import FriendsPanel from './FriendsPanel'

export default function AppLayout() {
  const [isFriendsOpen, setIsFriendsOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-brand-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar onToggleFriends={() => setIsFriendsOpen(!isFriendsOpen)} isFriendsOpen={isFriendsOpen} />

      {/* Main content area */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto 
        p-4 sm:p-6 lg:p-8 transition-all duration-300"
        style={{ 
          marginRight: isFriendsOpen ? 320 : 0
        }}
      >
        <div className="animate-entry h-full">
          <Outlet />
        </div>
      </main>

      {/* Global Bottom Banner / Footer placeholder */}
      <footer className="w-full py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400">
           <p className="text-[10px] font-black uppercase tracking-widest italic">
             &copy; 2026 Assignix Engineering. All Rights Reserved.
           </p>
           <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
              <span className="hover:text-brand-600 cursor-pointer transition-colors">Documentation</span>
              <span className="hover:text-brand-600 cursor-pointer transition-colors">Security</span>
              <span className="hover:text-brand-600 cursor-pointer transition-colors">System Status</span>
           </div>
        </div>
      </footer>

      {/* Friends Sidebar (Right) */}
      <FriendsPanel isOpen={isFriendsOpen} onClose={() => setIsFriendsOpen(false)} />
    </div>
  )
}
