import React, { useState } from 'react'
import { useBOQStore, useMaterialsStore, useUsersStore, useProjectStore, useBillingStore } from '@/store'
import { Card, CardHeader, CardTitle, CardBody, Badge, Button, Toggle, PageHeader, StatCard, Modal } from '@/components/ui'
import { formatINR, getVariation } from '@/utils/formula'
import { exportBOQToExcel, exportBillToExcel, exportCementToExcel, exportVariationToExcel } from '@/utils/excelExport'
import { exportBillToPDF, exportBOQToPDF } from '@/utils/pdfExport'
import toast from 'react-hot-toast'

export function Reports() {
  const { getPartsForProject, getItemsForProject } = useBOQStore()
  const { getBillsForProject, measurements, activeBillId } = useBillingStore()
  const { cementEntries } = useMaterialsStore()
  const { activeProjectId, getActiveProject } = useProjectStore()
  const project = getActiveProject()
  const PROJECT = project?.name || 'Quantix'

  const parts = getPartsForProject(activeProjectId)
  const items = getItemsForProject(activeProjectId)
  const bills = getBillsForProject(activeProjectId)
  const activeBill = bills.find(b => b.id === activeBillId) || bills[0]
  const variations = items.filter(i => i.billedQty > i.boqQty)

  const reports = [
    {
      icon: '📊', name: 'RA Bill Statement', desc: 'Complete Running Account Bill with all measurements.',
      onExcel: () => {
        if (!activeBill) { toast.error('No active bill found'); return }
        exportBillToExcel(activeBill, measurements, items, PROJECT)
        toast.success('Excel exported!')
      },
      onPDF: () => {
        if (!activeBill) { toast.error('No active bill found'); return }
        exportBillToPDF(activeBill, measurements, items, PROJECT)
        toast.success('PDF opened in new tab!')
      }
    },
    {
      icon: '⚖️', name: 'Variation Statement', desc: 'Items exceeding BOQ quantities. Auto-flagged.',
      onExcel: () => {
        if (!variations.length) { toast.error('No variations found'); return }
        exportVariationToExcel(variations, PROJECT)
        toast.success('Variation Excel exported!')
      },
      onPDF: () => toast('PDF coming soon!')
    },
    {
      icon: '🧱', name: 'Cement Consumption', desc: 'Norm vs actual cement usage reconciliation.',
      onExcel: () => {
        if (!cementEntries.length) { toast.error('No cement entries found'); return }
        exportCementToExcel(cementEntries, PROJECT)
        toast.success('Cement statement exported!')
      },
      onPDF: () => toast('PDF coming soon!')
    },
    {
      icon: '📋', name: 'Master BOQ', desc: 'Full Bill of Quantities with amounts and progress.',
      onExcel: () => {
        if (!items.length) { toast.error('No BOQ items found'); return }
        exportBOQToExcel(parts, items, PROJECT)
        toast.success('BOQ Excel exported!')
      },
      onPDF: () => {
        if (!items.length) { toast.error('No BOQ items found'); return }
        exportBOQToPDF(parts, items, PROJECT)
        toast.success('BOQ PDF opened in new tab!')
      }
    },
    {
      icon: '🔒', name: 'Part-Rate Withheld', desc: 'Auto-computed withheld amounts for incomplete items.',
      onExcel: () => toast('Coming in next update!'),
      onPDF:   () => toast('Coming in next update!')
    },
    {
      icon: '💰', name: 'Secured Advances', desc: 'Advance register with recovery and outstanding balances.',
      onExcel: () => toast('Coming in next update!'),
      onPDF:   () => toast('Coming in next update!')
    },
  ]

  return (
    <div>
      <PageHeader title="Reports & Exports" subtitle="Generate and download statements in Excel or PDF" />
      <div style={{ padding:'0 28px 28px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px,1fr))', gap:14, marginBottom:24 }}>
          {reports.map((r,i) => (
            <div key={i} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:20, display:'flex', flexDirection:'column', gap:10, transition:'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
            >
              <div style={{ fontSize:28 }}>{r.icon}</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700 }}>{r.name}</div>
              <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.5, flex:1 }}>{r.desc}</div>
              <div style={{ display:'flex', gap:6 }}>
                <Button variant="green" size="sm" onClick={r.onExcel}>⬇ Excel</Button>
                <Button variant="outline" size="sm" onClick={r.onPDF}>⬇ PDF</Button>
              </div>
            </div>
          ))}
        </div>
        <Card>
          <CardHeader><CardTitle>Export Settings</CardTitle></CardHeader>
          <CardBody>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              <div>
                <div style={{ fontSize:12, color:'var(--text2)', marginBottom:10, fontWeight:500 }}>Excel Options</div>
                {['Auto Page Setup (A3/A4 landscape)', 'Inject live Excel formulas', 'Include project header/footer'].map((opt,i) => (
                  <label key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--text2)', marginBottom:8, cursor:'pointer' }}>
                    <input type="checkbox" defaultChecked /> {opt}
                  </label>
                ))}
              </div>
              <div>
                <div style={{ fontSize:12, color:'var(--text2)', marginBottom:10, fontWeight:500 }}>PDF Options</div>
                {['Mobile-optimized layout', 'Include digital signature block', 'Open in new tab for preview'].map((opt,i) => (
                  <label key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--text2)', marginBottom:8, cursor:'pointer' }}>
                    <input type="checkbox" defaultChecked /> {opt}
                  </label>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export function Materials() {
  const { cementEntries, receipts } = useMaterialsStore()
  return (
    <div>
      <PageHeader title="Materials & Cement" subtitle="Track material receipts and cement consumption norms" />
      <div style={{ padding:'0 28px 28px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px,1fr))', gap:10, marginBottom:20 }}>
          <StatCard label="Cement Issued (T)" value="1,248" accent="blue" />
          <StatCard label="Consumed (T)" value="842" accent="green" />
          <StatCard label="Balance (T)" value="406" accent="gold" />
          <StatCard label="Variance" value="+4.1%" accent="red" />
        </div>
        <Card style={{ marginBottom:16 }}>
          <CardHeader><CardTitle>Cement Consumption Register</CardTitle><Button variant="outline" size="sm" onClick={() => toast('Add entry')}>+ Add</Button></CardHeader>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead><tr style={{ background:'var(--surface3)' }}>{['Week','Item','Work Qty','Norm','Norm Qty','Actual','Variance'].map(h => <th key={h} style={{ padding:'7px 12px', textAlign:'left', fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--text3)', borderBottom:'1px solid var(--border)' }}>{h}</th>)}</tr></thead>
              <tbody>
                {cementEntries.map(e => {
                  const norm = e.workQty * e.norm
                  const diff = e.actual - norm
                  return (
                    <tr key={e.id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'9px 12px', color:'var(--text2)' }}>{e.week}</td>
                      <td style={{ padding:'9px 12px' }}>{e.item}</td>
                      <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)' }}>{e.workQty}</td>
                      <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)' }}>{e.norm}</td>
                      <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)' }}>{norm.toFixed(0)} bags</td>
                      <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)' }}>{e.actual} bags</td>
                      <td style={{ padding:'9px 12px' }}><Badge color={Math.abs(diff)<5?'green':diff>0?'yellow':'red'}>{diff>0?'+':''}{diff.toFixed(0)} bags</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Material Receipt Register</CardTitle><Button variant="outline" size="sm" onClick={() => toast('Add receipt')}>+ Add</Button></CardHeader>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead><tr style={{ background:'var(--surface3)' }}>{['Receipt No.','Date','Material','Supplier','Qty','Rate','Amount','Status'].map(h => <th key={h} style={{ padding:'7px 12px', textAlign:'left', fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--text3)', borderBottom:'1px solid var(--border)' }}>{h}</th>)}</tr></thead>
              <tbody>
                {receipts.map(r => (
                  <tr key={r.id} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)', color:'var(--blue)' }}>{r.receiptNo}</td>
                    <td style={{ padding:'9px 12px', color:'var(--text2)' }}>{r.date}</td>
                    <td style={{ padding:'9px 12px' }}>{r.material}</td>
                    <td style={{ padding:'9px 12px', color:'var(--text2)' }}>{r.supplier}</td>
                    <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)' }}>{r.qty} {r.unit}</td>
                    <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)' }}>{formatINR(r.rate,0)}</td>
                    <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)', color:'var(--green)' }}>{formatINR(r.qty*r.rate)}</td>
                    <td style={{ padding:'9px 12px' }}><Badge color={r.status==='verified'?'green':'yellow'}>{r.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export function Advances() {
  const advances = [
    { no:'SA-007', date:'Dec 24', contractor:'M/s Patel Const.', material:'Cement',  value:850000, given:637500, recovered:425000 },
    { no:'SA-006', date:'Nov 24', contractor:'M/s Patel Const.', material:'Steel',   value:584000, given:438000, recovered:438000 },
    { no:'SA-005', date:'Oct 24', contractor:'M/s Kumar Works',  material:'Bitumen', value:742000, given:556500, recovered:371000 },
  ]
  return (
    <div>
      <PageHeader title="Advances" subtitle="Secured advance tracking and recovery ledger" actions={<Button variant="gold">+ New Advance</Button>} />
      <div style={{ padding:'0 28px 28px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px,1fr))', gap:10, marginBottom:20 }}>
          <StatCard label="Total Given"  value={formatINR(advances.reduce((s,a)=>s+a.given,0))}     accent="blue" />
          <StatCard label="Recovered"    value={formatINR(advances.reduce((s,a)=>s+a.recovered,0))} accent="green" />
          <StatCard label="Outstanding"  value={formatINR(advances.reduce((s,a)=>s+(a.given-a.recovered),0))} accent="red" />
        </div>
        <Card>
          <CardHeader><CardTitle>Secured Advance Register</CardTitle></CardHeader>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead><tr style={{ background:'var(--surface3)' }}>{['Adv. No.','Date','Contractor','Material','Value','Given','Recovered','Balance','Status'].map(h => <th key={h} style={{ padding:'7px 12px', textAlign:'left', fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--text3)', borderBottom:'1px solid var(--border)' }}>{h}</th>)}</tr></thead>
              <tbody>
                {advances.map(a => {
                  const bal = a.given - a.recovered
                  return (
                    <tr key={a.no} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)', color:'var(--blue)' }}>{a.no}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text2)' }}>{a.date}</td>
                      <td style={{ padding:'9px 12px' }}>{a.contractor}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text2)' }}>{a.material}</td>
                      <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)' }}>{formatINR(a.value)}</td>
                      <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)' }}>{formatINR(a.given)}</td>
                      <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)', color:'var(--green)' }}>{formatINR(a.recovered)}</td>
                      <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)', color:bal>0?'var(--red)':'var(--green)' }}>{formatINR(bal)}</td>
                      <td style={{ padding:'9px 12px' }}><Badge color={bal===0?'green':'yellow'}>{bal===0?'Closed':'Active'}</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export function Variation() {
  const { getItemsForProject } = useBOQStore()
  const { activeProjectId, getActiveProject } = useProjectStore()
  const project = getActiveProject()
  const items = getItemsForProject(activeProjectId)
  const variations = items.filter(i => i.billedQty > i.boqQty)
  return (
    <div>
      <PageHeader title="Variation Statement" subtitle="Items deviating from original BOQ"
        actions={<Button variant="gold" onClick={() => { exportVariationToExcel(variations, project?.name); toast.success('Exported!') }}>⬇ Export</Button>}
      />
      <div style={{ padding:'0 28px 28px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px,1fr))', gap:10, marginBottom:20 }}>
          <StatCard label="Items Over BOQ"     value={variations.length} accent="red" />
          <StatCard label="Total Excess Value" value={formatINR(variations.reduce((s,i)=>s+(i.billedQty-i.boqQty)*i.rate,0))} accent="red" />
        </div>
        <Card>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead><tr style={{ background:'var(--surface3)' }}>{['Item','Description','Unit','BOQ Qty','Billed','Excess','Rate','Excess Value','% Var'].map(h => <th key={h} style={{ padding:'7px 12px', textAlign:'left', fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--text3)', borderBottom:'1px solid var(--border)' }}>{h}</th>)}</tr></thead>
              <tbody>
                {variations.length === 0 && <tr><td colSpan={9} style={{ padding:'24px', textAlign:'center', color:'var(--text3)' }}>No variations found ✅</td></tr>}
                {variations.map(item => {
                  const excess = item.billedQty - item.boqQty
                  const v = getVariation(item.boqQty, item.billedQty)
                  return (
                    <tr key={item.id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)', color:'var(--blue)' }}>{item.no}</td>
                      <td style={{ padding:'9px 12px', maxWidth:240 }}>{item.description}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text2)' }}>{item.unit}</td>
                      <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)' }}>{item.boqQty}</td>
                      <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)', color:'var(--red)' }}>{item.billedQty}</td>
                      <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)', color:'var(--red)' }}>+{excess.toFixed(2)}</td>
                      <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)' }}>{formatINR(item.rate,0)}</td>
                      <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)', color:'var(--red)' }}>{formatINR(excess*item.rate)}</td>
                      <td style={{ padding:'9px 12px' }}><Badge color={v.status==='high'?'red':'yellow'}>+{v.pct}%</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export function BBS() {
  const bars = [
    { member:'Bottom Slab', mark:'T1', dia:16, shape:'Straight', A:6000, nos:24, cutLen:6200, weight:234.8 },
    { member:'Bottom Slab', mark:'T2', dia:12, shape:'Straight', A:4800, nos:32, cutLen:5000, weight:142.1 },
    { member:'Side Wall',   mark:'W1', dia:16, shape:'L-Shape',  A:3200, nos:48, cutLen:3840, weight:290.9 },
    { member:'Side Wall',   mark:'W2', dia:10, shape:'U-Stirrup',A:2800, nos:56, cutLen:3440, weight:118.8 },
    { member:'Top Slab',    mark:'T3', dia:20, shape:'Straight', A:6000, nos:20, cutLen:6200, weight:305.8 },
  ]
  const total = bars.reduce((s,b) => s+b.weight, 0)
  return (
    <div>
      <PageHeader title="Bar Bending Schedule" subtitle="Reinforcement steel summary" actions={<Button variant="gold">⬇ Export BBS</Button>} />
      <div style={{ padding:'0 28px 28px' }}>
        <Card>
          <CardHeader><CardTitle>BBS — Box Culvert CH 3+420</CardTitle><span style={{ fontFamily:'var(--font-mono)', color:'var(--green)' }}>{total.toFixed(1)} kg total</span></CardHeader>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead><tr style={{ background:'var(--surface3)' }}>{['Member','Mark','Dia','Shape','A(mm)','Nos.','Cut Len','Weight(kg)'].map(h => <th key={h} style={{ padding:'7px 12px', textAlign:'left', fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--text3)', borderBottom:'1px solid var(--border)' }}>{h}</th>)}</tr></thead>
              <tbody>
                {bars.map((b,i) => (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'9px 12px' }}>{b.member}</td>
                    <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)', color:'var(--blue)' }}>{b.mark}</td>
                    <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)' }}>{b.dia}</td>
                    <td style={{ padding:'9px 12px', color:'var(--text2)' }}>{b.shape}</td>
                    <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)' }}>{b.A.toLocaleString()}</td>
                    <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)' }}>{b.nos}</td>
                    <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)' }}>{b.cutLen.toLocaleString()}</td>
                    <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)', color:'var(--green)', fontWeight:600 }}>{b.weight}</td>
                  </tr>
                ))}
                <tr style={{ background:'var(--surface2)' }}>
                  <td colSpan={7} style={{ padding:'9px 12px', textAlign:'right', fontSize:11, color:'var(--text2)' }}>Total</td>
                  <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)', color:'var(--green)', fontWeight:700, fontSize:14 }}>{total.toFixed(1)} kg</td>
   </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export function Users() {
  const { subUsers, toggleUser } = useUsersStore()
  const { getItemsForProject, getPartsForProject } = useBOQStore()
  const { activeProjectId } = useProjectStore()
  const items = getItemsForProject(activeProjectId)
  const parts = getPartsForProject(activeProjectId)
  const [selectedUser, setSelectedUser] = useState(null)
  return (
    <div>
      <PageHeader title="Sub-User Management" subtitle="Restrict access to specific BOQ items" actions={<Button variant="gold">+ Create Sub-User</Button>} />
      <div style={{ padding:'0 28px 28px' }}>
        <Card style={{ marginBottom:16 }}>
          <CardHeader><CardTitle>Active Sub-Users</CardTitle></CardHeader>
          {subUsers.map(user => (
            <div key={user.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 18px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:user.color+'20', color:user.color, border:`1px solid ${user.color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>
                {user.name.split(' ').map(w=>w[0]).join('')}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, display:'flex', alignItems:'center', gap:6 }}>{user.name} {user.active && <Badge color="green">● Active</Badge>}</div>
                <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{user.role} · {user.assignedItems.length} items</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>Edit Access</Button>
              <Toggle checked={user.active} onChange={() => toggleUser(user.id)} />
            </div>
          ))}
        </Card>
        {selectedUser && (
          <Card>
            <CardHeader><CardTitle>Item Access — {selectedUser.name}</CardTitle><Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>Close ✕</Button></CardHeader>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead><tr style={{ background:'var(--surface3)' }}>{['✓','Item No.','Description','Part','Access'].map(h => <th key={h} style={{ padding:'7px 12px', textAlign:'left', fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--text3)', borderBottom:'1px solid var(--border)' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {items.slice(0,8).map(item => (
                    <tr key={item.id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'8px 12px', width:40 }}><input type="checkbox" defaultChecked={selectedUser.assignedItems.includes(item.id)} /></td>
                      <td style={{ padding:'8px 12px', fontFamily:'var(--font-mono)', color:'var(--blue)' }}>{item.no}</td>
                      <td style={{ padding:'8px 12px', color:'var(--text2)' }}>{item.description.slice(0,45)}</td>
                      <td style={{ padding:'8px 12px' }}>{parts.find(p=>p.id===item.partId)?.name}</td>
                      <td style={{ padding:'8px 12px' }}><select style={{ background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:4, padding:'3px 6px', color:'var(--text)', fontSize:11 }}><option>View + Edit</option><option>View Only</option></select></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export function Plans() {
  const [selected, setSelected] = useState('pro')
  const [code, setCode] = useState('')
  const plans = [
    { id:'basic',      name:'Basic',        price:'Rs.999',   features:['1 Work','2 Sub-users','50 BOQ items','PDF Export'] },
    { id:'pro',        name:'Professional', price:'Rs.2,499', features:['5 Works','10 Sub-users','Unlimited items','Excel+PDF','Live formulas','BBS'] },
    { id:'enterprise', name:'Enterprise',   price:'Rs.5,999', features:['Unlimited Works','Unlimited Users','All exports','Custom branding','API Access'] },
  ]
  return (
    <div>
      <PageHeader title="Subscription Plans" subtitle="Current plan: Professional · Valid till 31 Mar 2026" />
      <div style={{ padding:'0 28px 28px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:12, marginBottom:20 }}>
          {plans.map(plan => (
            <div key={plan.id} onClick={() => setSelected(plan.id)} style={{ background:selected===plan.id?'rgba(240,165,0,0.07)':'var(--surface2)', border:`1px solid ${selected===plan.id?'var(--accent)':'var(--border)'}`, borderRadius:10, padding:18, cursor:'pointer', transition:'all 0.2s' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700 }}>{plan.name}</span>
                {plan.id==='pro' && <Badge color="yellow">Current</Badge>}
              </div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:24, color:'var(--accent)', marginBottom:10 }}>{plan.price}<span style={{ fontSize:12, color:'var(--text3)' }}>/yr</span></div>
              {plan.features.map(f => <div key={f} style={{ fontSize:11, color:'var(--text2)', marginBottom:3 }}>✓ {f}</div>)}
              <Button variant={plan.id==='pro'?'gold':'outline'} style={{ marginTop:12, width:'100%' }}>{plan.id==='pro'?'Active Plan':'Select'}</Button>
            </div>
          ))}
        </div>
        <Card>
          <CardHeader><CardTitle>Activation Code</CardTitle></CardHeader>
          <CardBody style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="CBS-XXXX-XXXX-XXXX" style={{ flex:1, maxWidth:320, background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:6, padding:'8px 12px', color:'var(--text)', fontSize:12, outline:'none' }} />
            <Button variant="gold" onClick={() => code?toast.success('Plan activated!'):toast.error('Enter a code first')}>Activate</Button>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
