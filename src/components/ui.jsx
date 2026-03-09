import React from 'react'
import { clsx } from 'clsx'
export function Button({ children, variant='outline', size='md', onClick, disabled, className, type='button', style }) {
  const base = 'inline-flex items-center gap-1.5 font-medium cursor-pointer border-none transition-all duration-150 rounded-md disabled:opacity-40 disabled:cursor-not-allowed'
  const variants = {
    gold:    'bg-gradient-to-br from-[#f0a500] to-[#e07b00] text-black font-semibold hover:opacity-90',
    outline: 'bg-transparent border border-[#3d444d] text-[#8b949e] hover:border-[#f0a500] hover:text-[#f0a500] hover:bg-[rgba(240,165,0,0.1)]',
    ghost:   'bg-transparent text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]',
    green:   'bg-[rgba(63,185,80,0.15)] text-[#3fb950] border border-[rgba(63,185,80,0.3)]',
    red:     'bg-[rgba(248,81,73,0.15)] text-[#f85149] border border-[rgba(248,81,73,0.3)]',
  }
  const sizes = { sm:'text-xs px-2.5 py-1', md:'text-xs px-3.5 py-1.5', lg:'text-sm px-5 py-2.5' }
  return <button type={type} onClick={onClick} disabled={disabled} style={style} className={clsx(base, variants[variant], sizes[size], className)}>{children}</button>
}
export function Badge({ children, color='yellow' }) {
  const colors = { yellow:'bg-[rgba(240,165,0,0.15)] text-[#f0a500]', green:'bg-[rgba(63,185,80,0.15)] text-[#3fb950]', red:'bg-[rgba(248,81,73,0.15)] text-[#f85149]', blue:'bg-[rgba(88,166,255,0.15)] text-[#58a6ff]', purple:'bg-[rgba(188,140,255,0.15)] text-[#bc8cff]', gray:'bg-[rgba(139,148,158,0.15)] text-[#8b949e]' }
  return <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono', colors[color])}>{children}</span>
}
export function Card({ children, className }) {
  return <div className={clsx('bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden', className)}>{children}</div>
}
export function CardHeader({ children, className }) {
  return <div className={clsx('px-4 py-3 border-b border-[#30363d] flex items-center justify-between', className)}>{children}</div>
}
export function CardTitle({ children }) { return <span className="text-sm font-semibold text-[#e6edf3]">{children}</span> }
export function CardBody({ children, className }) { return <div className={clsx('p-4', className)}>{children}</div> }
export function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-[10px] font-medium text-[#6e7681] uppercase tracking-wider mb-1">{label}</label>}
      <input className="w-full bg-[#21262d] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-xs outline-none focus:border-[#f0a500] transition-all" {...props} />
    </div>
  )
}
export function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-[10px] font-medium text-[#6e7681] uppercase tracking-wider mb-1">{label}</label>}
      <select className="w-full bg-[#21262d] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-xs outline-none focus:border-[#f0a500] cursor-pointer transition-all" {...props}>{children}</select>
    </div>
  )
}
export function StatCard({ label, value, delta, accent='gold' }) {
  const colors = { gold:'#f0a500', green:'#3fb950', blue:'#58a6ff', red:'#f85149', purple:'#bc8cff' }
  const color = colors[accent]||colors.gold
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 relative overflow-hidden hover:border-[#3d444d] transition-colors">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:`linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div className="text-[10px] uppercase tracking-wider text-[#6e7681] mb-2">{label}</div>
      <div className="font-mono text-2xl font-medium mb-1" style={{ color }}>{value}</div>
      {delta && <div className="text-[11px] text-[#8b949e]">{delta}</div>}
    </div>
  )
}
export function ProgressBar({ label, value, max=100, color='gold' }) {
  const pct = Math.min((value/max)*100,100)
  const colors = { gold:'linear-gradient(90deg, #f0a500, #e07b00)', green:'linear-gradient(90deg, #3fb950, #2ea043)', red:'linear-gradient(90deg, #f85149, #da3633)', blue:'linear-gradient(90deg, #58a6ff, #1f6feb)' }
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-[#8b949e] mb-1"><span>{label}</span><span className="font-mono">{pct.toFixed(0)}%</span></div>
      <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, background:colors[color]||colors.gold }} />
      </div>
    </div>
  )
}
export function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <div className={clsx('w-9 h-5 rounded-full border transition-all duration-200 relative', checked?'bg-[rgba(63,185,80,0.2)] border-[rgba(63,185,80,0.5)]':'bg-[#21262d] border-[#3d444d]')}>
        <div className={clsx('absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all duration-200', checked?'left-[18px] bg-[#3fb950]':'left-0.5 bg-[#6e7681]')} />
      </div>
    </label>
  )
}
export function Modal({ open, onClose, title, subtitle, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-7 w-full max-w-lg slide-up">
        {title && <h2 className="text-lg font-bold mb-1" style={{ fontFamily:'Syne, sans-serif' }}>{title}</h2>}
        {subtitle && <p className="text-xs text-[#8b949e] mb-5">{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-0.5 border-b border-[#30363d] px-4 bg-[#161b22]">
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)}
          className={clsx('px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-all whitespace-nowrap bg-transparent', active===tab.id?'text-[#f0a500] border-[#f0a500]':'text-[#8b949e] border-transparent hover:text-[#e6edf3]')}>
          {tab.label}
        </button>
      ))}
    </div>
  )
}
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="px-7 pt-6 pb-0 mb-6 flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-xl font-bold mb-1" style={{ fontFamily:'Syne, sans-serif' }}>{title}</h1>
        {subtitle && <p className="text-xs text-[#8b949e]">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
    </div>
  )
}
