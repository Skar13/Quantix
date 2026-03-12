import React, { useState } from 'react'
import { useBillingStore, useBOQStore, useMaterialsStore, useUsersStore, useProjectStore } from '@/store'
import { exportBOQToExcel, exportBillToExcel, exportCementToExcel } from '@/utils/excelExport'
import { exportBillToPDF, exportBOQToPDF } from '@/utils/pdfExport'
import { Card, CardHeader, CardTitle, CardBody, Badge, Button, Toggle, PageHeader, StatCard, Modal } from '@/components/ui'
import { formatINR, getVariation, fmtQty } from '@/utils/formula'
import toast from 'react-hot-toast'

// ── REPORTS ──
export function Reports() {
  const { bills, measurements, activeBillId } = useBillingStore()
  const { parts, items } = useBOQStore()
  const { cementEntries } = useMaterialsStore()
  const { getActiveProject } = useProjectStore()
  
  const activeBill = bills.find(b => b.id === activeBillId)
  const project = getActiveProject()
  const PROJECT_NAME = project?.name || 'Online_CBS_Project'

  const reports = [
    { icon: '📊', name: 'RA Bill Statement',      desc: 'Complete Running Account Bill with all measurements, deductions, and net payable.',
      onExcel: () => { if(!activeBill) return toast.error('No active bill'); exportBillToExcel(activeBill, measurements, items, PROJECT_NAME); },
      onPDF:   () => { if(!activeBill) return toast.error('No active bill'); exportBillToPDF(activeBill, measurements, items, PROJECT_NAME); } },
    { icon: '⚖️', name: 'Variation Statement',    desc: 'Items with quantities exceeding BOQ. Auto-flagged.',
      onExcel: () => toast('Variation Excel — coming in Phase 3'),
      onPDF:   () => toast('Variation PDF — coming in Phase 3') },
    { icon: '🧱', name: 'Cement Consumption',     desc: 'Norm vs actual cement usage reconciliation statement.',
      onExcel: () => { if(!cementEntries.length) return toast.error('No cement data'); exportCementToExcel(cementEntries, PROJECT_NAME); },
      onPDF:   () => toast('Cement PDF — coming in Phase 3') },
    { icon: '🔒', name: 'Part-Rate Withheld',     desc: 'Auto-computed amounts withheld for incomplete items.',
      onExcel: () => toast('Withheld statement — coming in Phase 3'),
      onPDF:   () => toast('Withheld PDF — coming in Phase 3') },
    { icon: '💰', name: 'Secured Advances',       desc: 'Advance register with recovery and outstanding balances.',
      onExcel: () => toast('Advances Excel — coming in Phase 3'),
      onPDF:   () => toast('Advances PDF — coming in Phase 3') },
    { icon: '📋', name: 'Master BOQ',             desc: 'Full Bill of Quantities with amounts and progress.',
      onExcel: () => exportBOQToExcel(parts, items, PROJECT_NAME),
      onPDF:   () => exportBOQToPDF(parts, items, PROJECT_NAME) },
  ]

  return (
    <div>
      <PageHeader title="Reports & Exports" subtitle="Auto-generated statements, reconciliation, and export tools" />
      <div style={{ padding: '0 28px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14, marginBottom: 24 }}>
          {reports.map((r, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 28 }}>{r.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, flex: 1 }}>{r.desc}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button variant="green" size="sm" onClick={r.onExcel}>⬇ Excel</Button>
                <Button variant="outline" size="sm" onClick={r.onPDF}>⬇ PDF</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── MATERIALS ──
export function Materials() {
  const { cementEntries = [], receipts = [] } = useMaterialsStore()
  
  const totalIssued = receipts.filter(r => r.material.toLowerCase().includes('cement')).reduce((s, r) => s + r.qty, 0) * 20;
  const totalConsumed = cementEntries.reduce((s, e) => s + e.actual_bags, 0)
  const totalBalance = totalIssued - totalConsumed

  return (
    <div>
      <PageHeader title="Materials & Cement" subtitle="Track material receipts and cement consumption norms" />
      <div style={{ padding: '0 28px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
          <StatCard label="Cement Issued (Bags)" value={totalIssued.toLocaleString()} accent="blue" />
          <StatCard label="Consumed (Bags)" value={totalConsumed.toLocaleString()} accent="green" />
          <StatCard label="Balance (Bags)" value={totalBalance.toLocaleString()} accent="gold" />
        </div>

        <Card style={{ marginBottom: 16 }}>
          <CardHeader>
            <CardTitle>Cement Consumption Register</CardTitle>
          </CardHeader>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead><tr style={{ background: 'var(--surface3)' }}>
                {['Week', 'Item', 'Work Qty', 'Norm', 'Norm Qty', 'Actual', 'Variance'].map(h => (
                  <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 10, color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {cementEntries.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)' }}>No cement entries found</td></tr>
                ) : cementEntries.map(e => {
                  const normQty = e.work_qty * e.norm
                  const diff = e.actual_bags - normQty
                  return (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '9px 12px' }}>{e.week_label}</td>
                      <td style={{ padding: '9px 12px' }}>{e.item_name}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)' }}>{e.work_qty}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)' }}>{e.norm}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)' }}>{normQty.toFixed(0)}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)' }}>{e.actual_bags}</td>
                      <td style={{ padding: '9px 12px' }}><Badge color={diff <= 0 ? 'green' : 'red'}>{diff > 0 ? '+' : ''}{diff.toFixed(0)}</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Material Receipt Register</CardTitle></CardHeader>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead><tr style={{ background: 'var(--surface3)' }}>
                {['Receipt No.', 'Date', 'Material', 'Supplier', 'Qty', 'Rate', 'Amount', 'Status'].map(h => (
                  <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 10, color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {receipts.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)' }}>No receipts found</td></tr>
                ) : receipts.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', color: 'var(--blue)' }}>{r.receipt_no}</td>
                    <td style={{ padding: '9px 12px' }}>{r.date}</td>
                    <td style={{ padding: '9px 12px' }}>{r.material}</td>
                    <td style={{ padding: '9px 12px' }}>{r.supplier}</td>
                    <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)' }}>{r.qty} {r.unit}</td>
                    <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)' }}>{formatINR(r.rate, 0)}</td>
                    <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>{formatINR(r.qty * r.rate)}</td>
                    <td style={{ padding: '9px 12px' }}><Badge color={r.status === 'verified' ? 'green' : 'yellow'}>{r.status}</Badge></td>
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

// ── ADVANCES ──
export function Advances() {
  const { advances = [] } = useMaterialsStore()
  
  return (
    <div>
      <PageHeader title="Advances" subtitle="Secured advance tracking and recovery ledger" />
      <div style={{ padding: '0 28px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
          <StatCard label="Total Advances Given" value={formatINR(advances.reduce((s,a)=>s+a.given,0))} accent="blue" />
          <StatCard label="Total Recovered"      value={formatINR(advances.reduce((s,a)=>s+a.recovered,0))} accent="green" />
          <StatCard label="Outstanding Balance"  value={formatINR(advances.reduce((s,a)=>s+(a.given-a.recovered),0))} accent="red" />
        </div>
        <Card>
          <CardHeader><CardTitle>Secured Advance Register</CardTitle></CardHeader>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead><tr style={{ background: 'var(--surface3)' }}>
                {['Adv. No.', 'Date', 'Contractor', 'Material', 'Total Value', 'Given', 'Recovered', 'Balance', 'Status'].map(h => (
                  <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 10, color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {advances.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)' }}>No advances recorded</td></tr>
                ) : advances.map(a => {
                  const balance = a.given - a.recovered
                  return (
                    <tr key={a.id || a.no} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', color: 'var(--blue)' }}>{a.advance_no || a.no}</td>
                      <td style={{ padding: '9px 12px' }}>{a.date}</td>
                      <td style={{ padding: '9px 12px' }}>{a.contractor}</td>
                      <td style={{ padding: '9px 12px' }}>{a.material}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)' }}>{formatINR(a.total_value || a.value)}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)' }}>{formatINR(a.given)}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>{formatINR(a.recovered)}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', color: balance > 0 ? 'var(--red)' : 'var(--green)' }}>{formatINR(balance)}</td>
                      <td style={{ padding: '9px 12px' }}><Badge color={balance === 0 ? 'green' : 'yellow'}>{balance === 0 ? 'Closed' : 'Active'}</Badge></td>
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

// ── VARIATIONS ──
export function Variation() {
  const { items } = useBOQStore()
  const variations = items.filter(i => i.billedQty > i.boqQty)
  
  return (
    <div>
      <PageHeader title="Variation Statement" subtitle="Items deviating from original BOQ — auto-flagged" />
      <div style={{ padding: '0 28px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
          <StatCard label="Items Over BOQ"   value={variations.length} accent="red" />
          <StatCard label="Total Excess Value" value={formatINR(variations.reduce((s,i)=>(s+(i.billedQty-i.boqQty)*i.rate),0))} accent="red" />
        </div>
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead><tr style={{ background: 'var(--surface3)' }}>
                {['Item No.', 'Description', 'Unit', 'BOQ Qty', 'Billed Qty', 'Excess', 'Rate', 'Excess Value', '% Var'].map(h => (
                  <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 10, color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {variations.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)' }}>No variations found</td></tr>
                ) : variations.map(item => {
                  const excess = item.billedQty - item.boqQty
                  const v = getVariation(item.boqQty, item.billedQty)
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', color: 'var(--blue)' }}>{item.no}</td>
                      <td style={{ padding: '9px 12px', maxWidth: 280 }}>{item.description}</td>
                      <td style={{ padding: '9px 12px', color: 'var(--text2)' }}>{item.unit}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)' }}>{item.boqQty.toLocaleString()}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>{item.billedQty.toLocaleString()}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>+{excess.toFixed(2)}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)' }}>{formatINR(item.rate, 0)}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>{formatINR(excess * item.rate)}</td>
                      <td style={{ padding: '9px 12px' }}><Badge color={v.status === 'high' ? 'red' : 'yellow'}>+{v.pct}%</Badge></td>
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

// ── BBS (Empty State for Backend Integration) ──
export function BBS() {
  return (
    <div>
      <PageHeader title="Bar Bending Schedule" subtitle="Reinforcement steel summary for entire work" />
      <div style={{ padding: '0 28px 28px' }}>
        <Card>
          <EmptyState 
            icon="🔩" 
            title="BBS Module Disabled" 
            description="The Bar Bending Schedule module is currently awaiting backend integration for this project." 
          />
        </Card>
      </div>
    </div>
  )
}

// ── USERS / RBAC ──
export function Users() {
  const { subUsers, toggleUser } = useUsersStore()
  const { items, parts } = useBOQStore()
  const [selectedUser, setSelectedUser] = useState(null)
  const [addModal, setAddModal] = useState(false)

  return (
    <div>
      <PageHeader title="Sub-User Management" subtitle="Create sub-users and restrict access to specific BOQ items"
        actions={<Button variant="gold" onClick={() => setAddModal(true)}>+ Create Sub-User</Button>}
      />
      <div style={{ padding: '0 28px 28px' }}>
        <Card style={{ marginBottom: 16 }}>
          <CardHeader><CardTitle>Active Sub-Users</CardTitle></CardHeader>
          {subUsers.map(user => (
            <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: user.color + '20', color: user.color, border: `1px solid ${user.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {user.name.split(' ').map(w => w[0]).join('')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {user.name}
                  {user.active && <Badge color="green">● Online</Badge>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{user.role} · {user.assignedItems?.length || 0} BOQ items</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>Edit Access</Button>
              <Toggle checked={user.active} onChange={() => toggleUser(user.id)} />
            </div>
          ))}
        </Card>

        {selectedUser && (
          <Card>
            <CardHeader>
              <CardTitle>Item Access Control — {selectedUser.name}</CardTitle>
              <Badge color="blue">{selectedUser.assignedItems?.length || 0} of {items.length} items assigned</Badge>
            </CardHeader>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <Button variant="outline" size="sm">Select All</Button>
              <Button variant="outline" size="sm">Deselect All</Button>
              <Button variant="ghost" size="sm" style={{ marginLeft: 'auto' }} onClick={() => setSelectedUser(null)}>Close ✕</Button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead><tr style={{ background: 'var(--surface3)' }}>
                  {['✓', 'Item No.', 'Description', 'Part', 'Access Level'].map(h => (
                    <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {items.slice(0, 8).map(item => {
                    const assigned = selectedUser.assignedItems?.includes(item.id) || false
                    const part = parts.find(p => p.id === item.partId)
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px 12px', width: 40 }}><input type="checkbox" defaultChecked={assigned} /></td>
                        <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--blue)' }}>{item.no}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text2)' }}>{item.description.slice(0, 50)}</td>
                        <td style={{ padding: '8px 12px' }}>{part?.name}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <select style={{ background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 6px', color: 'var(--text)', fontSize: 11, cursor: 'pointer' }}>
                            <option>View + Edit</option>
                            <option>View Only</option>
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Create Sub-User">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {['Full Name', 'Email', 'Role', 'Password'].map(field => (
            <div key={field}>
              <label style={{ display: 'block', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>{field}</label>
              <input type={field === 'Password' ? 'password' : 'text'} placeholder={`Enter ${field.toLowerCase()}...`}
                style={{ width: '100%', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', color: 'var(--text)', fontSize: 12, outline: 'none' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Button variant="ghost" onClick={() => setAddModal(false)}>Cancel</Button>
          <Button variant="gold" onClick={() => { toast.success('Sub-user created!'); setAddModal(false) }}>Create User</Button>
        </div>
      </Modal>
    </div>
  )
}

// ── PLANS ──
export function Plans() {
  const [selected, setSelected] = useState('pro')
  const [code, setCode] = useState('')

  const plans = [
    { id: 'basic', name: 'Basic', price: '₹999', period: '/yr', features: ['1 Active Work', '2 Sub-users', '50 BOQ items', 'PDF Export'], missing: ['Excel formulas'] },
    { id: 'pro', name: 'Professional', price: '₹2,499', period: '/yr', features: ['5 Active Works', '10 Sub-users', 'Unlimited BOQ items', 'Excel + PDF Export', 'Live formulas in Excel', 'BBS Module'] },
    { id: 'enterprise', name: 'Enterprise', price: '₹5,999', period: '/yr', features: ['Unlimited Works', 'Unlimited Sub-users', 'All exports + BBS', 'Custom branding', 'Priority support', 'API Access'] },
  ]

  return (
    <div>
      <PageHeader title="Subscription Plans" subtitle={<>Current plan: <strong style={{ color: 'var(--accent)' }}>Professional</strong> · Valid till 31 Mar 2026</>} />
      <div style={{ padding: '0 28px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
          {plans.map(plan => (
            <div key={plan.id} onClick={() => setSelected(plan.id)} style={{
              border: `1px solid ${selected === plan.id ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 10, padding: 18, cursor: 'pointer', transition: 'all 0.2s',
              background: selected === plan.id ? 'rgba(240,165,0,0.07)' : 'var(--surface2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>{plan.name}</span>
                {plan.id === 'pro' && <Badge color="yellow">Current</Badge>}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, color: 'var(--accent)', marginBottom: 10 }}>
                {plan.price}<span style={{ fontSize: 12, color: 'var(--text3)' }}>{plan.period}</span>
              </div>
              {plan.features.map(f => <div key={f} style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 3 }}>✓ {f}</div>)}
              {plan.missing?.map(f => <div key={f} style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3 }}>✗ {f}</div>)}
              <Button variant={plan.id === 'pro' ? 'gold' : 'outline'} style={{ marginTop: 12, width: '100%' }}>
                {plan.id === 'pro' ? 'Active Plan' : 'Select'}
              </Button>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>Activation Code</CardTitle></CardHeader>
          <CardBody style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter activation code (e.g. CBS-XXXX-XXXX-XXXX)"
              style={{ flex: 1, maxWidth: 320, background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', color: 'var(--text)', fontSize: 12, outline: 'none' }} />
            <Button variant="gold" onClick={() => code ? toast.success('Plan activated!') : toast.error('Enter a code first')}>Activate</Button>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Codes are provided after payment confirmation</span>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
