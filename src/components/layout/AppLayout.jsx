import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { useAuthStore, useProjectStore } from '@/store'
import { Button } from '@/components/ui'
import toast from 'react-hot-toast'
const NAV = [
  { section:'Main', items:[
    { to:'/',          icon:'⬛', label:'Dashboard' },
    { to:'/boq',       icon:'📋', label:'Master BOQ',    badge:'12' },
    { to:'/billing',   icon:'📝', label:'Billing Entry', dot:true },
    { to:'/materials', icon:'🧱', label:'Materials' },
    { to:'/advances',  icon:'💰', label:'Advances' },
  ]},
  { section:'Reports', items:[
    { to:'/reports',   icon:'📊', label:'All Reports' },
    { to:'/variation', icon:'📈', label:'Variations',    badge:'2' },
    { to:'/bbs',       icon:'🔩', label:'BBS' },
  ]},
  { section:'Admin', items:[
    { to:'/users',     icon:'👥', label:'Sub-Users',     badge:'4' },
    { to:'/plans',     icon:'⭐', label:'Plans' },
    { to:'/projects',  icon:'📁', label:'Projects' },
  ]},
]
export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const { getActiveProject } = useProjectStore()
  const project = getActiveProject()
  const navigate = useNavigate()
  const initials = user?.name?.split(' ').map(w=>w[0]).join('') || 'SU'
  function handleLogout() { logout(); navigate('/login'); toast.success('Logged out') }
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>
      <header style={{ height:52, background:'var(--surface)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', padding:'0 16px', gap:12, flexShrink:0, zIndex:100 }}>
        <button onClick={() => setCollapsed(c=>!c)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text2)', fontSize:16, padding:4 }}>☰</button>
        <span style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:800 }}>Online <span style={{ color:'var(--accent)' }}>CBS</span></span>
        {project && <div style={{ display:'flex', alignItems:'center', gap:6, background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:6, padding:'4px 10px', fontSize:11, color:'var(--text2)' }}>📁 <strong style={{ color:'var(--text)', fontSize:11 }}>{project.name}</strong></div>}
        <div style={{ flex:1 }} />
        <span style={{ background:'rgba(240,165,0,0.15)', border:'1px solid rgba(240,165,0,0.3)', color:'var(--accent)', fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:20, fontFamily:'var(--font-mono)' }}>RA Bill #7</span>
        <Button variant="gold" size="sm" onClick={() => navigate('/reports')}>⬇ Export</Button>
        <div onClick={handleLogout} title="Logout" style={{ width:30, height:30, background:'linear-gradient(135deg, #f0a500, #e07b00)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#000', cursor:'pointer' }}>{initials}</div>
      </header>
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        <aside style={{ width:collapsed?52:220, background:'var(--surface)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0, overflowY:'auto', overflowX:'hidden', transition:'width 0.2s ease' }}>
          {NAV.map(section => (
            <div key={section.section} style={{ padding:'12px 10px 6px' }}>
              {!collapsed && <div style={{ fontSize:9, fontWeight:600, letterSpacing:1, textTransform:'uppercase', color:'var(--text3)', padding:'0 4px', marginBottom:4 }}>{section.section}</div>}
              {section.items.map(item => (
                <NavLink key={item.to} to={item.to} end={item.to==='/'} style={({ isActive }) => ({ display:'flex', alignItems:'center', gap:8, padding:'7px 8px', borderRadius:6, cursor:'pointer', fontSize:12, textDecoration:'none', marginBottom:1, color:isActive?'var(--accent)':'var(--text2)', background:isActive?'rgba(240,165,0,0.12)':'transparent', border:isActive?'1px solid rgba(240,165,0,0.2)':'1px solid transparent', justifyContent:collapsed?'center':'flex-start' })}>
                  <span style={{ fontSize:14, width:18, textAlign:'center', flexShrink:0 }}>{item.icon}</span>
                  {!collapsed && <span style={{ flex:1 }}>{item.label}</span>}
                  {!collapsed && item.badge && <span style={{ background:'var(--surface3)', color:'var(--text3)', fontSize:9, padding:'1px 5px', borderRadius:10, fontFamily:'var(--font-mono)' }}>{item.badge}</span>}
                  {!collapsed && item.dot && <span style={{ width:6, height:6, background:'var(--red)', borderRadius:'50%' }} />}
                </NavLink>
              ))}
            </div>
          ))}
          <div style={{ marginTop:'auto', padding:10, borderTop:'1px solid var(--border)' }}>
            <div onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px', borderRadius:6, cursor:'pointer' }}>
              <div style={{ width:28, height:28, flexShrink:0, background:'linear-gradient(135deg, #bc8cff, #58a6ff)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff' }}>{initials}</div>
              {!collapsed && <div><div style={{ fontSize:11, fontWeight:500 }}>{user?.name||'Admin'}</div><div style={{ fontSize:10, color:'var(--text3)' }}>{user?.role||'Superuser'}</div></div>}
            </div>
          </div>
        </aside>
        <main style={{ flex:1, overflowY:'auto', background:'var(--bg)' }}><Outlet /></main>
      </div>
    </div>
  )
}
