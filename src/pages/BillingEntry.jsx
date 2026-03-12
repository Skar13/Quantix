import React, { useState } from 'react'
import { useBillingStore, useBOQStore } from '@/store'
import { Card, Button, PageHeader } from '@/components/ui'
import toast from 'react-hot-toast'

export function BillingEntry() {
  const { bills, activeBillId } = useBillingStore()
  const { parts, items } = useBOQStore()
  const activeBill = bills.find(b => b.id === activeBillId)

  const [selectedPart, setSelectedPart] = useState('')
  const [selectedItem, setSelectedItem] = useState('')

  return (
    <div>
      <PageHeader
        title="Billing Entry"
        subtitle={activeBill ? `RA Bill #${activeBill.billNo} — Measurement entry` : 'Select or create a bill to begin'}
      />
      <div style={{ padding: '0 28px 28px' }}>
        <Card style={{ marginBottom: 16 }}>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase' }}>Part</label>
                <select
                  style={{ width: '100%', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px', color: 'var(--text)' }}
                  value={selectedPart}
                  onChange={(e) => setSelectedPart(e.target.value)}
                >
                  <option value="">Select Part...</option>
                  {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase' }}>Item</label>
                <select
                  style={{ width: '100%', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px', color: 'var(--text)' }}
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                >
                  <option value="">Select item...</option>
                  {items.filter(i => i.partId === selectedPart).map(i => (
                    <option key={i.id} value={i.id}>{i.no} - {i.description.slice(0, 30)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <Button variant="outline" size="sm">+ Add Row</Button>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>Total Qty: <strong style={{ color: 'var(--green)', fontSize: 14 }}>0.000</strong></span>
              <Button variant="gold" size="sm" onClick={() => toast.success('Entry saved')}>Save Entry</Button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--surface3)' }}>
                  {['#', 'DESCRIPTION', 'NO.', 'L', 'W', 'D', 'QTY'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)' }}>Select an item to add measurements</td></tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
