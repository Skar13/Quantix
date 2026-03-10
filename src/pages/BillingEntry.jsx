import React, { useState, useCallback } from 'react'
import { useBillingStore, useBOQStore } from '@/store'
import { calcMeasQty, evalFormula, parseExcelPaste, fmtQty } from '@/utils/formula'
import { Card, Button, Tabs, PageHeader, Select, Input } from '@/components/ui'
import toast from 'react-hot-toast'
function FormulaCell({ value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false)
  const result = evalFormula(value)
  const isFormula = value && String(value).match(/[+\-*/()]/)
  return (
    <div style={{ position:'relative' }}>
      <input value={value||''} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder={placeholder}
        style={{ width:'100%', background:'transparent', border:'none', outline:'none', padding:'7px 8px', fontSize:12, fontFamily:'var(--font-mono)', color:isFormula?'var(--accent)':'var(--text)', textAlign:'right' }} />
      {isFormula && focused && result !== null && (
  <div style={{ position:'fixed', zIndex:999, background:'var(--surface2)', border:'1px solid var(--accent)', borderRadius:4, padding:'3px 8px', fontSize:11, fontFamily:'var(--font-mono)', color:'var(--green)', whiteSpace:'nowrap', pointerEvents:'none' }}>= {result}</div>
)}
    </div>
  )
}
export default function BillingEntry() {
  const { parts, items } = useBOQStore()
  const { bills, activeBillId, addMeasurement } = useBillingStore()
  const activeBill = bills.find(b => b.id === activeBillId)
  const [rows, setRows] = useState([
    { desc:'LHS Carriageway Zone 1', no:'1', length:'4*100', width:'7.0', depth:'0.25' },
    { desc:'RHS Carriageway Zone 1', no:'1', length:'4*100', width:'7.0', depth:'0.25' },
    { desc:'Junction widening CH 2+840', no:'1', length:'(18+24)/2', width:'0.25', depth:'' },
  ])
  const [selectedPart, setSelectedPart] = useState(parts[1]?.id||'')
  const [selectedItem, setSelectedItem] = useState('')
  const [activeTab, setActiveTab] = useState('measurements')
  const [formulaDemo, setFormulaDemo] = useState('1*2*2.5*(1.2+2.5)/2')
  const partItems = items.filter(i => i.partId === selectedPart)
  const totalQty = rows.reduce((s,r) => s + (r.isGroup ? 0 : calcMeasQty(r.no, r.length, r.width, r.depth)), 0)
  const updateRow = useCallback((idx, data) => setRows(prev => prev.map((r,i) => i===idx ? {...r,...data} : r)), [])
  const deleteRow = useCallback((idx) => setRows(prev => prev.filter((_,i) => i!==idx)), [])
  function handlePaste(e) {
    e.preventDefault()
    const text = e.clipboardData.getData('text')
    const parsed = parseExcelPaste(text)
    if (!parsed.length) return
    setRows(prev => [...prev, ...parsed.map(cols => ({ desc:cols[0]||'', no:cols[1]||'1', length:cols[2]||'', width:cols[3]||'', depth:cols[4]||'' }))])
    toast.success(`${parsed.length} rows pasted from Excel`)
  }
  function handleSave() {
    if (!selectedItem) { toast.error('Please select an item first'); return }
    rows.filter(r => !r.isGroup).forEach(r => addMeasurement({ billId:activeBillId, itemId:selectedItem, partId:selectedPart, member:r.desc, no:r.no, length:r.length, width:r.width, depth:r.depth, qty:calcMeasQty(r.no,r.length,r.width,r.depth) }))
    toast.success(`${rows.filter(r=>!r.isGroup).length} measurements saved!`)
  }
  const demResult = evalFormula(formulaDemo)
  return (
    <div>
      <PageHeader title="Billing Entry" subtitle={`RA Bill #${activeBill?.billNo||7} — Measurement entry with formula cells`} />
      <div style={{ padding:'0 28px 28px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, marginBottom:14, flexWrap:'wrap' }}>
          <span style={{ fontSize:12, color:'var(--text2)', whiteSpace:'nowrap' }}>🧮 Formula Cell:</span>
          <input value={formulaDemo} onChange={e => setFormulaDemo(e.target.value)} style={{ flex:1, minWidth:200, background:'var(--surface3)', border:'1px solid var(--border2)', borderRadius:6, padding:'7px 12px', color:'var(--accent)', fontFamily:'var(--font-mono)', fontSize:13, outline:'none' }} />
          <span style={{ color:'var(--text3)', fontSize:18, fontFamily:'var(--font-mono)' }}>=</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:20, fontWeight:500, color:demResult!==null?'var(--green)':'var(--red)', minWidth:80 }}>{demResult!==null?demResult:'!ERR'}</span>
        </div>
        <Card>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:10, padding:'14px 16px', borderBottom:'1px solid var(--border)', background:'var(--surface2)' }}>
            <Select label="Part" value={selectedPart} onChange={e => { setSelectedPart(e.target.value); setSelectedItem('') }}>
              {parts.map(p => <option key={p.id} value={p.id}>{p.name} — {p.description}</option>)}
            </Select>
            <Select label="Item" value={selectedItem} onChange={e => setSelectedItem(e.target.value)}>
              <option value="">Select item...</option>
              {partItems.map(i => <option key={i.id} value={i.id}>{i.no} · {i.description.slice(0,30)}</option>)}
            </Select>
            <Input label="Zone" placeholder="Zone 1" />
            <Input label="Floor / Level" placeholder="Sub-grade" />
            <Input label="Member" placeholder="LHS Carriageway" />
            <Input label="Date" type="date" defaultValue="2025-01-14" />
          </div>
          <Tabs tabs={[{id:'measurements',label:'Measurements'},{id:'abstract',label:'Abstract'},{id:'deductions',label:'Deductions'}]} active={activeTab} onChange={setActiveTab} />
          {activeTab === 'measurements' && (
            <div onPaste={handlePaste} style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:800 }}>
                <thead>
                  <tr style={{ background:'var(--surface3)' }}>
                    {['#','Description','No.','Length','Width','Depth','Qty','Del'].map((h,i) => (
                      <th key={i} style={{ padding:'8px 10px', textAlign:i===0||i===7?'center':i>=2?'right':'left', fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--text3)', borderBottom:'2px solid var(--border)', borderRight:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => row.isGroup ? (
                    <tr key={i} style={{ background:'rgba(88,166,255,0.06)' }}>
                      <td colSpan={8} style={{ padding:0 }}>
                        <input value={row.desc||''} onChange={e => updateRow(i,{desc:e.target.value})} placeholder="Group header..." style={{ width:'100%', background:'transparent', border:'none', outline:'none', padding:'8px 12px', fontSize:12, fontWeight:600, color:'var(--blue)' }} />
                      </td>
                    </tr>
                  ) : (
                    <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'7px 8px', textAlign:'center', fontSize:10, fontFamily:'var(--font-mono)', color:'var(--text3)', background:'var(--surface3)', borderRight:'1px solid var(--border)', width:36 }}>{i+1}</td>
                      <td style={{ padding:0, borderRight:'1px solid var(--border)' }}><input value={row.desc||''} onChange={e => updateRow(i,{desc:e.target.value})} style={{ width:'100%', background:'transparent', border:'none', outline:'none', padding:'7px 8px', fontSize:12, color:'var(--text)' }} /></td>
                      <td style={{ padding:0, borderRight:'1px solid var(--border)', width:70 }}><FormulaCell value={row.no} onChange={v => updateRow(i,{no:v})} placeholder="1" /></td>
                      <td style={{ padding:0, borderRight:'1px solid var(--border)', width:120 }}><FormulaCell value={row.length} onChange={v => updateRow(i,{length:v})} placeholder="4*100" /></td>
                      <td style={{ padding:0, borderRight:'1px solid var(--border)', width:100 }}><FormulaCell value={row.width} onChange={v => updateRow(i,{width:v})} placeholder="7.5" /></td>
                      <td style={{ padding:0, borderRight:'1px solid var(--border)', width:100 }}><FormulaCell value={row.depth} onChange={v => updateRow(i,{depth:v})} placeholder="optional" /></td>
                      <td style={{ padding:'7px 10px', borderRight:'1px solid var(--border)', fontFamily:'var(--font-mono)', fontSize:12, color:'var(--green)', textAlign:'right', background:'var(--surface3)', width:110 }}>{fmtQty(calcMeasQty(row.no,row.length,row.width,row.depth))}</td>
                      <td style={{ padding:'4px 6px', textAlign:'center', width:50 }}><button onClick={() => deleteRow(i)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--red)', fontSize:13 }}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab !== 'measurements' && <div style={{ padding:20, color:'var(--text2)', fontSize:13 }}>Coming soon in next phase.</div>}
          <div style={{ padding:'10px 16px', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', background:'var(--surface)' }}>
            <Button variant="outline" size="sm" onClick={() => setRows(prev => [...prev, {desc:'',no:'1',length:'',width:'',depth:''}])}>+ Add Row</Button>
            <Button variant="outline" size="sm" onClick={() => setRows(prev => [...prev, {isGroup:true,desc:''}])}>+ Group Header</Button>
            <Button variant="ghost" size="sm" onClick={() => toast('Ctrl+V on the table to paste from Excel',{icon:'📋'})}>📋 Paste from Excel</Button>
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:14 }}>
              <span style={{ fontSize:12, color:'var(--text2)' }}>Total Qty:</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:18, color:'var(--green)' }}>{fmtQty(totalQty)}</span>
              <Button variant="gold" onClick={handleSave}>💾 Save Entry</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
