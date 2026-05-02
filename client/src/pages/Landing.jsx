import { Link } from 'react-router-dom'
import { Swords, Zap, Code, Shield, Users, TrendingUp, ChevronRight, Play, Cpu, Layout } from 'lucide-react'
import EngineeringNetworkBackground from '../components/ui/EngineeringNetworkBackground'
import { PixelCanvas } from '../components/ui/PixelCanvas'

export default function Landing() {
   return (
      <EngineeringNetworkBackground>
         <div className="min-h-screen text-slate-900 selection:bg-brand-500/10 selection:text-brand-600 overflow-x-hidden">
            {/* Dynamic Navbar */}
            <nav className="fixed top-0 left-0 right-0 h-20 border-b border-surface-700 bg-white/80 backdrop-blur-xl z-50 px-8 flex items-center justify-between">
               <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <img 
                     src="/logo.png" 
                     alt="Assignix Logo" 
                     className="h-12 w-auto object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
                     onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                  {/* Fallback pattern */}
                  <div className="hidden w-10 h-10 rounded-2xl bg-brand-600 items-center justify-center text-white shadow-xl shadow-brand-500/20 group-hover:rotate-12 transition-transform duration-500">
                     <Cpu size={22} fill="white" />
                  </div>
                  <span className="text-2xl font-black tracking-tighter uppercase text-slate-900">Assignix</span>
               </div>
               <div className="hidden md:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-surface-500">
                  <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
                  <a href="#battle" className="hover:text-brand-600 transition-colors">Challenges</a>
                  <a href="#analytics" className="hover:text-brand-600 transition-colors">Analytics</a>
                  <div className="h-4 w-px bg-surface-700" />
                  <Link id="landing-signin" to="/login" className="px-8 py-3 rounded-2xl bg-white border border-surface-700 text-slate-900 hover:border-brand-500/50 hover:bg-brand-600 hover:text-white transition-all shadow-sm active:scale-95">
                     Sign In
                  </Link>
               </div>
            </nav>

            {/* Hero Section */}
            <header className="relative w-full h-screen flex flex-col items-center justify-center px-6 text-center">
               <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
                  <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-brand-600/5 border border-brand-500/20 text-brand-600 text-[10px] font-black uppercase tracking-[0.3em]">
                     <Zap size={14} fill="currentColor" />
                     Master Your Coding Skills
                  </div>

                  <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase text-slate-900">
                     Code. Practice.<br />
                     <span className="text-brand-600">Succeed.</span>
                  </h1>

                  <p className="max-w-3xl mx-auto text-lg md:text-xl font-medium text-slate-600 leading-relaxed">
                     A professional platform built for high-performance learning, real-time competition, and data-driven growth.
                  </p>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-4">
                     <Link id="landing-get-started" to="/signup" className="group flex items-center gap-4 px-12 py-5 rounded-2xl bg-brand-600 text-white text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 hover:bg-brand-500 hover:scale-[1.02] active:scale-95 transition-all">
                        <Play size={18} fill="white" />
                        Get Started
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                     </Link>
                     <a href="#features" className="flex items-center gap-4 px-12 py-5 rounded-2xl bg-white border-2 border-slate-200 text-slate-900 text-sm font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all active:scale-95 shadow-lg">
                        View Features
                     </a>
                  </div>
               </div>

 <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                     <span className="text-[10px] font-black uppercase tracking-widest">Explore Ecosystem</span>
                     <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex items-start justify-center p-2">
                        <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" />
                     </div>
                  </div>
               </div>
            </header>

            {/* Feature Clusters */}
            <section id="features" className="py-32 px-8 max-w-7xl mx-auto">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {[
                     { icon: Code, title: 'Advanced IDE', desc: 'A professional-grade coding environment with real-time execution and performance metrics.', color: 'text-brand-600', link: '/practice' },
                     { icon: Swords, title: 'Challenge Hub', desc: 'Compete in real-time coding matches. Live leaderboards and competitive environment.', color: 'text-emerald-600', link: '/challenge' },
                     { icon: TrendingUp, title: 'Progress Analytics', desc: 'Detailed performance tracking with visual charts. Monitor your skills and consistency.', color: 'text-amber-600', link: '/progress' }
                  ].map((feature, i) => (
                     <Link
                        key={i}
                        to={feature.link}
                        className="group relative p-10 rounded-[3.5rem] bg-white/50 backdrop-blur-sm border border-surface-700 hover:border-brand-500/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 overflow-hidden active:scale-[0.98]"
                     >
                        <PixelCanvas
                           gap={12}
                           speed={30}
                           colors={["#e0f2fe", "#7dd3fc", "#4f46e5"]}
                           variant="icon"
                           noFocus
                        />
                        <div className="relative z-10">
                           <div className={`w-16 h-16 rounded-[1.5rem] bg-slate-50 ${feature.color} flex items-center justify-center mb-8 border border-surface-700 group-hover:scale-110 transition-transform duration-500`}>
                              <feature.icon size={32} />
                           </div>
                           <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">{feature.title}</h3>
                           <p className="text-base font-medium text-surface-500 leading-relaxed">{feature.desc}</p>
                        </div>
                     </Link>
                  ))}
               </div>
            </section>

            {/* Specialized Content Section */}
            <section id="battle" className="py-32 px-8 relative">
               <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-20">
                  <div className="space-y-10 order-2 lg:order-1">
                     <div className="space-y-4">
                        <span className="text-[10px] font-black text-brand-600 uppercase tracking-[0.3em]">Challenge System</span>
                        <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-tight uppercase text-slate-900">
                           Lead the <span className="text-brand-600 italic">Leaderboard</span>
                        </h2>
                        <p className="text-lg font-medium text-surface-500 leading-relaxed">
                           Our real-time challenge platform provides immediate feedback during competitions. Watch your rank improve live as you solve problems.
                        </p>
                     </div>

                     <div className="grid grid-cols-2 gap-8 pt-4">
                        {[
                           { label: 'Speed', val: 'Fast' },
                           { label: 'Uptime', val: '99.9%' },
                           { label: 'Version', val: 'v1.2.0' },
                           { label: 'Live', val: 'Instant' }
                        ].map((stat, i) => (
                           <div key={i} className="space-y-1">
                              <div className="text-sm font-black text-slate-900">{stat.val}</div>
                              <div className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">{stat.label}</div>
                           </div>
                        ))}
                     </div>

                     <button className="flex items-center gap-3 text-xs font-black text-brand-600 uppercase tracking-widest group">
                        Enter The Challenge Hub <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
                     </button>
                  </div>

                  {/* Visual Teaser */}
                  <div className="order-1 lg:order-2 p-4 rounded-[4rem] bg-white/30 backdrop-blur-md border border-surface-700 shadow-xl relative overflow-hidden group">
                     <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-white/20 to-transparent" />
                     <div className="relative p-12 space-y-6">
                        <div className="flex gap-2">
                           <div className="w-3 h-3 rounded-full bg-red-500/10 border border-red-500/20" />
                           <div className="w-3 h-3 rounded-full bg-amber-500/10 border border-amber-500/20" />
                           <div className="w-3 h-3 rounded-full bg-emerald-500/10 border border-emerald-100" />
                        </div>
                        <div className="space-y-3 font-mono text-xs text-brand-700">
                           <div className="opacity-40">{">>"} Opening Challenge Hub...</div>
                           <div className="opacity-60">{">>"} Connecting... [Fast]</div>
                           <div className="opacity-90 text-brand-600 font-bold">{">>"} Challenge Ready: Two Sum</div>
                        </div>
                        <div className="pt-8 flex -space-x-3">
                           {[1, 2, 3, 4].map(i => (
                              <div key={i} className="w-10 h-10 rounded-xl bg-slate-50 border-2 border-brand-100 shadow-xl" />
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-8 border-t border-surface-700 mt-20">
               <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="flex items-center gap-3 opacity-70 grayscale">
                     <img 
                        src="/logo.png" 
                        alt="Assignix Logo" 
                        className="h-8 w-auto object-contain"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                     />
                     <div className="hidden w-8 h-8 rounded-xl bg-brand-600 text-white items-center justify-center">
                        <Cpu size={18} fill="white" />
                     </div>
                     <span className="text-lg font-black tracking-tighter uppercase text-slate-900">Assignix</span>
                  </div>
                  <div className="flex gap-12 text-[10px] font-black uppercase tracking-widest text-surface-500">
                     <a href="#" className="hover:text-brand-600">Twitter</a>
                     <a href="#" className="hover:text-brand-600">Github</a>
                     <a href="#" className="hover:text-brand-600">Docs</a>
                     <a href="#" className="hover:text-brand-600 text-brand-600">v1.2.0</a>
                  </div>
                  <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">
                     © 2026 Assignix Platform. Professional Learning.
                  </p>
               </div>
            </footer>
         </div>
      </EngineeringNetworkBackground>
   )
}
