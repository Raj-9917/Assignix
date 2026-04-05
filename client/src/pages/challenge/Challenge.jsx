import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Swords, Users, Clock, Trophy, ChevronRight, Zap, Target, Flame, PlayCircle } from 'lucide-react'
import PageShell from '../../components/ui/PageShell'
import { initialChallenges } from '../../data/challenges'

export default function Challenge() {
  const [activeRooms] = useState(initialChallenges)

  return (
    <PageShell
      title="Challenge Hub"
      subtitle="Competitive real-time coding matches. Join a room and climb the rankings."
      icon={Swords}
    >
      <div className="space-y-12 pb-12">
        {/* Featured Tournament Banner */}
        <section className="relative p-12 rounded-[3.5rem] bg-white border border-surface-700 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-brand-500/5 transition-all duration-1000 group">
          <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all duration-1000 rotate-12 grayscale group-hover:grayscale-0">
             <Trophy size={200} className="text-brand-600" strokeWidth={2.5} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="space-y-8 flex-1">
              <div className="flex items-center gap-4">
                 <span className="px-6 py-2 rounded-full bg-brand-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-500/20">
                    Main Tournament
                 </span>
                 <span className="flex items-center gap-2 text-[10px] text-brand-700 font-black uppercase tracking-widest">
                    <Flame size={16} className="text-amber-600 animate-pulse" />
                    Weekly Coding Challenge #42
                 </span>
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-surface-300 tracking-tighter uppercase leading-none">
                   Ultimate Logic <span className="text-brand-600">Championship</span>
                </h3>
                <p className="text-surface-500 text-sm max-w-2xl font-medium uppercase tracking-widest text-[11px] leading-relaxed opacity-80">
                  Join the highest-stakes match of the week. 5 critical problems, 60 minutes, and 500+ active participants.
                </p>
              </div>
              <div className="flex items-center gap-8 pt-6">
                 <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                       <div key={i} className={`w-12 h-12 rounded-2xl border-4 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-surface-500 shadow-lg`}>
                          P{i}
                       </div>
                    ))}
                    <div className="w-12 h-12 rounded-2xl border-4 border-white bg-brand-50 text-brand-700 flex items-center justify-center text-[9px] font-black shadow-lg">+442</div>
                 </div>
                 <button className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-brand-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 hover:bg-brand-500 hover:-translate-y-1 active:scale-95 transition-all group">
                    <PlayCircle size={20} fill="white" strokeWidth={3} />
                    Join Now
                 </button>
              </div>
            </div>
          </div>
        </section>

        {/* Filters/Tabs */}
        <div className="flex items-center justify-between border-b border-surface-700 pb-8">
           <div className="flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-surface-500">
              <span className="text-brand-600 border-b-2 border-brand-600 pb-3 cursor-pointer">Live Matches</span>
              <span className="hover:text-surface-300 cursor-pointer transition-colors pb-3">Upcoming</span>
              <span className="hover:text-surface-300 cursor-pointer transition-colors pb-3">Past Results</span>
           </div>
           <button className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-white border border-surface-700 text-[10px] font-black uppercase tracking-widest text-brand-600 hover:bg-brand-600 hover:text-white transition-all shadow-sm">
              <Swords size={18} strokeWidth={2.5} /> Create Private Room
           </button>
        </div>

        {/* Global Live Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {activeRooms.map((room) => (
            <div key={room.id} className="group p-10 rounded-[3.5rem] bg-white border border-surface-700 hover:border-brand-500/30 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-brand-500/5 relative overflow-hidden">
               {/* Visual Accent */}
               <div className="absolute top-0 left-0 w-2 h-full bg-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />

               <div className="flex items-start justify-between mb-10">
                  <div className="space-y-2">
                     <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm ${
                        room.difficulty === 'Easy' ? 'text-emerald-700 border-emerald-100 bg-emerald-50' : 'text-amber-700 border-amber-100 bg-amber-50'
                     }`}>
                        Difficulty: {room.difficulty}
                     </span>
                     <h4 className="text-2xl font-black text-surface-300 uppercase tracking-tight leading-none pt-2">
                        {room.title}
                     </h4>
                  </div>
                  <div className="p-4 rounded-[1.5rem] bg-slate-50 text-brand-600 border border-surface-700 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500 shadow-inner">
                     <Zap size={24} fill="currentColor" strokeWidth={2.5} />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="p-5 rounded-[2rem] bg-slate-50 border border-surface-700 flex flex-col gap-1 shadow-inner">
                     <span className="text-[9px] font-black text-surface-500 uppercase tracking-widest opacity-60">Participants</span>
                     <span className="text-xl font-black text-surface-300 flex items-center gap-3">
                        <Users size={18} className="text-brand-600" strokeWidth={2.5} /> {room.participants}
                     </span>
                  </div>
                  <div className="p-5 rounded-[2rem] bg-slate-50 border border-surface-700 flex flex-col gap-1 shadow-inner">
                     <span className="text-[9px] font-black text-surface-500 uppercase tracking-widest opacity-60">Time Limit</span>
                     <span className="text-xl font-black text-surface-300 flex items-center gap-3">
                        <Clock size={18} className="text-brand-600" strokeWidth={2.5} /> {room.timeLimit}m
                     </span>
                  </div>
               </div>

               <Link
                 to={`/room/${room.id}`}
                 className="flex items-center justify-between w-full p-6 rounded-2xl bg-surface-800 text-[10px] font-black uppercase tracking-[0.2em] text-surface-300 hover:bg-brand-600 hover:text-white hover:-translate-y-1 active:scale-95 transition-all shadow-sm border border-surface-700"
               >
                 <span className="flex items-center gap-3"><PlayCircle size={20} strokeWidth={2.5} /> Join Match</span>
                 <ChevronRight size={18} strokeWidth={3} />
               </Link>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
