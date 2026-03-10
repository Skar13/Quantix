import React, { useState } from 'react'
import { useBOQStore, useProjectStore } from '@/store'
import { Card, Button, Badge, Modal, Input, Select, PageHeader } from '@/components/ui'
import { formatINR, getVariation } from '@/utils/formula'
import toast from 'react-hot-toast'

export default function MasterBOQ() {
  const { getPartsForProject, getItemsForProject, addItem, addPart, deleteItem } = useBOQStore()
  const { activeProjectId, getActiveProject } = useProjectStore()
  const project = getActiveProject()

  const parts = getPartsForProject(activeProjectId)
  const items = getItemsForProject(activeProjectId)

  const [search, setSearch] = useState('')
  const [importModal, setImportModal] = useState(false)
  const [addItemModal, setAddItemModal] = useState(false)
  const [addPartModal, setAddPartModal] = useState(false)
  const [newItem, setNewItem] = useState({ partId:'', no:'', description:'', unit:'', boqQty:'', rate:'' })
  const [newPart, setNewPart] = useState({ name:'', description:'' })

  const filtered = items.filter(i => !search || i.description.toLowerCase().includes(search.toLowerCase()) || i.no.toLowerCase().includes(search.toLowerCase()))
  const totalBOQ    = items.reduce((s,i) => s + i.boqQty * i.rate, 0)
  const totalBilled = items.reduce((s,i) => s + i.billedQty * i.rate, 0)

  function handleAddItem() {
    if (!newItem.no || !newItem.description) { toast.error('Item No. and description required'); return }
    if (!newItem.partId) { toast.error('Please select a part'); return }
    addItem({ ...newItem, boqQty: parseFloat(newItem.boqQty)||0, rate: parseFloat(newItem.rate)||0, billedQty:0 }, activeProjectId)
    toast.success('Item added!')
    setAddItemModal(false)
    setNewItem({ partId:'', no:'', description:'', unit:'', boqQty:'', rate:'' })
  }

  function handleAddPart() {
    if (!newPart.name) { toast.error('Part name required'); return }
    addPart({ ...newPart }, activeProjectId)
    toast.success('Part added!')
    setAddPartModal(false)
    setNewPart({ name:'', description:'' })
  }

  // Empty state
  if (parts.length === 0) {
    return (
      <div>
        <PageHeader title="Master BOQ" subtitle={project?.name || 'No project selected'}
          actions={<Button variant="gold" onClick={() => setAddPartModal(true)}>+ Add Part</Button>}
        />
        <div style={{ padding:'0 28px 28px' }}>
          <div style={{ textAlign:'center', padding:'80px 24px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12 }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📋</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, marginBottom:8 }}>No BOQ items yet</div>
            <div style={{ fontSize:13, color:'var(--text2)', marginBottom:24 }}>Start by adding parts and items or import from Excel</div>
            <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
              <Button variant="gold" onClick={() => setAddPartModal(true)}>+ Add Part</Button>
              <Button variant="outline" onClick={() => setImportModal(true)}>⬆ Import Excel</Button>
            </div>
          </div>
        </div>
        <Modal open={addPartModal} onClose={() => setAddPartModal(false)} title="Add BOQ Part">
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <Input label="Part Name *" value={newPart.name} onChange={e => setNewPart(p=>({...p,name:e.target.value}))} placeholder="e.g. Part A" />
            <Input label="Description" value={newPart.description} onChange={e => setNewPart(p=>({...p,description:e.target.value}))} placeholder="e.g. Earthwork" />
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
            <Button variant="ghost" onClick={() => setAddPartModal(false)}>Cancel</Button>
            <Button variant="gold" onClick={handleAddPart}>Add Part</Button>
          </div>
        </Modal>
        <Modal open={importModal} onClose={() => setImportModal(false)} title="Import Master BOQ" subtitle="Upload Excel work order file">
          <div style={{ border:'2px dashed var(--border2)', borderRadius:10, padding:32, textAlign:'center', cursor:'pointer', marginBottom:14 }}>
            <div style={{ fontSize:36, marginBottom:10 }}>📂</div>
            <div style={{ fontWeight:600, marginBottom:4 }}>Click to upload or drag & drop</div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>Supports .xlsx, .xls</div>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
            <Button variant="ghost" onClick={() => setImportModal(false)}>Cancel</Button>
            <Button variant="gold" onClick={() => { setImportModal(false); toast.success('Import feature coming soon!') }}>Import →</Button>
          </div>
        </Modal>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Master BOQ" subtitle={project?.name || 'Bill of Quantities'}
        actions={<>
          <Button variant="gold" onClick={() => setImportModal(true)}>⬆ Import Excel</Button>
          <Button variant="outline" onClick={() => setAddPartModal(true)}>+ Add Part</Button>
          <Button variant="outline" onClick={() => setAddItemModal(true)}>+ Add Item</Button>
        </>}
      />
      <div style={{ padding:'0 28px 28px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px,1fr))', gap:10, marginBottom:16 }}>
          {[['Total BOQ Value', formatINR(totalBOQ), 'gold'],['Billed Till Date', formatINR(totalBilled), 'green'],['Balance', formatINR(totalBOQ-totalBilled), 'blue'],['Total Items', items.length, 'purple']].map(([label,value,accent]) => (
            <div key={label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 16px' }}>
              <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:18, color:`var(--${accent})`, marginTop:4 }}>{value}</div>
            </div>
          ))}
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search items..." style={{ width:'100%', maxWidth:400, background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:6, padding:'8px 12px', color:'var(--text)', fontSize:12, outline:'none', marginBottom:12 }} />

        <Card>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:800 }}>
              <thead>
                <tr style={{ background:'var(--surface3)' }}>
                  {['Item No.','Description','Unit','BOQ Qty','Rate','Amount','Billed','%',''].map((h,i) => (
                    <th key={i} style={{ padding:'8px 10px', textAlign:i>=3?'right':'left', fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--text3)', borderBottom:'1px solid var(--border)', borderRight:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parts.map(part => {
                  const pi = filtered.filter(i => i.partId === part.id)
                  if (!pi.length && search) return null
                  return (
                    <React.Fragment key={part.id}>
                      <tr style={{ background:'rgba(240,165,0,0.04)' }}>
                        <td colSpan={9} style={{ padding:'9px 10px', fontFamily:'var(--font-display)', fontWeight:700, color:'var(--accent)', fontSize:12, borderBottom:'1px solid var(--border)' }}>{part.name} — {part.description}</td>
                      </tr>
                      {pi.length === 0 && (
                        <tr><td colSpan={9} style={{ padding:'12px', textAlign:'center', color:'var(--text3)', fontSize:11 }}>No items in this part yet. <span onClick={() => { setNewItem(p=>({...p,partId:part.id})); setAddItemModal(true) }} style={{ color:'var(--accent)', cursor:'pointer' }}>+ Add item</span></td></tr>
                      )}
                      {pi.map(item => {
                        const amt = item.boqQty * item.rate
                        const pct = item.boqQty > 0 ? (item.billedQty/item.boqQty)*100 : 0
                        const v = getVariation(item.boqQty, item.billedQty)
                        return (
                          <tr key={item.id} style={{ borderBottom:'1px solid var(--border)' }}>
                            <td style={{ padding:'8px 10px', fontFamily:'var(--font-mono)', color:'var(--blue)', borderRight:'1px solid var(--border)' }}>{item.no}</td>
                            <td style={{ padding:'8px 10px', fontSize:12, borderRight:'1px solid var(--border)', maxWidth:280 }}>{item.description}</td>
                            <td style={{ padding:'8px 10px', color:'var(--text2)', borderRight:'1px solid var(--border)' }}>{item.unit}</td>
                            <td style={{ padding:'8px 10px', fontFamily:'var(--font-mono)', textAlign:'right', borderRight:'1px solid var(--border)' }}>{item.boqQty.toLocaleString()}</td>
                            <td style={{ padding:'8px 10px', fontFamily:'var(--font-mono)', textAlign:'right', borderRight:'1px solid var(--border)' }}>{item.rate.toLocaleString()}</td>
                            <td style={{ padding:'8px 10px', fontFamily:'var(--font-mono)', textAlign:'right', color:'var(--green)', borderRight:'1px solid var(--border)' }}>{formatINR(amt)}</td>
                            <td style={{ padding:'8px 10px', fontFamily:'var(--font-mono)', textAlign:'right', color:v.status==='high'?'var(--red)':'var(--text)', borderRight:'1px solid var(--border)' }}>{item.billedQty.toLocaleString()}</td>
                            <td style={{ padding:'8px 10px', textAlign:'right', borderRight:'1px solid var(--border)' }}><span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:pct>100?'var(--red)':pct>75?'var(--green)':'var(--accent)' }}>{pct.toFixed(0)}%</span></td>
                            <td style={{ padding:'4px 8px', textAlign:'center' }}><button onClick={() => { deleteItem(item.id); toast.success('Removed') }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:12 }}>✕</button></td>
                          </tr>
                        )
                      })}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add Part Modal */}
      <Modal open={addPartModal} onClose={() => setAddPartModal(false)} title="Add BOQ Part">
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <Input label="Part Name *" value={newPart.name} onChange={e => setNewPart(p=>({...p,name:e.target.value}))} placeholder="e.g. Part A" />
          <Input label="Description" value={newPart.description} onChange={e => setNewPart(p=>({...p,description:e.target.value}))} placeholder="e.g. Earthwork" />
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
          <Button variant="ghost" onClick={() => setAddPartModal(false)}>Cancel</Button>
          <Button variant="gold" onClick={handleAddPart}>Add Part</Button>
        </div>
      </Modal>

      {/* Add Item Modal */}
      <Modal open={addItemModal} onClose={() => setAddItemModal(false)} title="Add BOQ Item">
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label style={{ display:'block', fontSize:10, color:'var(--text3)', textTransform:'uppercase', marginBottom:5 }}>Part *</label>
            <select value={newItem.partId} onChange={e => setNewItem(p=>({...p,partId:e.target.value}))} style={{ width:'100%', background:'var(--surface3)', border:'1px solid var(--border)', borderRadius:6, padding:'7px 10px', color:'var(--text)', fontSize:12, outline:'none' }}>
              <option value="">Select part...</option>
              {parts.map(p => <option key={p.id} value={p.id}>{p.name} — {p.description}</option>)}
            </select>
          </div>
          <Input label="Item No. *" value={newItem.no} onChange={e => setNewItem(p=>({...p,no:e.target.value}))} placeholder="e.g. A-1" />
          <Input label="Description *" value={newItem.description} onChange={e => setNewItem(p=>({...p,description:e.target.value}))} placeholder="Full item description" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            <Input label="Unit" value={newItem.unit} onChange={e => setNewItem(p=>({...p,unit:e.target.value}))} placeholder="m³" />
            <Input label="BOQ Qty" type="number" value={newItem.boqQty} onChange={e => setNewItem(p=>({...p,boqQty:e.target.value}))} placeholder="0" />
            <Input label="Rate (₹)" type="number" value={newItem.rate} onChange={e => setNewItem(p=>({...p,rate:e.target.value}))} placeholder="0" />
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
          <Button variant="ghost" onClick={() => setAddItemModal(false)}>Cancel</Button>
          <Button variant="gold" onClick={handleAddItem}>Add Item</Button>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal open={importModal} onClose={() => setImportModal(false)} title="Import Master BOQ" subtitle="Upload Excel work order file">
        <div style={{ border:'2px dashed var(--border2)', borderRadius:10, padding:32, textAlign:'center', cursor:'pointer', marginBottom:14 }}>
          <div style={{ fontSize:36, marginBottom:10 }}>📂</div>
          <div style={{ fontWeight:600, marginBottom:4 }}>Click to upload or drag & drop</div>
          <div style={{ fontSize:11, color:'var(--text3)' }}>Supports .xlsx, .xls</div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <Button variant="ghost" onClick={() => setImportModal(false)}>Cancel</Button>
          <Button variant="gold" onClick={() => { setImportModal(false); toast.success('Import feature coming soon!') }}>Import →</Button>
        </div>
      </Modal>
    </div>
  )
                                     }
