import React, { useEffect, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore, useProjectStore, useBOQStore, useBillingStore } from '@/store'
import { Button } from '@/components/ui'
import { projectsAPI } from '@/utils/api'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { path: '/',          icon: '🎛️', label: 'Dashboard' },
  { path: '/boq',       icon: '📋', label: 'Master BOQ' },
  { path: '/billing',   icon: '📝', label: 'Billing Entry' },
  { path: '/materials', icon: '🧱', label: 'Materials' },
  { path: '/advances',  icon: '💰', label: 'Advances' },
  { path: '/reports',   icon: '📊', label: 'Reports' },
  { path: '/users',     icon: '👥', label: 'Users' },
  { path: '/plans',     icon: '⭐', label: 'Plans' },
]

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { projects, activeProjectId, setActiveProject, fetchProjects } = useProjectStore()
  const { fetchBOQ } = useBOQStore()
  const { bills, activeBillId, fetchBills } = useBillingStore()

  const [showNewProject, setShowNewProject] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', client: '', location: '', contract_value: '', start_date: '' })

  useEffect(() => { fetchProjects() }, [fetchProjects])

  useEffect(() => {
    if (activeProjectId) {
      fetchBOQ(activeProjectId)
      fetchBills(activeProjectId)
    }
  }, [activeProjectId, fetchBOQ, fetchBills])

  // Auto-show modal if no projects exist after loading
  useEffect(() => {
    if (projects !== undefined && projects.length === 0) {
      setShowNewProject(true)
    }
  }, [projects])

  const activeBill = bills.find(b => b.id === activeBillId)
  const handleLogout = () => { logout(); navigate('/login') }

  async function handleCreateProject(e) {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Project name is required')
    setCreating(true)
    try {
      const newProject = await projectsAPI.create({
        name: form.name,
        client: form.client,
        location: form.location,
        contract_value: parseFloat(form.contract_value) || 0,
        start_date: form.start_date || null,
      })
      await fetchProjects()
      setActiveProject(String(newProject.id))
      toast.success(`Project "${newProject.name}" created!`)
      setShowNewProject(false)
      setForm({ name: '', client: '', location: '', contract_value: '', start_date: '' })
    } catch (err) {
      toast.error(err.message || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{ display:'flex', height:'100vh', background:'var(--background)', color:'var(--text)', overflow:'hidden' }}>

      {/* ── Sidebar ── */}
      <div style={{ width:64, background:'var(--surface2)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', alignItems:'center', padding:'20px 0', gap:4 }}>
        {NAV_ITEMS.map(item => (
          <div key={item.path} style={{ position:'relative', width:'100%', display:'flex', justifyContent:'center' }}
            className="nav-item-wrapper">
            <Link to={item.path} style={{
              width:40, height:40, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:20, textDecoration:'none', margin:'2px 0',
              background: location.pathname === item.path ? 'var(--surface3)' : 'transparent',
              border: location.pathname === item.path ? '1px solid var(--border)' : '1px solid transparent',
              transition: 'all 0.15s'
            }}>
              {item.icon}
            </Link>
            {/* Tooltip */}
            <div style={{
              position:'absolute', left:52, top:'50%', transform:'translateY(-50%)',
              background:'var(--surface3)', border:'1px solid var(--border)',
              color:'var(--text)', fontSize:11, fontWeight:600,
              padding:'4px 10px', borderRadius:6, whiteSpace:'nowrap',
              pointerEvents:'none', opacity:0, transition:'opacity 0.15s',
              zIndex:100, boxShadow:'0 4px 12px rgba(0,0,0,0.4)'
            }} className="nav-tooltip">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <header style={{ height:60, background:'var(--surface2)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', padding:'0 20px', gap:16, flexShrink:0 }}>
          <span style={{ color:'var(--accent)', fontWeight:900, fontSize:20, fontStyle:'italic', letterSpacing:'-0.5px', fontFamily:'var(--font-display)' }}>
            Quantix
          </span>

          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>

            {/* Project Selector */}
            <select
              value={activeProjectId || ''}
              onChange={(e) => setActiveProject(e.target.value)}
              style={{ background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:6, padding:'6px 10px', color:'var(--text)', fontSize:13, cursor:'pointer', maxWidth:160 }}
            >
              <option value="" disabled>Select Project...</option>
              {(projects || []).map(p => <option key={p.id} value={p.id}>📁 {p.name}</option>)}
            </select>

            {/* New Project Button */}
            <button
              onClick={() => setShowNewProject(true)}
              title="New Project"
              style={{ background:'rgba(240,165,0,0.15)', border:'1px solid rgba(240,165,0,0.3)', color:'var(--accent)', borderRadius:6, padding:'5px 10px', fontSize:13, cursor:'pointer', fontWeight:700 }}>
              + Project
            </button>

            {/* Active Bill Badge */}
            {activeBill ? (
              <span style={{ background:'rgba(240,165,0,0.15)', border:'1px solid rgba(240,165,0,0.3)', color:'var(--accent)', fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:20, fontFamily:'var(--font-mono)' }}>
                RA Bill #{activeBill.billNo}
              </span>
            ) : (
              <span style={{ background:'rgba(139,148,158,0.15)', border:'1px solid rgba(139,148,158,0.3)', color:'var(--text3)', fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:20, fontFamily:'var(--font-mono)' }}>
                No Active Bill
              </span>
            )}

            <Button variant="outline" size="sm" onClick={() => window.print()}>↓ Print</Button>

            {/* User Avatar / Logout */}
            <div onClick={handleLogout} title={`Logout (${user?.name})`} style={{ width:32, height:32, borderRadius:'50%', background:'var(--accent)', color:'#000', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, cursor:'pointer' }}>
              {user?.name ? user.name.slice(0,2).toUpperCase() : 'AU'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex:1, overflowY:'auto' }}>
          <Outlet />
        </main>
      </div>

      {/* ── New Project Modal ── */}
      {showNewProject && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={e => { if (e.target === e.currentTarget && projects.length > 0) setShowNewProject(false) }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:32, width:'100%', maxWidth:460 }} className="slide-up">
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, marginBottom:4 }}>
              {projects.length === 0 ? '👋 Welcome to Quantix!' : '➕ New Project'}
            </h2>
            <p style={{ fontSize:12, color:'var(--text3)', marginBottom:24 }}>
              {projects.length === 0 ? 'Create your first project to get started.' : 'Fill in the project details below.'}
            </p>

            <form onSubmit={handleCreateProject}>
              <div style={{ display:'grid', gap:14 }}>

                <div>
                  <label style={{ display:'block', fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', marginBottom:5 }}>Project Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. NH-44 Road Widening"
                    style={{ width:'100%', background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text)', fontSize:13, outline:'none', boxSizing:'border-box' }} />
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <label style={{ display:'block', fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', marginBottom:5 }}>Client</label>
                    <input value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))}
                      placeholder="Client name"
                      style={{ width:'100%', background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text)', fontSize:13, outline:'none', boxSizing:'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', marginBottom:5 }}>Location</label>
                    <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                      placeholder="City / State"
                      style={{ width:'100%', background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text)', fontSize:13, outline:'none', boxSizing:'border-box' }} />
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <label style={{ display:'block', fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', marginBottom:5 }}>Contract Value (₹)</label>
                    <input type="number" value={form.contract_value} onChange={e => setForm(f => ({ ...f, contract_value: e.target.value }))}
                      placeholder="0"
                      style={{ width:'100%', background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text)', fontSize:13, outline:'none', boxSizing:'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', marginBottom:5 }}>Start Date</label>
                    <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                      style={{ width:'100%', background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text)', fontSize:13, outline:'none', boxSizing:'border-box' }} />
                  </div>
                </div>

                <div style={{ display:'flex', gap:10, marginTop:8 }}>
                  {projects.length > 0 && (
                    <button type="button" onClick={() => setShowNewProject(false)}
                      style={{ flex:1, background:'transparent', border:'1px solid var(--border)', borderRadius:8, padding:11, color:'var(--text3)', fontSize:13, cursor:'pointer' }}>
                      Cancel
                    </button>
                  )}
                  <button type="submit" disabled={creating}
                    style={{ flex:2, background:'linear-gradient(135deg, #f0a500, #e07b00)', color:'#000', border:'none', borderRadius:8, padding:11, fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                    {creating ? '⏳ Creating...' : '🏗️ Create Project'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tooltip CSS */}
      <style>{`
        .nav-item-wrapper:hover .nav-tooltip { opacity: 1 !important; }
        .nav-item-wrapper:hover a { background: var(--surface3) !important; border-color: var(--border) !important; }
      `}</style>
    </div>
  )
}
