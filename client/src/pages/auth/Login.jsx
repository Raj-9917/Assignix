import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, UserCircle, GraduationCap, Cpu, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (email && password) {
      const result = await login(email, password)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.message)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface-50 text-slate-900 selection:bg-brand-500/10 selection:text-brand-600 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] aspect-square bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05)_0%,transparent_60%)] -z-10" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/5 blur-[120px] rounded-full -z-10" />

      <div className="relative w-full max-w-lg animate-fade-in px-4">
        {/* Card */}
        <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl shadow-brand-500/5 border border-surface-700 relative overflow-hidden">
          {/* Subtle top accent */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-600 to-brand-400 opacity-60" />
          
          {/* Brand */}
          <div className="flex flex-col items-center mb-12">
            <div className="w-20 h-20 rounded-[2rem] bg-brand-600 flex items-center justify-center shadow-xl shadow-brand-500/20 mb-6 group hover:rotate-12 transition-transform duration-300">
              <Cpu size={36} fill="white" className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Assignix</h1>
            <p className="text-[10px] font-black text-surface-500 uppercase tracking-[0.3em]">Professional Learning Portal</p>
          </div>

          {error && (
            <div className="bg-red-50/50 border border-red-500/20 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-8 text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-surface-500 group-focus-within:text-brand-600 transition-colors">
                   <Mail size={18} />
                 </div>
                 <input
                   id="login-email"
                   type="email"
                   required
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="you@example.com"
                   className="w-full px-14 py-5 rounded-2xl bg-slate-50 border border-surface-700
                     text-slate-900 text-sm font-bold placeholder:text-surface-600
                     focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500
                     transition-all duration-300 shadow-inner"
                 />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-surface-500 group-focus-within:text-brand-600 transition-colors">
                   <Lock size={18} />
                 </div>
                 <input
                   id="login-password"
                   type="password"
                   required
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••"
                   className="w-full px-14 py-5 rounded-2xl bg-slate-50 border border-surface-700
                     text-slate-900 text-sm font-bold placeholder:text-surface-600
                     focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500
                     transition-all duration-300 shadow-inner"
                 />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="login-submit"
              className="w-full flex items-center justify-center gap-3 px-8 py-6 mt-4
                rounded-[2rem] bg-brand-600 text-white font-black text-[11px] uppercase tracking-[0.2em]
                shadow-2xl shadow-brand-500/20
                hover:bg-brand-500 hover:scale-[1.02] hover:shadow-brand-500/30
                active:scale-[0.98] transition-all duration-300 cursor-pointer disabled:opacity-50 group"
            >
              {loading ? (
                 <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={18} fill="white" />
                  Log In Now
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] font-black text-surface-500 mt-12 uppercase tracking-[0.2em]">
            New to Assignix?{' '}
            <Link to="/signup" className="text-brand-600 hover:text-brand-500 cursor-pointer transition-all border-b-2 border-brand-600/20 pb-0.5 ml-1 font-black">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
