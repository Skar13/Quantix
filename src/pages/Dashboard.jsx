import React from 'react'
import { useBOQStore, useBillingStore, useUsersStore, useProjectStore } from '@/store'
import { StatCard, Card, CardHeader, CardTitle, CardBody, Badge, ProgressBar, PageHeader } from '@/components/ui'
import { formatINR, getVariation } from '@/utils/formula'

export default function Dashboard() {
  const { getPartsForProject, getItemsForProject } = useBOQStore()
  const { getBillsForProject } = useBillingStore()
  const { subUsers } = useUsersStore()
  const { getActiveProject, activeProjectId } = useProjectStore()
  const project = getActiveProject()

  const parts = getPartsForProject(activeProjectId)
  const items = getItemsForProject(activeProjectId)
  const bills = getBillsForProject(activeProjectId)

  const totalContract = items.reduce((s,i) => s + i.boqQty * i.rate, 0)
  const totalBilled   = items.reduce((s,i) => s + i.billedQty * i.rate, 0)
  const variations    = items.filter(i => i.billedQty > i.boqQty)
  const onlineUsers   = subUsers.filter(u => u.active).length
  const currentBill   = bills.find(b => b.status === 'draft')

  // Empty state for new projects
  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle={project?.name || 'No project selected'} />
        <div style={{ padding:'0 28px 28px' }}>
          <div style={{ textAlign:'center', padding:'80px 24px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12 }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🏗️</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, marginBottom:8 }}>Project is empty</div>
            <div style={{ fontSize:13, color:'var(--text2)', marginBottom:24 }}>Start by importing or adding your Master BOQ</div>
            <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
              <a href="/boq" style={{ background:'linear-gradient(135deg, #f0a500, #e07b00)', color:'#000', padding:'10px 20px', borderRadius:8, fontWeight:600, fontSize:13, textDecoration:'none' }}>📋 Setup Master BOQ</a>
              <a href="/projects" style={{ background:'var(--surface2)', color:'var(--text)', padding:'10px 20px', borderRadius:8, fontSize:13, textDecoration:'none', border:'1px solid var(--border)' }}>📁 Switch Project</a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`${project?.name} · RA Bill #${project?.currentBill||7}`} />
      <div style={{ padding:'0 28px 28px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(190px, 1fr))', gap:12, marginBottom:20 }}>
          <StatCard label="Contract Value"   value={formatINR(totalContract)} delta="Total BOQ amount" accent="gold" />
          <StatCard label="Billed Till Date" value={formatINR(totalBilled)} delta={`${totalContract>0?((totalBilled/totalContract)*100).toFixed(1):0}% of contract`} accent="green" />
          <StatCard label="Current RA Bill"  value={formatINR(currentBill?.amount||0)} delta={`Bill #${project?.currentBill||1} · Draft`} accent="blue" />
          <StatCard label="Variations"       value={variations.length} delta="Items exceeding BOQ" accent="red" />
          <StatCard label="Active Sub-users" value={onlineUsers} delta={`${onlineUsers} of ${subUsers.length} active`} accent="purple" />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
          <Card>
            <CardHeader><CardTitle>BOQ Progress by Part</CardTitle><Badge color="yellow">Live</Badge></CardHeader>
            <CardBody>
              {parts.map(part => {
                const pi     = items.filter(i => i.partId === part.id)
                const total  = pi.reduce((s,i) => s + i.boqQty, 0)
                const billed = pi.reduce((s,i) => s + i.billedQty, 0)
                const pct    = total > 0 ? (billed/total)*100 : 0
                const color  = pct > 100 ? 'red' : pct > 75 ? 'green' : 'gold'
                return <ProgressBar key={part.id} label={`${part.name} — ${part.description}`} value={pct} max={100} color={color} />
              })}
            </CardBody>
          </Card>
          <Card>
            <CardHeader><CardTitle>Bill History</CardTitle></CardHeader>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead><tr style={{ background:'var(--surface3)' }}>
                  {['Bill #','Date','Amount','Status'].map(h => <th key={h} style={{ padding:'7px 12px', textAlign:'left', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', color:'var(--text3)', borderBottom:'1px solid var(--border)' }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {bills.length === 0 && (
                    <tr><td colSpan={4} style={{ padding:'20px', textAlign:'center', color:'var(--text3)', fontSize:12 }}>No bills yet</td></tr>
                  )}
                  {bills.map(b => (
                    <tr key={b.id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'9px 12px' }}>RA Bill #{b.billNo}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text2)' }}>{b.date}</td>
                      <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)' }}>{formatINR(b.amount)}</td>
                      <td style={{ padding:'9px 12px' }}><Badge color={b.status==='passed'?'green':'yellow'}>{b.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {variations.length > 0 && (
          <Card>
            <CardHeader><CardTitle>⚠️ Variation Alerts</CardTitle><Badge color="red">{variations.length} items over BOQ</Badge></CardHeader>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead><tr style={{ background:'var(--surface3)' }}>
                  {['Item','Description','BOQ Qty','Billed','Excess','%'].map(h => <th key={h} style={{ padding:'7px 12px', textAlign:'left', fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--text3)', borderBottom:'1px solid var(--border)' }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {variations.map(item => {
                    const v = getVariation(item.boqQty, item.billedQty)
                    return (
                      <tr key={item.id} style={{ borderBottom:'1px solid var(--border)' }}>
                        <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)', color:'var(--blue)' }}>{item.no}</td>
                        <td style={{ padding:'9px 12px', color:'var(--text2)' }}>{item.description}</td>
                        <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)' }}>{item.boqQty}</td>
                        <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)', color:'var(--red)' }}>{item.billedQty}</td>
                        <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)', color:'var(--red)' }}>+{(item.billedQty-item.boqQty).toFixed(2)}</td>
                        <td style={{ padding:'9px 12px' }}><Badge color={v.status==='high'?'red':'yellow'}>+{v.pct}%</Badge></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
