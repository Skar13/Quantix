<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Quantix — Code Updates</title>
<style>
  :root {
    --bg: #0d1117; --surface: #161b22; --surface2: #21262d;
    --border: #30363d; --accent: #f0a500; --green: #3fb950;
    --text: #e6edf3; --text2: #8b949e; --text3: #6e7681;
    --red: #f85149; --blue: #58a6ff;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: 'Segoe UI', sans-serif; padding: 20px; }
  h1 { font-size: 24px; color: var(--accent); margin-bottom: 6px; }
  .subtitle { color: var(--text2); font-size: 13px; margin-bottom: 24px; }
  .file-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 20px; overflow: hidden; }
  .file-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border); background: var(--surface2); }
  .file-path { font-family: monospace; font-size: 13px; color: var(--blue); }
  .file-desc { font-size: 11px; color: var(--text3); margin-top: 2px; }
  .copy-btn {
    background: var(--accent); color: #000; border: none; border-radius: 6px;
    padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer;
    transition: opacity 0.2s; white-space: nowrap; flex-shrink: 0;
  }
  .copy-btn:hover { opacity: 0.85; }
  .copy-btn.copied { background: var(--green); color: #fff; }
  pre {
    padding: 16px; overflow-x: auto; font-size: 11px; line-height: 1.6;
    font-family: 'Courier New', monospace; color: var(--text2);
    max-height: 400px; overflow-y: auto;
  }
  pre::-webkit-scrollbar { width: 4px; height: 4px; }
  pre::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; margin-left: 8px; }
  .badge-update { background: rgba(240,165,0,0.15); color: var(--accent); }
  .badge-new { background: rgba(63,185,80,0.15); color: var(--green); }
  .steps { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; }
  .steps h3 { color: var(--accent); font-size: 14px; margin-bottom: 10px; }
  .step { display: flex; gap: 10px; margin-bottom: 8px; font-size: 13px; color: var(--text2); align-items: flex-start; }
  .step-num { background: var(--accent); color: #000; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
  .nav { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
  .nav-btn { background: var(--surface); border: 1px solid var(--border); color: var(--text2); padding: 6px 14px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.15s; }
  .nav-btn:hover { border-color: var(--accent); color: var(--accent); }
</style>
</head>
<body>

<h1>🏗️ Quantix — Code Updates</h1>
<p class="subtitle">All files that need to be updated on GitHub. Click Copy → Paste on GitHub → Commit.</p>

<div class="steps">
  <h3>📋 How to use this</h3>
  <div class="step"><div class="step-num">1</div><span>Click <strong>Copy</strong> button on any file below</span></div>
  <div class="step"><div class="step-num">2</div><span>Go to <strong>github.com/Skar13/Quantix</strong></span></div>
  <div class="step"><div class="step-num">3</div><span>Navigate to the file path shown, click pencil ✏️ icon</span></div>
  <div class="step"><div class="step-num">4</div><span>Select All → Delete → Paste → Commit to master</span></div>
</div>

<div class="nav">
  <button class="nav-btn" onclick="scrollTo('otherPages')">OtherPages.jsx</button>
  <button class="nav-btn" onclick="scrollTo('billingEntry')">BillingEntry.jsx</button>
  <button class="nav-btn" onclick="scrollTo('dashboard')">Dashboard.jsx</button>
  <button class="nav-btn" onclick="scrollTo('masterBOQ')">MasterBOQ.jsx</button>
  <button class="nav-btn" onclick="scrollTo('appLayout')">AppLayout.jsx</button>
</div>

<div id="otherPages" class="file-card">
  <div class="file-header">
    <div>
      <div class="file-path">src/pages/OtherPages.jsx <span class="badge badge-update">UPDATE</span></div>
      <div class="file-desc">Reports page — connect Excel & PDF export buttons</div>
    </div>
    <button class="copy-btn" onclick="copyCode(this, 'code-otherPages')">📋 Copy</button>
  </div>
  <pre id="code-otherPages">import React, { useState } from 'react'
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
          <StatCard label="Items Over BOQ"    value={variations.length} accent="red" />
          <StatCard label="Total Excess Value" value={formatINR(variations.reduce((s,i)=>s+(i.billedQty-i.boqQty)*i.rate,0))} accent="red" />
        </div>
        <Card>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead><tr style={{ background:'var(--surface3)' }}>{['Item','Description','Unit','BOQ Qty','Billed','Excess','Rate','Excess Value','% Var'].map(h => <th key={h} style={{ padding:'7px 12px', textAlign:'left', fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--text3)', borderBottom:'1px solid var(--border)' }}>{h}</th>)}</tr></thead>
              <tbody>
                {variations.length === 0 && <tr><td colSpan={9} style={{ pad
