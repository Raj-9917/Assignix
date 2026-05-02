import React, { useState } from 'react';
import { 
  Settings, 
  ShieldAlert, 
  Bell, 
  Moon, 
  Globe, 
  Zap, 
  Save, 
  RefreshCcw,
  Monitor,
  Database,
  Lock,
  Eye,
  Layout
} from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationOpen: true,
    featuredProblemId: 'two-sum',
    siteNotice: 'Platform scheduled for maintenance this weekend.',
    theme: 'White Premium',
    maxUploadSize: 50,
    apiRateLimit: 100
  });

  const [saving, setSaving] = useState(false);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      alert('System configuration updated successfully.');
    }, 1000);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Configuration</h1>
        <p className="text-sm font-medium text-slate-500 italic">Global parameters controlling platform behavior and appearance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Operations Section */}
        <section className="space-y-6">
           <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-brand-600" />
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Ops</h2>
           </div>
           
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                 <div>
                    <p className="text-sm font-black text-slate-900">Maintenance Mode</p>
                    <p className="text-[10px] text-slate-400 font-medium">Bypass all traffic to static notice.</p>
                 </div>
                 <button 
                  onClick={() => handleToggle('maintenanceMode')}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.maintenanceMode ? 'bg-rose-500' : 'bg-slate-200'}`}
                 >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`} />
                 </button>
              </div>

              <div className="flex items-center justify-between">
                 <div>
                    <p className="text-sm font-black text-slate-900">User Registrations</p>
                    <p className="text-[10px] text-slate-400 font-medium">Allow new account creations.</p>
                 </div>
                 <button 
                  onClick={() => handleToggle('registrationOpen')}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.registrationOpen ? 'bg-emerald-500' : 'bg-slate-200'}`}
                 >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.registrationOpen ? 'right-1' : 'left-1'}`} />
                 </button>
              </div>

              <div className="space-y-2 pt-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Notice (Ticker)</label>
                 <input 
                  type="text" 
                  value={settings.siteNotice}
                  onChange={(e) => handleInputChange('siteNotice', e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
                 />
              </div>
           </div>
        </section>

        {/* Curation Section */}
        <section className="space-y-6">
           <div className="flex items-center gap-2 mb-4">
              <Eye size={18} className="text-brand-600" />
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Content Curation</h2>
           </div>
           
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Problem of the Day (Lead ID)</label>
                 <input 
                  type="text" 
                  value={settings.featuredProblemId}
                  onChange={(e) => handleInputChange('featuredProblemId', e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
                  placeholder="e.g. two-sum"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Interface Engine</label>
                 <select 
                  value={settings.theme}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
                 >
                    <option>White Premium</option>
                    <option>Dark Onyx (Coming Soon)</option>
                    <option>Glassmorphism v2</option>
                 </select>
              </div>
           </div>
        </section>

        {/* Infrastructure Section */}
        <section className="md:col-span-2 space-y-6">
           <div className="flex items-center gap-2 mb-4">
              <Database size={18} className="text-brand-600" />
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Infrastructure Resource Limits</h2>
           </div>
           
           <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Submission Size (MB)</label>
                    <span className="text-xs font-black text-slate-900">{settings.maxUploadSize}MB</span>
                 </div>
                 <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={settings.maxUploadSize}
                  onChange={(e) => handleInputChange('maxUploadSize', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                 />
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">API Requests / Minute</label>
                    <span className="text-xs font-black text-slate-900">{settings.apiRateLimit} Req</span>
                 </div>
                 <input 
                  type="range" 
                  min="50" 
                  max="500" 
                  step="10"
                  value={settings.apiRateLimit}
                  onChange={(e) => handleInputChange('apiRateLimit', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                 />
              </div>
           </div>
        </section>
      </div>

      <div className="flex items-center justify-end gap-4 bg-white/80 backdrop-blur p-4 rounded-3xl border border-slate-200 sticky bottom-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-700">
         <p className="text-[10px] font-bold text-slate-400 italic mr-4">Changes will propagate across all clusters upon commitment.</p>
         <button className="p-4 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all rounded-2xl">
            <RefreshCcw size={20} />
         </button>
         <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-4 bg-brand-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-500 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-500/20 disabled:opacity-50"
         >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            Commit Configuration
         </button>
      </div>
    </div>
  );
}
