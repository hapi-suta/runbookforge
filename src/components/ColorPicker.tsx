'use client'

import { useState } from 'react'
import { Palette, Check } from 'lucide-react'

export const colorOptions = [
  { name: 'teal', bg: 'bg-teal-500/20', border: 'border-teal-500/30', text: 'text-teal-400', solid: 'bg-teal-500', hex: '#14b8a6' },
  { name: 'emerald', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', solid: 'bg-emerald-500', hex: '#10b981' },
  { name: 'green', bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400', solid: 'bg-green-500', hex: '#22c55e' },
  { name: 'sky', bg: 'bg-sky-500/20', border: 'border-sky-500/30', text: 'text-sky-400', solid: 'bg-sky-500', hex: '#0ea5e9' },
  { name: 'blue', bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', solid: 'bg-blue-500', hex: '#3b82f6' },
  { name: 'violet', bg: 'bg-violet-500/20', border: 'border-violet-500/30', text: 'text-violet-400', solid: 'bg-violet-500', hex: '#8b5cf6' },
  { name: 'purple', bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400', solid: 'bg-purple-500', hex: '#a855f7' },
  { name: 'pink', bg: 'bg-pink-500/20', border: 'border-pink-500/30', text: 'text-pink-400', solid: 'bg-pink-500', hex: '#ec4899' },
  { name: 'red', bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', solid: 'bg-red-500', hex: '#ef4444' },
  { name: 'orange', bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400', solid: 'bg-orange-500', hex: '#f97316' },
  { name: 'amber', bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400', solid: 'bg-amber-500', hex: '#f59e0b' },
  { name: 'yellow', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', solid: 'bg-yellow-500', hex: '#eab308' },
]

export function getColorClasses(colorName: string) {
  return colorOptions.find(c => c.name === colorName) || colorOptions[0]
}

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

export default function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selected = getColorClasses(value)

  return (
    <div className="relative">
      {label && <label className="block text-xs text-slate-500 mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 bg-slate-800 border border-slate-700 rounded hover:border-slate-600 transition-colors"
      >
        <div className={`w-4 h-4 rounded ${selected.solid}`} />
        <Palette size={12} className="text-slate-400" />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 p-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 grid grid-cols-6 gap-1">
            {colorOptions.map(color => (
              <button
                key={color.name}
                onClick={() => { onChange(color.name); setIsOpen(false); }}
                className={`w-6 h-6 rounded ${color.solid} hover:scale-110 transition-transform flex items-center justify-center`}
                title={color.name}
              >
                {value === color.name && <Check size={12} className="text-white" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
