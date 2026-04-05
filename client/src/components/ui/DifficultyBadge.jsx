export default function DifficultyBadge({ difficulty }) {
  const diffConfigs = {
    Easy:   { color: 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' },
    Medium: { color: 'bg-amber-50 text-amber-700 border-amber-100 shadow-sm' },
    Hard:   { color: 'bg-rose-50 text-rose-700 border-rose-100 shadow-sm' },
  }

  const config = diffConfigs[difficulty] || diffConfigs.Easy

  return (
    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border leading-none ${config.color}`}>
      {difficulty}
    </span>
  )
}
