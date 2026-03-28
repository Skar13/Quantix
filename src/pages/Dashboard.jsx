import React from 'react'
import { useProjectStore, useBOQStore, useBillingStore } from '@/store'
import { Card, CardHeader, CardTitle, StatCard } from '@/components/ui'
import { formatINR } from '@/utils/formula'

export default function Dashboard() {
  const { projects, activeProjectId } = useProjectStore()
  const { items = [] } = useBOQStore()
  const { bills = [] } = useBillingStore()

  const activeProject = projects?.find(p => p.id === activeProjectId)

  // Safety Check: If no project is selected or loaded yet
  if (!activeProject) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--accent)' }}>Welcome to Quantix</h2>
        <p style={{ color: 'var(--text3)' }}>Please select a project from the top menu or create one in the Projects section to see your data.</p>
      </div>
    )
  }

  const contractValue = items.reduce((sum, item) => sum + (item.boqQty * item.rate), 0)
  const billedAmount = items.reduce((sum, item) => sum + (item.billedQty * item.rate), 0)

  return (
    <div style={{ padding: '0 28px 28px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontFamily: 'var(--font-display)', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: 'var(--text3)', fontSize: 13 }}>{activeProject.name} · Project Overview</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Contract Value" value={formatINR(contractValue)} accent="gold" />
        <StatCard label="Billed Till Date" value={formatINR(billedAmount)} accent="green" />
        <StatCard label="Balance" value={formatINR(contractValue - billedAmount)} accent="blue" />
        <StatCard label="Active Bills" value={bills.length} accent="purple" />
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
          {bills.length === 0 ? "No bills generated yet for this project." : "Project data is live."}
        </div>
      </Card>
    </div>
  )
}
