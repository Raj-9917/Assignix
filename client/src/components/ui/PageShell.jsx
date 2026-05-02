import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * PageShell — A consistent wrapper for every page.
 * Renders a subtle header area with the page name,
 * a decorative gradient banner, and a content slot.
 */
export default function PageShell({ title, subtitle, icon: Icon, actions, centered = false, breadcrumbs, children }) {
  if (!title) return children;

  return (
    <div className="animate-entry">
      {/* Hero banner */}
      <div className={`relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] mb-8 sm:mb-12
        bg-slate-900 border border-slate-800 p-8 sm:p-12 shadow-2xl ${centered ? 'text-center' : ''}`}>
        
        {/* Background decoration - subtle refined gradients */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-600/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-brand-500/5 blur-[120px] pointer-events-none" />

        <div className={`relative flex flex-col md:flex-row items-center gap-8 ${centered ? 'justify-center text-center' : 'justify-between'}`}>
          <div className={`flex flex-col gap-6 w-full ${centered ? 'items-center text-center' : 'items-start'}`}>
            
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <div className="flex items-center flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                {breadcrumbs.map((crumb, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {crumb.path ? (
                      <Link to={crumb.path} className="hover:text-brand-400 transition-colors">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-slate-300">{crumb.label}</span>
                    )}
                    {idx < breadcrumbs.length - 1 && <ChevronRight size={12} className="text-slate-600" strokeWidth={3} />}
                  </div>
                ))}
              </div>
            )}

            <div className={`flex items-center gap-8 ${centered ? 'flex-col sm:flex-row' : ''}`}>
              {Icon && (
                <div className="w-20 h-20 rounded-3xl bg-white/5 text-brand-400 border border-white/10
                  flex items-center justify-center shrink-0 shadow-inner group">
                  <Icon size={32} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-500" />
                </div>
              )}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  {title}
                </h2>
              {subtitle && (
                <p className="text-xs sm:text-sm font-medium text-slate-400 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
              )}
            </div>
            </div>
          </div>

          {actions && (
            <div className={`flex items-center gap-4 mt-8 md:mt-0 ${centered ? 'justify-center' : ''}`}>
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="relative">
        {children ?? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-56 rounded-3xl border border-slate-200 bg-white shadow-sm flex items-center justify-center group hover:border-brand-500/30 transition-all duration-300"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 opacity-40 group-hover:opacity-100 group-hover:text-brand-500 transition-all">Coming soon</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
