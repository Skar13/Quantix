import React, { useState } from 'react'
import { useProjectStore } from '@/store'
import { Card, CardHeader, CardTitle, Button, Modal, Input, PageHeader, Badge } from '@/components/ui'
import { formatINR } from '@/utils/formula'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Projects() {
  const { projects, addProject, setActiveProject, activeProjectId } = useProjectStore()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name:'', contract_no:'', contractor:'', contract_value:'', start_date:'', end_date:'' })
  const navigate = useNavigate()

  function handleCreate() {
    if (!form.name) { toast.error('Project name required'); return }
    addProject({ ...form, contract_value: parseFloat(form.contract_value)||0, currentBill:1 })
    toast.success(`Project "${form.name}" created!`)
    setModal(false)
    setForm({ name:'', contract_no:'', contractor:'', contract_value:'', start_date:'', end_date:'' })
  }

  function handleSwitch(id) {
    setActiveProject(id)
    toast.success('Project switched!')
    navigate('/')
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Manage all your civil engineering projects"
        actions={<Button variant="gold" onClick={() => setModal(true)}>+ New Project</Button>}
      />
      <div style={{ padding:'0 28px 28px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:16 }}>
          {projects.map(project => (
            <div key={project.id} style={{
              background:'var(--surface)',
              border:`2px solid ${project.id===activeProjectId?'var(--accent)':'var(--border)'}`,
              borderRadius:12, padding:20, transition:'all 0.2s'
            }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                <div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, marginBottom:4 }}>{project.name}</div>
                  {project.contract_no && <div style={{ fontSize:11, color:'var(--text3)' }}>{project.contract_no}</div>}
                </div>
                {project.id === activeProjectId && <Badge color="yellow">Active</Badge>}
              </div>
              {project.contractor && (
                <div style={{ fontSize:12, color:'var(--text2)', marginBottom:8 }}>🏢 {project.contractor}</div>
              )}
              {project.contract_value > 0 && (
                <div style={{ fontSize:12, color:'var(--green)', fontFamily:'var(--font-mono)', marginBottom:8 }}>
                  💰 {formatINR(project.contract_value)}
                </div>
              )}
              {project.start_date && (
                <div style={{ fontSize:11, color:'var(--text3)', marginBottom:12 }}>
                  📅 {project.start_date} → {project.end_date}
                </div>
              )}
              <div style={{ display:'flex', gap:8 }}>
                {project.id !== activeProjectId && (
                  <Button variant="gold" size="sm" onClick={() => handleSwitch(project.id)}>Switch to this</Button>
                )}
                <Button variant="outline" size="sm" onClick={() => navigate('/')}>View Dashboard</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Create New Project" subtitle="Add a new civil engineering project">
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <Input label="Project Name *" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. NH-44 Road Widening Package 4" />
          <Input label="Contract No." value={form.contract_no} onChange={e => setForm(p=>({...p,contract_no:e.target.value}))} placeholder="e.g. NHAI/NH44/PKG4/2025" />
          <Input label="Contractor Name" value={form.contractor} onChange={e => setForm(p=>({...p,contractor:e.target.value}))} placeholder="e.g. M/s ABC Constructions" />
          <Input label="Contract Value (₹)" type="number" value={form.contract_value} onChange={e => setForm(p=>({...p,contract_value:e.target.value}))} placeholder="e.g. 50000000" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <Input label="Start Date" type="date" value={form.start_date} onChange={e => setForm(p=>({...p,start_date:e.target.value}))} />
            <Input label="End Date" type="date" value={form.end_date} onChange={e => setForm(p=>({...p,end_date:e.target.value}))} />
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button variant="gold" onClick={handleCreate}>Create Project</Button>
        </div>
      </Modal>
    </div>
  )
}
