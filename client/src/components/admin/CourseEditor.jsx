import { useState } from 'react'
import { X, Save, BookOpen, Layers, Type, Image as ImageIcon, Palette, BarChart, Check } from 'lucide-react'

export default function CourseEditor({ course, onSave, onClose }) {
  const [formData, setFormData] = useState(course || {
    title: '',
    id: '',
    description: '',
    category: 'Programming',
    thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800',
    color: '#6366f1',
    difficulty: 'Beginner'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-900 border border-surface-700 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-10 py-8 border-b border-surface-700 flex items-center justify-between bg-surface-800/50">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/20">
                <BookOpen size={24} strokeWidth={2.5} />
             </div>
             <div>
                <h3 className="text-xl font-black text-surface-300 uppercase tracking-tight">
                  {course ? 'Refine Course' : 'Launch New Course'}
                </h3>
                <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest opacity-60">Design a premium learning path.</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-surface-700 text-surface-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest px-1">Course Title</label>
              <div className="relative group">
                <Type className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 group-focus-within:text-brand-600 transition-colors" size={18} />
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-surface-800 border border-surface-700 text-surface-300 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all"
                  placeholder="e.g. Advanced Python"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest px-1">Unique ID (Slug)</label>
              <input
                type="text"
                required
                disabled={!!course}
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full px-6 py-4 rounded-2xl bg-surface-800 border border-surface-700 text-surface-300 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all disabled:opacity-50"
                placeholder="e.g. advanced-python"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest px-1">Detailed Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-6 py-4 rounded-2xl bg-surface-800 border border-surface-700 text-surface-300 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all resize-none"
              placeholder="Provide a comprehensive summary of what students will learn..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest px-1">Category</label>
                <div className="relative group">
                  <Layers className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 group-focus-within:text-brand-600 transition-colors" size={18} />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-surface-800 border border-surface-700 text-surface-300 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all appearance-none"
                  >
                    <option>Programming</option>
                    <option>Web Dev</option>
                    <option>Data Science</option>
                    <option>Cybersecurity</option>
                  </select>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest px-1">Difficulty</label>
                <div className="relative group">
                  <BarChart className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 group-focus-within:text-brand-600 transition-colors" size={18} />
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-surface-800 border border-surface-700 text-surface-300 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all appearance-none"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest px-1">Branding Color</label>
                <div className="relative group">
                  <Palette className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 group-focus-within:text-brand-600 transition-colors" size={18} />
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-14 pl-14 pr-6 rounded-2xl bg-surface-800 border border-surface-700 cursor-pointer overflow-hidden"
                  />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest px-1">Thumbnail URL</label>
                <div className="relative group">
                  <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 group-focus-within:text-brand-600 transition-colors" size={18} />
                  <input
                    type="text"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-surface-800 border border-surface-700 text-surface-300 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-600 transition-all"
                    placeholder="https://..."
                  />
                </div>
             </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-surface-700 bg-surface-800/50 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-8 py-4 rounded-2xl bg-surface-700 text-surface-300 text-[10px] font-black uppercase tracking-widest hover:bg-surface-600 transition-all"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-4 rounded-2xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-500 transition-all flex items-center gap-2 shadow-xl shadow-brand-500/20"
          >
            <Check size={16} strokeWidth={3} />
            Commit Changes
          </button>
        </div>
      </div>
    </div>
  )
}
