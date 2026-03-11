import * as XLSX from 'xlsx'
import { formatINR, fmtQty } from './formula'

export function exportBOQToExcel(parts, items, projectName) {
  const wb = XLSX.utils.book_new()
  const rows = []

  rows.push([projectName || 'Quantix', '', '', '', '', '', ''])
  rows.push(['MASTER BILL OF QUANTITIES', '', '', '', '', '', ''])
  rows.push([])
  rows.push(['Item No.', 'Description', 'Unit', 'BOQ Qty', 'Rate (Rs.)', 'Amount (Rs.)', 'Billed Qty', '% Complete'])

  let rowIdx = 4

  parts.forEach(part => {
    rows.push([`${part.name} — ${part.description}`, '', '', '', '', '', '', ''])
    rowIdx++
    const partItems = items.filter(i => i.partId === part.id)
    partItems.forEach(item => {
      const rateCol  = XLSX.utils.encode_cell({ r: rowIdx, c: 4 })
      const qtyCol   = XLSX.utils.encode_cell({ r: rowIdx, c: 3 })
      const billedCol = XLSX.utils.encode_cell({ r: rowIdx, c: 6 })
      rows.push([
        item.no,
        item.description,
        item.unit,
        item.boqQty,
        item.rate,
        { f: `${qtyCol}*${rateCol}` },
        item.billedQty,
        { f: `IF(${qtyCol}=0,0,${billedCol}/${qtyCol})` }
      ])
      rowIdx++
    })
  })

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [
    { wch: 10 }, { wch: 55 }, { wch: 8 }, { wch: 12 },
    { wch: 12 }, { wch: 16 }, { wch: 12 }, { wch: 12 }
  ]
  ws['!pageSetup'] = { paperSize: 8, orientation: 'landscape', fitToPage: true, fitToWidth: 1 }

  XLSX.utils.book_append_sheet(wb, ws, 'Master BOQ')
  XLSX.writeFile(wb, `BOQ_${projectName?.replace(/\s/g, '_') || 'Export'}.xlsx`)
}

export function exportBillToExcel(bill, measurements, items, projectName) {
  const wb = XLSX.utils.book_new()
  const rows = []

  rows.push([`RUNNING ACCOUNT BILL No. ${bill.billNo || bill.bill_no}`, '', '', '', '', '', '', ''])
  rows.push([projectName, '', '', '', '', '', '', ''])
  rows.push([`Date: ${bill.date || bill.bill_date}`, '', '', '', '', '', '', ''])
  rows.push([])
  rows.push(['#', 'Description', 'No.', 'Length', 'Width', 'Depth', 'Quantity', 'Unit'])

  let r = 5
  measurements.forEach((m, idx) => {
    const noRef = XLSX.utils.encode_cell({ r, c: 2 })
    const lRef  = XLSX.utils.encode_cell({ r, c: 3 })
    const wRef  = XLSX.utils.encode_cell({ r, c: 4 })
    const dRef  = XLSX.utils.encode_cell({ r, c: 5 })
    const item  = items.find(i => i.id === m.itemId || i.id === m.item_id)

    rows.push([
      idx + 1,
      m.member || m.description || '',
      parseFloat(m.no) || 1,
      m.length || 0,
      m.width  || 0,
      m.depth  || 0,
      { f: `${noRef}*${lRef}*${wRef}${m.depth ? `*${dRef}` : ''}` },
      item?.unit || ''
    ])
    r++
  })

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [
    { wch: 4 }, { wch: 40 }, { wch: 6 },
    { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 6 }
  ]
  ws['!pageSetup'] = { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1 }

  XLSX.utils.book_append_sheet(wb, ws, `RA Bill ${bill.billNo || bill.bill_no}`)
  XLSX.writeFile(wb, `RA_Bill_${bill.billNo || bill.bill_no}_${projectName?.replace(/\s/g, '_') || ''}.xlsx`)
}

export function exportCementToExcel(entries, projectName) {
  const wb = XLSX.utils.book_new()
  const rows = [
    ['CEMENT CONSUMPTION STATEMENT'],
    [projectName],
    [],
    ['Week', 'Item of Work', 'Work Qty', 'Norm (bags/unit)', 'Norm Consumption', 'Actual', 'Variance', 'Remarks']
  ]

  entries.forEach(e => {
    const normQty  = e.workQty * e.norm
    const variance = e.actual - normQty
    rows.push([
      e.week || e.week_label,
      e.item  || e.item_name,
      e.workQty || e.work_qty,
      e.norm,
      normQty.toFixed(0),
      e.actual || e.actual_bags,
      variance > 0 ? `+${variance.toFixed(0)}` : variance.toFixed(0),
      variance > 10 ? 'Excess — investigate' : 'Within norms'
    ])
  })

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [
    { wch: 10 }, { wch: 20 }, { wch: 12 }, { wch: 16 },
    { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 22 }
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Cement Statement')
  XLSX.writeFile(wb, `Cement_${projectName?.replace(/\s/g, '_') || ''}.xlsx`)
}

export function exportVariationToExcel(items, projectName) {
  const wb = XLSX.utils.book_new()
  const rows = [
    ['VARIATION STATEMENT'],
    [projectName],
    [],
    ['Item No.', 'Description', 'Unit', 'BOQ Qty', 'Billed Qty', 'Excess Qty', 'Rate', 'Excess Value', '% Variation']
  ]

  items.forEach(item => {
    const excess = item.billedQty - item.boqQty
    const pct    = item.boqQty > 0 ? ((excess / item.boqQty) * 100).toFixed(2) : 0
    rows.push([
      item.no, item.description, item.unit,
      item.boqQty, item.billedQty,
      excess.toFixed(2),
      item.rate,
      (excess * item.rate).toFixed(2),
      `${pct}%`
    ])
  })

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [
    { wch: 10 }, { wch: 50 }, { wch: 8 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 10 }
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Variation Statement')
  XLSX.writeFile(wb, `Variation_${projectName?.replace(/\s/g, '_') || ''}.xlsx`)
    }
