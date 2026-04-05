/**
 * PageShell — A consistent wrapper for every page.
 * Renders a subtle header area with the page name,
 * a decorative gradient banner, and a content slot.
 */
export default function PageShell({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="animate-fade-in">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-[32px] mb-10
        bg-surface-900 border border-surface-700 p-10 shadow-sm">
        {/* Background decoration */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full
          bg-brand-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full
          bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-6">
          {Icon && (
            <div className="w-16 h-16 rounded-[2rem] bg-brand-50 text-brand-600 border border-brand-100
              flex items-center justify-center shrink-0 shadow-sm">
              <Icon size={28} />
            </div>
          )}
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-surface-300 tracking-tight uppercase">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs font-bold text-surface-500 uppercase tracking-widest">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content area — placeholder grid */}
      {children ?? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-44 rounded-3xl border border-surface-700/50
                bg-surface-900/50 backdrop-blur-sm
                flex items-center justify-center
                group hover:border-brand-500/30 hover:bg-surface-900
                transition-all duration-300 shadow-sm"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-surface-600 opacity-40 group-hover:opacity-100 group-hover:text-brand-500 transition-all">Coming soon</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
