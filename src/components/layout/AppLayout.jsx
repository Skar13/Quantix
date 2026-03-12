import React, { useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore, useProjectStore, useBOQStore, useBillingStore } from '@/store'
import { Button } from '@/components/ui'

const NAV_ITEMS = [
  { path: '/', icon: '🎛️', label: 'Dashboard' },
  { path: '/boq', icon: '📋', label: 'Master BOQ' },
  { path: '/billing', icon: '📝', label: 'Billing Entry' },
  { path: '/materials', icon: '🧱', label: 'Materials' },
  { path: '/advances', icon: '💰', label: 'Advances' },
  { path: '/reports', icon: '📊', label: 'Reports' },
  { path: '/users', icon: '👥', label: 'Users' },
  { path: '/plans', icon: '⭐', label: 'Plans' },
]

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const { user, logout } = useAuthStore()
  const { projects, activeProjectId, setActiveProject, fetchProjects } = useProjectStore()
  const { fetchBOQ } = useBOQStore()
  const { bills, activeBillId, fetchBills } = useBillingStore()

  // ── THE MAGIC: Initial Data Fetching from Database ──
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useEffect(() => {
    if (activeProjectId) {
      fetchBOQ(activeProjectId)
      fetchBills(activeProjectId)
    }
  }, [activeProjectId, fetchBOQ, fetchBills])

  const activeBill = bills.find(b => b.id === activeBillId)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--background)', color: 'var(--text)', overflow: 'hidden' }}>
      
      {/* Sidebar Navigation */}
      <div style={{ width: 64, background: 'var(--surface2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 20 }}>
        {NAV_ITEMS.map(item => (
          <Link key={item.path} to={item.path} style={{
            width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, textDecoration: 'none',
            background: location.pathname === item.path ? 'var(--surface3)' : 'transparent',
            border: location.pathname === item.path ? '1px solid var(--border)' : '1px solid transparent'
          }} title={item.label}>
            {item.icon}
          </Link>
        ))}
      </div>

      {/* Main App Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <header style={{ height: 60, background: 'var(--surface2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--accent)', fontWeight: 900, fontSize: 18, fontStyle: 'italic', letterSpacing: '-0.5px' }}>
              Online<br/><span style={{ fontSize: 14 }}>CBS</span>
            </span>
          </div>

          {/* Dynamic Project & Bill Header Controls */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <select
              value={activeProjectId || ''}
              onChange={(e) => setActiveProject(e.target.value)}
              style={{ background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text)', fontSize: 13, cursor: 'pointer', maxWidth: 150 }}
            >
              <option value="" disabled>Select Project...</option>
              {projects.map(p => <option key={p.id} value={p.id}>📁 {p.name}</option>)}
            </select>

            {/* Dynamic Bill Badge (Replaces RA Bill #7) */}
            {activeBill ? (
              <span style={{ background:'rgba(240,165,0,0.15)', border:'1px solid rgba(240,165,0,0.3)', color:'var(--accent)', fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:20, fontFamily:'var(--font-mono)' }}>
                RA Bill #{activeBill.billNo}
              </span>
            ) : (
              <span style={{ background:'rgba(139, 148, 158,0.15)', border:'1px solid rgba(139, 148, 158,0.3)', color:'var(--text3)', fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:20, fontFamily:'var(--font-mono)' }}>
                No Active Bill
              </span>
            )}

            <Button variant="outline" size="sm" onClick={() => window.print()}>↓ Print</Button>

            <div onClick={handleLogout} title="Logout" style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {user?.name ? user.name.slice(0,2).toUpperCase() : 'AU'}
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
