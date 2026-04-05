import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { User, Mail, Lock, ShieldCheck, GraduationCap, ArrowRight, Cpu, Sparkles } from 'lucide-react'

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'student'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    const result = await register(
      formData.name, 
      formData.username, 
      formData.email, 
      formData.password, 
      formData.role
    )
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface-50 text-slate-900 selection:bg-brand-500/10 selection:text-brand-600 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Visuals */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] aspect-square bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05)_0%,transparent_60%)] -z-10" />
      <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-brand-500/5 blur-[120px] rounded-full -z-10" />

      <div className="w-full max-w-xl relative z-10 animate-fade-in">
        <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl shadow-brand-500/5 border border-surface-700 relative overflow-hidden">
          {/* Subtle top accent */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-600 to-brand-400 opacity-60" />

          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-brand-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-500/20 group hover:rotate-12 transition-transform duration-500">
              <Cpu size={32} fill="white" className="text-white" />
            </div>
            <h1 className="text-5xl font-black tracking-tight leading-[0.9] uppercase text-slate-900 mb-3">
              Create <span className="text-brand-600">Account</span>
            </h1>
            <p className="text-lg font-medium text-surface-500 max-w-sm mx-auto">
              Ready to elevate your code? Join the professional hub.
            </p>
          </div>

          {error && (
            <div className="bg-red-50/50 border border-red-500/20 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-8 text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1 space-y-2">
               <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Full Name</label>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-surface-500 group-focus-within:text-brand-600 transition-colors">
                   <User size={18} />
                 </div>
                 <input
                   type="text"
                   required
                   placeholder="John Doe"
                   className="w-full px-14 py-5 rounded-2xl bg-slate-50 border border-surface-700
                   text-slate-900 text-sm font-bold placeholder:text-surface-600
                   focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500
                   transition-all duration-300 shadow-inner"
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                 />
               </div>
            </div>

            <div className="md:col-span-1 space-y-2">
               <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Username</label>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-surface-500 group-focus-within:text-brand-600 transition-colors">
                   <Sparkles size={18} />
                 </div>
                 <input
                   type="text"
                   required
                   placeholder="john_doe"
                   className="w-full px-14 py-5 rounded-2xl bg-slate-50 border border-surface-700
                   text-slate-900 text-sm font-bold placeholder:text-surface-600
                   focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500
                   transition-all duration-300 shadow-inner"
                   value={formData.username}
                   onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                 />
               </div>
            </div>

            <div className="md:col-span-1 space-y-2">
               <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Email Address</label>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-surface-500 group-focus-within:text-brand-600 transition-colors">
                   <Mail size={18} />
                 </div>
                 <input
                   type="email"
                   required
                   placeholder="name@company.com"
                   className="w-full px-14 py-5 rounded-2xl bg-slate-50 border border-surface-700
                   text-slate-900 text-sm font-bold placeholder:text-surface-600
                   focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500
                   transition-all duration-300 shadow-inner"
                   value={formData.email}
                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                 />
               </div>
            </div>

            <div className="md:col-span-1 space-y-2">
               <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Password</label>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-surface-500 group-focus-within:text-brand-600 transition-colors">
                   <Lock size={18} />
                 </div>
                 <input
                   type="password"
                   required
                   placeholder="••••••••"
                   className="w-full px-14 py-5 rounded-2xl bg-slate-50 border border-surface-700
                   text-slate-900 text-sm font-bold placeholder:text-surface-600
                   focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500
                   transition-all duration-300 shadow-inner"
                   value={formData.password}
                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                 />
               </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-2 gap-4 pb-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'student' })}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all group ${
                  formData.role === 'student' 
                    ? 'border-brand-500 bg-brand-50/50 text-brand-700 shadow-lg shadow-brand-500/10' 
                    : 'border-surface-700 bg-white text-surface-400 hover:border-brand-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.role === 'student' ? 'bg-brand-600 text-white' : 'bg-slate-50 text-surface-400 transition-colors'}`}>
                   <GraduationCap size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Student</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'teacher' })}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all group ${
                  formData.role === 'teacher' 
                    ? 'border-brand-500 bg-brand-50/50 text-brand-700 shadow-lg shadow-brand-500/10' 
                    : 'border-surface-700 bg-white text-surface-400 hover:border-brand-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.role === 'teacher' ? 'bg-brand-600 text-white' : 'bg-slate-50 text-surface-400'}`}>
                   <ShieldCheck size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Teacher</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 w-full flex items-center justify-center gap-3 px-8 py-6
                rounded-[2rem] bg-brand-600 text-white font-black text-[11px] uppercase tracking-[0.2em]
                shadow-2xl shadow-brand-500/20
                hover:bg-brand-500 hover:scale-[1.02] hover:shadow-brand-500/30
                active:scale-95 transition-all duration-300 disabled:opacity-50 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={18} fill="white" />
                  Start Your Journey
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-surface-700 text-center">
            <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 hover:text-brand-500 font-black border-b-2 border-brand-600/20 pb-0.5 ml-1 transition-all">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

