import { useState, useEffect } from 'react'
import { User, Shield, Bell, Layout, Monitor, Globe, Save, ChevronRight, UserCircle, Camera, CheckSquare, Zap, Cpu, Settings as SettingsIcon, Lock, Mail, Sparkles, AlertCircle } from 'lucide-react'
import PageShell from '../../components/ui/PageShell'
import { useAuth } from '../../context/AuthContext'

export default function Settings() {
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Profile State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
  })

  // Security State
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Notifications State
  const [notificationData, setNotificationData] = useState({
    email: user?.notificationSettings?.email ?? true,
    push: user?.notificationSettings?.push ?? true,
    assignments: user?.notificationSettings?.assignments ?? true,
    mentions: user?.notificationSettings?.mentions ?? true,
  })

  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('assignix_theme') || 'Cloud Light')

  useEffect(() => {
    localStorage.setItem('assignix_theme', theme)
    // Apply theme class to root
    const root = document.documentElement
    root.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast')
    if (theme === 'Cloud Light') root.classList.add('theme-light')
    if (theme === 'Modern Dark') root.classList.add('theme-dark')
    if (theme === 'High Contrast') root.classList.add('theme-high-contrast')
  }, [theme])

  const handleSave = async (e) => {
    e?.preventDefault()
    setIsSaving(true)
    setMessage({ type: '', text: '' })

    // Validation for security tab
    if (activeTab === 'security') {
      if (securityData.newPassword !== securityData.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' })
        setIsSaving(false)
        return
      }
      if (securityData.newPassword && securityData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
        setIsSaving(false)
        return
      }
    }

    const payload = {
      ...formData,
      notificationSettings: notificationData,
      ...(securityData.newPassword ? { password: securityData.newPassword } : {})
    }

    const result = await updateProfile(payload)
    setIsSaving(false)

    if (result.success) {
      setMessage({ type: 'success', text: 'Settings updated successfully!' })
      // Clear security fields on success
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } else {
      setMessage({ type: 'error', text: result.message })
    }

    // Clear message after 5 seconds
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'preferences', label: 'Preferences', icon: Monitor },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <PageShell
      title="User Settings"
      subtitle="Manage your identity, preferences, and platform security."
      icon={SettingsIcon}
    >
      <div className="flex flex-col lg:flex-row gap-12 pb-20">
        {/* Sidebar Navigation */}
        <aside className="lg:w-80 space-y-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setMessage({ type: '', text: '' })
              }}
              className={`w-full flex items-center gap-4 px-8 py-5 rounded-[2rem] transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-sm ${
                activeTab === tab.id 
                ? 'bg-brand-600 text-white shadow-xl shadow-brand-500/20 active:scale-95' 
                : 'bg-surface-900 text-surface-500 hover:bg-brand-50 hover:text-brand-600 border border-surface-700 hover:border-brand-100'
              }`}
            >
              <tab.icon size={20} strokeWidth={2.5} />
              {tab.label}
              {activeTab === tab.id && <ChevronRight size={16} strokeWidth={3} className="ml-auto" />}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="flex-1 max-w-5xl">
          <div className="p-12 rounded-[3.5rem] bg-surface-900 border border-surface-700 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-brand-500/5 transition-all">
            <div className="absolute top-0 right-0 p-20 opacity-[0.03] group-hover:opacity-[0.07] rotate-12 transition-transform group-hover:scale-110 grayscale group-hover:grayscale-0">
               <Cpu size={250} className="text-brand-600" strokeWidth={2.5} />
            </div>

            <div className="relative z-10 space-y-16">
               {/* Status Messages */}
               {message.text && (
                 <div className={`p-5 rounded-2xl flex items-center gap-4 border animate-fade-in ${
                   message.type === 'success' 
                   ? 'bg-emerald-50/10 border-emerald-500/20 text-emerald-500' 
                   : 'bg-red-50/10 border-red-500/20 text-red-500'
                 }`}>
                   {message.type === 'success' ? <Zap size={20} /> : <AlertCircle size={20} />}
                   <p className="text-[10px] font-black uppercase tracking-widest">{message.text}</p>
                 </div>
               )}

               {activeTab === 'profile' && (
                 <div className="space-y-12 animate-fade-in-up">
                    <div className="flex flex-col md:flex-row items-center gap-10 border-b border-surface-700 pb-12">
                       <div className="group relative">
                          <div className="w-32 h-32 rounded-[2.5rem] bg-brand-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-brand-500/20 overflow-hidden border-4 border-surface-900">
                             {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                          </div>
                          <button className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-surface-900 text-brand-600 border border-surface-700 shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                             <Camera size={18} strokeWidth={2.5} />
                          </button>
                       </div>
                       <div className="space-y-4 text-center md:text-left">
                          <div className="flex items-center gap-4 justify-center md:justify-start">
                             <h3 className="text-3xl font-black text-surface-300 uppercase tracking-tight">{user?.name || 'Assignix Member'}</h3>
                             <span className="text-[10px] font-black text-brand-600 lowercase tracking-tight opacity-60">@{user?.username}</span>
                          </div>
                          <div className="flex items-center gap-3 justify-center md:justify-start">
                             <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50/10 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">Identity Verified</span>
                             <span className="text-[9px] font-black text-brand-700 uppercase tracking-widest bg-brand-50/10 px-3 py-1.5 rounded-full border border-brand-100 shadow-sm">Status: {user?.role}</span>
                          </div>
                           <p className="text-[11px] font-black text-surface-500 uppercase tracking-widest opacity-60 leading-relaxed max-w-lg italic">Building clean and efficient code solutions at Assignix.</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                            <input 
                              type="text" 
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-8 py-5 rounded-[2rem] bg-surface-800 border border-surface-700 text-[11px] font-black uppercase tracking-widest text-surface-300 focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all outline-none shadow-inner"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] ml-1">Unique Username</label>
                            <div className="relative">
                               <span className="absolute left-6 top-1/2 -translate-y-1/2 text-surface-500 font-black text-[11px]">@</span>
                               <input 
                                 type="text" 
                                 value={formData.username}
                                 onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                 className="w-full pl-10 pr-8 py-5 rounded-[2rem] bg-surface-800 border border-surface-700 text-[11px] font-black lowercase tracking-widest text-surface-300 focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all outline-none shadow-inner"
                               />
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-3">
                            <label className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                            <input 
                              type="email" 
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full px-8 py-5 rounded-[2rem] bg-surface-800 border border-surface-700 text-[11px] font-black uppercase tracking-widest text-surface-300 focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all outline-none shadow-inner"
                            />
                        </div>
                    </div>
                 </div>
               )}

               {activeTab === 'preferences' && (
                 <div className="space-y-12 animate-fade-in-up">
                    <div className="space-y-8">
                       <h4 className="text-2xl font-black text-surface-300 uppercase tracking-tight">Display Theme</h4>
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                          {['Cloud Light', 'Modern Dark', 'High Contrast'].map((t, i) => (
                             <div 
                              key={i} 
                              onClick={() => setTheme(t)}
                              className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer flex flex-col gap-5 text-center ${
                                theme === t ? 'bg-brand-50/10 border-brand-200 shadow-xl shadow-brand-500/5 ring-2 ring-brand-500/10' : 'bg-surface-800 border-surface-700 hover:border-surface-600'
                              }`}>
                                <div className={`w-16 h-16 rounded-[1.5rem] mx-auto border shadow-sm ${
                                   t === 'Cloud Light' ? 'bg-white border-brand-100' : 
                                   t === 'High Contrast' ? 'bg-black border-yellow-400' :
                                   'bg-surface-900 border-surface-700'
                                }`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${theme === t ? 'text-brand-600' : 'text-surface-300'}`}>
                                  {t}
                                </span>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
               )}

               {activeTab === 'security' && (
                 <div className="space-y-12 animate-fade-in-up">
                    <div className="flex items-center gap-6 border-b border-surface-700 pb-12">
                       <div className="w-20 h-20 rounded-[1.5rem] bg-emerald-50/10 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg">
                          <Lock size={32} strokeWidth={2.5} />
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-2xl font-black text-surface-300 uppercase tracking-tight">Update Password</h4>
                          <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest opacity-60">Maintain account security by updating regularly.</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] ml-1">Current Password</label>
                            <input 
                              type="password" 
                              placeholder="••••••••"
                              value={securityData.currentPassword}
                              onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                              className="w-full px-8 py-5 rounded-[2rem] bg-surface-800 border border-surface-700 text-[11px] font-black tracking-widest text-surface-300 focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all outline-none shadow-inner"
                            />
                        </div>
                        <div className="space-y-3 md:col-start-1">
                            <label className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] ml-1">New Password</label>
                            <input 
                              type="password" 
                              placeholder="••••••••"
                               value={securityData.newPassword}
                               onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                              className="w-full px-8 py-5 rounded-[2rem] bg-surface-800 border border-surface-700 text-[11px] font-black tracking-widest text-surface-300 focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all outline-none shadow-inner"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
                            <input 
                              type="password" 
                              placeholder="••••••••"
                               value={securityData.confirmPassword}
                               onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                              className="w-full px-8 py-5 rounded-[2rem] bg-surface-800 border border-surface-700 text-[11px] font-black tracking-widest text-surface-300 focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all outline-none shadow-inner"
                            />
                        </div>
                    </div>
                 </div>
               )}

               {activeTab === 'notifications' && (
                 <div className="space-y-12 animate-fade-in-up">
                    <div className="flex items-center gap-6 border-b border-surface-700 pb-12">
                       <div className="w-20 h-20 rounded-[1.5rem] bg-amber-50/10 border border-amber-100 text-amber-600 flex items-center justify-center shadow-lg">
                          <Bell size={32} strokeWidth={2.5} />
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-2xl font-black text-surface-300 uppercase tracking-tight">Notification Alerts</h4>
                          <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest opacity-60">Choose how you stay connected to the hub.</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {[
                         { id: 'email', label: 'Email Notifications', sub: 'Receive updates via your registered inbox.' },
                         { id: 'push', label: 'Push Notifications', sub: 'Instant alerts on your device for real-time events.' },
                         { id: 'assignments', label: 'Assignment Alerts', sub: 'Get notified when new work is posted.' },
                         { id: 'mentions', label: 'Mention Alerts', sub: 'Notifications when someone tags your @username.' },
                       ].map((item) => (
                         <div key={item.id} className="p-8 rounded-[2.5rem] bg-surface-800 border border-surface-700 flex items-center justify-between group hover:border-brand-500/30 transition-all">
                            <div className="space-y-1">
                               <p className="text-[11px] font-black text-surface-300 uppercase tracking-tight">{item.label}</p>
                               <p className="text-[9px] font-black text-surface-500 uppercase tracking-widest opacity-60 leading-tight">{item.sub}</p>
                            </div>
                            <button 
                              onClick={() => setNotificationData({ ...notificationData, [item.id]: !notificationData[item.id] })}
                              className={`w-14 h-8 rounded-full relative transition-all duration-300 ${
                                notificationData[item.id] ? 'bg-brand-600 shadow-lg shadow-brand-500/20' : 'bg-surface-700'
                              }`}
                            >
                               <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 shadow-sm ${
                                  notificationData[item.id] ? 'left-7' : 'left-1'
                               }`} />
                            </button>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {/* Global Save Button */}
               <div className="pt-12 border-t border-surface-700 flex justify-end">
                  <button 
                     onClick={handleSave}
                     disabled={isSaving}
                     className="flex items-center gap-4 px-12 py-5 rounded-2xl bg-brand-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 hover:bg-brand-500 disabled:opacity-50 transition-all active:scale-95"
                  >
                     {isSaving ? <Cpu size={22} className="animate-spin" /> : <Save size={22} strokeWidth={2.5} />}
                     {isSaving ? 'Saving Changes...' : 'Save Updates'}
                  </button>
               </div>
            </div>
          </div>
        </main>
      </div>
    </PageShell>
  )
}
